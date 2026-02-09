import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from 'src/common/strategies/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateTierDto } from './dto/create-profile.dto';

@UseGuards(JwtAuthGuard)
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  getProfile(@Req() req) {
    return this.profileService.getUserProfile(req.user)
  }

  @Delete()
  deleteUser(@Req() req) {
    return this.profileService.deleteUser(req.user.email)
  }

  @Patch('update')
  updateProfile(@Req() req, @Body() updateProfileDto: UpdateProfileDto) {
    const email = req.user.email
    return this.profileService.updateUser(email, updateProfileDto);
  }
  
  @Patch('update-plan')
  updatePlan(@Req() req, @Body() newPlan: CreateTierDto) {
    const email = req.user.email
    return this.profileService.updateCurrentPlan(email, newPlan);
  }
}
