import { Controller, Post, Body, UseGuards, Req, Get, Query, ParseIntPipe, ForbiddenException, Logger } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/strategies/jwt-auth.guard';
import { TransactionService } from './transaction.service';
import { DepositDto, getPlanDTO, ResolveDetailsDTO, UseBalanceDTO, WithdrawDto } from './dto/transaction.dto';

@UseGuards(JwtAuthGuard)
@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) { }


  @Post('create')
  async createPayment(@Req() req, @Body() body: { amount: number }) {
    const email = req.user.email;
    const order = await this.transactionService.generatePaymentAddress(body.amount, email);

    return order;
  }

  @Post('create-deposit-transaction')
  async createDepositTransaction(@Body() body: { orderID: string }, @Req() req) {
    const email = req.user.email;
    const { orderID } = body;
    if (!orderID) throw new ForbiddenException('orderID is required');
    return await this.transactionService.createDepositTransaction(orderID, email);
  }

  @Post('withdraw')
  async WithdrawDto(@Body() withdrawDto: WithdrawDto, @Req() req) {
    const email = req.user.email;
    return this.transactionService.withdraw(withdrawDto, email)
  }

  @Get()
  async getTransactions(
    @Req() req,
    @Query('limit', ParseIntPipe) limit = 50,
    @Query('page', ParseIntPipe) page = 1
  ) {
    const email = req.user.email
    return this.transactionService.getTransactionHistory(email, limit, page)
  }

  @Post('getPlan')
  async getPlan(@Body() getPlanDto: getPlanDTO, @Req() req) {
    const email = req.user.email
    return this.transactionService.getPlan(email, getPlanDto.amount, getPlanDto.plan)
  }
  @Post('mine')
  async mine(@Body('amount') amount: number, @Req() req) {
    const email = req.user.email
    return this.transactionService.mine(email, amount)
  }
  @Post('resolve_account')
  async resolveAccount(@Body() resolveDetailsDTO: ResolveDetailsDTO) {
    return this.transactionService.resolveAccount(resolveDetailsDTO.account_number, resolveDetailsDTO.account_bank)
  }

  @Get('spin-wheel')
  async spinWheel(@Req() req) {
    const email = req.user.email;
    return this.transactionService.spinReward(email, 0.01)
  }

  @Get('check-in-transaction')
  async getCheckInTransactions(
    @Req() req,
    @Query('limit', ParseIntPipe) limit = 50,
    @Query('page', ParseIntPipe) page = 1
  ) {
    const email = req.user.email
    return this.transactionService.getCheckInTransactions(email, limit, page)
  }
}