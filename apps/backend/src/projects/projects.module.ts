import { Module } from '@nestjs/common';
import { FeaturesModule } from '../features/features.module';
import { ProjectController } from './projects.controller';
import { ProjectService } from './projects.service';

@Module({
  imports: [FeaturesModule],
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [ProjectService],
})
export class ProjectsModule {}
