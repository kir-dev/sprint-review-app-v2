import { PrismaClient } from '@prisma/client';
import { configureGroupAccess } from './configure-group-access.cli';

jest.mock('@prisma/client', () => ({ PrismaClient: jest.fn() }));

describe('Group access setup command', () => {
  const db = {
    systemSetting: { findUnique: jest.fn(), create: jest.fn(), updateMany: jest.fn() },
    $disconnect: jest.fn(),
  };
  const args = ['--group-name', 'Test group'];
  const configure = (args: string[]) => configureGroupAccess(args, '42');

  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.mocked(PrismaClient).mockReturnValue(db as unknown as PrismaClient);
    db.systemSetting.findUnique.mockResolvedValue(null);
    db.systemSetting.updateMany.mockResolvedValue({ count: 1 });
  });
  afterEach(() => jest.restoreAllMocks());

  it('validates arguments before connecting to any database', async () => {
    await expect(configure(['--group-id', 'invalid'])).rejects.toThrow();
    expect(PrismaClient).not.toHaveBeenCalled();
  });

  it('requires the deployment environment before any database access', async () => {
    await expect(configureGroupAccess(args, '')).rejects.toThrow('AUTHSCH_GROUP_ID');
    expect(PrismaClient).not.toHaveBeenCalled();
  });

  it('initializes a closed policy with alumni disabled by default', async () => {
    await configure(args);
    const value: string = db.systemSetting.create.mock.calls[0][0].data.value;
    expect(JSON.parse(value)).toMatchObject({ allowAlumni: false });
    expect(JSON.parse(value)).not.toHaveProperty('groupId');
    expect(db.$disconnect).toHaveBeenCalled();
  });

  it('does not overwrite an existing configuration without --replace', async () => {
    db.systemSetting.findUnique.mockResolvedValue({ value: 'existing' });
    await expect(configure(args)).rejects.toThrow('Policy exists');
    expect(db.systemSetting.updateMany).not.toHaveBeenCalled();
    expect(db.systemSetting.create).not.toHaveBeenCalled();
    expect(db.$disconnect).toHaveBeenCalled();
  });

  it('repairs corrupt configuration atomically with --replace', async () => {
    db.systemSetting.findUnique.mockResolvedValue({ value: 'corrupt' });
    await configure([...args, '--replace', '--allow-alumni']);
    expect(db.systemSetting.updateMany).toHaveBeenCalledWith({
      where: { key: 'groupAccess', value: 'corrupt' },
      data: { value: expect.stringContaining('"allowAlumni":true') },
    });
  });

  it('detects concurrent setup changes and disconnects', async () => {
    db.systemSetting.findUnique.mockResolvedValue({ value: 'old' });
    db.systemSetting.updateMany.mockResolvedValue({ count: 0 });
    await expect(configure([...args, '--replace'])).rejects.toThrow('concurrently');
    expect(db.$disconnect).toHaveBeenCalled();
  });

  it('only reads when --show is used', async () => {
    await configure(['--show']);
    expect(db.systemSetting.findUnique).toHaveBeenCalledWith({ where: { key: 'groupAccess' } });
    expect(db.systemSetting.create).not.toHaveBeenCalled();
    expect(db.systemSetting.updateMany).not.toHaveBeenCalled();
  });
});
