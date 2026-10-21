import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface OnlineUserEntry {
  name: string;
  currentRoute: string | null;
  sockets: Set<string>;
}

export interface OnlineUserSummary {
  userId: string;
  name: string;
  currentRoute: string | null;
}

@WebSocketGateway({
  namespace: '/notifications',
  cors: {
    origin: true, // TODO: Restrict to web origin via env var (e.g. CORS_ORIGIN)
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private readonly userSockets = new Map<string, OnlineUserEntry>();

  constructor(private readonly jwtService: JwtService, private readonly config: ConfigService) {}

  getOnlineUserIds(): string[] {
    return Array.from(this.userSockets.keys());
  }

  getOnlineUsersCount(): number {
    return this.userSockets.size;
  }

  /**
   * Live snapshot of who's online and which page they're currently viewing.
   */
  getOnlineUsersDetailed(): OnlineUserSummary[] {
    return Array.from(this.userSockets.entries()).map(([userId, entry]) => ({
      userId,
      name: entry.name,
      currentRoute: entry.currentRoute,
    }));
  }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token;
      if (!token) {
        this.logger.warn(`[Notifications] Client ${client.id} connected without token, disconnecting.`);
        client.disconnect(true);
        return;
      }

      let userId: string;
      let role: string | undefined;
      let name: string | undefined;
      if (token === 'mock-jwt-token' && process.env.NODE_ENV !== 'production') {
        userId = 'mock-user-1';
        name = 'Người dùng demo';
      } else {
        const payload = await this.jwtService.verifyAsync(token, { secret: this.config.get<string>('JWT_SECRET') || process.env.JWT_SECRET || 'courtmate-secret-key-12345' });
        userId = String(payload.sub);
        role = payload.role;
        name = payload.name;
      }

      // Join user-specific room and broadcast room
      client.join(`user:${userId}`);
      client.join('broadcast');
      if (role === 'REGIONAL_ADMIN' || role === 'SUPER_ADMIN') {
        client.join('admin');
      }

      // Store userId on socket data for potential later use
      (client as any).userId = userId;

      // Track online socket
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, { name: name || 'Người dùng', currentRoute: null, sockets: new Set() });
      }
      this.userSockets.get(userId)!.sockets.add(client.id);
      this.emitOnlineUpdate();

      this.logger.log(`[Notifications] Client ${client.id} authenticated as user:${userId}`);
    } catch (error) {
      this.logger.warn(`[Notifications] Client ${client.id} failed auth, disconnecting.`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = (client as any).userId;
    if (userId && this.userSockets.has(userId)) {
      const entry = this.userSockets.get(userId)!;
      entry.sockets.delete(client.id);
      if (entry.sockets.size === 0) {
        this.userSockets.delete(userId);
      }
    }
    this.emitOnlineUpdate();
    this.logger.log(`[Notifications] Client ${client.id} disconnected`);
  }

  /**
   * Client reports which page it's currently viewing (sent on every route change).
   * Used to populate the admin "who's online, on which page" list.
   */
  @SubscribeMessage('page-view')
  handlePageView(@ConnectedSocket() client: Socket, @MessageBody() data: { route?: string }) {
    const userId = (client as any).userId;
    if (!userId || !this.userSockets.has(userId) || !data?.route) return;

    this.userSockets.get(userId)!.currentRoute = data.route;
    this.emitOnlineUpdate();
  }

  /**
   * Push the live online-user count + detailed list to admins watching the dashboard.
   */
  private emitOnlineUpdate(): void {
    const detailed = this.getOnlineUsersDetailed();
    this.server.to('admin').emit('online-count', { count: Math.max(detailed.length, 1) });
    this.server.to('admin').emit('online-users', detailed);
  }

  /**
   * Emit notification to a specific user's room.
   */
  emitToUser(userId: string, payload: any): void {
    this.server.to(`user:${userId}`).emit('notification:new', payload);
  }

  /**
   * Emit notification to the broadcast room (all connected users).
   */
  emitBroadcast(payload: any): void {
    this.server.to('broadcast').emit('notification:new', payload);
  }
}
