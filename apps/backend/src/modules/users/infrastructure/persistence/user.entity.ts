import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { normalizeName } from '../../normalize-name';

@Schema()
export class UserPreferencesSchema {
  @Prop({ type: String })
  profileType?: string; // 'PLAYER' | 'ORGANIZER'

  @Prop({ type: [String], default: [] })
  sports!: string[];

  @Prop()
  location?: string; // e.g. "Da Nang"

  @Prop({ type: String, default: null })
  skillLevel?: string;

  @Prop({ type: String, default: null })
  clubName?: string;

  @Prop({ type: String, default: null })
  avatarUrl?: string;
}

export const UserPreferencesSchemaFactory =
  SchemaFactory.createForClass(UserPreferencesSchema);

@Schema({ timestamps: true, collection: 'users' })
export class User extends Document {
  @Prop({ required: true })
  email!: string;

  @Prop({ required: false })
  identifier?: string;

  @Prop({ required: false, default: '' })
  name!: string;

  @Prop({ type: String, default: null })
  avatarUrl?: string;

  // normalizeName(name), kept in sync by the hooks below; used for accent-insensitive search
  @Prop({ type: String, default: '' })
  nameNormalized!: string;

  @Prop({ required: true, enum: ['USER', 'PLAYER', 'COACH', 'ORGANIZER', 'REGIONAL_ADMIN', 'SUPER_ADMIN'], default: 'USER' })
  role!: string;

  @Prop({ default: 'active', enum: ['active', 'disabled'] })
  status!: string;

  @Prop({ type: UserPreferencesSchemaFactory, default: {} })
  preferences!: UserPreferencesSchema;

  @Prop({ default: false })
  isVerified!: boolean;

  @Prop({ type: [String], default: [] })
  bookmarkedTournaments!: string[];

  @Prop({ type: [String], default: [] })
  bookmarkedCoaches!: string[];

  @Prop({ required: false })
  password?: string;

  @Prop({ type: String })
  organizerCertificateUrl?: string;

  @Prop({ type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' })
  organizerApprovalStatus?: string;

  @Prop({ type: [String], default: [] })
  organizerSports?: string[];

  @Prop({ type: String })
  organizerRejectionReason?: string;

  @Prop({ type: Date })
  organizerSubmittedAt?: Date;

  @Prop({ type: [String], default: [] })
  friends!: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', function () {
  if (this.isModified('name') || !this.nameNormalized) this.nameNormalized = normalizeName(this.name);
});

// Query updates bypass the save hook: derive the field when an update sets `name`
UserSchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function () {
  const update: any = this.getUpdate();
  if (!update || Array.isArray(update)) return;
  const name = update.$set?.name ?? update.name;
  if (name !== undefined) this.set('nameNormalized', normalizeName(name));
});

// Indexes for Phase 8 queries
UserSchema.index({ role: 1 });
UserSchema.index({ 'preferences.location': 1 });
UserSchema.index({ email: 1 }, { unique: true });
