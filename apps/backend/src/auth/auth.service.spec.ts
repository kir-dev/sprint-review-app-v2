import type { AuthSchProfile } from '@kir-dev/passport-authsch';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { GroupAccessService } from '../group-access/group-access.service';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

const profile = {
  authSchId: 'authsch-uuid-1',
  email: 'member@example.test',
  fullName: 'Test member',
  schAcc: { schAccUsername: 'member' },
} as AuthSchProfile;

describe('AuthService membership gate', () => {
  const access = { authorizeProfile: jest.fn() };
  const users = { create: jest.fn() };
  const jwt = { sign: jest.fn() };
  const db = {
    user: { findUnique: jest.fn(), update: jest.fn(), updateMany: jest.fn() },
  };
  let service: AuthService;

  beforeEach(() => {
    jest.resetAllMocks();
    access.authorizeProfile.mockResolvedValue({ groupId: 42 });
    // Default: legacy account found by email, not yet linked to AuthSCH.
    db.user.findUnique.mockImplementation(({ where }) =>
      Promise.resolve(
        where.email === profile.email ? { id: 1, authSchId: null } : null,
      ),
    );
    db.user.updateMany.mockResolvedValue({ count: 1 });
    users.create.mockResolvedValue({ id: 2 });
    jwt.sign.mockReturnValue('signed-token');
    service = new AuthService(
      jwt as unknown as JwtService,
      db as unknown as PrismaService,
      access as unknown as GroupAccessService,
      users as unknown as UsersService,
    );
  });

  it('does not read/create a local account or issue JWT on a denied profile', async () => {
    access.authorizeProfile.mockRejectedValue(new Error('denied'));
    await expect(service.login(profile)).rejects.toThrow('denied');
    expect(db.user.findUnique).not.toHaveBeenCalled();
    expect(users.create).not.toHaveBeenCalled();
    expect(jwt.sign).not.toHaveBeenCalled();
  });

  it('issues a minimal signed session for an authorized existing account', async () => {
    await expect(service.login(profile)).resolves.toBe('signed-token');
    expect(jwt.sign).toHaveBeenCalledWith({ id: 1, sub: 1, groupAccess: { groupId: 42 } });
    expect(users.create).not.toHaveBeenCalled();
  });

  it('links a legacy email-matched account to the AuthSCH id', async () => {
    await service.login(profile);
    expect(db.user.updateMany).toHaveBeenCalledWith({
      where: { id: 1, authSchId: null },
      data: { authSchId: profile.authSchId },
    });
  });

  it('keeps the same account after the AuthSCH email changes', async () => {
    db.user.findUnique.mockImplementation(({ where }) =>
      Promise.resolve(
        where.authSchId === profile.authSchId
          ? { id: 7, email: 'old@example.test' }
          : null,
      ),
    );
    await service.login(profile);
    expect(users.create).not.toHaveBeenCalled();
    expect(db.user.update).toHaveBeenCalledWith({
      where: { id: 7 },
      data: { email: profile.email },
    });
    expect(jwt.sign).toHaveBeenCalledWith(expect.objectContaining({ id: 7, sub: 7 }));
  });

  it('keeps the old email when the new one belongs to another account', async () => {
    db.user.findUnique.mockResolvedValueOnce({ id: 7, email: 'old@example.test' });
    db.user.update.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('unique', {
        code: 'P2002',
        clientVersion: 'test',
      }),
    );
    await expect(service.login(profile)).resolves.toBe('signed-token');
    expect(jwt.sign).toHaveBeenCalledWith(expect.objectContaining({ id: 7 }));
  });

  it('does not hand an email-matched account to a different AuthSCH identity', async () => {
    db.user.findUnique.mockImplementation(({ where }) =>
      Promise.resolve(
        where.email === profile.email ? { id: 1, authSchId: 'other-uuid' } : null,
      ),
    );
    await expect(service.login(profile)).rejects.toThrow();
    expect(db.user.updateMany).not.toHaveBeenCalled();
    expect(users.create).not.toHaveBeenCalled();
    expect(jwt.sign).not.toHaveBeenCalled();
  });

  it('creates a linked account when neither id nor email matches', async () => {
    db.user.findUnique.mockResolvedValue(null);
    await service.login(profile);
    expect(users.create).toHaveBeenCalledWith({
      authSchId: profile.authSchId,
      email: profile.email,
      fullName: profile.fullName,
      githubUsername: 'member',
    });
    expect(jwt.sign).toHaveBeenCalledWith(expect.objectContaining({ id: 2 }));
  });

  it('does not treat a database error as a new account', async () => {
    db.user.findUnique.mockRejectedValue(new Error('DB offline'));
    await expect(service.login(profile)).rejects.toThrow('DB offline');
    expect(users.create).not.toHaveBeenCalled();
    expect(jwt.sign).not.toHaveBeenCalled();
  });

  it('does not create a user when required identity fields are missing', async () => {
    await expect(service.login({ ...profile, email: '' })).rejects.toThrow();
    await expect(service.login({ ...profile, authSchId: '' })).rejects.toThrow();
    expect(users.create).not.toHaveBeenCalled();
  });

  it('rejects a deleted current user', async () => {
    db.user.findUnique.mockResolvedValue(null);
    await expect(service.getUserById(1)).rejects.toThrow();
  });
});
