import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { HealthService } from './health.service';

describe('HealthService', () => {
  let healthService: HealthService;
  let execute: jest.Mock;
  let query: jest.Mock;
  let transaction: jest.Mock;

  beforeEach(async () => {
    execute = jest.fn();
    query = jest.fn();
    transaction = jest.fn(async (callback, options) => {
      await callback({ $executeRawUnsafe: execute, $queryRaw: query });
      return options;
    });
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        {
          provide: PrismaService,
          useValue: { $transaction: transaction },
        },
      ],
    }).compile();

    healthService = module.get(HealthService);
  });

  it('reports liveness without querying the database', () => {
    expect(healthService.isLive()).toBe(true);
    expect(transaction).not.toHaveBeenCalled();
    expect(query).not.toHaveBeenCalled();
  });

  it('reports ready when the database probe succeeds', async () => {
    query.mockResolvedValue([{ '?column?': 1 }]);

    await expect(healthService.isReady()).resolves.toBe(true);
    expect(execute).toHaveBeenCalledWith('SET LOCAL statement_timeout = 750');
    expect(transaction).toHaveBeenCalledWith(expect.any(Function), {
      maxWait: 1000,
      timeout: 1000,
    });
  });

  it('reports unavailable without exposing a database error', async () => {
    transaction.mockRejectedValue(
      new Error('database.internal:5432 is unavailable'),
    );

    await expect(healthService.isReady()).resolves.toBe(false);
  });

  it('reports unavailable as soon as shutdown begins', async () => {
    query.mockResolvedValue([{ '?column?': 1 }]);
    healthService.beforeApplicationShutdown();

    await expect(healthService.isReady()).resolves.toBe(false);
    expect(transaction).not.toHaveBeenCalled();
    expect(query).not.toHaveBeenCalled();
  });
});
