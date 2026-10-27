import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import {
  parseAuthSchProfile,
  RawAuthSchProfile,
} from '@kir-dev/passport-authsch';
import { APP_SESSION_COOKIE } from './session-cookie';
import { SESSION_MAX_AGE_SECONDS } from '../group-access/group-access.types';

describe('AuthController', () => {
  const profile = parseAuthSchProfile({ sub: 'member' } as RawAuthSchProfile);
  const createResponse = () => ({
    cookie: jest.fn(),
    clearCookie: jest.fn(),
    setHeader: jest.fn(),
    redirect: jest.fn(),
  });
  const createController = (appUrl: string | undefined) => {
    const authService = {
      login: jest.fn().mockResolvedValue('header.payload.signature'),
    } as unknown as AuthService;
    const controller = new AuthController(authService, {
      get: jest.fn((key: string) => (key === 'APP_URL' ? appUrl : undefined)),
    } as unknown as ConfigService);
    return { authService, controller };
  };
  type CallbackResponse = Parameters<AuthController['oauthRedirect']>[1];

  it('stores the JWT in an HttpOnly API cookie and returns to the login page', async () => {
    const { controller } = createController('https://review.example.test/');
    const response = createResponse();

    await controller.oauthRedirect(
      profile,
      response as unknown as CallbackResponse,
    );

    expect(response.cookie).toHaveBeenCalledWith(
      APP_SESSION_COOKIE,
      'header.payload.signature',
      {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/api',
        maxAge: SESSION_MAX_AGE_SECONDS * 1000,
      },
    );
    expect(response.redirect).toHaveBeenCalledWith(
      'https://review.example.test/login',
    );
    expect(response.setHeader).toHaveBeenCalledWith(
      'Cache-Control',
      'no-store',
    );
  });

  it('drops the Secure flag only for an HTTP loopback app URL', async () => {
    const { controller } = createController('http://127.0.0.1:3000');
    const response = createResponse();

    await controller.oauthRedirect(
      profile,
      response as unknown as CallbackResponse,
    );

    expect(response.cookie.mock.calls[0][2]).toMatchObject({ secure: false });
    expect(response.redirect).toHaveBeenCalledWith(
      'http://127.0.0.1:3000/login',
    );
  });

  it.each([
    ['an invalid URL', 'not-a-url'],
    ['a non-loopback HTTP URL', 'http://review.example.test'],
    ['a URL with a path', 'https://review.example.test/app'],
  ])('rejects %s before issuing a JWT', async (_case, appUrl) => {
    const { authService, controller } = createController(appUrl);
    const response = createResponse();

    await expect(
      controller.oauthRedirect(
        profile,
        response as unknown as CallbackResponse,
      ),
    ).rejects.toThrow('APP_URL');
    expect(authService.login).not.toHaveBeenCalled();
    expect(response.cookie).not.toHaveBeenCalled();
  });

  it('clears the session cookie with the attributes it was set with', () => {
    const { controller } = createController('https://review.example.test');
    const response = createResponse();

    controller.logout(
      response as unknown as Parameters<AuthController['logout']>[0],
    );

    expect(response.clearCookie).toHaveBeenCalledWith(APP_SESSION_COOKIE, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/api',
    });
  });
});
