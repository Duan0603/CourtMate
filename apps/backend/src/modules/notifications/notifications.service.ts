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

    const payload = {
      id: notification._id.toString(),
      type: notification.type,
      title: notification.title,
      body: notification.body,
      link: notification.link,
      userId: notification.userId,
      createdAt: notification.createdAt,
    };

    if (dto.userId) {
      this.notificationsGateway.emitToUser(dto.userId, payload);
    } else {
      this.notificationsGateway.emitBroadcast(payload);
    }

    return notification;
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

    // Get read status for these notifications
    const notificationIds = notifications.map((n) => n._id.toString());
    const reads = await this.notificationReadModel
      .find({
        notificationId: { $in: notificationIds },
        userId,
      })
      .exec();
    const readSet = new Set(reads.map((r) => r.notificationId));

    return notifications.map((n) => ({
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

    const readCount = await this.notificationReadModel.countDocuments({
      notificationId: { $in: ids },
      userId,
    });

    return ids.length - readCount;
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
      { $setOnInsert: { notificationId, userId, readAt: new Date() } },
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
        update: { $setOnInsert: { notificationId: n._id.toString(), userId, readAt: new Date() } },
        upsert: true,
      },
    }));

    if (ops.length > 0) {
      await this.notificationReadModel.bulkWrite(ops);
    }
  }
}
