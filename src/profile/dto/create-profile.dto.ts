import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class WithdrawalWalletDto {
  @IsString()
  walletAddress: string;

  @IsNumber()
  amount: number;
}

export class TierDetailsDto {
  @IsString()
  name: string;

  @IsString()
  package_level: string;

  @IsNumber()
  price: number;

  @IsNumber()
  contract_duration_in_days: number;

  @IsNumber()
  daily_rate: number;

  @IsNumber()
  total_revenue: number;

  @IsString()
  expiring_At: string;
}

export class CreateTierDto {
  @IsString()
  type: string;

  @IsString()
  title: string;

  @ValidateNested()
  @Type(() => TierDetailsDto)
  details: TierDetailsDto;

  @IsOptional()
  @IsString()
  profileImage?: string;

  @IsOptional()
  @IsString()
  forgotPasswordCode?: string;

  @IsOptional()
  @IsNumber()
  forgotPasswordCodeValidation?: number;

  @IsOptional()
  @IsNumber()
  referral_count?: number;

  @IsOptional()
  @IsString()
  referredBy?: string;

  @IsOptional()
  @IsString()
  referral_code?: string;

  @IsOptional()
  @IsString()
  usdtWallet?: string;

  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  accountNumber?: string;

  @IsOptional()
  @IsString()
  accountName?: string;

  @IsOptional()
  @IsString()
  facebook?: string;

  @IsOptional()
  @IsString()
  telegram?: string;

  @IsOptional()
  @IsString()
  whatsappNo?: string;

  @IsOptional()
  @IsString()
  walletPassword?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => WithdrawalWalletDto)
  withdrawalWallet?: WithdrawalWalletDto;

  @IsOptional()
  @IsEnum(['pending', 'completed', 'failed'])
  withdrawStatus?: 'pending' | 'completed' | 'failed';

  @IsOptional()
  @IsString()
  twentyFourHourTimerStart: string

  @IsOptional()
  @IsBoolean()
  ActivateBot?: boolean;

  @IsOptional()
  @IsNumber()
  vip?: number;

  @IsOptional()
  @IsDate()
  joinDate?: Date;
}
