import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: false, collection: 'notification_reads' })
export class NotificationRead extends Document {
  @Prop({ required: true })
  notificationId!: string;

  @Prop({ required: true })
  userId!: string;

  @Prop({ type: Date, default: () => new Date() })
  readAt!: Date;

  @Prop({ type: Boolean, default: false })
  isDeleted?: boolean;
}

export const NotificationReadSchema = SchemaFactory.createForClass(NotificationRead);

// Unique compound index: one read record per user per notification
NotificationReadSchema.index({ notificationId: 1, userId: 1 }, { unique: true });
