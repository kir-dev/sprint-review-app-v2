import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { DashboardModule } from './dashboard/dashboard.module';
import { EventsModule } from './events/events.module';
import { FeaturesModule } from './features/features.module';
import { LogsModule } from './logs/logs.module';
import { ProjectsModule } from './projects/projects.module';
import { StatsModule } from './stats/stats.module';
import { UsersModule } from './users/users.module';
import { WorkPeriodsModule } from './work-periods/work-periods.module';
import { SettingsModule } from './settings/settings.module';
import { PositionsModule } from './positions/positions.module';
import { EventCategoriesModule } from './event-categories/event-categories.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    ProjectsModule,
    UsersModule,
    WorkPeriodsModule,
    LogsModule,
    FeaturesModule,
    EventsModule,
    StatsModule,
    DashboardModule,
    SettingsModule,
    PositionsModule,
    EventCategoriesModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
