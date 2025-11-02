import { Test, TestingModule } from '@nestjs/testing';
import { Difficulty, LogCategory } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { LogsService } from './logs.service';

describe('LogsService', () => {
  let service: LogsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogsService,
        {
          provide: PrismaService,
          useValue: {
            log: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<LogsService>(LogsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a log', async () => {
      const logData = {
        date: '2024-11-02',
        category: LogCategory.PROJECT,
        description: 'Worked on feature X',
        difficulty: Difficulty.MEDIUM,
        timeSpent: 120,
        userId: 1,
        projectId: 1,
        workPeriodId: 1,
      };

      const expectedLog = {
        id: 1,
        date: new Date(logData.date),
        category: logData.category,
        description: logData.description,
        difficulty: logData.difficulty,
        timeSpent: logData.timeSpent,
        userId: logData.userId,
        projectId: logData.projectId,
        workPeriodId: logData.workPeriodId,
        user: { id: 1, fullName: 'Test User', email: 'test@example.com' },
        project: { id: 1, name: 'Test Project' },
        workPeriod: { id: 1, name: '2024 Spring' },
      };

      jest.spyOn(prisma.log, 'create').mockResolvedValue(expectedLog as any);

      const result = await service.create(logData);
      expect(result).toEqual(expectedLog);
    });
  });

  describe('findAll', () => {
    it('should return an array of logs', async () => {
      const expectedLogs = [
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

      jest.spyOn(prisma.log, 'findMany').mockResolvedValue(expectedLogs as any);

      const result = await service.findAll();
      expect(result).toEqual(expectedLogs);
    });
  });
});
