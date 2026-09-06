import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../../prisma/prisma.service';
import { ROLES_KEY } from '../decorators/roles.decorator';

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

    // 1. The group leader (isLeader: true) always has access to everything
    if (user.position.isLeader) {
      return true;
    }

    // 2. Check if the user has the required role name or permission flag
    const hasRequiredRole = requiredRoles.some((role) => {
      // Backward compatibility: match position name (e.g. "KORVEZETO", "GAZDASAGIS")
      if (role === user.position.name) {
        return true;
      }

      // Dynamic permissions: check if the position model has a boolean flag matching the role string
      const permissionValue = user.position[role as keyof typeof user.position];
      if (typeof permissionValue === 'boolean' && permissionValue === true) {
        return true;
      }

      return false;
    });

    if (!hasRequiredRole) {
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );
    }

    return true;
  }
}
