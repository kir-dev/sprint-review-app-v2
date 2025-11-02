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

      const expectedUser = { id: 1, ...userData, createdAt: new Date() };
      jest.spyOn(prisma.user, 'create').mockResolvedValue(expectedUser);

      const result = await service.create(userData);
      expect(result).toEqual(expectedUser);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: userData,
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
      expect(result).toEqual(expectedUsers);
    });
  });
});
