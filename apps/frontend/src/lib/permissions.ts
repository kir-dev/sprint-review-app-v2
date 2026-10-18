export type PermissionFlag =
  | 'canManageSettings'
  | 'canExportLogs'
  | 'canManageEvents'
  | 'canManageProjects';

interface PermissionHolder {
  positionDetails?:
    | ({ isLeader: boolean } & Record<PermissionFlag, boolean>)
    | null;
}

/** Mirrors the backend: the group leader always has every permission. */
export function hasPermission(
  user: PermissionHolder | null | undefined,
  flag: PermissionFlag,
): boolean {
  const details = user?.positionDetails;
  return !!details && (details.isLeader || details[flag] === true);
}
