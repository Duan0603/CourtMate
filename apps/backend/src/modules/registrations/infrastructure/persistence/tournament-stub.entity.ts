import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'tournaments', timestamps: true })
export class TournamentStub extends Document {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: false })
  sport?: string;

  @Prop({ required: false })
  time?: string;

  @Prop({ required: false })
  status?: string;

  @Prop({ required: false })
  startDate?: Date;

  @Prop({ required: false })
  endDate?: Date;

  @Prop({ required: false })
  location?: string;

  @Prop({ required: false })
  district?: string;

  @Prop({ required: false })
  city?: string;

  @Prop({
    type: {
      id: { type: String },
      name: { type: String },
      email: { type: String },
      avatar: { type: String },
      isVerified: { type: Boolean },
    },
    required: false,
  })
  organizer?: {
    id: string;
    name: string;
    email?: string;
    avatar?: string;
    isVerified?: boolean;
  };

  @Prop({ required: true })
  slotsLimit!: number;

  @Prop({ required: true })
  registrationFee!: number;

  @Prop({ default: 0 })
  joinedSlots!: number;

  @Prop({ type: [{ name: String, fee: Number }], default: [] })
  categories?: { name?: string; fee: number }[];
}

export const TournamentStubSchema = SchemaFactory.createForClass(TournamentStub);
