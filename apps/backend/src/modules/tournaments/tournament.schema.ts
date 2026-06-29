import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Tournament as ITournament, SportType, TournamentStatus, TournamentCategory } from '@courtmate/shared';

export type TournamentDocument = Tournament & Document & { createdAt: Date; updatedAt: Date };

@Schema({ _id: false })
export class OrganizerInfo {
  @Prop({ required: true })
  id!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: false })
  avatar?: string;

  @Prop({ required: true, default: false })
  isVerified!: boolean;
}

@Schema({ _id: true })
export class CategoryInfo implements TournamentCategory {
  @Prop({ required: true })
  id!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  fee!: number;

  @Prop({ type: Number, required: false })
  maxParticipants?: number;
}

@Schema({ timestamps: true })
export class Tournament implements Omit<ITournament, 'id' | 'createdAt'> {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ required: true, enum: SportType })
  sport!: SportType;

  @Prop({ required: false })
  time?: string;

  @Prop({ required: false })
  coverImage?: string;

  @Prop({ required: true })
  startDate!: Date;

  @Prop({ required: true })
  endDate!: Date;

  @Prop({ required: true })
  location!: string;

  @Prop({ required: false })
  district?: string;

  @Prop({ required: true })
  city!: string;

  @Prop({ type: OrganizerInfo, required: true })
  organizer!: OrganizerInfo;

  @Prop({ required: true, enum: TournamentStatus, default: TournamentStatus.UPCOMING })
  status!: TournamentStatus;

  @Prop({ required: false })
  rulesText?: string;

  @Prop({ required: false })
  rulesFileUrl?: string;

  @Prop({ required: false })
  rules?: string;

  @Prop({ type: [CategoryInfo], required: true, default: [] })
  categories!: CategoryInfo[];

  @Prop({ type: [String], required: false })
  schedule?: string[];

  @Prop({ required: false })
  registrationLink?: string;

  @Prop({ default: 0 })
  reportsCount!: number;

  @Prop({ default: false })
  isHidden!: boolean;
}

export const TournamentSchema = SchemaFactory.createForClass(Tournament);

// Create indexes to optimize location and status queries
TournamentSchema.index({ city: 1, startDate: 1 });
TournamentSchema.index({ status: 1 });
