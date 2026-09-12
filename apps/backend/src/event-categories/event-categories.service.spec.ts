import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { EventCategoriesService } from './event-categories.service';

describe('EventCategoriesService', () => {
  const eventCategory = {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };
  const service = new EventCategoriesService({
    eventCategory,
  } as unknown as PrismaService);

  beforeEach(() => jest.clearAllMocks());

  it('translates a concurrent duplicate-name create into a bad request', async () => {
    eventCategory.findUnique.mockResolvedValue(null);
    eventCategory.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('duplicate', {
        code: 'P2002',
        clientVersion: 'test',
      }),
    );

    await expect(
      service.create({ name: 'test', label: 'Test', color: '#123456' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('does not hide unrelated database failures', async () => {
    const databaseError = new Error('database unavailable');
    eventCategory.findUnique.mockResolvedValue(null);
    eventCategory.create.mockRejectedValue(databaseError);

    await expect(
      service.create({ name: 'test', label: 'Test', color: '#123456' }),
    ).rejects.toBe(databaseError);
  });
});
