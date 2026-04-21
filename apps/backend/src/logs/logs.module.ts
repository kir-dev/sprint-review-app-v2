import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { RolesGuard } from '../common/guards/roles.guard';
import { LogsController } from './logs.controller';
import { LogsService } from './logs.service';

@Module({
  imports: [PrismaModule],
  controllers: [LogsController],
  providers: [LogsService, RolesGuard],
  exports: [LogsService],
})
export class LogsModule {}
