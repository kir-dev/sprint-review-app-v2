import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { Request } from 'express';
import { AuthSchStrategy, buildAuthSchRedirectUri } from './authsch.strategy';

describe('AuthSchStrategy', () => {
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

  it('uses BACKEND_PUBLIC_URL as the supported redirectUri', () => {
    expect(buildAuthSchRedirectUri(configService)).toBe(
      'https://backend.example.test/auth/callback',
    );

    const strategy = new AuthSchStrategy(configService);
    const redirect = jest.fn();
    Object.assign(strategy, { redirect });

    strategy.login();

    expect(redirect).toHaveBeenCalledTimes(1);
    expect(redirect.mock.calls[0][0]).toContain(
      'redirect_uri=https://backend.example.test/auth/callback',
    );
  });

  it('does not log OAuth query values when callback processing fails', async () => {
    const oauthCode = 'oauth-code-must-not-leak';
    const clientSecret = values.AUTHSCH_CLIENT_SECRET;
    const loggerWarn = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const strategy = new AuthSchStrategy(configService);
    const fail = jest.fn();
    Object.assign(strategy, { fail });
    jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error(`request failed: ${oauthCode}`));

    await strategy.callback({
      query: { code: oauthCode },
    } as unknown as Request);

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
});
