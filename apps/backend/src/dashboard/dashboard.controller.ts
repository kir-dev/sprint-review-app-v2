import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(AuthGuard('jwt'))
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  getSummary(@Req() req: Request) {
    // @ts-ignore
    return this.dashboardService.getSummary(req.user.id);
  }

  @Get('projects')
  getProjects(@Req() req: Request) {
    // @ts-ignore
    return this.dashboardService.getProjectsStats(req.user.id);
  }

  @Get('feed')
  getFeed(@Req() req: Request) {
    // @ts-ignore
    return this.dashboardService.getFeed(req.user.id);
  }

  @Get('stats')
  getStats(@Req() req: Request) {
    // @ts-ignore
    return this.dashboardService.getStats(req.user.id);
  }

  @Get('events')
  getEvents(@Req() req: Request) {
    // @ts-ignore
    return this.dashboardService.getEvents(req.user.id);
  }

  @Get('top-users')
  getTopUsers() {
    return this.dashboardService.getTopUsers();
  }
}
