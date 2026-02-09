import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserOrder, UserOrderSchema } from './userOrder.schema';

@Module({
   imports: [MongooseModule.forFeature([{ name: UserOrder.name, schema: UserOrderSchema }])],
   exports: [MongooseModule],
})
export class UserOrderModule { }