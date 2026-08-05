import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  const previousFrontendUrl = process.env.FRONTEND_URL;

  afterEach(() => {
    if (previousFrontendUrl === undefined) {
      delete process.env.FRONTEND_URL;
    } else {
      process.env.FRONTEND_URL = previousFrontendUrl;
    }
  });

  it('builds a single-slash, URL-encoded frontend handoff', () => {
    process.env.FRONTEND_URL = 'https://frontend.example.test/';
    const authService = {
      login: jest.fn().mockReturnValue('header.payload.signature'),
    } as unknown as AuthService;
    const response = { redirect: jest.fn() };
    const controller = new AuthController(authService);

    controller.oauthRedirect(
      { id: 1 },
      response as unknown as Parameters<AuthController['oauthRedirect']>[1],
    );

    expect(response.redirect).toHaveBeenCalledWith(
      'https://frontend.example.test/login?jwt=header.payload.signature',
    );
  });
});
