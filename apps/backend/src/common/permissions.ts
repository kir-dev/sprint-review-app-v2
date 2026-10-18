import type { Position } from '@prisma/client';

export const PERMISSION_FLAGS = [
  'canManageSettings',
  'canExportLogs',
  'canManageEvents',
  'canManageProjects',
] as const satisfies readonly (keyof Position)[];

export type PermissionFlag = (typeof PERMISSION_FLAGS)[number];

export function isPermissionFlag(value: string): value is PermissionFlag {
  return PERMISSION_FLAGS.some((flag) => flag === value);
}

type PermissionHolder = Pick<Position, 'isLeader' | PermissionFlag>;

/** The group leader (isLeader: true) always has every known permission. */
export function hasPermission(
  position: PermissionHolder | null | undefined,
  flag: PermissionFlag,
): boolean {
  if (!position) {
    return false;
  }
  return position.isLeader || position[flag] === true;
}
