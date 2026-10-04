import { ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateLogDto, Difficulty, LogCategory } from './dto/create-log.dto';
import { UpdateLogDto } from './dto/update-log.dto';
import { LogsController } from './logs.controller';
import { LogsService } from './logs.service';

describe('LogsController', () => {
  let controller: LogsController;
  let service: LogsService;
  const currentUser = { id: 7 };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LogsController],
      providers: [
        {
          provide: LogsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            getStatsByUser: jest.fn(),
            getStatsByProject: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<LogsController>(LogsController);
    service = module.get<LogsService>(LogsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a log', async () => {
      const dto = {
        date: '2024-11-02',
        category: LogCategory.PROJECT,
        description: 'Worked on feature X',
        difficulty: Difficulty.MEDIUM,
        timeSpent: 120,
        projectId: 1,
        workPeriodId: 1,
      };
      const expectedResult = {
        id: 1,
        ...dto,
        userId: 1,
        date: new Date(dto.date),
        user: { id: 1, fullName: 'Test User', email: 'test@example.com' },
        project: { id: 1, name: 'Test Project' },
        workPeriod: { id: 1, name: '2024 Spring' },
      };

      jest.spyOn(service, 'create').mockResolvedValue(expectedResult as any);

      expect(await controller.create(currentUser, dto)).toBe(expectedResult);
      expect(service.create).toHaveBeenCalledWith(currentUser.id, dto);
    });
  });

  describe('update', () => {
    it('should update the log on behalf of the current user', async () => {
      const dto = { description: 'Updated description' };
      jest.spyOn(service, 'update').mockResolvedValue({ id: 3 } as any);

      await controller.update('3', currentUser, dto);

      expect(service.update).toHaveBeenCalledWith(3, currentUser.id, dto);
    });
  });

  describe('remove', () => {
    it('should delete the log on behalf of the current user', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue({ id: 3 } as any);

      await controller.remove('3', currentUser);

      expect(service.remove).toHaveBeenCalledWith(3, currentUser.id);
    });
  });

  describe('request validation', () => {
    const pipe = new ValidationPipe({ whitelist: true, transform: true });

    it('should drop a client-supplied userId when creating a log', async () => {
      const body = await pipe.transform(
        {
          date: '2024-11-02',
          category: LogCategory.OTHER,
          description: 'Attempt to log for someone else',
          workPeriodId: 1,
          userId: 99,
        },
        { type: 'body', metatype: CreateLogDto },
      );

      expect(body).not.toHaveProperty('userId');
    });

    it('should drop a client-supplied userId when updating a log', async () => {
      const body = await pipe.transform(
        { userId: 99 },
        { type: 'body', metatype: UpdateLogDto },
      );

      expect(body).not.toHaveProperty('userId');
    });
  });

  describe('findAll', () => {
    it('should return an array of logs', async () => {
      const expectedResult = [
        {
          id: 1,
          date: new Date('2024-11-02'),
          category: LogCategory.PROJECT,
          description: 'Test log',
          difficulty: Difficulty.MEDIUM,
          timeSpent: 120,
          userId: 1,
          projectId: 1,
          workPeriodId: 1,
          user: { id: 1, fullName: 'Test User', email: 'test@example.com' },
          project: { id: 1, name: 'Test Project' },
          workPeriod: { id: 1, name: '2024 Spring' },
        },
      ];

      jest.spyOn(service, 'findAll').mockResolvedValue(expectedResult as any);

      expect(await controller.findAll()).toBe(expectedResult);
    });
  });
});
