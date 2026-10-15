import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { SportType, CoachBookingType, CoachBookingStatus } from '@courtmate/shared';

@Schema({ timestamps: true })
export class CoachBookingEntity extends Document {
  @Prop({ required: true, index: true })
  coachId!: string;

  @Prop({ default: '' })
  coachName!: string;

  @Prop({ default: '' })
  coachAvatar!: string;

  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({ required: true })
  userName!: string;

  @Prop({ default: '' })
  userPhone!: string;

  @Prop({ default: '' })
  userEmail!: string;

  @Prop({ type: String, enum: CoachBookingType, default: CoachBookingType.HOURLY })
  bookingType!: CoachBookingType;

  @Prop({ default: null })
  courseId?: string;

  @Prop({ default: null })
  courseTitle?: string;

  @Prop({ type: String, enum: SportType, default: SportType.BADMINTON })
  sport!: SportType;

  @Prop({ required: true })
  bookingDate!: string;

  @Prop({ default: '' })
  startTime?: string;

  @Prop({ default: '' })
  endTime?: string;

  @Prop({ default: 1 })
  durationHours?: number;

  @Prop({ required: true })
  courtLocation!: string;

  @Prop({ required: true })
  totalPrice!: number;

  @Prop({ default: '' })
  notes?: string;

  @Prop({ type: String, enum: CoachBookingStatus, default: CoachBookingStatus.PENDING })
  status!: CoachBookingStatus;

  @Prop({ type: String, default: 'UNPAID' })
  paymentStatus!: 'UNPAID' | 'PAID' | 'REFUNDED';
}

export const CoachBookingSchema = SchemaFactory.createForClass(CoachBookingEntity);
