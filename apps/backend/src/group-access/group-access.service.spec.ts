import {
  ConflictException,
  ForbiddenException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { GroupAccessService } from './group-access.service';
import {
  GroupAccessClaim,
  GroupAccessPolicy,
  SESSION_MAX_AGE_SECONDS,
} from './group-access.types';

const policy: GroupAccessPolicy = {
  groupId: 42,
  groupName: 'Example group',
  allowAlumni: false,
  version: '41c17e45-119e-4afb-992c-bc0125c2d9d3',
  revision: '41c17e45-119e-4afb-992c-bc0125c2d9d3',
};
const group = { groupId: 42, groupName: 'Example group' };
const profile = (overrides: Record<string, unknown> = {}) => ({
  pek: { activeMemberAt: [], executiveAt: [], alumniMemberAt: [], ...overrides },
});

describe('GroupAccessService', () => {
  let service: GroupAccessService;
  const db = { systemSetting: { findUnique: jest.fn(), updateMany: jest.fn() } };
  const claim = (overrides: Partial<GroupAccessClaim> = {}): GroupAccessClaim => ({
    groupId: policy.groupId,
    membershipType: 'active',
    revision: policy.revision,
    checkedAt: Math.floor(Date.now() / 1000),
    ...overrides,
  });

  beforeEach(() => {
    jest.resetAllMocks();
    db.systemSetting.findUnique.mockResolvedValue({ value: JSON.stringify(policy) });
    db.systemSetting.updateMany.mockResolvedValue({ count: 1 });
    service = new GroupAccessService(
      db as unknown as PrismaService,
      new ConfigService({ AUTHSCH_GROUP_ID: '42' }),
    );
  });

  it.each([
    ['activeMemberAt', 'active'],
    ['executiveAt', 'executive'],
  ])('accepts the target group in %s', async (list, type) => {
    await expect(service.authorizeProfile(profile({ [list]: [group] }))).resolves.toMatchObject({
      groupId: 42,
      membershipType: type,
    });
  });

  it.each([undefined, '', '0', '-1', '1.2', '1e2', '0x6a', '9007199254740992'])(
    'refuses to start with an invalid deployment group (%#)',
    (value) => {
      expect(
        () =>
          new GroupAccessService(
            db as unknown as PrismaService,
            new ConfigService({ AUTHSCH_GROUP_ID: value }),
          ),
      ).toThrow('AUTHSCH_GROUP_ID');
    },
  );

  it('uses the environment ID even if a legacy database record names another group', async () => {
    db.systemSetting.findUnique.mockResolvedValue({
      value: JSON.stringify({ ...policy, groupId: 999 }),
    });
    await expect(service.getPolicy()).resolves.toMatchObject({ groupId: 42 });
    await expect(
      service.authorizeProfile(profile({ activeMemberAt: [group] })),
    ).resolves.toMatchObject({ groupId: 42 });
  });

  it('uses ID, not display name', async () => {
    await expect(
      service.authorizeProfile(profile({ activeMemberAt: [{ ...group, groupName: 'Renamed' }] })),
    ).resolves.toMatchObject({ groupId: 42 });
    await expect(
      service.authorizeProfile(profile({ activeMemberAt: [{ ...group, groupId: 43 }] })),
    ).rejects.toThrow(ForbiddenException);
  });

  it('accepts alumni only when enabled', async () => {
    const alumni = profile({ alumniMemberAt: [group] });
    await expect(service.authorizeProfile(alumni)).rejects.toThrow(ForbiddenException);
    db.systemSetting.findUnique.mockResolvedValue({
      value: JSON.stringify({ ...policy, allowAlumni: true }),
    });
    await expect(service.authorizeProfile(alumni)).resolves.toMatchObject({
      membershipType: 'alumni',
    });
  });

  it('does not substitute entrants or local roles for membership', async () => {
    await expect(
      service.authorizeProfile({ ...profile(), entrants: [group], position: { isLeader: true } }),
    ).rejects.toMatchObject({ response: { code: 'GROUP_MEMBERSHIP_REQUIRED' } });
  });

  it.each([
    undefined,
    {},
    { pek: null },
    { pek: {} },
    profile({ activeMemberAt: null }),
    profile({ activeMemberAt: {} }),
    profile({ activeMemberAt: [null] }),
    profile({ activeMemberAt: [{ groupId: '42', groupName: 'Example' }] }),
    profile({ activeMemberAt: [{ groupId: -1, groupName: 'Example' }] }),
    profile({ activeMemberAt: [{ groupId: 42 }] }),
    profile({ activeMemberAt: [group], alumniMemberAt: undefined }),
  ])('fails closed on malformed or missing provider data (%#)', async (input) => {
    await expect(service.authorizeProfile(input)).rejects.toMatchObject({
      response: { code: 'GROUP_MEMBERSHIP_UNVERIFIABLE' },
    });
  });

  it.each([
    null,
    { value: '{' },
    { value: '{}' },
    { value: JSON.stringify({ ...policy, allowAlumni: 'false' }) },
  ])('fails closed on absent or corrupt configuration (%#)', async (setting) => {
    db.systemSetting.findUnique.mockResolvedValue(setting);
    await expect(service.getPolicy()).rejects.toThrow(ServiceUnavailableException);
  });

  it('fails closed on DB read failure', async () => {
    db.systemSetting.findUnique.mockRejectedValue(new Error('offline'));
    await expect(service.assertSession(claim())).rejects.toThrow(ServiceUnavailableException);
  });

  it('allows a session just under seven days old', async () => {
    await expect(
      service.assertSession(
        claim({ checkedAt: Math.floor(Date.now() / 1000) - SESSION_MAX_AGE_SECONDS + 10 }),
      ),
    ).resolves.toBeUndefined();
  });

  it.each([
    undefined,
    {},
    { groupId: 43 },
    { revision: 'old' },
    { membershipType: 'alumni' },
    { membershipType: 'invented' },
    { checkedAt: 0 },
    { checkedAt: '123' },
    { checkedAt: Number.MAX_SAFE_INTEGER },
  ])('rejects legacy, stale or malformed session evidence (%#)', async (overrides) => {
    const evidence =
      overrides === undefined
        ? undefined
        : Object.keys(overrides).length
          ? { ...claim(), ...overrides }
          : {};
    await expect(service.assertSession(evidence)).rejects.toThrow(UnauthorizedException);
  });

  it('rejects membership evidence at the exact seven-day boundary', async () => {
    await expect(
      service.assertSession(
        claim({ checkedAt: Math.floor(Date.now() / 1000) - SESSION_MAX_AGE_SECONDS }),
      ),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('accepts alumni session evidence when enabled', async () => {
    db.systemSetting.findUnique.mockResolvedValue({
      value: JSON.stringify({ ...policy, allowAlumni: true }),
    });
    await expect(
      service.assertSession(claim({ membershipType: 'alumni' })),
    ).resolves.toBeUndefined();
  });

  it('rotates revision on membership rule changes and uses an atomic comparison', async () => {
    const next = await service.updatePolicy({ ...policy, allowAlumni: true });
    expect(next.revision).not.toBe(policy.revision);
    expect(db.systemSetting.updateMany).toHaveBeenCalledWith({
      where: { key: 'groupAccess', value: JSON.stringify(policy) },
      data: { value: expect.not.stringContaining('"groupId"') },
    });
  });

  it('preserves sessions for a display name change', async () => {
    expect((await service.updatePolicy({ ...policy, groupName: 'New name' })).revision).toBe(
      policy.revision,
    );
  });

  it('rejects a stale editor', async () => {
    await expect(service.updatePolicy({ ...policy, revision: 'old' })).rejects.toThrow(
      ConflictException,
    );
    expect(db.systemSetting.updateMany).not.toHaveBeenCalled();
  });

  it('detects a stale editor even after only the display name changed', async () => {
    db.systemSetting.findUnique.mockResolvedValue({
      value: JSON.stringify({ ...policy, groupName: 'Renamed', version: 'new-version' }),
    });
    await expect(service.updatePolicy(policy)).rejects.toThrow(ConflictException);
    expect(db.systemSetting.updateMany).not.toHaveBeenCalled();
  });

  it('detects concurrent saves', async () => {
    db.systemSetting.updateMany.mockResolvedValue({ count: 0 });
    await expect(service.updatePolicy(policy)).rejects.toThrow(ConflictException);
  });

  it('reports write failure without enabling access', async () => {
    db.systemSetting.updateMany.mockRejectedValue(new Error('offline'));
    await expect(service.updatePolicy(policy)).rejects.toThrow(ServiceUnavailableException);
  });
});
