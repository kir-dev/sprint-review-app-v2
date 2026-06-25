import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  getSummary(@Req() req: Request) {
    return this.dashboardService.getSummary((req.user as any).id);
  }

  @Get('projects')
  getProjects(@Req() req: Request) {
    return this.dashboardService.getProjectsStats((req.user as any).id);
  }

  @Get('feed')
  getFeed(@Req() req: Request) {
    return this.dashboardService.getFeed((req.user as any).id);
  }

  @Get('stats')
  getStats(@Req() req: Request) {
    return this.dashboardService.getStats((req.user as any).id);
  }

  @Get('events')
  getEvents(@Req() req: Request) {
    return this.dashboardService.getEvents((req.user as any).id);
  }

  @Get('top-users')
  getTopUsers() {
    return this.dashboardService.getTopUsers();
  }
}
