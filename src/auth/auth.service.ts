import { Injectable, UnauthorizedException, ConflictException, BadRequestException, InternalServerErrorException, NotFoundException, RequestTimeoutException } from '@nestjs/common';
import { Login, Signup } from './dto/auth.types';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/common/schemas/user/user.schema';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import doHash, { validateHash } from 'src/common/helpers/hashing';
import * as crypto from 'crypto';
import { config } from 'dotenv';
import sendResetMail from 'src/common/helpers/mailer';
import { CrewService } from 'src/crew/crew.service';
import { OAuth2Client } from 'google-auth-library';

config()


export function generateUserID(): string {
  return crypto.randomBytes(3).toString('hex'); // 6-char code like 'a4d2f1'
}


@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private crewService: CrewService,
    private jwtService: JwtService,
    private googleClient: OAuth2Client
  ) { }

  private async generateUniqueUserID(): Promise<string> {
    let userID: string;
    let exists = true;
    let attempts = 0;
    const MAX_ATTEMPTS = 10;

    while (exists && attempts < MAX_ATTEMPTS) {
      userID = generateUserID();
      const user = await this.userModel.findOne({ userID });
      exists = !!user;
      attempts++;
    }

    if (exists) throw new RequestTimeoutException('Failed to generate unique userID after multiple attempts');

    return userID!;
  }

  private async handleReferrer(referral_code?: string) {
    if (!referral_code) return undefined;

    const referrer = await this.userModel.findOne({ referral_code });
    if (!referrer) throw new BadRequestException('Invalid referral code');

    await this.userModel.findByIdAndUpdate(referrer._id, {
      $inc: { referral_count: 1 },
    });

    return referrer.referral_code;
  }

  private async createCrewIfNotExists(user: UserDocument) {
    const existingCrew = await this.crewService.getUserCrew(user.email);
    if (!existingCrew) await this.crewService.createCrew(user);
  }

  private generateJwt(user: UserDocument) {
    const payload = { userID: user.userID, email: user.email, sub: user._id };
    return this.jwtService.sign(payload);
  }

  private formatAuthResponse(user: UserDocument, message = 'login successful') {
    return {
      success: true,
      access_token: this.generateJwt(user),
      user: {
        userID: user.toObject().userID,
        email: user.toObject().email,
        sub: user.toObject()._id,
        expires_at: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
      },
      message,
    };
  }

  private async verifyGoogleToken(token: string) {
    const ticket = await this.googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    return ticket.getPayload();
  }

  //Normal Auth
  //start
  async validateUser({ email, password }: Login): Promise<any> {
    const user = await this.userModel.findOne({ email });
    if (user && user.password && await validateHash(password, user.password)) {
      const { password, ...result } = user.toObject();
      return result;
    }
    throw new UnauthorizedException('Invalid credentials');
  }
  async login(user: UserDocument) {
    await this.createCrewIfNotExists(user);
    return this.formatAuthResponse(user);
  }

  async signup(signup: Signup) {
    const { email, fullName, DOB, password, referral_code, phone } = signup;

    if (await this.userModel.findOne({ email })) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await doHash(password, 10);
    const referredBy = await this.handleReferrer(referral_code);
    const userID = await this.generateUniqueUserID();

    const newUser = new this.userModel({
      userID,
      email,
      fullName,
      DOB,
      username: `${fullName.split(' ')[0]}_${userID}`,
      password: hashedPassword,
      referral_code: userID,
      referredBy,
      whatsappNo: phone
    });

    await newUser.save();
    await this.crewService.createCrew(newUser);

    if (referral_code) {
      await this.crewService.updateCrew(referral_code, newUser);
    }

    return this.formatAuthResponse(newUser);
  }

  //end

  //Google service functionalities
  //start


  async googleLogin(token: string) {
    const ticket = await this.verifyGoogleToken(token);
    if (!ticket) throw new UnauthorizedException('Invalid Google token');

    const { sub } = ticket;
    const user = await this.userModel.findOne({ googleId: sub });

    if (!user) {
      throw new UnauthorizedException(
        'Google account not linked. Please sign up first.',
      );
    }

    return this.formatAuthResponse(user);
  }

  async googleSignup(token: string, referral_code?: string) {
    const ticket = await this.verifyGoogleToken(token);
    if (!ticket) throw new UnauthorizedException('Invalid Google token');

    const { email, sub, picture, name } = ticket;

    // Find existing user by email
    let user = await this.userModel.findOne({ email });

    // If already linked to this Google → conflict
    if (user?.googleId && user.googleId === sub) {
      throw new ConflictException('Account already exists. Please login.');
    }

    // If email linked to another Google account → block
    if (user?.googleId && user.googleId !== sub) {
      throw new UnauthorizedException(
        'Email already linked to another Google account',
      );
    }

    // Link existing user without googleId
    if (user && !user.googleId) {
      user.googleId = sub;
      user.profileImage = picture ?? user.profileImage;
      await user.save();
    }

    // Create new user if none exists
    if (!user) {
      const userID = await this.generateUniqueUserID();
      const referredBy = await this.handleReferrer(referral_code);

      user = new this.userModel({
        userID,
        email,
        googleId: sub,
        profileImage: picture,
        username: `${name?.split(' ')[0]}_${userID}`,
        referral_code: userID,
        referredBy,
      });

      await user.save();
      await this.crewService.createCrew(user);

      if (referral_code) {
        await this.crewService.updateCrew(referral_code, user);
      }
    }

    return this.formatAuthResponse(user);
  }


  //end

  //sendCode service functionalities
  //start
  async sendCode(email) {
    const existingUser = await this.userModel.findOne({ email });
    if (!existingUser) {
      throw new NotFoundException("User doesn't exists");
    }
    const code = Math.floor(Math.random() * 10000).toString().padStart(6, '0');
    const info = await sendResetMail(email, existingUser.username, code)
    if (!info) {
      throw new InternalServerErrorException(`Failed to send to Code to ${email}`)
    }
    existingUser.forgotPasswordCode = code
    existingUser.forgotPasswordCodeExpiresAt = Date.now() + 10 * 60 * 60 * 1000
    existingUser.save()

    return { success: true, message: 'Code Sent Successfully!' }
  }
  //end

  //verifyCode service functionalities
  //start
  async verifyCode(email, code) {
    const existingUser = await this.userModel.findOne({ email }).select('+forgotPasswordCode +forgotPasswordCodeExpiresAt')
    if (!existingUser) {
      throw new NotFoundException("User doesn't exists");
    }
    if (!existingUser.forgotPasswordCode || !existingUser.forgotPasswordCodeExpiresAt) {
      throw new InternalServerErrorException('Something Went Wrong')
    }
    if (Date.now() > existingUser.forgotPasswordCodeExpiresAt) {
      throw new RequestTimeoutException('Code Has Expired!')
    }
    if (code === existingUser.forgotPasswordCode) {
      existingUser.forgotPasswordCode = undefined
      existingUser.forgotPasswordCodeExpiresAt = undefined
      await existingUser.save()
      const token = this.jwtService.sign({
        sub: existingUser._id,
        email,
        purpose: 'password-reset',
      }, {
        secret: process.env.JWT_RESET_SECRET,
        expiresIn: '10m'
      });
      return { success: true, message: 'Code verified Successfully!!!', password_token: token }
    } else {
      throw new ConflictException('Code is Invalid')
    }
  }
  //end

  //updatePassword service functionalities
  //start
  async updatePassword(email, newPassword) {
    const existingUser = await this.userModel.findOne({ email })
    if (!existingUser) {
      throw new NotFoundException("User doesn't exists");
    }
    const hashedPassword = await doHash(newPassword, 10);
    existingUser.password = hashedPassword
    await existingUser.save()
    return { success: true, message: 'Password Set Successfully' }
  }
  //end


}
