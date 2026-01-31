import { IsNotEmpty, IsOptional, IsString, Length, IsEmail } from 'class-validator';

export class Signup {
   @IsNotEmpty()@IsString()@IsEmail()
   readonly email: string;
   
   @IsNotEmpty()@IsString()
   readonly fullName: string;

   @IsNotEmpty()@IsString()@Length(6, 20)
   readonly password: string;

   @IsNotEmpty()@IsString()
   readonly DOB: string;

   @IsNotEmpty()@IsString()
   readonly phone: string;

   @IsOptional()@IsString()
   readonly referral_code?: string;
}

export class Login {
   @IsNotEmpty()@IsString()@IsEmail()
   readonly email: string;

   @IsNotEmpty()@IsString()@Length(6)
   readonly password: string;
}


export class sendVerification {
   @IsEmail()@IsNotEmpty()@IsString()
   readonly email: string
}