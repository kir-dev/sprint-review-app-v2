import { SetMetadata } from '@nestjs/common';
import { Position } from '@prisma/client';

export const ROLES_KEY = 'roles';

export const Roles = (...positions: Position[]) =>
  SetMetadata(ROLES_KEY, positions);
