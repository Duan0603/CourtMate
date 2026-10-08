import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Feedback extends Document {
  @Prop({ required: true })
  userName!: string;

  @Prop({ required: false })
  userEmail?: string;

  @Prop({ required: false })
  userAvatar?: string;

  @Prop({ required: false })
  userRole?: string;

  @Prop({ required: true, min: 1, max: 5, default: 5 })
  rating!: number;

  @Prop({ required: true })
  comment!: string;

  @Prop({ required: false, default: 'Chung' })
  category?: string;

  @Prop({ required: false, default: true })
  isVerified?: boolean;

  @Prop({ required: false })
  userId?: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const FeedbackSchema = SchemaFactory.createForClass(Feedback);
FeedbackSchema.index({ createdAt: -1 });
