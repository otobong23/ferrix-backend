import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type UserTransactionDocument = UserTransaction & Document;

@Schema({ timestamps: true })
export class UserTransaction {
  // @Prop({ type: String, default: () => uuidv4(), unique: true, immutable: true })
  // transactionID: string;

  @Prop({ type: String, default: () => uuidv4(), unique: true })
  transactionID: string;

  @Prop({ type: String, ref: 'user', required: true })
  email: string;

  @Prop({ required: true, enum: ['deposit', 'withdrawal', 'tier', 'bonus', 'yield'] })
  type: string;

  @Prop({ type: String })
  image: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ type: String })
  plan: string

  @Prop({ default: 'pending', enum: ['pending', 'completed', 'failed'] })
  status: string;

  @Prop({ default: 'USDT' })
  Coin: string; // e.g. 'USDT', 'BTC'

  @Prop({ type: String })
  withdrawWalletAddress: string;

  @Prop({ type: String })
  bankName: string;

  @Prop({ type: String })
  accountName: string;

  @Prop({ type: String })
  accountNumber: string;

  @Prop({ type: Date })
  date: Date;
}

export const UserTransactionSchema = SchemaFactory.createForClass(UserTransaction);