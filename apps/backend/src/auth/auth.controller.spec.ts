import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import {
  parseAuthSchProfile,
  RawAuthSchProfile,
} from '@kir-dev/passport-authsch';

describe('AuthController', () => {
  const profile = parseAuthSchProfile({ sub: 'member' } as RawAuthSchProfile);

  it('builds a single-slash, URL-encoded frontend handoff', async () => {
    const authService = {
      login: jest.fn().mockResolvedValue('header.payload.signature'),
    } as unknown as AuthService;
    const response = { redirect: jest.fn(), setHeader: jest.fn() };
    const controller = new AuthController(
      authService,
      new ConfigService({ FRONTEND_URL: 'https://frontend.example.test/' }),
    );

    await controller.oauthRedirect(
      profile,
      response as unknown as Parameters<AuthController['oauthRedirect']>[1],
    );

    expect(response.redirect).toHaveBeenCalledWith(
      'https://frontend.example.test/login?jwt=header.payload.signature',
    );
  });

  it('allows an explicitly configured HTTP loopback URL for development', async () => {
    const authService = {
      login: jest.fn().mockResolvedValue('header.payload.signature'),
    } as unknown as AuthService;
    const response = { redirect: jest.fn(), setHeader: jest.fn() };
    const controller = new AuthController(
      authService,
      new ConfigService({ FRONTEND_URL: 'http://127.0.0.1:3000' }),
    );

    await controller.oauthRedirect(
      profile,
      response as unknown as Parameters<AuthController['oauthRedirect']>[1],
    );

    expect(response.redirect).toHaveBeenCalledWith(
      'http://127.0.0.1:3000/login?jwt=header.payload.signature',
    );
  });

  it.each([
    ['a missing URL', undefined],
    ['an invalid URL', 'not-a-url'],
    ['a non-loopback HTTP URL', 'http://frontend.example.test'],
  ])('rejects %s before issuing a JWT', async (_case, frontendUrl) => {
    const authService = {
      login: jest.fn().mockResolvedValue('header.payload.signature'),
    } as unknown as AuthService;
    const response = { redirect: jest.fn(), setHeader: jest.fn() };
    const controller = new AuthController(authService, {
      get: jest.fn().mockReturnValue(frontendUrl),
    } as unknown as ConfigService);

    await expect(
      controller.oauthRedirect(
        profile,
        response as unknown as Parameters<AuthController['oauthRedirect']>[1],
      ),
    ).rejects.toThrow();
    expect(authService.login).not.toHaveBeenCalled();
    expect(response.redirect).not.toHaveBeenCalled();
  });
});
