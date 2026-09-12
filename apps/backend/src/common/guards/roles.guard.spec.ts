import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../../prisma/prisma.service';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  const context = {
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: () => ({ getRequest: () => ({ user: { id: 1 } }) }),
  } as unknown as ExecutionContext;

  function createGuard(requiredRoles: string[], position: object) {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(requiredRoles),
    } as unknown as Reflector;
    const prisma = {
      user: { findUnique: jest.fn().mockResolvedValue({ id: 1, position }) },
    } as unknown as PrismaService;
    return new RolesGuard(reflector, prisma);
  }

  it('authorizes only an enabled allow-listed permission flag', async () => {
    const guard = createGuard(['canManageSettings'], {
      name: 'MEMBER',
      isLeader: false,
      canManageSettings: true,
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it('rejects mutable position names used as permission metadata', async () => {
    const guard = createGuard(['MEMBER'], {
      name: 'MEMBER',
      isLeader: false,
      canManageSettings: false,
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      'Unknown permission metadata',
    );
  });
});
