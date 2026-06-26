import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { SportType } from '@courtmate/shared';

@Schema()
class TournamentCategorySchema {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, type: Number })
  fee!: number;

  @Prop({ type: Number, required: false })
  maxParticipants?: number;
}

@Schema({ timestamps: true })
export class Tournament extends Document {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ type: String, enum: SportType, required: true })
  sport!: SportType;

  @Prop({ required: true })
  time!: string;

  @Prop({ required: true })
  location!: string;

  @Prop({ required: true })
  city!: string;

  @Prop({ type: Object, required: true })
  organizer!: {
    id: string;
    name: string;
    isVerified: boolean;
  };

  @Prop({ required: false })
  rulesText?: string;

  @Prop({ required: false })
  rulesFileUrl?: string;

  @Prop({ type: [TournamentCategorySchema], required: true })
  categories!: TournamentCategorySchema[];
}

export const TournamentSchema = SchemaFactory.createForClass(Tournament);
