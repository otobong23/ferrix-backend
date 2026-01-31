import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Model } from 'mongoose';


// Crew Member Schema
@Schema({ timestamps: true })
export class CrewMember {
  @Prop({ type: String, required: true })
  userID: string;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true, min: 1, max: 3 })
  level: number;

  @Prop({ type: Date, default: Date.now })
  joinedAt?: Date;

  @Prop({ type: Number, default: 0 })
  totalDeposits: number;

  @Prop({ type: Number, default: 0 })
  totalWithdrawals: number;

  @Prop({ type: Number, default: 0 })
  transactionCount: number;

  @Prop({ type: [String], default: undefined })
  currentPlan: string[]
}

export const CrewMemberSchema = SchemaFactory.createForClass(CrewMember);


// Main Crew Schema - represents the entire referral tree for a user
@Schema({ timestamps: true })
export class Crew {
  @Prop({ type: String, ref: 'user', required: true, unique: true })
  userID: string;

  @Prop({ required: true })
  ownerUsername: string;

  @Prop({ required: true })
  ownerReferralCode: string;

  @Prop({ type: [CrewMemberSchema], default: [] })
  level_1: CrewMember[];

  @Prop({ type: [CrewMemberSchema], default: [] })
  level_2: CrewMember[];

  @Prop({ type: [CrewMemberSchema], default: [] })
  level_3: CrewMember[];

  @Prop({ type: Number, default: 0 })
  totalMembers: number;

  @Prop({ type: Number, default: 0 })
  totalCrewDeposits: number;

  @Prop({ type: Number, default: 0 })
  totalCrewWithdrawals: number;

  @Prop({ type: Number, default: 0 })
  totalCrewTransactions: number;

  @Prop({ type: Date, default: Date.now })
  lastUpdated: Date;
}

export const CrewSchema = SchemaFactory.createForClass(Crew);

// 🔍 Static Search Method
CrewSchema.statics.search = function (keyword: string) {
  const pattern = new RegExp(keyword, 'i');
  return this.find({
    $or: [
      { ownerUsername: pattern },
      { ownerReferralCode: pattern },
      { userID: pattern },
    ],
  });
};

// 🧠 Types
export interface CrewDocument extends Crew, Document {}

export interface CrewModel extends Model<CrewDocument> {
  search(keyword: string): Promise<CrewDocument[]>;
}