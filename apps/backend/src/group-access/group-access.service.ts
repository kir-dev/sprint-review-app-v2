import {
  ConflictException,
  ForbiddenException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../../prisma/prisma.service';
import {
  GROUP_ACCESS_KEY,
  GroupAccessClaim,
  GroupAccessPolicy,
  GroupAccessSettings,
  isGroupId,
  isRecord,
  MembershipType,
  parseSettings,
  parseConfiguredGroupId,
  SESSION_MAX_AGE_SECONDS,
} from './group-access.types';

/** Enforces the installation's group policy using AuthSCH membership evidence. */
@Injectable()
export class GroupAccessService {
  private readonly groupId: number;

  constructor(
    private readonly prisma: PrismaService,
    config: ConfigService,
  ) {
    this.groupId = parseConfiguredGroupId(config.get<string>('AUTHSCH_GROUP_ID'));
  }

  private async readSetting() {
    try {
      const setting = await this.prisma.systemSetting.findUnique({
        where: { key: GROUP_ACCESS_KEY },
      });
      if (!setting) throw new Error('Missing policy');
      const policy = parseSettings(JSON.parse(setting.value));
      return { policy, value: setting.value };
    } catch {
      throw new ServiceUnavailableException({ code: 'GROUP_ACCESS_UNAVAILABLE' });
    }
  }

  async getPolicy(): Promise<GroupAccessPolicy> {
    return { ...(await this.readSetting()).policy, groupId: this.groupId };
  }

  async updatePolicy(input: GroupAccessSettings): Promise<GroupAccessPolicy> {
    const current = await this.readSetting();
    if (input.version !== current.policy.version || input.revision !== current.policy.revision)
      throw new ConflictException();
    const next = parseSettings({ ...input, version: randomUUID(), revision: randomUUID() });
    // A display name change does not invalidate membership evidence.
    if (next.allowAlumni === current.policy.allowAlumni) {
      next.revision = current.policy.revision;
    }
    try {
      const result = await this.prisma.systemSetting.updateMany({
        where: { key: GROUP_ACCESS_KEY, value: current.value },
        data: { value: JSON.stringify(next) },
      });
      if (result.count !== 1) throw new ConflictException();
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      throw new ServiceUnavailableException({ code: 'GROUP_ACCESS_UNAVAILABLE' });
    }
    return { ...next, groupId: this.groupId };
  }

  async authorizeProfile(profile: unknown): Promise<GroupAccessClaim> {
    const policy = await this.getPolicy();
    const pek = isRecord(profile) ? profile.pek : undefined;
    if (!isRecord(pek)) this.unverifiable();
    const lists: [string, MembershipType][] = [
      ['executiveAt', 'executive'],
      ['activeMemberAt', 'active'],
      ['alumniMemberAt', 'alumni'],
    ];
    let membershipType: MembershipType | undefined;
    for (const [key, type] of lists) {
      const memberships = pek[key];
      if (!Array.isArray(memberships)) this.unverifiable();
      for (const entry of memberships) {
        if (!isRecord(entry) || !isGroupId(entry.groupId) || typeof entry.groupName !== 'string') {
          this.unverifiable();
        }
        if (entry.groupId === policy.groupId && (type !== 'alumni' || policy.allowAlumni)) {
          membershipType ??= type;
        }
      }
    }
    if (!membershipType) throw new ForbiddenException({ code: 'GROUP_MEMBERSHIP_REQUIRED' });
    return {
      groupId: policy.groupId,
      membershipType,
      checkedAt: Math.floor(Date.now() / 1000),
      revision: policy.revision,
    };
  }

  async assertSession(claim: unknown): Promise<void> {
    const policy = await this.getPolicy();
    const now = Math.floor(Date.now() / 1000);
    if (
      !isRecord(claim) ||
      claim.groupId !== policy.groupId ||
      claim.revision !== policy.revision ||
      typeof claim.checkedAt !== 'number' ||
      !Number.isInteger(claim.checkedAt) ||
      claim.checkedAt > now ||
      now - claim.checkedAt >= SESSION_MAX_AGE_SECONDS ||
      !['active', 'executive', ...(policy.allowAlumni ? ['alumni'] : [])].includes(
        String(claim.membershipType),
      )
    ) {
      throw new UnauthorizedException({ code: 'GROUP_SESSION_INVALID' });
    }
  }

  private unverifiable(): never {
    throw new ForbiddenException({ code: 'GROUP_MEMBERSHIP_UNVERIFIABLE' });
  }
}
