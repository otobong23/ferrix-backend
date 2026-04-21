import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Earner, EarnerSchema } from './earner.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Earner.name, schema: EarnerSchema }])],
  exports: [MongooseModule],
})
export class EarnerModule {}
