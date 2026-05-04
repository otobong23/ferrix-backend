import { BadRequestException, ConflictException, ForbiddenException, HttpException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateEarnerDTO, DepositDto, WithdrawDto } from './dto/transaction.dto';
import { Tier, User, UserDocument } from 'src/common/schemas/user/user.schema';
import { sendMail } from 'src/common/helpers/mailer';
import { UserTransaction, UserTransactionDocument } from 'src/common/schemas/transaction/userTransaction.schema';
import { CrewService } from 'src/crew/crew.service';
import { config } from 'dotenv';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import axios from 'axios';
import { UserOrder, UserOrderDocument } from 'src/common/schemas/order/userOrder.schema';
import { AxiosError } from 'axios';
import { VARIABLES } from 'src/common/constant/variables/variables';
import { Earner, EarnerDocument } from 'src/common/schemas/earners/earner.schema';
config();

const to = process.env.EMAIL_USER
const EXPIRY_MINUTES = 30;

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(UserOrder.name) private readonly userOrderModel: Model<UserOrderDocument>,
    @InjectModel(UserTransaction.name) private readonly transactionModel: Model<UserTransactionDocument>,
    @InjectModel(Earner.name) private earnerModel: Model<EarnerDocument>,
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

  private DURATION_24_HOURS = 24 * 60 * 60 * 1000 //24 hours
  private DURATION_30_MINUTES = 30 * 60 * 1000
  private DURATION = this.DURATION_24_HOURS;

  private handleDailyYield = (param: Tier[] = []) => param.reduce((total, plan) => {
    const price = Number(plan.daily_rate);
    return total + price;
  }, 0);

  async generatePaymentAddress(amount: number, email: string): Promise<{ message: string, order: UserOrderDocument }> {

    const existingUser = await this.userModel.findOne({ email });
    if (!existingUser) throw new NotFoundException('User not found');

    if (!existingUser.ActivateBot) {
      throw new NotFoundException('Your account has been suspended');
    }

    try {

      const fixedAmount = Number(amount);
      const offset = (Math.floor(Math.random() * 90) + 10) / 100;
      let price_amount = fixedAmount + offset;

      let retries = 3;
      while (retries > 0) {
        const exists = await this.userOrderModel.findOne({ displayAmount: price_amount, status: 'pending' });
        if (!exists) break;

        price_amount = fixedAmount + ((Math.floor(Math.random() * 90) + 10) / 100);
        retries--;
      }

      const invoice = {
        pay_address: VARIABLES.DEPOSIT_WALLET_ADDRESS.USDT_BEP20,
        pay_amount: fixedAmount,
        order_id: crypto.randomUUID(),
        price_amount
      };

      const newUserOrder = new this.userOrderModel({
        email,
        address: invoice.pay_address,
        displayAmount: invoice.price_amount,  // this is the randomized amount the user will pay, used to identify the transaction
        expectedAmount: invoice.pay_amount,   // this is the actual amount the user should pay, used for record-keeping
        invoiceId: invoice.order_id,
        status: "pending",
        expiresAt: new Date(Date.now() + EXPIRY_MINUTES * 60 * 1000),
      });

      await newUserOrder.save();

      return {
        message: "Payment invoice generated successfully",
        order: newUserOrder
      };

    } catch (err: any) {
      console.error("Payment Address error:", err?.message || err);
      throw new InternalServerErrorException("Failed to create payment invoice");
    }
  }

  async createDepositTransaction(orderID: string, email: string) {
    const existingUser = await this.userModel.findOne({ email });
    if (!existingUser) throw new NotFoundException('User not found. Please sign up.');
    const order = await this.userOrderModel.findById(orderID);
    if (!order) throw new NotFoundException('order not found');
    if (order.email !== email) throw new ForbiddenException('You are not authorized to confirm this deposit');
    if (order.status !== 'pending') throw new BadRequestException('This order has already been processed');
    if (order.referenceID) return { message: 'This order has already been processed', success: false, redirect: true };
    const newTransaction = new this.transactionModel({ orderID, email, type: 'deposit', amount: order.displayAmount, status: 'pending', date: new Date() }) as UserTransactionDocument & { _id: any };
    await newTransaction.save();

    order.referenceID = newTransaction._id.toString();
    await order.save();
    const mailSent = await sendMail(to, existingUser.email, Number(order.displayAmount), newTransaction._id.toString(), 'deposit')
    return { message: 'Deposit request submitted successfully', transaction: newTransaction, redirect: false }
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
        const percent = Number(amount) * 0.12
        const newTransaction = new this.transactionModel({ email, type: 'withdrawal', amount, status: 'pending', withdrawWalletAddress: walletAddress, date: new Date(), displayAmount: amount - percent }) as UserTransactionDocument & { _id: any };
        await newTransaction.save();
        const mailSent = await sendMail(to, existingUser.email, amount - percent, newTransaction._id.toString(), 'withdrawal')
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

  // async mine(email: string, amount: number) {
  //   const now = Date.now();
  //   const duration = 24 * 60 * 60 * 1000;
  //   // const duration = 1 * 1 * 60 * 1000 //1 minutes


  //   const user = await this.userModel.findOneAndUpdate(
  //     {
  //       email,
  //       ActivateBot: true,
  //       twentyFourHourTimerStart: { $ne: '' },
  //       $expr: {
  //         $lte: [
  //           { $add: [{ $toLong: "$twentyFourHourTimerStart" }, duration] },
  //           now,
  //         ],
  //       },
  //     },
  //     {
  //       $inc: {
  //         balance: amount,
  //         totalYield: amount,
  //       },
  //       $set: {
  //         twentyFourHourTimerStart: '',
  //       },
  //     },
  //     { new: true }
  //   );

  //   if (!user) {
  //     throw new BadRequestException(
  //       'Yield already claimed or timer not finished'
  //     );
  //   }

  //   const newTransaction = new this.transactionModel({
  //     email,
  //     type: 'yield',
  //     amount,
  //     status: 'completed',
  //     date: new Date(),
  //   });

  //   await newTransaction.save();

  //   return user.balance;
  // }

  async createEarner(email: string) {
    const existingUser = await this.userModel.findOne({ email })
    if (!existingUser) throw new NotFoundException('User not Found, please signup');

    if (existingUser.twentyFourHourTimerStart) throw new BadRequestException("Yield already claimed or timer not finished");

    if (!existingUser.currentPlan.length) return;
    const daily_rate = this.handleDailyYield(existingUser.currentPlan)

    const now = Date.now();
    existingUser.twentyFourHourTimerStart = now.toString();

    this.earnerModel.create({
      userID: existingUser.userID,
      daily_rate,
      expiresAt: now + this.DURATION
    });

    await existingUser.save();
    return { success: true, startTime: existingUser.twentyFourHourTimerStart }
  }


  async getPlan(email: string, amount: number, plan: string) {
    const existingUser = await this.findUserByEmail(email);
    if (!existingUser) throw new NotFoundException('User not Found, please signup');
    if (existingUser.ActivateBot) {
      if (existingUser.balance < amount) {
        throw new InternalServerErrorException('Insufficient balance to purchase plan');
      }
      existingUser.balance -= amount;
      const newTransaction = new this.transactionModel({ email, type: 'tier', amount, plan, status: 'completed', date: new Date() })
      await newTransaction.save();
      await existingUser.save();
      await this.crewService.referral_reward_on_plan_purchase(existingUser.userID);
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
    } catch (error: any) {
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
        const newTransaction = new this.transactionModel({ email, type: 'check-in', amount, status: 'completed', date: new Date() })
        await newTransaction.save()
        await existingUser.save();
        return existingUser.balance;
      } catch (err: any) {
        console.error('Error processing spin reward:', err)
        throw new InternalServerErrorException('An error occurred while processing your spin reward. please try again later. Error: ' + err.message)
      }
    }
  }

  async getCheckInTransactions(email: string, limit: number = 50, page: number = 1) {
    limit = Math.max(1, Math.min(limit, 100))
    page = Math.max(1, page)
    const offset = (page - 1) * limit;

    const user = await this.findUserByEmail(email);

    const transactions = await this.transactionModel
      .find({ email, type: 'check-in' })
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
}
