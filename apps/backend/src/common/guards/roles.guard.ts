import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Position } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { ROLES_KEY } from '../decorators/roles.decorator';

const PERMISSION_FLAGS = [
  'canManageSettings',
  'canExportLogs',
  'canManageEvents',
  'canManageProjects',
] as const satisfies readonly (keyof Position)[];

type PermissionFlag = (typeof PERMISSION_FLAGS)[number];

function isPermissionFlag(value: string): value is PermissionFlag {
  return PERMISSION_FLAGS.some((flag) => flag === value);
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userId: number | undefined = request.user?.id;

    if (!userId) {
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { position: true },
    });

    if (!user || !user.position) {
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );
    }

    if (!requiredRoles.every(isPermissionFlag)) {
      throw new Error('Unknown permission metadata');
    }

    // The group leader (isLeader: true) always has access to known permissions.
    if (user.position.isLeader) {
      return true;
    }

    const hasRequiredRole = requiredRoles.some(
      (role) => user.position?.[role] === true,
    );

    if (!hasRequiredRole) {
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );
    }

    return true;
  }
}
