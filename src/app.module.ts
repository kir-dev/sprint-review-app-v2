import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { LogsModule } from './logs/logs.module';
import { ProjectsModule } from './projects/projects.module';
import { UsersModule } from './users/users.module';
import { WorkPeriodsModule } from './work-periods/work-periods.module';

@Module({
  imports: [
    PrismaModule,
    ProjectsModule,
    UsersModule,
    WorkPeriodsModule,
    LogsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
