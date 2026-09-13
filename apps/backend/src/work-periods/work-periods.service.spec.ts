import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
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
              findAll: jest.fn(),
              findMany: jest.fn(),
              findOne: jest.fn(),
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
        ...workPeriodData,
        startDate: new Date(workPeriodData.startDate),
        endDate: new Date(workPeriodData.endDate),
      };

      jest
        .spyOn(prisma.workPeriod, 'findUnique')
        .mockResolvedValue(null);
      jest
        .spyOn(prisma.workPeriod, 'create')
        .mockResolvedValue(expectedWorkPeriod as any);

      const result = await service.create(workPeriodData);
      expect(result).toEqual(expectedWorkPeriod);
    });

    it('should throw BadRequestException if name already exists in pre-check', async () => {
      const workPeriodData = {
        name: '2024 Spring',
        startDate: '2024-03-01',
        endDate: '2024-06-30',
      };

      jest
        .spyOn(prisma.workPeriod, 'findUnique')
        .mockResolvedValue({ id: 1, ...workPeriodData } as any);

      await expect(service.create(workPeriodData)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException on concurrent unique constraint violation (P2002)', async () => {
      const workPeriodData = {
        name: '2024 Spring',
        startDate: '2024-03-01',
        endDate: '2024-06-30',
      };

      jest.spyOn(prisma.workPeriod, 'findUnique').mockResolvedValue(null);
      const p2002Error = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint violation',
        { code: 'P2002', clientVersion: '5.x' },
      );
      jest.spyOn(prisma.workPeriod, 'create').mockRejectedValue(p2002Error);

      await expect(service.create(workPeriodData)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('update', () => {
    it('should update a work period', async () => {
      const updateData = {
        name: '2024 Spring Updated',
      };
      const expected = {
        id: 1,
        name: '2024 Spring Updated',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-06-30'),
      };

      jest.spyOn(prisma.workPeriod, 'findUnique').mockResolvedValue(null);
      jest
        .spyOn(prisma.workPeriod, 'update')
        .mockResolvedValue(expected as any);

      const result = await service.update(1, updateData);
      expect(result).toEqual(expected);
    });

    it('should throw BadRequestException if new name belongs to another work period', async () => {
      jest.spyOn(prisma.workPeriod, 'findUnique').mockResolvedValue({
        id: 2,
        name: 'Existing Name',
      } as any);

      await expect(
        service.update(1, { name: 'Existing Name' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException on concurrent unique constraint violation (P2002)', async () => {
      jest.spyOn(prisma.workPeriod, 'findUnique').mockResolvedValue(null);
      const p2002Error = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint violation',
        { code: 'P2002', clientVersion: '5.x' },
      );
      jest.spyOn(prisma.workPeriod, 'update').mockRejectedValue(p2002Error);

      await expect(
        service.update(1, { name: 'Concurrent Name' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return an array of work periods and deduplicate legacy duplicates by keeping the one with logs', async () => {
      const mockWorkPeriods = [
        {
          id: 2,
          name: '2025/2026 II. félév',
          startDate: new Date('2026-01-01'),
          endDate: new Date('2026-05-31'),
          _count: { logs: 0 },
        },
        {
          id: 1,
          name: '2025/2026 II. félév',
          startDate: new Date('2026-01-01'),
          endDate: new Date('2026-05-31'),
          _count: { logs: 29 },
        },
        {
          id: 3,
          name: '2025/2026 I. félév',
          startDate: new Date('2025-09-01'),
          endDate: new Date('2025-12-31'),
          _count: { logs: 15 },
        },
      ];

      jest
        .spyOn(prisma.workPeriod, 'findMany')
        .mockResolvedValue(mockWorkPeriods as any);

      const result = await service.findAll();
      expect(result).toHaveLength(2);
      const springSemester = result.find(
        (wp) => wp.name === '2025/2026 II. félév',
      );
      expect(springSemester?.id).toBe(1);
      expect(springSemester?._count?.logs).toBe(29);
    });
  });

  describe('findCurrent', () => {
    it('should return active work period if found by date range', async () => {
      const activeWorkPeriod = {
        id: 1,
        name: 'Active Period',
        startDate: new Date(),
        endDate: new Date(),
        _count: { logs: 5 },
      };

      jest
        .spyOn(prisma.workPeriod, 'findFirst')
        .mockResolvedValue(activeWorkPeriod as any);

      const result = await service.findCurrent();
      expect(result).toEqual(activeWorkPeriod);
    });

    it('should extend/update and return existing work period if found by semester name', async () => {
      const existingByName = {
        id: 10,
        name: '2025/2026 II. félév',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-05-31'),
        _count: { logs: 20 },
      };

      jest
        .spyOn(prisma.workPeriod, 'findFirst')
        .mockResolvedValueOnce(null) // Not found by date
        .mockResolvedValueOnce(existingByName as any); // Found by name

      const updated = { ...existingByName, endDate: new Date('2026-08-31') };
      jest
        .spyOn(prisma.workPeriod, 'update')
        .mockResolvedValue(updated as any);

      const result = await service.findCurrent();
      expect(prisma.workPeriod.update).toHaveBeenCalled();
      expect(result).toEqual(updated);
    });

    it('should create new work period if neither date range nor name matches', async () => {
      jest
        .spyOn(prisma.workPeriod, 'findFirst')
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      const created = {
        id: 99,
        name: 'New Period',
        startDate: new Date(),
        endDate: new Date(),
        _count: { logs: 0 },
      };
      jest
        .spyOn(prisma.workPeriod, 'create')
        .mockResolvedValue(created as any);

      const result = await service.findCurrent();
      expect(prisma.workPeriod.create).toHaveBeenCalled();
      expect(result).toEqual(created);
    });

    it('should handle concurrent creation race condition gracefully (P2002)', async () => {
      const existing = {
        id: 50,
        name: 'Concurrent Period',
        startDate: new Date(),
        endDate: new Date(),
        _count: { logs: 0 },
      };

      jest
        .spyOn(prisma.workPeriod, 'findFirst')
        .mockResolvedValueOnce(null) // Not found by date
        .mockResolvedValueOnce(null) // Not found by name
        .mockResolvedValueOnce(existing as any); // Found on P2002 retry

      const p2002Error = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint violation',
        { code: 'P2002', clientVersion: '5.x' },
      );
      jest
        .spyOn(prisma.workPeriod, 'create')
        .mockRejectedValue(p2002Error);

      const result = await service.findCurrent();
      expect(result).toEqual(existing);
    });
  });
});
