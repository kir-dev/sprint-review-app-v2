export const GROUP_ACCESS_KEY = 'groupAccess';
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

export interface GroupAccessSettings {
  groupName: string;
  allowAlumni: boolean;
  version: string;
  revision: string;
}

export interface GroupAccessPolicy extends GroupAccessSettings {
  groupId: number;
}

/** Parses the deployment-owned PÉK group ID without permissive numeric coercion. */
export function parseConfiguredGroupId(value: unknown): number {
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value.trim()) || !isGroupId(Number(value))) {
    throw new Error('AUTHSCH_GROUP_ID must be a positive integer PÉK group ID');
  }
  return Number(value);
}

export type MembershipType = 'active' | 'executive' | 'alumni';

export interface GroupAccessClaim {
  groupId: number;
  membershipType: MembershipType;
  checkedAt: number;
  revision: string;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isGroupId(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
}

export function parseSettings(value: unknown): GroupAccessSettings {
  if (
    !isRecord(value) ||
    typeof value.groupName !== 'string' ||
    !value.groupName.trim() ||
    value.groupName.length > 100 ||
    typeof value.allowAlumni !== 'boolean' ||
    typeof value.version !== 'string' ||
    !value.version ||
    typeof value.revision !== 'string' ||
    !value.revision
  ) {
    throw new Error('Invalid group access policy');
  }
  return {
    groupName: value.groupName.trim(),
    allowAlumni: value.allowAlumni,
    version: value.version,
    revision: value.revision,
  };
}
