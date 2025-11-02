import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { WorkPeriodsController } from './work-periods.controller';
import { WorkPeriodsService } from './work-periods.service';

@Module({
  imports: [PrismaModule],
  controllers: [WorkPeriodsController],
  providers: [WorkPeriodsService],
  exports: [WorkPeriodsService],
})
export class WorkPeriodsModule {}
