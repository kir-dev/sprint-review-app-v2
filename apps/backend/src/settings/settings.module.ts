import { GroupAccessModule } from '../group-access/group-access.module';
import { GroupAccessController } from './group-access.controller';
import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';

@Module({
  imports: [PrismaModule, GroupAccessModule],
  controllers: [SettingsController, GroupAccessController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
