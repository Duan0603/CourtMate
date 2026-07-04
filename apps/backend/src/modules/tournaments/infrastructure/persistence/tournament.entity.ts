import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class TournamentOrganizerSchema {
  @Prop({ required: true })
  id!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ default: false })
  isVerified!: boolean;
}

export const TournamentOrganizerSchemaFactory =
  SchemaFactory.createForClass(TournamentOrganizerSchema);

@Schema({ timestamps: true, collection: 'tournaments' })
export class Tournament extends Document {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ required: true, enum: ['BADMINTON', 'FOOTBALL', 'PICKLEBALL', 'TENNIS'] })
  sport!: string;

  @Prop({ required: true })
  time!: string;

  @Prop({ required: true })
  location!: string; // Specific venue

  @Prop({ required: true })
  city!: string; // e.g. "Da Nang"

  @Prop({ type: TournamentOrganizerSchemaFactory, required: true })
  organizer!: TournamentOrganizerSchema;

  @Prop()
  rules?: string;

  @Prop({ default: 0 })
  registrationFee!: number;

  @Prop({ default: 0 })
  slotsLimit!: number;

  @Prop({ default: false })
  isHidden!: boolean; // Phase 8: moderation flag

  @Prop({ default: false })
  isFeatured!: boolean; // Phase 8: featured by admin

  @Prop({ default: 0 })
  reportsCount!: number; // Phase 7 stub: report counter
}

export const TournamentSchema = SchemaFactory.createForClass(Tournament);

// Indexes for Phase 8 city-based routing and queries
TournamentSchema.index({ city: 1, sport: 1, createdAt: -1 });
TournamentSchema.index({ city: 1, isHidden: 1 });
TournamentSchema.index({ 'organizer.id': 1 });
