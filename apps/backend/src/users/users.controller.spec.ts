import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from '../common/guards/roles.guard';
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
            assertCanUpdate: jest.fn(),
            remove: jest.fn(),
            getUserProjects: jest.fn(),
            getUserLogs: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

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
  describe('update', () => {
    it('authorizes the signed-in user before updating', async () => {
      const dto = { position: 'TAG' };
      jest
        .spyOn(service, 'assertCanUpdate')
        .mockRejectedValue(new ForbiddenException());

      await expect(controller.update('2', { id: 1 }, dto)).rejects.toThrow(
        ForbiddenException,
      );
      expect(service.assertCanUpdate).toHaveBeenCalledWith(1, 2, dto);
      expect(service.update).not.toHaveBeenCalled();
    });

    it('updates the user once authorized', async () => {
      const dto = { githubUsername: 'uj' };
      jest.spyOn(service, 'assertCanUpdate').mockResolvedValue(undefined);
      jest.spyOn(service, 'update').mockResolvedValue({ id: 1 } as any);

      await expect(controller.update('1', { id: 1 }, dto)).resolves.toEqual({
        id: 1,
      });
      expect(service.update).toHaveBeenCalledWith(1, dto);
    });
  });
});
