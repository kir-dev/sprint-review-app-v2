import { Module } from '@nestjs/common';
import { EventsModule } from '../events/events.module';
import { LogsModule } from '../logs/logs.module';
import { ProjectsModule } from '../projects/projects.module';
import { UsersModule } from '../users/users.module';
import { WorkPeriodsModule } from '../work-periods/work-periods.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [LogsModule, ProjectsModule, WorkPeriodsModule, UsersModule, EventsModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
