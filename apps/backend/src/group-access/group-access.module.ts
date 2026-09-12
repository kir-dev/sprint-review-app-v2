import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { GroupAccessService } from './group-access.service';

@Module({
  imports: [PrismaModule, ConfigModule],
  providers: [GroupAccessService],
  exports: [GroupAccessService],
})
export class GroupAccessModule {}
