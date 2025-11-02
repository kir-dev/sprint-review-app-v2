import { Test, TestingModule } from '@nestjs/testing';
import { WorkPeriodsController } from './work-periods.controller';
import { WorkPeriodsService } from './work-periods.service';

describe('WorkPeriodsController', () => {
  let controller: WorkPeriodsController;
  let service: WorkPeriodsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkPeriodsController],
      providers: [
        {
          provide: WorkPeriodsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            findCurrent: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            getWorkPeriodLogs: jest.fn(),
            getWorkPeriodStats: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<WorkPeriodsController>(WorkPeriodsController);
    service = module.get<WorkPeriodsService>(WorkPeriodsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a work period', async () => {
      const dto = {
        name: '2024 Spring',
        startDate: '2024-03-01',
        endDate: '2024-06-30',
      };
      const expectedResult = {
        id: 1,
        name: dto.name,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
      };

      jest.spyOn(service, 'create').mockResolvedValue(expectedResult);

      expect(await controller.create(dto)).toBe(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return an array of work periods', async () => {
      const expectedResult = [
        {
          id: 1,
          name: '2024 Spring',
          startDate: new Date('2024-03-01'),
          endDate: new Date('2024-06-30'),
          _count: { logs: 10 },
        },
      ];

      jest.spyOn(service, 'findAll').mockResolvedValue(expectedResult);

      expect(await controller.findAll()).toBe(expectedResult);
    });
  });
});
