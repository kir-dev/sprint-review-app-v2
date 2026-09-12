import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            position: {
              findUnique: jest.fn(),
            },
            user: {
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

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const userData = {
        email: 'test@example.com',
        fullName: 'Test User',
        githubUsername: 'testuser',
      };

      const position = { id: 1, name: 'UJONC' };
      const storedUser = {
        id: 1,
        ...userData,
        createdAt: new Date(),
        position,
      };
      jest.spyOn(prisma.position, 'findUnique').mockResolvedValue(position);
      jest.spyOn(prisma.user, 'create').mockResolvedValue(storedUser);

      const result = await service.create(userData);
      expect(result).toEqual({
        ...storedUser,
        position: 'UJONC',
        positionDetails: position,
      });
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: userData.email,
          simonyiEmail: undefined,
          githubUsername: userData.githubUsername,
          fullName: userData.fullName,
          profileImage: undefined,
          positionId: position.id,
        },
        include: { position: true },
      });
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const expectedUsers = [
        {
          id: 1,
          email: 'test@example.com',
          fullName: 'Test User',
          githubUsername: 'testuser',
          createdAt: new Date(),
          _count: { logs: 0, managedProjects: 0, projects: 0 },
        },
      ];

      jest.spyOn(prisma.user, 'findMany').mockResolvedValue(expectedUsers);

      const result = await service.findAll();
      expect(result).toEqual([
        {
          ...expectedUsers[0],
          position: null,
          positionDetails: null,
        },
      ]);
    });
  });

  it('retries the complete serializable update transaction after P2034', async () => {
    const storedUser = {
      id: 1,
      email: 'updated@example.com',
      fullName: 'Test User',
      position: { id: 1, name: 'TAG' },
    };
    const transaction = {
      user: { update: jest.fn().mockResolvedValue(storedUser) },
    };
    const transactionRunner = jest
      .fn()
      .mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError('write conflict', {
          code: 'P2034',
          clientVersion: 'test',
        }),
      )
      .mockImplementationOnce(
        (operation: (client: typeof transaction) => Promise<unknown>) =>
          operation(transaction),
      );
    const retryingService = new UsersService({
      $transaction: transactionRunner,
    } as unknown as PrismaService);

    await expect(
      retryingService.update(1, { email: storedUser.email }),
    ).resolves.toMatchObject({ email: storedUser.email, position: 'TAG' });
    expect(transactionRunner).toHaveBeenCalledTimes(2);
    expect(transactionRunner.mock.calls[1][1]).toEqual({
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });
  });
});
