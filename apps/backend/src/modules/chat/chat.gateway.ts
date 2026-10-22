import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { NotificationsService } from '../notifications/notifications.service';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { ChatService, MAX_MESSAGE_LENGTH } from './chat.service';

interface ChatUser {
  id: string;
  name: string;
}

const personalRoom = (userId: string) => `user:${userId}`;

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly chatService: ChatService,
    private readonly notifications: NotificationsService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  handleConnection(client: Socket) {
    // Handlers await this so events sent right after connecting are not processed unauthenticated
    client.data.auth = this.authenticate(client);
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Client disconnected: ${client.id}`);
  }

  private async authenticate(client: Socket): Promise<ChatUser | null> {
    try {
      const token = client.handshake.auth?.token;
      if (!token) throw new Error('missing token');

      const secret =
        this.configService.get<string>('JWT_SECRET') || process.env.JWT_SECRET || 'courtmate-secret-key-12345';
      const payload = await this.jwtService.verifyAsync(token, { secret });
      const id = String(payload.sub);
      const name = payload.name || (await this.chatService.getUserName(id)) || payload.email || 'Người dùng';

      const user: ChatUser = { id, name };
      client.data.user = user;
      client.join(personalRoom(id));
      this.logger.debug(`Client ${client.id} authenticated as ${id}`);
      return user;
    } catch {
      client.emit('auth_error', { message: 'Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại' });
      client.disconnect(true);
      return null;
    }
  }

  private requireUser(client: Socket): Promise<ChatUser | null> {
    return client.data.auth ?? Promise.resolve(null);
  }

  /** Kept for client compatibility: identity comes from the JWT, `data.userId` is ignored. */
  @SubscribeMessage('register_user')
  async handleRegisterUser(@ConnectedSocket() client: Socket) {
    const me = await this.requireUser(client);
    if (!me) return;
    client.emit('recent_chats', await this.chatService.getRecentChats(me.id));
  }

  @SubscribeMessage('join_room')
  async handleJoinRoom(@MessageBody() data: { roomId: string }, @ConnectedSocket() client: Socket) {
    const me = await this.requireUser(client);
    if (!me) return;

    const roomId = data?.roomId;
    if (!ChatService.dmPartner(roomId, me.id)) {
      client.emit('chat_error', { roomId, message: 'Bạn không có quyền truy cập cuộc trò chuyện này' });
      return;
    }

    // A socket views one conversation at a time
    for (const room of client.rooms) {
      if (room !== client.id && room !== roomId && !room.startsWith('user:')) client.leave(room);
    }
    client.join(roomId);

    try {
      const messages = await this.chatService.getHistory(roomId);
      client.emit('chat_history', { roomId, messages });
    } catch (e) {
      this.logger.error(`Failed to load history for ${roomId}`, e as Error);
      client.emit('chat_error', { roomId, message: 'Không tải được lịch sử tin nhắn' });
    }
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    @MessageBody() data: { roomId: string; content: string; clientMsgId?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const me = await this.requireUser(client);
    if (!me) return;

    const roomId = data?.roomId;
    const clientMsgId = data?.clientMsgId;
    const dedupeId =
      typeof clientMsgId === 'string' && clientMsgId.length > 0 && clientMsgId.length <= 64 ? clientMsgId : undefined;
    const content = typeof data?.content === 'string' ? data.content.trim() : '';
    const receiverId = ChatService.dmPartner(roomId, me.id);

    const fail = (message: string) => client.emit('message_error', { roomId, clientMsgId, message });
    if (!receiverId) return fail('Bạn không có quyền gửi tin vào cuộc trò chuyện này');
    if (!content) return fail('Tin nhắn trống');
    if (content.length > MAX_MESSAGE_LENGTH) return fail(`Tin nhắn tối đa ${MAX_MESSAGE_LENGTH} ký tự`);
    if (!(await this.chatService.userExists(receiverId))) return fail('Người nhận không tồn tại');

    let saved: any;
    let duplicate: boolean;
    try {
      ({ message: saved, duplicate } = await this.chatService.saveMessage(roomId, me.id, me.name, content, dedupeId));
    } catch (e) {
      this.logger.error(`Failed to save message in ${roomId}`, e as Error);
      return fail('Gửi tin nhắn thất bại, vui lòng thử lại');
    }

    // Resend of a message that was already delivered: only re-ack the sender
    if (duplicate) {
      client.emit('message_ack', { ...saved, clientMsgId });
      return;
    }

    // Everyone viewing the room plus the sender's other tabs, except this socket (it gets the ack)
    client.to(roomId).to(personalRoom(me.id)).emit('receive_message', saved);
    client.emit('message_ack', { ...saved, clientMsgId });

    // Sidebar preview, unread badge and toast for the receiver wherever they are in the app
    this.server.to(personalRoom(receiverId)).emit('new_message_notification', saved);
    try {
      await this.notifications.send({ userId: receiverId, type: 'MESSAGE_RECEIVED', title: 'Tin nhắn mới từ ' + me.name, body: content.slice(0, 160), link: '/chat?userId=' + me.id });
    } catch (error) { this.logger.error('Could not persist message notification', error); }
  }

  @SubscribeMessage('mark_seen')
  async handleMarkSeen(@MessageBody() data: { roomId: string }, @ConnectedSocket() client: Socket) {
    const me = await this.requireUser(client);
    if (!me) return;

    const roomId = data?.roomId;
    const partnerId = ChatService.dmPartner(roomId, me.id);
    if (!partnerId) return;

    try {
      const seenAt = await this.chatService.markSeen(roomId, me.id);
      client
        .to(roomId)
        .to(personalRoom(partnerId))
        .to(personalRoom(me.id))
        .emit('message_seen', { roomId, userId: me.id, seenAt });
    } catch (e) {
      this.logger.error(`Failed to mark ${roomId} as seen`, e as Error);
    }
  }
}
