import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { UserModule } from 'src/common/schemas/user/user.module';
import { JwtStrategy } from 'src/common/strategies/jwt.strategy';
import { UserCrewModule } from 'src/common/schemas/crew/userCrew.module';
import { CrewModule } from 'src/crew/crew.module';
import { UserTransactionModule } from 'src/common/schemas/transaction/userTransaction.module';
import { UserAdminModule } from 'src/common/schemas/admin/userAdmin.module';

@Module({
  imports: [ UserModule, UserCrewModule, CrewModule, UserTransactionModule, UserAdminModule ],
  controllers: [ProfileController],
  providers: [ProfileService, JwtStrategy],
  exports: [ProfileService]
})
export class ProfileModule {}
