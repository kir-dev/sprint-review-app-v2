import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { parseAuthSchProfile, RawAuthSchProfile } from '@kir-dev/passport-authsch';

describe('AuthController', () => {
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
      parseAuthSchProfile({ sub: 'member' } as RawAuthSchProfile),
      response as unknown as Parameters<AuthController['oauthRedirect']>[1],
    );

    expect(response.redirect).toHaveBeenCalledWith(
      'https://frontend.example.test/login?jwt=header.payload.signature',
    );
  });
});
