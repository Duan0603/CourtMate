import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class UserPreferencesSchema {
  @Prop({ type: String })
  profileType?: string; // 'PLAYER' | 'ORGANIZER'

  @Prop({ type: [String], default: [] })
  sports!: string[];

  @Prop()
  location?: string; // e.g. "Da Nang"
}

export const UserPreferencesSchemaFactory =
  SchemaFactory.createForClass(UserPreferencesSchema);

@Schema({ timestamps: true, collection: 'users' })
export class User extends Document {
  @Prop({ required: true })
  email!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, enum: ['USER', 'REGIONAL_ADMIN', 'SUPER_ADMIN'], default: 'USER' })
  role!: string;

  @Prop({ type: UserPreferencesSchemaFactory, default: {} })
  preferences!: UserPreferencesSchema;

  @Prop({ default: false })
  isVerified!: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes for Phase 8 queries
UserSchema.index({ role: 1 });
UserSchema.index({ 'preferences.location': 1 });
UserSchema.index({ email: 1 }, { unique: true });
