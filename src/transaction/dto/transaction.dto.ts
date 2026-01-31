import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class DepositDto {

   @IsNotEmpty()@IsNumber()
   amount: number;

   @IsNotEmpty()@IsString()
   image: string; // includes data:image/png;base64,...

   @IsNotEmpty()@IsString()
   transactionID: string
}

export class WithdrawDto {
   
   @IsNotEmpty()@IsNumber()
   amount: number;

   @IsOptional()
   @IsString()
   walletAddress: string;

   @IsNotEmpty()@IsString()
   accountNumber: string;

   @IsNotEmpty()@IsString()
   accountName: string;

   @IsNotEmpty()@IsString()
   bankName: string;

}

export class UseBalanceDTO {
   @IsNotEmpty()@IsNumber()
   amount: number;

   @IsNotEmpty()@IsString()@IsIn(['add', 'minus'])
   action: 'minus' | 'add'
}

export class getPlanDTO {

   @IsNotEmpty()@IsNumber()
   amount: number;

   @IsNotEmpty()@IsString()
   plan: string

}

export class ResolveDetailsDTO{
   @IsNotEmpty()@IsString()
   account_number: string;
   
   @IsNotEmpty()@IsString()
   account_bank: string;
}