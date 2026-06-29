import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Report extends Document {
  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true })
  targetId!: string;

  @Prop({ required: true, enum: ['FEED_ITEM', 'TOURNAMENT'] })
  targetType!: 'FEED_ITEM' | 'TOURNAMENT';

  @Prop({ required: true })
  reason!: string;

  @Prop({ required: false })
  notes?: string;
}

export const ReportSchema = SchemaFactory.createForClass(Report);

// Prevent same user from reporting the same item multiple times
ReportSchema.index({ userId: 1, targetId: 1 }, { unique: true });
