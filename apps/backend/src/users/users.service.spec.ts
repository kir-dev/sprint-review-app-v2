import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
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
});
