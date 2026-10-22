import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'page_views' })
export class PageView extends Document {
  @Prop({ type: String, required: true })
  route!: string;

  @Prop({ type: String, required: false, default: null })
  userId?: string | null;
}

export const PageViewSchema = SchemaFactory.createForClass(PageView);
PageViewSchema.index({ route: 1 });
PageViewSchema.index({ createdAt: -1 });
