import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'messages' })
export class Message extends Document {
  @Prop({ required: true, index: true })
  roomId!: string;

  @Prop({ required: true })
  senderId!: string;

  @Prop({ required: true })
  senderName!: string;

  @Prop({ required: true })
  content!: string;

  // Set when the receiver has seen the message (null = unread)
  @Prop({ type: Date, default: null })
  readAt!: Date | null;

  // Client-generated id that makes sends idempotent across retries / reconnects
  @Prop({ type: String })
  clientMsgId?: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
MessageSchema.index({ roomId: 1, createdAt: -1 });
MessageSchema.index(
  { senderId: 1, clientMsgId: 1 },
  { unique: true, partialFilterExpression: { clientMsgId: { $type: 'string' } } },
);
