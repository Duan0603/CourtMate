import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PaymentProvider = 'PAYOS' | 'MOMO';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED';

@Schema({ timestamps: true, collection: 'payment_transactions' })
export class PaymentTransaction extends Document {
  @Prop({ required: true, unique: true, index: true })
  orderId!: string;

  @Prop({ required: true, index: true })
  registrationId!: string;

  @Prop({ required: true, enum: ['PAYOS', 'MOMO'] })
  provider!: PaymentProvider;

  @Prop({ required: true, min: 1000 })
  amount!: number;

  @Prop({ required: true, enum: ['PENDING', 'PAID', 'FAILED', 'EXPIRED'], default: 'PENDING', index: true })
  status!: PaymentStatus;

  @Prop()
  gatewayTransactionId?: string;

  @Prop()
  payUrl?: string;

  @Prop({ type: Object })
  gatewayResponse?: Record<string, unknown>;

  @Prop()
  processedAt?: Date;

  createdAt!: Date;
  updatedAt!: Date;
}

export const PaymentTransactionSchema = SchemaFactory.createForClass(PaymentTransaction);
PaymentTransactionSchema.index(
  { registrationId: 1, provider: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'PENDING' } },
);
