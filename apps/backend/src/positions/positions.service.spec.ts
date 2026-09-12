import { BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PositionsService } from './positions.service';

describe('PositionsService', () => {
  const position = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };
  const prisma = {
    position,
    $transaction: jest.fn(async (operation: unknown) => {
      if (typeof operation === 'function') return operation({ position });
      return operation;
    }),
  };
  const service = new PositionsService(prisma as unknown as PrismaService);

  beforeEach(() => jest.clearAllMocks());

  it('rejects partial and duplicate position order lists before updates', async () => {
    position.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);

    await expect(service.updateOrder([1, 1])).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await expect(service.updateOrder([1])).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(position.update).not.toHaveBeenCalled();
  });

  it('rejects creating a second leader position', async () => {
    position.findUnique.mockResolvedValue(null);
    position.findFirst.mockResolvedValue({ id: 1, isLeader: true });

    await expect(
      service.create({
        name: 'SECOND_LEADER',
        label: 'Second leader',
        color: '#123456',
        isLeader: true,
      }),
    ).rejects.toThrow('leader position already exists');
  });

  it('rejects promoting a position while another leader exists', async () => {
    position.findUnique.mockResolvedValue({
      id: 2,
      name: 'MEMBER',
      isLeader: false,
    });
    position.findFirst.mockResolvedValue({ id: 1, isLeader: true });

    await expect(service.update(2, { isLeader: true })).rejects.toThrow(
      'leader position already exists',
    );
  });
});
