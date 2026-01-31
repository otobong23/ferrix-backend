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

@Schema({ timestamps: true, _id: false })
class depositWallet {
  @Prop()
  amount: number

  @Prop()
  coin: string

  @Prop()
  recieptImage: string
}


@Schema({ timestamps: true, _id: false })
export class Tier {
  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  title: string;

  @Prop({
    type: {
      price: { type: String, required: true },
      daily_yield: { type: String, required: true },
      duration: { type: String, required: true },
      roi: { type: String, required: true },
      purchase_limit: { type: String, required: true },
    },
    required: true,
  })
  details: {
    price: string;
    daily_yield: string;
    duration: string;
    roi: string;
    purchase_limit: string;
  };

  @Prop()
  expiring_date?: string;
}


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

  @Prop({ unique: true, sparse: true })
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

  @Prop({ type: [Tier], default: [] })
  currentPlan: Tier[];

  @Prop({ type: [Tier], default: [] })
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
  forgotPasswordCodeValidation?: number;

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