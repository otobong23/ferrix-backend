import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/common/schemas/user/user.schema';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { Crew, CrewDocument } from 'src/common/schemas/crew/userCrew.schema';
import { CrewService } from 'src/crew/crew.service';
import { TierDetailsDto } from './dto/create-profile.dto';
import { UserTransaction, UserTransactionDocument } from 'src/common/schemas/transaction/userTransaction.schema';
import { Admin, AdminDocument } from 'src/common/schemas/admin/userAdmin.schema';

export type TIER_LIST_TYPE = {
  name: string;
  package_level: string;
  price: number;
  contract_duration_in_days: number;
  daily_rate: number;
  total_revenue: number;
  expiring_At: string;
}


@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Crew.name) private crewModel: Model<CrewDocument>,
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
    @InjectModel(UserTransaction.name) private transactionModel: Model<UserTransactionDocument>,
    private crewService: CrewService,
    private readonly jwtService: JwtService) { }

  private async handleVIP(email: string) {
    const existingUser = await this.userModel.findOne({ email })
    if (!existingUser) throw new NotFoundException('user not found');
    const existingUserCrew = await this.crewService.getUserCrew(email)
    if (!existingUserCrew) throw new NotFoundException('user not found')
    if (existingUserCrew?.totalCrewDeposits >= 3000) existingUser.vip = 1
    if (existingUserCrew?.totalCrewDeposits >= 5000) existingUser.vip = 2
    if (existingUserCrew?.totalCrewDeposits >= 10000) existingUser.vip = 3

    await existingUser.save();
  }

  private async handleMeter(email: string) {
    const existingUser = await this.userModel.findOne({ email });
    if (!existingUser) throw new NotFoundException('User not found');
    const existingUserCrew = await this.crewService.getUserCrew(email);
    if (!existingUserCrew) throw new NotFoundException('User crew not found');
    const level_1_referrals = existingUserCrew.members.level_1.length ?? 0;
    const total_referrals = existingUserCrew.totalMembers
    let meter = 0;

    if (level_1_referrals >= 10 && total_referrals >= 50) {
      meter = 1;
    } else if (level_1_referrals >= 30 && total_referrals >= 100) {
      meter = 2;
    } else if (level_1_referrals >= 50 && total_referrals >= 200) {
      meter = 3;
    } else {
      meter = 3;
    }

    existingUser.meter = meter;
    await existingUser.save();
  }

  private async handleExpiredPlans(email: string): Promise<void> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new NotFoundException('User not found, please login');
    }

    const now = new Date();

    const stillActivePlans: TIER_LIST_TYPE[] = [];
    const expiredPlans: TIER_LIST_TYPE[] = [];

    for (const plan of user.currentPlan as TIER_LIST_TYPE[]) {

      if (!plan.expiring_At) {
        // Safety fallback: if expiring_At is missing, keep it active
        stillActivePlans.push(plan);
        continue;
      }

      const expirationDate = new Date(plan.expiring_At);

      if (expirationDate <= now) {
        expiredPlans.push(plan);
      } else {
        stillActivePlans.push(plan);
      }
    }

    if (expiredPlans.length > 0) {
      user.currentPlan = stillActivePlans;
      user.previousPlan.push(...expiredPlans);
      await user.save();
    }
  }

  async getUserProfileByUserID(userID: string) {
    const existingUser = await this.userModel.findOne({ userID })
    if (!existingUser) throw new NotFoundException('User not Found');
    return { ...existingUser.toObject(), password: undefined, __v: undefined, _id: undefined }
  }

  async getUserProfile({ email }: { email: string }) {
    const existingUser = await this.userModel.findOne({ email: email })
    const existingAdmin = await this.adminModel.findOne()
    if (existingUser) {
      await this.handleVIP(email);
      await this.handleMeter(email)
      await this.handleExpiredPlans(email)
      if (existingAdmin) {
        existingUser.depositAddress = existingAdmin.walletAddress
      }
      return { ...existingUser.toObject(), password: undefined, __v: undefined, _id: undefined }
    } else {
      throw new NotFoundException('User not Found, please signup')
    }
  }

  async deleteUser(email: string) {
    const existingUser = await this.userModel.findOne({ email })
    if (!existingUser) throw new NotFoundException('User not Found, please signup');
    await this.transactionModel.deleteMany({ email })
    await this.crewModel.findOneAndDelete({ userID: existingUser.userID })
    await this.userModel.findOneAndDelete({ email })
    return { message: 'user deleted successfully' }
  }

  async updateUser(email: string, updateData: Partial<User>) {
    const existingUser = await this.userModel.findOneAndUpdate({ email }, updateData, { new: true })
    if (existingUser) {
      if (existingUser.ActivateBot) {
        await this.handleVIP(email);
        await this.handleMeter(email)
        return { ...existingUser.toObject(), ...updateData, password: undefined, __v: undefined, _id: undefined }
      } else {
        throw new ConflictException('Your account has been suspended. Please Vist Customer Care')
      }
    } else {
      throw new NotFoundException('User not Found, please signup')
    }
  }

  async updateCurrentPlan(email, newPlan: Partial<TierDetailsDto>) {
    const existingUser = await this.userModel.findOneAndUpdate({ email }, { $push: { currentPlan: newPlan } }, { new: true })
    if (!existingUser) throw new NotFoundException('User not Found, please signup');
    if (existingUser.ActivateBot) {
      await this.handleVIP(email);
      await this.handleMeter(email)
      return { ...existingUser.toObject(), password: undefined, __v: undefined, _id: undefined }
    } else {
      throw new ConflictException('Your account has been suspended. Please Vist Customer Care')
    }
  }
} 
