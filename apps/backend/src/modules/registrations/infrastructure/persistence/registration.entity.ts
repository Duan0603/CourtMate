import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { SkillLevel, RegistrationStatus } from '@courtmate/shared';

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_, ret: any) => {
      ret.id = ret._id ? ret._id.toString() : ret.id;
      delete ret.__v;
      return ret;
    },
  },
  toObject: {
    virtuals: true,
    transform: (_, ret: any) => {
      ret.id = ret._id ? ret._id.toString() : ret.id;
      return ret;
    },
  },
})
export class Registration extends Document {
  @Prop({ required: true, index: true })
  tournamentId!: string;

  @Prop({ required: true, index: true })
  playerId!: string;

  @Prop({ required: true })
  playerName!: string;

  @Prop({ required: false })
  partnerName?: string;

  @Prop({ required: true })
  contactPhone!: string;

  @Prop({
    required: true,
    type: String,
    enum: Object.values(SkillLevel)
  })
  skillLevel!: SkillLevel;

  @Prop({
    required: true,
    type: String,
    enum: Object.values(RegistrationStatus),
    default: RegistrationStatus.PENDING
  })
  status!: RegistrationStatus;

  @Prop({ required: false, index: true })
  paymentTransactionId?: string;
}

export const RegistrationSchema = SchemaFactory.createForClass(Registration);
// Create compound index to prevent duplicate registrations for the same player in the same tournament
RegistrationSchema.index({ tournamentId: 1, playerId: 1 }, { unique: true });
