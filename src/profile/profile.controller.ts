import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, InternalServerErrorException } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from 'src/common/strategies/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateTierDto, supportMailDTO, TierDetailsDto } from './dto/create-profile.dto';
import { sendHelpMail } from 'src/common/helpers/mailer';

@UseGuards(JwtAuthGuard)
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) { }

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
    console.log('debug')
    const email = req.user.email
    return this.profileService.updateUser(email, updateProfileDto);
  }

  @Patch('update-plan')
  updatePlan(@Req() req, @Body() newPlan: TierDetailsDto) {
    const email = req.user.email
    return this.profileService.updateCurrentPlan(email, newPlan);
  }

  @Post('support-mail')
  async supportMail(@Body() body: supportMailDTO) {
    const { email, name, message } = body

    const info = await sendHelpMail(email, name, message)
    if (!info) {
      throw new InternalServerErrorException(`Failed to send support email to ${email}`);
    }

    return { message: 'Message sent Successfully' }
  }
}
