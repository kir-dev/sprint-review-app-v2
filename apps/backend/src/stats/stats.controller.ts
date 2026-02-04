import { Controller, Get, Param } from '@nestjs/common';
import { StatsService } from './stats.service';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get(':userId/breakdown')
  async getBreakdown(@Param('userId') userId: string) {
    return this.statsService.getBreakdown(+userId);
  }

  @Get(':userId/history')
  async getHistory(@Param('userId') userId: string) {
    return this.statsService.getHistory(+userId);
  }

  @Get(':userId/gamification')
  async getGamification(@Param('userId') userId: string) {
    return this.statsService.getGamification(+userId);
  }

  @Get(':userId/positions')
  async getPositions(@Param('userId') userId: string) {
    return this.statsService.getPositionHistory(+userId);
  }
}
