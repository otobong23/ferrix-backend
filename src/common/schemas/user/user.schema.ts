import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Model } from 'mongoose';

const DEPOSIT_ADDRESS = 'TFcGAio7carxRnPCeVmZgCqe2AnpvPtqAf';

// export type UserDocument = User & Document;

@Schema({ timestamps: true, _id: false })
class withdrawalWallet {
  @Prop()
  walletAddress: string

  @Prop()
  amount: number
}


@Schema({ timestamps: true }) // timestamps MUST be here
export class Tier {

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  package_level: string;

  @Prop({ type: Number, required: true })
  price: number;

  @Prop({ type: Number, required: true })
  contract_duration_in_days: number;

  @Prop({ type: Number, required: true })
  daily_rate: number;

  @Prop({ required: true, type: Number })
  total_revenue: number;

  @Prop({ type: String })
  expiring_At?: string;
}

export const TierSchema = SchemaFactory.createForClass(Tier);


@Schema({ timestamps: true })
export class User {
  @Prop({ type: String, required: true, unique: true })
  userID: string

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ type: String })
  fullName: string

  @Prop({ type: String })
  DOB: string

  @Prop({ trim: true })
  password?: string;

  @Prop({ type: String, unique: true, sparse: true })
  googleId?: string;

  @Prop({ type: Number, select: true, default: 0 })
  balance: number;

  @Prop({ type: Number, select: true, default: 0 })
  totalYield: number;

  @Prop({ type: Number, select: true, default: 0 })
  totalWithdraw: number;

  @Prop({ type: Number, select: true, default: 0 })
  totalDeposit: number;

  @Prop({ type: Number, select: true, default: 0 })
  transactionCount: number;

  @Prop({ type: [TierSchema], default: [] })
  currentPlan: Tier[];

  @Prop({ type: [TierSchema], default: [] })
  previousPlan: Tier[];

  @Prop({ type: String, default: '' })
  whatsappNo: string;

  @Prop({ type: String, default: '' })
  facebook: string;

  @Prop({ type: String, default: '' })
  telegram: string;

  @Prop({ type: String, default: '' })
  profileImage: string;

  @Prop({ type: String, select: false, default: undefined })
  forgotPasswordCode?: string;

  @Prop({ type: Number, select: false, default: undefined })
  forgotPasswordCodeExpiresAt?: number;

  @Prop({ required: true })
  referral_code?: string;

  @Prop({ default: null })
  referredBy?: string;

  @Prop({ default: 0 })
  referral_count?: number;

  @Prop({ type: String })
  usdtWallet: string;

  @Prop({ type: String })
  bankName: string;

  @Prop({ type: String })
  accountName: string;

  @Prop({ type: String })
  accountNumber: string;

  @Prop({ type: String })
  walletPassword: string

  @Prop({ type: withdrawalWallet })
  withdrawalWallet: withdrawalWallet;

  @Prop({ type: ['pending', 'completed', 'failed'] })
  withdrawStatus: 'pending' | 'completed' | 'failed'

  @Prop({ type: String, default: DEPOSIT_ADDRESS })
  depositAddress: string

  @Prop({ type: String, default: undefined })
  twentyFourHourTimerStart: string

  @Prop({ type: Number, default: Date.now() })
  spinWheelTimerStart: number

  @Prop({ type: Boolean, default: true })
  ActivateBot: boolean;

  @Prop({ type: Number, default: 0 })
  vip: number;

  @Prop({ type: Number, default: 0 })
  meter: number;

  @Prop({ type: Boolean, default: true })
  oneTimeBonus: boolean

  @Prop({ type: Date, default: Date.now() })
  joinDate: Date

}

export const UserSchema = SchemaFactory.createForClass(User);


UserSchema.statics.search = function (keyword: string) {
  const pattern = new RegExp(keyword, 'i'); // case-insensitive

  return this.find({
    $or: [
      { username: pattern },
      { email: pattern },
      { referral_code: pattern },
      { referredBy: pattern },
    ],
  });
};


export interface UserDocument extends User, Document { }

export interface UserModel extends Model<UserDocument> {
  search(keyword: string): Promise<UserDocument[]>;
}