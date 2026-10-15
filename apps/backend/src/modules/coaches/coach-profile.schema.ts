import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { SportType, CoachVerificationStatus, CoachCertificate } from '@courtmate/shared';

@Schema({ timestamps: true })
export class CoachProfileEntity extends Document {
  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({ required: true })
  fullName!: string;

  @Prop({ required: true })
  headline!: string;

  @Prop({ default: '' })
  avatarUrl!: string;

  @Prop({ default: '' })
  coverUrl!: string;

  @Prop({ default: '' })
  phone!: string;

  @Prop({ default: '' })
  email!: string;

  @Prop({ type: [String], enum: SportType, default: [SportType.BADMINTON] })
  sports!: SportType[];

  @Prop({ default: '' })
  bio!: string;

  @Prop({ default: 1 })
  experienceYears!: number;

  @Prop({ type: Array, default: [] })
  certificates!: CoachCertificate[];

  @Prop({ required: true, default: 200000 })
  hourlyRate!: number;

  @Prop({ default: 'Đà Nẵng' })
  city!: string;

  @Prop({ type: [String], default: [] })
  districts!: string[];

  @Prop({ type: [String], default: [] })
  preferredCourts!: string[];

  @Prop({ default: 5.0 })
  rating!: number;

  @Prop({ default: 0 })
  reviewCount!: number;

  @Prop({ type: String, enum: CoachVerificationStatus, default: CoachVerificationStatus.PENDING })
  verificationStatus!: CoachVerificationStatus;

  @Prop({ type: Array, default: [] })
  availableSlots!: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }[];
}

export const CoachProfileSchema = SchemaFactory.createForClass(CoachProfileEntity);
