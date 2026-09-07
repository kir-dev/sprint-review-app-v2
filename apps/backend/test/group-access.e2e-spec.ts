import {
  ExecutionContext,
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from '../src/auth/auth.module';
import { AuthSchDedupGuard } from '../src/auth/authsch-dedup.guard';
import { GroupAccessPolicy, SESSION_MAX_AGE_SECONDS } from '../src/group-access/group-access.types';
import { JwtAuthGuard } from '../src/common/guards/jwt-auth.guard';
import { SettingsModule } from '../src/settings/settings.module';

const initialPolicy: GroupAccessPolicy = {
  groupId: 42,
  groupName: 'Test group',
  allowAlumni: false,
  version: '41c17e45-119e-4afb-992c-bc0125c2d9d3',
  revision: '41c17e45-119e-4afb-992c-bc0125c2d9d3',
};
const { groupId: _groupId, ...initialSettings } = initialPolicy;
const memberProfile = {
  email: 'member@example.test',
  fullName: 'Test Member',
  pek: {
    activeMemberAt: [{ groupId: 42, groupName: 'Test group' }],
    executiveAt: [],
    alumniMemberAt: [],
  },
};

describe('Group access HTTP integration', () => {
  let app: INestApplication;
  let jwt: JwtService;
  let policyValue: string | null;
  let callbackProfile: unknown;
  let callbackFails: boolean;
  let useProviderCallback: boolean;
  let manager: boolean;
  let leader: boolean;
  const db = {
    systemSetting: { findUnique: jest.fn(), updateMany: jest.fn() },
    user: { findUnique: jest.fn(), create: jest.fn() },
    position: { findUnique: jest.fn() },
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AuthModule, SettingsModule],
      providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard }],
    })
      .overrideProvider(PrismaService)
      .useValue(db)
      .overrideProvider(ConfigService)
      .useValue({
        get: (key: string) =>
          ({
            JWT_SECRET: 'test-secret-never-used-outside-tests',
            AUTHSCH_GROUP_ID: '42',
            FRONTEND_URL: 'http://frontend.example.test',
            AUTHSCH_CLIENT_ID: 'test-client',
            AUTHSCH_CLIENT_SECRET: 'test-secret',
          })[key],
      })
      .overrideGuard(AuthSchDedupGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          if (useProviderCallback) return new AuthSchDedupGuard().canActivate(context);
          if (callbackFails) throw new UnauthorizedException();
          context.switchToHttp().getRequest<{ user: unknown }>().user = callbackProfile;
          return true;
        },
      })
      .compile();
    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true, forbidUnknownValues: false }),
    );
    await app.init();
    jwt = module.get(JwtService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    policyValue = JSON.stringify(initialPolicy);
    callbackProfile = memberProfile;
    callbackFails = false;
    useProviderCallback = false;
    manager = true;
    leader = false;
    db.systemSetting.findUnique.mockImplementation(async ({ where }: { where: { key: string } }) =>
      where.key === 'groupAccess' && policyValue !== null
        ? { key: where.key, value: policyValue }
        : null,
    );
    db.systemSetting.updateMany.mockImplementation(
      async ({ where, data }: { where: { value: string }; data: { value: string } }) => {
        if (where.value !== policyValue) return { count: 0 };
        policyValue = data.value;
        return { count: 1 };
      },
    );
    db.user.findUnique.mockImplementation(async () => ({
      id: 1,
      email: memberProfile.email,
      fullName: memberProfile.fullName,
      position: { name: 'TAG', canManageSettings: manager, isLeader: leader },
    }));
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const sign = (overrides: Record<string, unknown> = {}) =>
    jwt.sign({
      id: 1,
      sub: 1,
      groupAccess: {
        groupId: 42,
        membershipType: 'active',
        checkedAt: Math.floor(Date.now() / 1000),
        revision: initialPolicy.revision,
      },
      ...overrides,
    });

  it('allows public branding even before setup; denies private endpoints', async () => {
    policyValue = null;
    await request(app.getHttpServer()).get('/settings/public').expect(200);
    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${sign()}`)
      .expect(503);
    await request(app.getHttpServer()).get('/settings/access').expect(401);
  });

  it('requests the PÉK scope in the real login redirect', async () => {
    const response = await request(app.getHttpServer()).get('/auth/login').expect(302);
    const scope = new URL(response.headers.location).searchParams.get('scope');
    expect(scope).toContain('pek.sch.bme.hu:profile');
  });

  it.each([42, 43])('checks group %i after the safe provider callback', async (providerGroupId) => {
    useProviderCallback = true;
    const fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({ access_token: 'test-provider-token' })))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            sub: 'test-member',
            email: memberProfile.email,
            name: memberProfile.fullName,
            'pek.sch.bme.hu:executiveAt/v1': [],
            'pek.sch.bme.hu:activeMemberships/v1': [
              {
                id: providerGroupId,
                name: 'Test group',
                title: [],
              },
            ],
            'pek.sch.bme.hu:alumniMemberships/v1': [],
          }),
        ),
      );

    const response = await request(app.getHttpServer())
      .get('/auth/callback?code=provider-callback-test')
      .expect(302);
    const destination = new URL(response.headers.location);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    if (providerGroupId === initialPolicy.groupId) {
      const token = destination.searchParams.get('jwt');
      expect(token).toBeTruthy();
      const claims = jwt.verify<{ exp: number; iat: number }>(token!);
      expect(claims.exp - claims.iat).toBe(SESSION_MAX_AGE_SECONDS);
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    } else {
      expect(destination.searchParams.get('error')).toBe('GROUP_MEMBERSHIP_REQUIRED');
      expect(destination.searchParams.has('jwt')).toBe(false);
      expect(db.user.findUnique).not.toHaveBeenCalled();
      expect(db.user.create).not.toHaveBeenCalled();
    }
  });

  it('issues a seven-day JWT after an authorized callback', async () => {
    const response = await request(app.getHttpServer()).get('/auth/callback').expect(302);
    const token = new URL(response.headers.location).searchParams.get('jwt');
    expect(token).toBeTruthy();
    const claims = jwt.verify<{ exp: number; iat: number }>(token!);
    expect(claims.exp - claims.iat).toBe(SESSION_MAX_AGE_SECONDS);
    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(response.headers['cache-control']).toBe('no-store');
  });

  it('returns a safe membership error without local account access', async () => {
    callbackProfile = {
      ...memberProfile,
      pek: { activeMemberAt: [], executiveAt: [], alumniMemberAt: [] },
    };
    const response = await request(app.getHttpServer()).get('/auth/callback').expect(302);
    expect(response.headers.location).toBe(
      'http://frontend.example.test/login?error=GROUP_MEMBERSHIP_REQUIRED',
    );
    expect(db.user.findUnique).not.toHaveBeenCalled();
    expect(db.user.create).not.toHaveBeenCalled();
  });

  it('distinguishes missing memberships from non-membership', async () => {
    callbackProfile = { ...memberProfile, pek: {} };
    const response = await request(app.getHttpServer()).get('/auth/callback').expect(302);
    expect(response.headers.location).toContain('error=GROUP_MEMBERSHIP_UNVERIFIABLE');
  });

  it('redirects provider errors to a fixed login destination', async () => {
    callbackFails = true;
    const response = await request(app.getHttpServer())
      .get('/auth/callback?next=https://untrusted.test')
      .expect(302);
    expect(response.headers.location).toBe(
      'http://frontend.example.test/login?error=AUTHSCH_FAILED',
    );
  });

  it('rejects legacy and expired JWTs', async () => {
    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${jwt.sign({ sub: 1, id: 1 })}`)
      .expect(401);
    await request(app.getHttpServer())
      .get('/auth/me')
      .set(
        'Authorization',
        `Bearer ${sign({ iat: Math.floor(Date.now() / 1000) - SESSION_MAX_AGE_SECONDS - 1 })}`,
      )
      .expect(401);
  });

  it('accepts sessions older than one day, within seven days', async () => {
    const token = sign({
      groupAccess: {
        groupId: 42,
        membershipType: 'active',
        checkedAt: Math.floor(Date.now() / 1000) - 2 * 24 * 60 * 60,
        revision: initialPolicy.revision,
      },
    });
    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  it('protects settings reads and writes from ordinary members', async () => {
    manager = false;
    const token = sign();
    await request(app.getHttpServer())
      .get('/settings/access')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
    await request(app.getHttpServer())
      .put('/settings/access')
      .set('Authorization', `Bearer ${token}`)
      .send(initialSettings)
      .expect(403);
    expect(db.systemSetting.updateMany).not.toHaveBeenCalled();
  });

  it('does not allow local group leaders to bypass membership', async () => {
    leader = true;
    await request(app.getHttpServer())
      .get('/settings/access')
      .set('Authorization', `Bearer ${sign({ groupAccess: undefined })}`)
      .expect(401);
  });

  it('rejects a group ID change from an authorized settings manager', async () => {
    const token = sign();
    await request(app.getHttpServer())
      .put('/settings/access')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...initialSettings, groupId: 43 })
      .expect(400);
    expect(db.systemSetting.updateMany).not.toHaveBeenCalled();
    await request(app.getHttpServer())
      .get('/settings/access')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect(({ body }) => expect(body.groupId).toBe(42));
  });

  it('invalidates sessions when the alumni rule changes', async () => {
    const token = sign();
    await request(app.getHttpServer())
      .put('/settings/access')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...initialSettings, allowAlumni: true })
      .expect(200);
    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(401);
  });

  it('does not invalidate sessions when only the display name changes', async () => {
    const token = sign();
    await request(app.getHttpServer())
      .put('/settings/access')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...initialSettings, groupName: 'Renamed' })
      .expect(200);
    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  it.each([{ groupId: '42' }, { groupId: 0 }, { groupName: ' ' }, { allowAlumni: 'false' }])(
    'validates policy writes (%#)',
    async (override) => {
      await request(app.getHttpServer())
        .put('/settings/access')
        .set('Authorization', `Bearer ${sign()}`)
        .send({ ...initialSettings, ...override })
        .expect(400);
      expect(db.systemSetting.updateMany).not.toHaveBeenCalled();
    },
  );

  it('rejects stale editor revisions', async () => {
    await request(app.getHttpServer())
      .put('/settings/access')
      .set('Authorization', `Bearer ${sign()}`)
      .send({ ...initialSettings, revision: '1cb173f2-6c25-49ad-81cb-b8882ebc85e2' })
      .expect(409);
  });
});
