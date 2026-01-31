import { Controller, Post, Body, UseGuards, Req, BadRequestException, Get, Query, ParseIntPipe, Patch } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/strategies/jwt-auth.guard';
import { TransactionService } from './transaction.service';
import { DepositDto, getPlanDTO, ResolveDetailsDTO, UseBalanceDTO, WithdrawDto } from './dto/transaction.dto';

@UseGuards(JwtAuthGuard)
@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) { }

  @Post('deposit')
  async deposit(@Body() depositDto: DepositDto, @Req() req) {
    const email = req.user.email;
    const { image } = depositDto;

    if (image.length > 10 * 1024 * 1024) {
      throw new BadRequestException('File too large');
    }
    return await this.transactionService.deposit(depositDto, email);
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
}
