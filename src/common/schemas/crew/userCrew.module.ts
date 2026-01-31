import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Crew, CrewSchema } from './userCrew.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Crew.name, schema: CrewSchema }]),
    ],
    exports: [MongooseModule]
})
export class UserCrewModule { }