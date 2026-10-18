import { hasPermission } from './permissions';

describe('hasPermission', () => {
  const member = {
    isLeader: false,
    canManageSettings: false,
    canExportLogs: false,
    canManageEvents: true,
    canManageProjects: false,
  };

  it('grants only the flags enabled on the position', () => {
    expect(hasPermission(member, 'canManageEvents')).toBe(true);
    expect(hasPermission(member, 'canManageProjects')).toBe(false);
  });

  it('grants every flag to the group leader', () => {
    expect(
      hasPermission({ ...member, isLeader: true }, 'canManageSettings'),
    ).toBe(true);
  });

  it('denies users without a position', () => {
    expect(hasPermission(null, 'canManageEvents')).toBe(false);
  });
});
