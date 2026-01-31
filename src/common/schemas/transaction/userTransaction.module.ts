import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserTransaction, UserTransactionSchema } from './userTransaction.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: UserTransaction.name, schema: UserTransactionSchema }]),
    ],
    exports: [MongooseModule]
})
export class UserTransactionModule { }