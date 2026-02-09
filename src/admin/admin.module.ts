import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController, BlockonomicsController } from './admin.controller';
import { config } from 'dotenv';
import { UserModule } from 'src/common/schemas/user/user.module';
import { UserTransactionModule } from 'src/common/schemas/transaction/userTransaction.module';
import { CrewModule } from 'src/crew/crew.module';
import { ProfileModule } from 'src/profile/profile.module';
import { TransactionModule } from 'src/transaction/transaction.module';
import { UserCrewModule } from 'src/common/schemas/crew/userCrew.module';
import { JwtStrategy } from 'src/common/strategies/jwt.strategy';
import { UserAdminModule } from 'src/common/schemas/admin/userAdmin.module';
import { UserOrderModule } from 'src/common/schemas/order/userOrder.module';
config()

@Module({
  imports: [ UserAdminModule, UserModule, UserOrderModule, UserTransactionModule, UserCrewModule, ProfileModule, TransactionModule, CrewModule ],
  controllers: [AdminController, BlockonomicsController],
  providers: [AdminService, JwtStrategy],
})
export class AdminModule {}
