import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    console.log(`[Socket] Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`[Socket] Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('register_user')
  handleRegisterUser(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    console.log(`[Socket] User ${data.userId} registered personal room: ${client.id}`);
    client.join(data.userId);
  }

  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    console.log(`[Socket] Client ${client.id} joining room: ${data.roomId}`);
    try {
      client.join(data.roomId);
      
      // Load and send room specific chat history
      const history = await this.chatService.getHistory(data.roomId);
      client.emit('chat_history', history);
    } catch (e) {
      console.error(`[Socket] Failed to join room ${data.roomId}:`, e);
    }
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    @MessageBody()
    data: {
      roomId: string;
      senderId: string;
      senderName: string;
      receiverId: string;
      content: string;
    },
  ) {
    console.log(
      `[Socket] Message in Room ${data.roomId} by ${data.senderName}: "${data.content}"`,
    );
    try {
      const savedMsg = await this.chatService.saveMessage(
        data.roomId,
        data.senderId,
        data.senderName,
        data.content,
      );

      // Broadcast to room members only
      this.server.to(data.roomId).emit('receive_message', savedMsg);

      // Emit notification to receiver's personal room
      this.server.to(data.receiverId).emit('new_message_notification', {
        _id: savedMsg._id,
        senderId: data.senderId,
        senderName: data.senderName,
        content: data.content,
        createdAt: (savedMsg as any).createdAt || new Date().toISOString(),
      });
    } catch (e) {
      console.error('[Socket] Failed to process message:', e);
    }
  }
}
