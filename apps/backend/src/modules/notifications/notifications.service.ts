import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification } from './schemas/notification.schema';
import { NotificationRead } from './schemas/notification-read.schema';
import { NotificationsGateway } from './notifications.gateway';

export interface SendNotificationDto {
  type: string;
  title: string;
  body: string;
  link?: string;
  userId?: string;
}

const CHAT_MESSAGE_TYPE = 'MESSAGE_RECEIVED';
const chatLink = (partnerId: string) => '/chat?userId=' + partnerId;

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<Notification>,
    @InjectModel(NotificationRead.name)
    private readonly notificationReadModel: Model<NotificationRead>,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  /**
   * Create a notification and emit it via Socket.IO.
   * If userId is provided, sends to that user's room; otherwise broadcasts.
   */
  async send(dto: SendNotificationDto): Promise<Notification> {
    const notification = await new this.notificationModel({
      type: dto.type,
      title: dto.title,
      body: dto.body,
      link: dto.link || null,
      userId: dto.userId || null,
    }).save();

    const payload = this.toPayload(notification);

    if (dto.userId) {
      this.notificationsGateway.emitToUser(dto.userId, payload);
    } else {
      this.notificationsGateway.emitBroadcast(payload);
    }

    return notification;
  }

  private toPayload(notification: any) {
    return {
      id: notification._id.toString(),
      type: notification.type,
      title: notification.title,
      body: notification.body,
      link: notification.link,
      userId: notification.userId,
      createdAt: notification.createdAt,
    };
  }

  /**
   * One notification per conversation partner instead of one per message: a new message
   * rewrites the existing entry (latest text, moved to the top, unread again) so a burst of
   * chat messages cannot push other notifications out of the list.
   */
  async notifyChatMessage(receiverId: string, senderId: string, senderName: string, content: string): Promise<void> {
    const now = new Date();
    // Raw driver update: Mongoose drops writes to the immutable `createdAt`, which orders the list
    const result: any = await this.notificationModel.collection.findOneAndUpdate(
      { userId: receiverId, type: CHAT_MESSAGE_TYPE, link: chatLink(senderId) },
      {
        $set: { title: 'Tin nhắn mới từ ' + senderName, body: content.slice(0, 160), createdAt: now, updatedAt: now },
        $setOnInsert: { userId: receiverId, type: CHAT_MESSAGE_TYPE, link: chatLink(senderId) },
      },
      { upsert: true, returnDocument: 'after' },
    );
    // Driver 5 wraps the document in { value }, driver 6 returns it directly
    const notification = result && 'value' in result ? result.value : result;
    if (!notification) return;

    await this.notificationReadModel
      .deleteOne({ notificationId: notification._id.toString(), userId: receiverId })
      .exec();
    this.notificationsGateway.emitToUser(receiverId, this.toPayload(notification));
  }

  /** The reader has opened the conversation: its chat notification no longer needs attention. */
  async markChatRead(readerId: string, partnerId: string): Promise<void> {
    const notification = await this.notificationModel
      .findOne({ userId: readerId, type: CHAT_MESSAGE_TYPE, link: chatLink(partnerId) })
      .select('_id')
      .exec();
    if (notification) await this.markRead(readerId, notification._id.toString());
  }

  /**
   * List notifications for a user (their own + broadcasts), newest first.
   */
  async list(userId: string, limit = 30): Promise<any[]> {
    const notifications = await this.notificationModel
      .find({
        $or: [{ userId }, { userId: null }],
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();

    // Get read and deleted status for these notifications
    const notificationIds = notifications.map((n) => n._id.toString());
    const reads = await this.notificationReadModel
      .find({
        notificationId: { $in: notificationIds },
        userId,
      })
      .exec();

    const readSet = new Set(
      reads.filter((r) => !r.isDeleted).map((r) => r.notificationId),
    );
    const deletedSet = new Set(
      reads.filter((r) => r.isDeleted).map((r) => r.notificationId),
    );

    return notifications
      .filter((n) => !deletedSet.has(n._id.toString()))
      .map((n) => ({
        id: n._id.toString(),
        type: n.type,
        title: n.title,
        body: n.body,
        link: n.link,
        userId: n.userId,
        createdAt: n.createdAt,
        read: readSet.has(n._id.toString()),
      }));
  }

  /**
   * Count unread notifications (capped at 50 most recent for MVP performance).
   */
  async unreadCount(userId: string): Promise<number> {
    const recentNotifications = await this.notificationModel
      .find({
        $or: [{ userId }, { userId: null }],
      })
      .sort({ createdAt: -1 })
      .limit(50)
      .select('_id')
      .exec();

    const ids = recentNotifications.map((n) => n._id.toString());
    if (ids.length === 0) return 0;

    const reads = await this.notificationReadModel
      .find({
        notificationId: { $in: ids },
        userId,
      })
      .exec();

    const deletedSet = new Set(
      reads.filter((r) => r.isDeleted).map((r) => r.notificationId),
    );
    const readSet = new Set(
      reads.filter((r) => !r.isDeleted).map((r) => r.notificationId),
    );

    const activeIds = ids.filter((id) => !deletedSet.has(id));
    return activeIds.filter((id) => !readSet.has(id)).length;
  }

  /**
   * Mark a single notification as read. Idempotent.
   * Only allows marking own notifications or broadcasts.
   */
  async markRead(userId: string, notificationId: string): Promise<void> {
    const notification = await this.notificationModel.findById(notificationId).exec();
    if (!notification) return;
    // Only allow marking if it's a broadcast or belongs to this user
    if (notification.userId !== null && notification.userId !== userId) return;

    await this.notificationReadModel.updateOne(
      { notificationId, userId },
      { $set: { readAt: new Date() }, $setOnInsert: { notificationId, userId, isDeleted: false } },
      { upsert: true },
    );
  }

  /**
   * Mark all notifications as read for a user. Idempotent.
   */
  async markAllRead(userId: string): Promise<void> {
    const unreadNotifications = await this.notificationModel
      .find({
        $or: [{ userId }, { userId: null }],
      })
      .select('_id')
      .exec();

    const ops = unreadNotifications.map((n) => ({
      updateOne: {
        filter: { notificationId: n._id.toString(), userId },
        update: {
          $set: { readAt: new Date() },
          $setOnInsert: { notificationId: n._id.toString(), userId, isDeleted: false },
        },
        upsert: true,
      },
    }));

    if (ops.length > 0) {
      await this.notificationReadModel.bulkWrite(ops);
    }
  }

  /**
   * Delete / dismiss a single notification for a user.
   */
  async deleteOne(userId: string, notificationId: string): Promise<void> {
    const notification = await this.notificationModel.findById(notificationId).exec();
    if (!notification) return;

    if (notification.userId !== null && notification.userId !== userId) return;

    if (notification.userId === userId) {
      // Direct notification owned by user: remove completely
      await this.notificationModel.deleteOne({ _id: notificationId }).exec();
      await this.notificationReadModel.deleteMany({ notificationId, userId }).exec();
    } else {
      // Broadcast notification: mark deleted specifically for this user
      await this.notificationReadModel.updateOne(
        { notificationId, userId },
        { $set: { isDeleted: true, readAt: new Date() }, $setOnInsert: { notificationId, userId } },
        { upsert: true },
      );
    }
  }

  /**
   * Delete all notifications for a user (clear list).
   */
  async deleteAll(userId: string): Promise<void> {
    // 1. Delete all personal notifications owned by this user
    const userNotifications = await this.notificationModel.find({ userId }).select('_id').exec();
    const userNotificationIds = userNotifications.map((n) => n._id.toString());

    await this.notificationModel.deleteMany({ userId }).exec();
    if (userNotificationIds.length > 0) {
      await this.notificationReadModel.deleteMany({
        notificationId: { $in: userNotificationIds },
      }).exec();
    }

    // 2. Mark all broadcast notifications as deleted for this user
    const broadcasts = await this.notificationModel.find({ userId: null }).select('_id').exec();
    const ops = broadcasts.map((b) => ({
      updateOne: {
        filter: { notificationId: b._id.toString(), userId },
        update: {
          $set: { isDeleted: true, readAt: new Date() },
          $setOnInsert: { notificationId: b._id.toString(), userId },
        },
        upsert: true,
      },
    }));

    if (ops.length > 0) {
      await this.notificationReadModel.bulkWrite(ops);
    }
  }
}
