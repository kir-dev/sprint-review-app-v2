import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { EventService } from './events.service';
import { BadRequestException } from '@nestjs/common';

describe('EventService', () => {
  let service: EventService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventService, { provide: PrismaService, useValue: {} }],
    }).compile();

    service = module.get<EventService>(EventService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('validates an explicitly supplied category before updating', async () => {
    const prismaMock = {
      eventCategory: { findUnique: jest.fn().mockResolvedValue(null) },
      event: { update: jest.fn() },
    };
    const eventService = new EventService(
      prismaMock as unknown as PrismaService,
    );

    await expect(
      eventService.update(1, { categoryId: 0 }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prismaMock.event.update).not.toHaveBeenCalled();
  });
});
