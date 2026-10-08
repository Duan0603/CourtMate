import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from './chat.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message.name) private readonly messageModel: Model<Message>,
  ) {}

  async getHistory(roomId: string, limit = 100): Promise<any[]> {
    try {
      const dbMessages = await this.messageModel
        .find({ roomId })
        .sort({ createdAt: 1 })
        .limit(limit)
        .lean()
        .exec();

      return dbMessages.map(m => ({
        _id: m._id.toString(),
        roomId: m.roomId,
        senderId: m.senderId,
        senderName: m.senderName,
        content: m.content,
        createdAt: (m as any).createdAt || new Date(),
      }));
    } catch (e) {
      console.error('[ChatService] getHistory error:', e);
      return [];
    }
  }

  async getRecentChats(userId: string): Promise<any[]> {
    try {
      // Find messages where this user is part of the room
      const regex = new RegExp(`(^|_)${userId}(_|$)`);
      const userRooms = await this.messageModel
        .find({ roomId: { $regex: regex } })
        .sort({ createdAt: -1 })
        .limit(100)
        .lean()
        .exec();

      const partnersMap = new Map<string, any>();

      for (const msg of userRooms) {
        const ids = msg.roomId.split('_');
        const partnerId = ids[0] === userId ? ids[1] : ids[0];
        if (!partnerId || partnerId === userId) continue;

        if (!partnersMap.has(partnerId)) {
          let partnerName = msg.senderId === partnerId ? msg.senderName : 'Người dùng';
          partnersMap.set(partnerId, {
            id: partnerId,
            name: partnerName,
            email: '',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
            role: 'PLAYER',
            lastMessage: {
              _id: msg._id.toString(),
              roomId: msg.roomId,
              senderId: msg.senderId,
              senderName: msg.senderName,
              content: msg.content,
              createdAt: (msg as any).createdAt,
            },
          });
        }
      }

      return Array.from(partnersMap.values());
    } catch (e) {
      console.error('[ChatService] getRecentChats error:', e);
      return [];
    }
  }

  async saveMessage(
    roomId: string,
    senderId: string,
    senderName: string,
    content: string,
  ): Promise<any> {
    try {
      const created = await this.messageModel.create({
        roomId,
        senderId,
        senderName,
        content,
      });

      return {
        _id: created._id.toString(),
        roomId: created.roomId,
        senderId: created.senderId,
        senderName: created.senderName,
        content: created.content,
        createdAt: (created as any).createdAt || new Date(),
      };
    } catch (e) {
      console.error('[ChatService] Error saving message to MongoDB, fallback to generated ID:', e);
      return {
        _id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        roomId,
        senderId,
        senderName,
        content,
        createdAt: new Date(),
      };
    }
  }
}
