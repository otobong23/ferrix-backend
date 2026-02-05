import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";


@Injectable()
export default class ResetPasswordStrategy extends PassportStrategy(
  Strategy,
  'jwt-reset-password'
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_RESET_SECRET, // 🔐 DIFFERENT SECRET
    });
  }

  async validate(payload: any) {
    const { email, purpose } = payload;

    if (!email && purpose !== 'password-reset') {
      throw new UnauthorizedException('Invalid reset token');
    }

    return { email };
  }
}