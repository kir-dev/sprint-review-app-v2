import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

export const Roles = (...positions: string[]) =>
  SetMetadata(ROLES_KEY, positions);
