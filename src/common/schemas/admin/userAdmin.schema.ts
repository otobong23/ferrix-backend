
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

const DEPOSIT_ADDRESS = 'TFcGAio7carxRnPCeVmZgCqe2AnpvPtqAf';
const whatsappLink = 'https://wa.me/447447247209'
const telegramLink = 'https://t.me/+kWTXS1QL1qlkZTQ0'
const USER_PASS = '12345678'

@Schema()
export class Admin {
   @Prop({ required: true, unique: true })
   email: string;

   @Prop({ required: true, default: USER_PASS })
   password: string;

   @Prop({ type: Number, default: 0 })
   totalDeposit: number;

   @Prop({ type: Number, default: 0 })
   totalWithdraw: number;

   @Prop({ type: Number, default: 0 })
   ProfitStop: number;

   @Prop({ type: Number, default: 0 })
   totalTransactions: number;

   @Prop({ type: String, default: DEPOSIT_ADDRESS })
   walletAddress: string;

   @Prop({ type: String, default: whatsappLink })
   whatsappLink: string;

   @Prop({ type: String, default: telegramLink })
   telegramLink: string;

}

export const AdminSchema = SchemaFactory.createForClass(Admin);
export type AdminDocument = Admin & Document;