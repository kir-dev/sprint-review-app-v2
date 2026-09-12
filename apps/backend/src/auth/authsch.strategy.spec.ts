import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { AuthSchStrategy, buildAuthSchRedirectUri } from './authsch.strategy';

describe('AuthSchStrategy', () => {
  const createState = () => `${Date.now().toString(36)}.${'a'.repeat(43)}`;
  const values: Record<string, string> = {
    AUTHSCH_CLIENT_ID: 'client-id',
    AUTHSCH_CLIENT_SECRET: 'client-secret',
    BACKEND_PUBLIC_URL: 'https://backend.example.test/',
    AUTHSCH_PROVIDER: 'https://auth.example.test',
    PORT: '3001',
  };
  const configService = {
    get: jest.fn((key: string) => values[key]),
  } as unknown as ConfigService;

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('uses BACKEND_PUBLIC_URL and forwards a state-bound login', async () => {
    expect(buildAuthSchRedirectUri(configService)).toBe(
      'https://backend.example.test/auth/callback',
    );

    const strategy = new AuthSchStrategy(configService);
    const redirect = jest.fn();
    Object.assign(strategy, { redirect });

    const state = createState();
    const session: Record<string, unknown> = {};
    await strategy.authenticate({
      path: '/auth/login',
      query: { state },
      session,
    } as unknown as Parameters<AuthSchStrategy['authenticate']>[0]);

    expect(redirect).toHaveBeenCalledTimes(1);
    const redirectUrl = new URL(redirect.mock.calls[0][0]);
    expect(redirectUrl.searchParams.get('redirect_uri')).toBe(
      'https://backend.example.test/auth/callback',
    );
    expect(redirectUrl.searchParams.get('state')).toMatch(
      /^[a-z0-9]{8,12}\.[A-Za-z0-9_-]{43}$/,
    );
    expect(redirectUrl.searchParams.get('state')).not.toBe(state);
    expect(session).toMatchObject({ authSchLogin: { clientNonce: state } });
  });

  it('does not log OAuth query values when callback processing fails', async () => {
    const oauthCode = 'oauth-code-must-not-leak';
    const clientSecret = values.AUTHSCH_CLIENT_SECRET;
    const loggerWarn = jest
      .spyOn(Logger.prototype, 'warn')
      .mockImplementation(() => undefined);
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    const strategy = new AuthSchStrategy(configService);
    const fail = jest.fn();
    Object.assign(strategy, { fail });
    jest
      .spyOn(global, 'fetch')
      .mockRejectedValueOnce(new Error(`request failed: ${oauthCode}`));
    const providerState = createState();

    await strategy.authenticate({
      path: '/auth/callback',
      query: { code: oauthCode, state: providerState },
      session: {
        authSchLogin: {
          providerState,
          clientNonce: createState(),
          createdAt: Date.now(),
        },
      },
    } as unknown as Parameters<AuthSchStrategy['authenticate']>[0]);

    expect(global.fetch).toHaveBeenCalledWith(
      'https://auth.example.test/oauth2/token',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    const logged = JSON.stringify(loggerWarn.mock.calls);
    expect(fail).toHaveBeenCalledWith(401);
    expect(consoleError).not.toHaveBeenCalled();
    expect(logged).not.toContain(oauthCode);
    expect(logged).not.toContain(clientSecret);
  });

  it('rejects a missing, mismatched, expired, or replayed callback state', async () => {
    const strategy = new AuthSchStrategy(configService);
    const fail = jest.fn();
    Object.assign(strategy, { fail });
    const fetchSpy = jest.spyOn(global, 'fetch');
    const state = createState();
    const session = {
      authSchLogin: {
        providerState: state,
        clientNonce: createState(),
        createdAt: Date.now() - 10 * 60 * 1000 - 1,
      },
    };

    await strategy.authenticate({
      path: '/auth/callback',
      query: { code: 'oauth-code', state },
      session,
    } as unknown as Parameters<AuthSchStrategy['authenticate']>[0]);
    await strategy.authenticate({
      path: '/auth/callback',
      query: { code: 'oauth-code', state },
      session,
    } as unknown as Parameters<AuthSchStrategy['authenticate']>[0]);

    expect(fail).toHaveBeenCalledTimes(2);
    expect(fetchSpy).not.toHaveBeenCalled();

    const freshSession = {
      authSchLogin: {
        providerState: `${Date.now().toString(36)}.${'a'.repeat(43)}`,
        clientNonce: createState(),
        createdAt: Date.now(),
      },
    };
    await strategy.authenticate({
      path: '/auth/callback',
      query: {
        code: 'oauth-code',
        state: `${Date.now().toString(36)}.${'b'.repeat(43)}`,
      },
      session: freshSession,
    } as unknown as Parameters<AuthSchStrategy['authenticate']>[0]);
    expect(fail).toHaveBeenCalledTimes(3);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it.each([
    'http://auth.example.test',
    'not-a-url',
    'https://auth.example.test/base',
  ])(
    'rejects an unsafe AuthSCH provider before making requests: %s',
    (provider) => {
      expect(
        () =>
          new AuthSchStrategy({
            get: jest.fn((key: string) =>
              key === 'AUTHSCH_PROVIDER' ? provider : values[key],
            ),
          } as unknown as ConfigService),
      ).toThrow('AUTHSCH_PROVIDER');
    },
  );
});
