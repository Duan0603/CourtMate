import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole, SportType } from '@courtmate/shared';

@Schema()
class UserPreferencesSchema {
  @Prop({ type: [String], enum: SportType, default: [] })
  sports!: SportType[];

  @Prop({ type: String, default: null })
  location?: string;

  @Prop({ type: String, default: null })
  skillLevel?: string;

  @Prop({ type: String, default: null })
  clubName?: string;
}

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true, index: true })
  email!: string;

  @Prop({ required: false, default: '' })
  name!: string;

  @Prop({ type: String, enum: UserRole, default: UserRole.USER })
  role!: UserRole;

  @Prop({ type: UserPreferencesSchema, default: () => ({ sports: [] }) })
  preferences!: UserPreferencesSchema;

  @Prop({ type: Boolean, default: false })
  isVerified!: boolean;

  @Prop({ type: [String], default: [] })
  bookmarkedTournaments!: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
