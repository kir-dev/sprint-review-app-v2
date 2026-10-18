import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../../prisma/prisma.service';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { hasPermission, isPermissionFlag } from '../permissions';

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

    const hasRequiredRole = requiredRoles.some((role) =>
      hasPermission(user.position, role),
    );

    if (!hasRequiredRole) {
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );
    }

    return true;
  }
}
