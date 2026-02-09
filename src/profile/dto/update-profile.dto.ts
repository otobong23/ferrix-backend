import { PartialType } from '@nestjs/mapped-types';
import { CreateTierDto } from './create-profile.dto';

export class UpdateProfileDto extends PartialType(CreateTierDto) {}
