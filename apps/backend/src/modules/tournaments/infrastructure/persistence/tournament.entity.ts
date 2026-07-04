import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class TournamentOrganizerSchema {
  @Prop({ required: true })
  id!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: false })
  avatar?: string;

  @Prop({ default: false })
  isVerified!: boolean;
}

export const TournamentOrganizerSchemaFactory =
  SchemaFactory.createForClass(TournamentOrganizerSchema);

@Schema({ _id: true })
export class CategoryInfo {
  @Prop({ required: true })
  id!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  fee!: number;

  @Prop({ type: Number, required: false })
  maxParticipants?: number;
}

export const CategoryInfoSchema = SchemaFactory.createForClass(CategoryInfo);

@Schema({ timestamps: true, collection: 'tournaments' })
export class Tournament extends Document {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ required: true, enum: ['BADMINTON', 'FOOTBALL', 'PICKLEBALL', 'TENNIS'] })
  sport!: string;

  @Prop({ required: false })
  time?: string;

  @Prop({ required: false })
  coverImage?: string;

  @Prop({ required: true })
  startDate!: Date;

  @Prop({ required: true })
  endDate!: Date;

  @Prop({ required: true })
  location!: string; // Specific venue

  @Prop({ required: false })
  district?: string;

  @Prop({ required: true })
  city!: string; // e.g. "Da Nang"

  @Prop({ type: TournamentOrganizerSchemaFactory, required: true })
  organizer!: TournamentOrganizerSchema;

  @Prop({ required: true, enum: ['UPCOMING', 'OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'], default: 'UPCOMING' })
  status!: string;

  @Prop({ required: false })
  rulesText?: string;

  @Prop({ required: false })
  rulesFileUrl?: string;

  @Prop({ required: false })
  rules?: string;

  @Prop({ type: [CategoryInfoSchema], required: true, default: [] })
  categories!: CategoryInfo[];

  @Prop({ type: [String], required: false })
  schedule?: string[];

  @Prop({ required: false })
  registrationLink?: string;

  @Prop({ default: false })
  isHidden!: boolean; // Phase 8: moderation flag

  @Prop({ default: false })
  isFeatured!: boolean; // Phase 8: featured by admin

  @Prop({ default: 0 })
  reportsCount!: number; // Phase 7 stub: report counter

  createdAt!: Date;
  updatedAt!: Date;
}

export const TournamentSchema = SchemaFactory.createForClass(Tournament);

// Indexes for Phase 8 city-based routing and queries
TournamentSchema.index({ city: 1, sport: 1, createdAt: -1 });
TournamentSchema.index({ city: 1, isHidden: 1 });
TournamentSchema.index({ 'organizer.id': 1 });
TournamentSchema.index({ city: 1, startDate: 1 });
TournamentSchema.index({ status: 1 });
