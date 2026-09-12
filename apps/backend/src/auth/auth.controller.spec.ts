import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import {
  parseAuthSchProfile,
  RawAuthSchProfile,
} from '@kir-dev/passport-authsch';

describe('AuthController', () => {
  const profile = parseAuthSchProfile({ sub: 'member' } as RawAuthSchProfile);
  const request = { authSchState: 'state-value' };
  const createResponse = () => {
    const response = {
      setHeader: jest.fn(),
      status: jest.fn(),
      type: jest.fn(),
      send: jest.fn(),
    };
    response.status.mockReturnValue(response);
    response.type.mockReturnValue(response);
    response.send.mockReturnValue(response);
    return response;
  };

  it('builds a single-slash, URL-encoded frontend handoff', async () => {
    const authService = {
      login: jest.fn().mockResolvedValue('header.payload.signature'),
    } as unknown as AuthService;
    const response = createResponse();
    const controller = new AuthController(
      authService,
      new ConfigService({ FRONTEND_URL: 'https://frontend.example.test/' }),
    );

    await controller.oauthRedirect(
      profile,
      request as Parameters<AuthController['oauthRedirect']>[1],
      response as unknown as Parameters<AuthController['oauthRedirect']>[2],
    );

    const html = response.send.mock.calls[0][0] as string;
    expect(html).toContain(
      'action="https://frontend.example.test/api/auth/session"',
    );
    expect(html).toContain('name="state" value="state-value"');
    expect(html).toContain('name="jwt" value="header.payload.signature"');
    expect(html).not.toContain('?jwt=');
  });

  it('allows an explicitly configured HTTP loopback URL for development', async () => {
    const authService = {
      login: jest.fn().mockResolvedValue('header.payload.signature'),
    } as unknown as AuthService;
    const response = createResponse();
    const controller = new AuthController(
      authService,
      new ConfigService({ FRONTEND_URL: 'http://127.0.0.1:3000' }),
    );

    await controller.oauthRedirect(
      profile,
      request as Parameters<AuthController['oauthRedirect']>[1],
      response as unknown as Parameters<AuthController['oauthRedirect']>[2],
    );

    expect(response.send.mock.calls[0][0]).toContain(
      'action="http://127.0.0.1:3000/api/auth/session"',
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
    const response = createResponse();
    const controller = new AuthController(authService, {
      get: jest.fn().mockReturnValue(frontendUrl),
    } as unknown as ConfigService);

    await expect(
      controller.oauthRedirect(
        profile,
        request as Parameters<AuthController['oauthRedirect']>[1],
        response as unknown as Parameters<AuthController['oauthRedirect']>[2],
      ),
    ).rejects.toThrow();
    expect(authService.login).not.toHaveBeenCalled();
    expect(response.send).not.toHaveBeenCalled();
  });

  it('rejects a callback without its validated state before issuing a JWT', async () => {
    const authService = {
      login: jest.fn().mockResolvedValue('header.payload.signature'),
    } as unknown as AuthService;
    const response = createResponse();
    const controller = new AuthController(
      authService,
      new ConfigService({ FRONTEND_URL: 'https://frontend.example.test' }),
    );

    await expect(
      controller.oauthRedirect(
        profile,
        {} as Parameters<AuthController['oauthRedirect']>[1],
        response as unknown as Parameters<AuthController['oauthRedirect']>[2],
      ),
    ).rejects.toThrow('state is missing');
    expect(authService.login).not.toHaveBeenCalled();
  });
});
