import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller'
import { JwtStrategy } from 'src/common/strategies/jwt.strategy';
import { configDotenv } from 'dotenv';
import { UserModule } from 'src/common/schemas/user/user.module';
import { CrewModule } from 'src/crew/crew.module';
import { OAuth2Client } from 'google-auth-library';
configDotenv()


@Module({
  imports: [UserModule, CrewModule,],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    {
      provide: OAuth2Client,
      useFactory: () => {
        return new OAuth2Client({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        });
      },
    }
  ],
  exports: [JwtStrategy],
})
export class AuthModule { }
