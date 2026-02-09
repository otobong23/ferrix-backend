import { BadRequestException, ConflictException, ForbiddenException, HttpException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DepositDto, WithdrawDto } from './dto/transaction.dto';
import { User, UserDocument } from 'src/common/schemas/user/user.schema';
import { sendMail } from 'src/common/helpers/mailer';
import { UserTransaction, UserTransactionDocument } from 'src/common/schemas/transaction/userTransaction.schema';
import { CrewService } from 'src/crew/crew.service';
import { config } from 'dotenv';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import axios from 'axios';
import { UserOrder, UserOrderDocument } from 'src/common/schemas/order/userOrder.schema';
import { AxiosError } from 'axios';
config();

const to = process.env.EMAIL_USER
const EXPIRY_MINUTES = 30;

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(UserOrder.name) private readonly userOrderModel: Model<UserOrderDocument>,
    @InjectModel(UserTransaction.name) private readonly transactionModel: Model<UserTransactionDocument>,
    private crewService: CrewService,
    private readonly httpService: HttpService
  ) { }
  private readonly logger = new Logger(TransactionService.name);

  private async findUserByEmail(email: string): Promise<UserDocument> {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new NotFoundException('User not found. Please sign up.');
    }
    return user;
  }

  private readonly apiUrl = 'https://www.blockonomics.co/api';
  async generatePaymentAddress(amount: number, email: string): Promise<{ message: string, order: UserOrderDocument }> {
    const existingUser = await this.userModel.findOne({ email });
    if (!existingUser) throw new NotFoundException('User not found. Please sign up.');

    if (existingUser.ActivateBot) {
      try {
        const response = await axios.post(
          `${this.apiUrl}/new_address?crypto=USDT`, {},
          {
            headers: {
              Authorization: `Bearer ${process.env.BLOCKONOMICS_API_KEY}`,
              'Content-Type': 'application/json',
            },
          },
        );

        const USDT_DECIMALS = 1_000_000;
        const DISPLAY_DECIMALS = 1_000; // 3 decimal places

        const toAtomic = (v: number) => Math.round(v * USDT_DECIMALS);
        const toDisplay = (atomic: number) =>
          Number((atomic / USDT_DECIMALS).toFixed(3));

        const normalizedAmount = Number(amount.toFixed(3));
        const baseAtomic = toAtomic(normalizedAmount);


        // 100–999 × 0.001 USDT = 0.100–0.999 USDT ✅ (3 decimals)
        const offsetAtomic = Math.floor(Math.random() * 900 + 100) * DISPLAY_DECIMALS;

        let payableAtomic = baseAtomic + offsetAtomic;

        let retries = 3;
        while (retries > 0) {
          const exists = await this.userOrderModel.findOne({
            atomicAmount: payableAtomic,
            status: 'pending',
          });

          if (!exists) break;

          payableAtomic = baseAtomic + (Math.floor(Math.random() * 900 + 100) * DISPLAY_DECIMALS);
          retries--;
        }

        const newUserOrder = new this.userOrderModel({
          address: response.data.address,
          atomicAmount: payableAtomic,
          displayAmount: toDisplay(payableAtomic),
          email,
          expiresAt: new Date(Date.now() + EXPIRY_MINUTES * 60 * 1000),
        });

        await newUserOrder.save();

        return { message: 'Payment address generated successfully', order: newUserOrder };
      } catch (err) {
        console.error('Request Address error:', err);
        const message =
          err instanceof AxiosError
            ? err.response?.data?.message || 'Unexpected API error'
            : err instanceof Error ? err.message : 'An unexpected error occurred';
        throw new InternalServerErrorException(`Failed to generate payment address: ${message}`);
      }
    } else {
      throw new NotFoundException('Your account has been suspended. Please Vist Customer Care')
    }
  }

  async createDepositTransaction(orderID: string, email: string) {
    const existingUser = await this.userModel.findOne({ email });
    if (!existingUser) throw new NotFoundException('User not found. Please sign up.');
    const order = await this.userOrderModel.findById(orderID);
    if (!order) throw new NotFoundException('order not found');
    if (order.email !== email) throw new ForbiddenException('You are not authorized to confirm this deposit');
    if (order.status !== 'pending') throw new BadRequestException('This order has already been processed');
    if (order.referenceID) return { message: 'This order has already been processed', success: false };
    const newTransaction = new this.transactionModel({ orderID, email, type: 'deposit', amount: order.displayAmount, status: 'pending', date: new Date() }) as UserTransactionDocument & { _id: any };
    await newTransaction.save();

    order.referenceID = newTransaction._id.toString();
    await order.save();
    const mailSent = await sendMail(to, existingUser.email, Number(order.displayAmount), newTransaction._id.toString(), 'deposit')
    return { message: 'Deposit request submitted successfully', transaction: newTransaction }
  }

  // async deposit(depositDto: DepositDto, email: string) {
  //   const existingUser = await this.userModel.findOne({ email });

  //   if (!existingUser) throw new NotFoundException('User not found. Please sign up.');

  //   if (existingUser.ActivateBot) {

  //     const { amount } = depositDto;
  //     const newTransaction = new this.transactionModel({ transactionID: depositDto.transactionID, email, type: 'deposit', amount, image: depositDto.image, status: 'pending', date: new Date() }) as UserTransactionDocument & { _id: any };

  //     await newTransaction.save();
  //     const mailSent = await sendMail(to, existingUser.email, Number(amount), newTransaction._id.toString(), 'deposit')
  //     // await this.crewService.updateCrewOnTransaction(existingUser.userID, "deposit", amount)
  //     if (!mailSent) {
  //       throw new InternalServerErrorException('Failed to send Review email')
  //     }
  //     return { message: 'Deposit request submitted successfully', newTransaction }
  //   } else {
  //     throw new NotFoundException('Your account has been suspended. Please Vist Customer Care')
  //   }

  // }

  async withdraw(withdrawDto: WithdrawDto, email: string) {
    const { walletAddress, amount } = withdrawDto;
    const existingUser = await this.userModel.findOne({ email })
    if (existingUser) {
      if (existingUser.ActivateBot) {
        existingUser.withdrawalWallet = { walletAddress, amount: Number(amount) }
        existingUser.withdrawStatus = 'pending';
        const now = new Date()

        // Get day name in Africa/Lagos timezone
        const day = now.toLocaleString("en-US", {
          timeZone: "Africa/Lagos",
          weekday: "long"
        });

        // Restrict weekends
        if (["Saturday", "Sunday"].includes(day)) {
          throw new ConflictException("Withdrawals aren't allowed on weekends. Withdrawals reopen at 09:00 AM Monday (Africa/Lagos time).");
        }

        const hour = parseInt(now.toLocaleString("en-US", { timeZone: "Africa/Lagos", hour: "numeric", hour12: false }))
        if (hour < 9 || hour >= 17) {
          throw new ConflictException('Withdrawals are only Allowed from 09:00AM - 05:00PM UTC+1 Timezone. Please try again during business hours.')
        }
        if (amount < 12) {
          throw new ConflictException('Minimum Withdrawal is $12.00')
        }
        if (existingUser.balance < amount) {
          throw new ConflictException('Insufficient balance for withdrawal')
        }
        const pendingWithdrawal = await this.transactionModel.findOne({ email, type: 'withdrawal', status: 'pending' });
        if (pendingWithdrawal) throw new ConflictException('You have a pending Withdrawal request. Please wait for it to be processed before making another request.');

        existingUser.balance -= amount;
        const newTransaction = new this.transactionModel({ email, type: 'withdrawal', amount, status: 'pending', withdrawWalletAddress: walletAddress, date: new Date() }) as UserTransactionDocument & { _id: any };
        await newTransaction.save();
        const percent = Number(amount) * 0.12
        const mailSent = await sendMail(to, existingUser.email, percent, newTransaction._id.toString(), 'withdrawal')
        if (!mailSent) {
          throw new InternalServerErrorException('Failed to send withdrawal Confirmation email')
        }

        await existingUser.save();
        // await this.crewService.updateCrewOnTransaction(existingUser.userID, "withdraw", amount)
        return { message: 'Withdrawal request submitted successfully', newTransaction }
      } else {
        throw new ConflictException('Your account has been suspended. Please Vist Customer Care')
      }
    } else {
      throw new NotFoundException('User not Found, please signup')
    }
  }

  async getTransactionHistory(email: string, limit: number = 50, page: number = 1) {
    limit = Math.max(1, Math.min(limit, 100))
    page = Math.max(1, page)
    const offset = (page - 1) * limit;

    const user = await this.findUserByEmail(email);

    const transactions = await this.transactionModel
      .find({ email })
      .sort({ date: -1 })
      .limit(limit)
      .skip(offset)
      .exec();

    const total = await this.transactionModel.countDocuments({ email })
    const totalPages = total === 0 ? 1 : Math.ceil(total / limit);

    return {
      transactions,
      page,
      total,
      totalPages,
      user: {
        email: user.email,
        balance: user.balance,
      },
    };
  }

  async mine(email: string, amount: number) {
    const existingUser = await this.findUserByEmail(email);
    if (!existingUser) throw new NotFoundException('User not Found, please signup');
    if (existingUser.ActivateBot) {
      existingUser.balance += amount;
      existingUser.totalYield += amount;
      // await this.crewService.awardReferralBonus(existingUser.userID, amount, "mining_profit")
      const newTransaction = new this.transactionModel({ email, type: 'yield', amount, status: 'completed', date: new Date() })
      await newTransaction.save()
      await existingUser.save();
      return existingUser.balance;
    } else {
      throw new ConflictException('Your account has been suspended. Please Vist Customer Care')
    }
  }

  async getPlan(email: string, amount: number, plan: string) {
    const existingUser = await this.findUserByEmail(email);
    if (!existingUser) throw new NotFoundException('User not Found, please signup');
    if (existingUser.ActivateBot) {
      if (existingUser.balance < amount) {
        throw new InternalServerErrorException('Insufficient balance for withdrawal');
      }
      existingUser.balance -= amount;
      const newTransaction = new this.transactionModel({ email, type: 'tier', amount, plan, status: 'completed', date: new Date() })
      await newTransaction.save()
      await existingUser.save();
      return existingUser.balance;
    } else {
      throw new ConflictException('Your account has been suspended. Please Vist Customer Care')
    }
  }

  async resolveAccount(account_number: string, account_bank: string) {
    const FLW_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY;
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          'https://api.flutterwave.com/v3/accounts/resolve',
          {
            account_number,
            account_bank,
          },
          {
            headers: {
              Authorization: `Bearer ${FLW_SECRET_KEY}`,
              'Content-Type': 'application/json',
            },
          }
        )
      );
      return response.data;
    } catch (error) {
      throw new HttpException(error.response?.data || 'Flutterwave error', error.response?.status || 500);
    }
  }

  async spinReward(email: string, amount: number) {
    const existingUser = await this.findUserByEmail(email);
    if (!existingUser) throw new NotFoundException('user not Found, please signup');
    if (existingUser.ActivateBot) {
      const startTime = new Date(existingUser.spinWheelTimerStart);
      const currentTime = new Date();
      const timeDifference = currentTime.getTime() - startTime.getTime();
      const hoursInMilliseconds = 24 * 60 * 60 * 1000;
      if (timeDifference < hoursInMilliseconds) throw new BadRequestException('Time for next spin has not elapsed. Please try again later.');
      try {
        existingUser.balance += amount;
        existingUser.spinWheelTimerStart = Date.now();
        const newTransaction = new this.transactionModel({ email, type: 'bonus', amount, status: 'completed', date: new Date() })
        await newTransaction.save()
        await existingUser.save();
        return existingUser.balance;
      } catch (err) {
        console.error('Error processing spin reward:', err)
        throw new InternalServerErrorException('An error occurred while processing your spin reward. please try again later. Error: ' + err.message)
      }
    }
  }
}
