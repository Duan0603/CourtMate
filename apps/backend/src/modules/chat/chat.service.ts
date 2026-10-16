import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from './chat.schema';
import { User } from '../users/infrastructure/persistence/user.entity';

const OBJECT_ID = /^[0-9a-f]{24}$/i;
const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80';

export const MAX_MESSAGE_LENGTH = 2000;

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message.name) private readonly messageModel: Model<Message>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  /** Direct-message room id shared by two users: "<smallerId>_<largerId>". */
  static dmRoomId(userA: string, userB: string): string {
    return [userA, userB].sort().join('_');
  }

  /**
   * Returns the partner id if `roomId` is a valid DM room that `userId` belongs to,
   * otherwise null. Prevents users from joining or posting into other people's rooms.
   */
  static dmPartner(roomId: string, userId: string): string | null {
    if (typeof roomId !== 'string') return null;
    const ids = roomId.split('_');
    if (ids.length !== 2 || !ids.every((id) => OBJECT_ID.test(id))) return null;
    if (ids[0] === ids[1] || ChatService.dmRoomId(ids[0], ids[1]) !== roomId) return null;
    if (!ids.includes(userId)) return null;
    return ids[0] === userId ? ids[1] : ids[0];
  }

  private toDto(m: any) {
    return {
      _id: String(m._id),
      roomId: m.roomId,
      senderId: m.senderId,
      senderName: m.senderName,
      content: m.content,
      createdAt: m.createdAt || new Date(),
      readAt: m.readAt || null,
      clientMsgId: m.clientMsgId || undefined,
    };
  }

  /** Latest `limit` messages of a room, oldest first. */
  async getHistory(roomId: string, limit = 100): Promise<any[]> {
    const latest = await this.messageModel
      .find({ roomId })
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit)
      .lean()
      .exec();
    return latest.reverse().map((m) => this.toDto(m));
  }

  async getUserName(userId: string): Promise<string | null> {
    if (!OBJECT_ID.test(userId)) return null;
    const user = await this.userModel.findById(userId).select('name email').lean().exec();
    return user ? user.name || user.email : null;
  }

  async userExists(userId: string): Promise<boolean> {
    if (!OBJECT_ID.test(userId)) return false;
    return !!(await this.userModel.exists({ _id: userId }));
  }

  /** One entry per conversation partner, newest conversation first, with unread counts. */
  async getRecentChats(userId: string): Promise<any[]> {
    const roomPattern = new RegExp(`^(${userId}_[0-9a-f]{24}|[0-9a-f]{24}_${userId})$`, 'i');
    const rooms = await this.messageModel
      .aggregate([
        { $match: { roomId: { $regex: roomPattern } } },
        { $sort: { createdAt: -1 } },
        {
          $group: {
            _id: '$roomId',
            lastMessage: { $first: '$$ROOT' },
            unreadCount: {
              $sum: {
                $cond: [
                  { $and: [{ $ne: ['$senderId', userId] }, { $eq: [{ $ifNull: ['$readAt', null] }, null] }] },
                  1,
                  0,
                ],
              },
            },
          },
        },
        { $sort: { 'lastMessage.createdAt': -1 } },
        { $limit: 50 },
      ])
      .exec();

    const partnerIds = rooms
      .map((r) => ChatService.dmPartner(r._id, userId))
      .filter((id): id is string => !!id);

    const partners = await this.userModel
      .find({ _id: { $in: partnerIds } })
      .select('name email role preferences.avatarUrl')
      .lean()
      .exec();
    const partnerById = new Map(partners.map((p: any) => [String(p._id), p]));

    return rooms
      .map((r) => {
        const partnerId = ChatService.dmPartner(r._id, userId);
        if (!partnerId) return null;
        const partner: any = partnerById.get(partnerId);
        const lastMessage = this.toDto(r.lastMessage);
        return {
          id: partnerId,
          name:
            partner?.name ||
            partner?.email ||
            (lastMessage.senderId === partnerId ? lastMessage.senderName : 'Người dùng'),
          email: partner?.email || '',
          avatarUrl: partner?.preferences?.avatarUrl || DEFAULT_AVATAR,
          role: partner?.role || 'PLAYER',
          lastMessage,
          unreadCount: r.unreadCount,
        };
      })
      .filter(Boolean);
  }

  /**
   * Saves a message. A resend with the same `clientMsgId` (retry, reconnect flushing the
   * send buffer) returns the already-saved message with `duplicate: true` instead of a copy.
   */
  async saveMessage(
    roomId: string,
    senderId: string,
    senderName: string,
    content: string,
    clientMsgId?: string,
  ): Promise<{ message: any; duplicate: boolean }> {
    const findExisting = () => this.messageModel.findOne({ senderId, clientMsgId }).lean().exec();

    if (clientMsgId) {
      const existing = await findExisting();
      if (existing) return { message: this.toDto(existing), duplicate: true };
    }

    try {
      const created = await this.messageModel.create({ roomId, senderId, senderName, content, clientMsgId });
      return { message: this.toDto(created.toObject()), duplicate: false };
    } catch (e: any) {
      // Two copies raced past the lookup: the unique index lets only one through
      if (clientMsgId && e?.code === 11000) {
        const existing = await findExisting();
        if (existing) return { message: this.toDto(existing), duplicate: true };
      }
      throw e;
    }
  }

  /** Marks every message the partner sent in this room as read by `readerId`. */
  async markSeen(roomId: string, readerId: string): Promise<Date> {
    const seenAt = new Date();
    await this.messageModel
      .updateMany({ roomId, senderId: { $ne: readerId }, readAt: null }, { $set: { readAt: seenAt } })
      .exec();
    return seenAt;
  }
}
