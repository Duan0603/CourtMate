import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { CoachBookingType } from '@courtmate/shared';

@Schema({ timestamps: true })
export class CoachReviewEntity extends Document {
  @Prop({ required: true, index: true })
  coachId!: string;

  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true })
  userName!: string;

  @Prop({ default: '' })
  userAvatar!: string;

  @Prop({ required: true, min: 1, max: 5 })
  rating!: number;

  @Prop({ required: true })
  comment!: string;

  @Prop({ type: String, enum: CoachBookingType, default: CoachBookingType.HOURLY })
  bookingType!: CoachBookingType;
}

export const CoachReviewSchema = SchemaFactory.createForClass(CoachReviewEntity);
