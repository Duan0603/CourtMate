import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BadmintonSkillLevel, MatchStatus, SportType } from '@courtmate/shared';

export type MatchDocument = Match & Document;

@Schema({ _id: false })
export class MatchPlayerSchema {
  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ default: '' })
  phone?: string;

  @Prop({ default: '' })
  avatarUrl?: string;

  @Prop({ type: String, enum: BadmintonSkillLevel, default: BadmintonSkillLevel.TB })
  skillLevel?: BadmintonSkillLevel;

  @Prop({ default: Date.now })
  joinedAt!: Date;
}

@Schema({ timestamps: true, collection: 'matches' })
export class Match {
  @Prop({ required: true, index: true })
  hostId!: string;

  @Prop({ required: true })
  hostName!: string;

  @Prop({ default: '' })
  hostAvatar?: string;

  @Prop({ default: '' })
  hostPhone?: string;

  @Prop({ type: String, enum: SportType, default: SportType.BADMINTON, index: true })
  sport!: SportType;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ default: '' })
  venueId?: string;

  @Prop({ required: true, trim: true })
  venueName!: string;

  @Prop({ required: true, trim: true })
  venueAddress!: string;

  @Prop({ required: true, index: true })
  district!: string;

  @Prop({ required: true, default: 'Da Nang', index: true })
  city!: string;

  @Prop({ default: '' })
  courtNumber?: string;

  @Prop({ required: true, type: Date, index: true })
  startTime!: Date;

  @Prop({ required: true, type: Date })
  endTime!: Date;

  @Prop({ required: true, min: 2, max: 20, default: 4 })
  totalSlots!: number;

  @Prop({ required: true, default: 1 })
  joinedCount!: number;

  @Prop({ type: [MatchPlayerSchema], default: [] })
  players!: MatchPlayerSchema[];

  @Prop({ type: String, enum: BadmintonSkillLevel, default: BadmintonSkillLevel.TBY })
  minSkillLevel!: BadmintonSkillLevel;

  @Prop({ type: String, enum: BadmintonSkillLevel, default: BadmintonSkillLevel.TB_PLUS })
  maxSkillLevel!: BadmintonSkillLevel;

  @Prop({ required: true, default: 'Chia đều tiền sân tại chỗ' })
  estimatedCostText!: string;

  @Prop({ default: '' })
  notes?: string;

  @Prop({ default: 'Cầu Hải Yến / Thành Công' })
  shuttleType?: string;

  @Prop({ type: String, enum: MatchStatus, default: MatchStatus.OPEN, index: true })
  status!: MatchStatus;

  @Prop({ unique: true, sparse: true })
  shareCode?: string;
}

export const MatchSchema = SchemaFactory.createForClass(Match);

MatchSchema.index({ city: 1, sport: 1, status: 1, startTime: 1 });
MatchSchema.index({ district: 1, status: 1 });
