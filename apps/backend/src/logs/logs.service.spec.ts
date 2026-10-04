import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Difficulty, LogCategory, Prisma } from '@prisma/client';
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
        userId: 1,
        projectId: logData.projectId,
        workPeriodId: logData.workPeriodId,
        user: { id: 1, fullName: 'Test User', email: 'test@example.com' },
        project: { id: 1, name: 'Test Project' },
        workPeriod: { id: 1, name: '2024 Spring' },
      };

      jest.spyOn(prisma.log, 'create').mockResolvedValue(expectedLog as any);

      const result = await service.create(1, logData);
      expect(result).toEqual(expectedLog);
    });

    it('should always assign the log to the given user, ignoring any userId in the payload', async () => {
      jest.spyOn(prisma.log, 'create').mockResolvedValue({ id: 1 } as any);

      await service.create(7, {
        date: '2024-11-02',
        category: LogCategory.OTHER,
        description: 'Attempt to log for someone else',
        workPeriodId: 1,
        userId: 99,
      } as any);

      expect(prisma.log.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ user: { connect: { id: 7 } } }),
        }),
      );
    });
  });

  describe('update', () => {
    it('should only update a log owned by the given user', async () => {
      jest.spyOn(prisma.log, 'update').mockResolvedValue({ id: 3 } as any);

      await service.update(3, 7, { description: 'Updated description' });

      expect(prisma.log.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 3, userId: 7 } }),
      );
    });

    it('should not allow reassigning the log to another user', async () => {
      jest.spyOn(prisma.log, 'update').mockResolvedValue({ id: 3 } as any);

      await service.update(3, 7, { userId: 99 } as any);

      const [args] = (prisma.log.update as jest.Mock).mock.calls[0];
      expect(args.data).not.toHaveProperty('user');
      expect(args.data).not.toHaveProperty('userId');
    });

    it("should report someone else's log as not found", async () => {
      jest.spyOn(prisma.log, 'update').mockRejectedValue(recordNotFound());

      await expect(
        service.update(3, 7, { description: 'Updated description' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should only delete a log owned by the given user', async () => {
      jest.spyOn(prisma.log, 'delete').mockResolvedValue({ id: 3 } as any);

      await service.remove(3, 7);

      expect(prisma.log.delete).toHaveBeenCalledWith({
        where: { id: 3, userId: 7 },
      });
    });

    it("should report someone else's log as not found", async () => {
      jest.spyOn(prisma.log, 'delete').mockRejectedValue(recordNotFound());

      await expect(service.remove(3, 7)).rejects.toBeInstanceOf(
        NotFoundException,
      );
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

function recordNotFound() {
  return new Prisma.PrismaClientKnownRequestError('Record not found', {
    code: 'P2025',
    clientVersion: Prisma.prismaVersion.client,
  });
}
