import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';



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
  private readonly userSockets = new Map<string, Set<string>>();

  constructor(private readonly jwtService: JwtService, private readonly config: ConfigService) {}

  getOnlineUserIds(): string[] {
    return Array.from(this.userSockets.keys());
  }

  getOnlineUsersCount(): number {
    return this.userSockets.size;
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
      if (token === 'mock-jwt-token' && process.env.NODE_ENV !== 'production') {
        userId = 'mock-user-1';
      } else {
        const payload = await this.jwtService.verifyAsync(token, { secret: this.config.get<string>('JWT_SECRET') || process.env.JWT_SECRET || 'courtmate-secret-key-12345' });
        userId = String(payload.sub);
      }

      // Join user-specific room and broadcast room
      client.join(`user:${userId}`);
      client.join('broadcast');

      // Store userId on socket data for potential later use
      (client as any).userId = userId;

      // Track online socket
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(client.id);

      this.logger.log(`[Notifications] Client ${client.id} authenticated as user:${userId}`);
    } catch (error) {
      this.logger.warn(`[Notifications] Client ${client.id} failed auth, disconnecting.`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = (client as any).userId;
    if (userId && this.userSockets.has(userId)) {
      const set = this.userSockets.get(userId)!;
      set.delete(client.id);
      if (set.size === 0) {
        this.userSockets.delete(userId);
      }
    }
    this.logger.log(`[Notifications] Client ${client.id} disconnected`);
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
