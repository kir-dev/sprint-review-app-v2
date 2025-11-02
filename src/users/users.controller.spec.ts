import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            getUserProjects: jest.fn(),
            getUserLogs: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const dto = {
        email: 'test@example.com',
        fullName: 'Test User',
        githubUsername: 'testuser',
      };
      const expectedResult = { id: 1, ...dto, createdAt: new Date() };

      jest.spyOn(service, 'create').mockResolvedValue(expectedResult);

      expect(await controller.create(dto)).toBe(expectedResult);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const expectedResult = [
        {
          id: 1,
          email: 'test@example.com',
          fullName: 'Test User',
          githubUsername: 'testuser',
          createdAt: new Date(),
          _count: { logs: 0, managedProjects: 0, projects: 0 },
        },
      ];

      jest.spyOn(service, 'findAll').mockResolvedValue(expectedResult);

      expect(await controller.findAll()).toBe(expectedResult);
    });
  });
});
