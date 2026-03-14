import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserOrderDocument = UserOrder & Document;

@Schema({ timestamps: true })
export class UserOrder {
  @Prop({ type: String })
  txid: string;

  @Prop({ type: String, ref: 'user', required: true })
  email: string;

  @Prop({ type: Number, required: true })
  displayAmount: number;

  @Prop({ type: Number, required: true })
  atomicAmount: number;

  @Prop({ default: 'pending', enum: ['pending', 'completed', 'failed'] })
  status: 'pending' | 'completed' | 'failed';

  @Prop({ default: 'USDT' })
  coin: string;

  @Prop({ type: String })
  address: string;

  @Prop({ type: String })
  referenceID: string;

  @Prop({ type: Date, required: true })
  expiresAt: Date;
}

export const UserOrderSchema = SchemaFactory.createForClass(UserOrder);

UserOrderSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

UserOrderSchema.index(
  { atomicAmount: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'pending' } }
);