import { Test, TestingModule } from '@nestjs/testing';
import { FeaturesService } from '../features/features.service';
import { ProjectController } from './projects.controller';
import { ProjectService } from './projects.service';

describe('ProjectController', () => {
  let controller: ProjectController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectController],
      providers: [
        { provide: ProjectService, useValue: {} },
        { provide: FeaturesService, useValue: {} },
      ],
    }).compile();

    controller = module.get<ProjectController>(ProjectController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
