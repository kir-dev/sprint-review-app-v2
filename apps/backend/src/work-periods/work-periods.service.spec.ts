import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { WorkPeriodsService } from './work-periods.service';

describe('WorkPeriodsService', () => {
  let service: WorkPeriodsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkPeriodsService,
        {
          provide: PrismaService,
          useValue: {
            workPeriod: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<WorkPeriodsService>(WorkPeriodsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a work period', async () => {
      const workPeriodData = {
        name: '2024 Spring',
        startDate: '2024-03-01',
        endDate: '2024-06-30',
      };

      const expectedWorkPeriod = {
        id: 1,
        name: workPeriodData.name,
        startDate: new Date(workPeriodData.startDate),
        endDate: new Date(workPeriodData.endDate),
      };

      jest
        .spyOn(prisma.workPeriod, 'create')
        .mockResolvedValue(expectedWorkPeriod);

      const result = await service.create(workPeriodData);
      expect(result).toEqual(expectedWorkPeriod);
    });
  });

  describe('findAll', () => {
    it('should return an array of work periods', async () => {
      const expectedWorkPeriods = [
        {
          id: 1,
          name: '2024 Spring',
          startDate: new Date('2024-03-01'),
          endDate: new Date('2024-06-30'),
          _count: { logs: 10 },
        },
      ];

      jest
        .spyOn(prisma.workPeriod, 'findMany')
        .mockResolvedValue(expectedWorkPeriods);

      const result = await service.findAll();
      expect(result).toEqual(expectedWorkPeriods);
    });
  });
});
