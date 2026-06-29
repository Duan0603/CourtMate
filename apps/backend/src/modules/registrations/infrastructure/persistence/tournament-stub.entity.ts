import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'tournaments', timestamps: true })
export class TournamentStub extends Document {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  slotsLimit!: number;

  @Prop({ required: true })
  registrationFee!: number;
}

export const TournamentStubSchema = SchemaFactory.createForClass(TournamentStub);
