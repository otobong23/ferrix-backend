import { Controller, Get, Post, Body, Patch, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Login, sendVerification, Signup } from './dto/auth.types';
import { JwtAuthGuard } from 'src/common/strategies/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  async login(@Body() createAuthDto: Login) {
    const user = await this.authService.validateUser(createAuthDto);
    return this.authService.login(user)
  }
  @Post('signup')
  async signup(@Body() createAuthDto: Signup) {
    return this.authService.signup(createAuthDto);
  }
  @Post('google/signup')
  async googleSignup(@Body('token') token: string, @Body('referral_code') referral_code: string) {
    return this.authService.googleSignup(token, referral_code)
  }
  @Post('google/login')
  async googleLogin(@Body('token') token: string) {
    return this.authService.googleLogin(token)
  }

  

  // @UseGuards(JwtAuthGuard)
  // @Patch('signout')
  // signout(@Req() req){
  //   return req.clearCookie('Authorization')
  // }

  @Patch('sendVerificationCode')
  sendVerification(@Body() { email }: sendVerification) {
    return this.authService.sendCode(email)
  }

  @Patch('verify-code')
  verifyCode(@Body() { email, code }: { email: string, code: string }) {
    return this.authService.verifyCode(email, code)
  }


  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  changePassword(@Body() { newPassword }:{ newPassword: string }, @Req() req) {
    const email = req.user.email;
    return this.authService.updatePassword(email, newPassword);
  }

}
