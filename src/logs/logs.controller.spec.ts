import { Test, TestingModule } from '@nestjs/testing';
import { Difficulty, LogCategory } from './dto/create-log.dto';
import { LogsController } from './logs.controller';
import { LogsService } from './logs.service';

describe('LogsController', () => {
  let controller: LogsController;
  let service: LogsService;

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
    }).compile();

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
        userId: 1,
        projectId: 1,
        workPeriodId: 1,
      };
      const expectedResult = {
        id: 1,
        ...dto,
        date: new Date(dto.date),
        user: { id: 1, fullName: 'Test User', email: 'test@example.com' },
        project: { id: 1, name: 'Test Project' },
        workPeriod: { id: 1, name: '2024 Spring' },
      };

      jest.spyOn(service, 'create').mockResolvedValue(expectedResult as any);

      expect(await controller.create(dto)).toBe(expectedResult);
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
