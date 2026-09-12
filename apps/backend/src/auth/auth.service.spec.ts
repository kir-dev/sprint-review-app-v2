import type { AuthSchProfile } from '@kir-dev/passport-authsch';
import { NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { GroupAccessService } from '../group-access/group-access.service';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

const profile = {
  email: 'member@example.test',
  fullName: 'Test member',
  schAcc: { schAccUsername: 'member' },
} as AuthSchProfile;

describe('AuthService membership gate', () => {
  const access = { authorizeProfile: jest.fn() };
  const users = { findByEmail: jest.fn(), create: jest.fn() };
  const jwt = { sign: jest.fn() };
  const db = { user: { findUnique: jest.fn() } };
  let service: AuthService;

  beforeEach(() => {
    jest.resetAllMocks();
    access.authorizeProfile.mockResolvedValue({ groupId: 42 });
    users.findByEmail.mockResolvedValue({ id: 1 });
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
    expect(users.findByEmail).not.toHaveBeenCalled();
    expect(users.create).not.toHaveBeenCalled();
    expect(jwt.sign).not.toHaveBeenCalled();
  });

  it('issues a minimal signed session for an authorized existing account', async () => {
    await expect(service.login(profile)).resolves.toBe('signed-token');
    expect(jwt.sign).toHaveBeenCalledWith({ id: 1, sub: 1, groupAccess: { groupId: 42 } });
    expect(users.create).not.toHaveBeenCalled();
  });

  it('creates an authorized new account only on NotFound', async () => {
    users.findByEmail.mockRejectedValue(new NotFoundException());
    await service.login(profile);
    expect(users.create).toHaveBeenCalledWith({
      email: profile.email,
      fullName: profile.fullName,
      githubUsername: 'member',
    });
  });

  it('does not treat a database error as a new account', async () => {
    users.findByEmail.mockRejectedValue(new Error('DB offline'));
    await expect(service.login(profile)).rejects.toThrow('DB offline');
    expect(users.create).not.toHaveBeenCalled();
    expect(jwt.sign).not.toHaveBeenCalled();
  });

  it('does not create a user when required identity fields are missing', async () => {
    await expect(service.login({ ...profile, email: '' })).rejects.toThrow();
    expect(users.create).not.toHaveBeenCalled();
  });

  it('rejects a deleted current user', async () => {
    db.user.findUnique.mockResolvedValue(null);
    await expect(service.getUserById(1)).rejects.toThrow();
  });
});
