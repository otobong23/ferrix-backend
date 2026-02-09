import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateAdminDto { }

export class AdminLoginDto {
   @IsString() @IsNotEmpty()
   username: string;

   @IsString() @IsNotEmpty()
   password: string
}

export class AdminUpdateDto {
   @IsNumber()@IsOptional()
   ProfitStop: number;

   @IsNumber()@IsOptional()
   totalTransactions: number;

   @IsString()@IsOptional()
   walletAddress: string;

   @IsString()@IsOptional()
   whatsappLink: string;

   @IsString()@IsOptional()
   telegramLink: string;

   @IsString()@IsOptional()
   email: string;
   
   @IsString()@IsOptional()
   password: string;
}

export class UpdateTransactionDto {
  @IsEnum(['completed', 'failed'])
  status: 'completed' | 'failed';

  @IsString()
  @IsOptional()
  image?: string;

  @IsNumber()
  amount?: number

  @IsEnum(['minus', 'add'])
  action?: 'minus' | 'add'
}