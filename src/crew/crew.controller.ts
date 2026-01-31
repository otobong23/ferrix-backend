import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { CrewService } from './crew.service';
import { JwtAuthGuard } from 'src/common/strategies/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('crew')
export class CrewController {
  constructor(private readonly crewService: CrewService) {}

  @Get()
  async getUserCrew(@Req() req){
    const email = req.user.email
    return this.crewService.getUserCrew(email)
  }
}
