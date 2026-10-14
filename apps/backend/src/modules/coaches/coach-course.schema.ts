import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { SportType } from '@courtmate/shared';

@Schema({ timestamps: true })
export class CoachCourseEntity extends Document {
  @Prop({ required: true, index: true })
  coachId!: string;

  @Prop({ required: true })
  title!: string;

  @Prop({ type: String, enum: SportType, default: SportType.BADMINTON })
  sport!: SportType;

  @Prop({ default: 'Mọi cấp độ' })
  level!: string;

  @Prop({ required: true })
  price!: number;

  @Prop({ default: 8 })
  totalSessions!: number;

  @Prop({ default: 90 })
  durationPerSession!: number;

  @Prop({ required: true })
  scheduleDescription!: string;

  @Prop({ default: 6 })
  maxStudents!: number;

  @Prop({ default: 0 })
  enrolledCount!: number;

  @Prop({ required: true })
  location!: string;

  @Prop({ default: '' })
  description!: string;

  @Prop({ type: [String], default: [] })
  syllabus!: string[];

  @Prop({ type: String, default: 'OPEN' })
  status!: 'OPEN' | 'FULL' | 'COMPLETED';
}

export const CoachCourseSchema = SchemaFactory.createForClass(CoachCourseEntity);
