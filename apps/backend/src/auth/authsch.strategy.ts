import {
  AuthSchProfile,
  AuthSchScope,
  AuthSchTokenResponse,
  parseAuthSchProfile,
  RawAuthSchProfile,
  Strategy,
} from '@kir-dev/passport-authsch';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { UsersService } from '../users/users.service';

const AUTHSCH_REQUEST_TIMEOUT_MS = 5000;

@Injectable()
export class AuthSchStrategy extends PassportStrategy(Strategy, 'authsch') {
  private readonly logger = new Logger(AuthSchStrategy.name);
  private readonly authSchClientId: string;
  private readonly authSchClientSecret: string;
  private readonly authSchRedirectUri: string;
  private readonly authSchProvider: string;

  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    const redirectUri = buildAuthSchRedirectUri(configService);

    super({
      clientId: configService.get<string>('AUTHSCH_CLIENT_ID') || '',
      clientSecret: configService.get<string>('AUTHSCH_CLIENT_SECRET') || '',
      scopes: [
        AuthSchScope.PROFILE,
        AuthSchScope.EMAIL,
        AuthSchScope.SCHACC_ID,
      ],
      redirectUri,
    });

    this.authSchClientId = configService.get<string>('AUTHSCH_CLIENT_ID') || '';
    this.authSchClientSecret =
      configService.get<string>('AUTHSCH_CLIENT_SECRET') || '';
    this.authSchRedirectUri = redirectUri;
    this.authSchProvider = (
      configService.get<string>('AUTHSCH_PROVIDER') || 'https://auth.sch.bme.hu'
    ).replace(/\/+$/, '');

    this.logger.log('AuthSCH strategy initialized');
  }

  /**
   * The upstream strategy logs raw callback errors, whose HTTP client context
   * can contain the OAuth code, client secret and bearer token. Keep its login
   * redirect behavior, but handle the callback locally with metadata-only logs.
   */
  async callback(request: Request): Promise<void> {
    const authorizationCode = request.query.code;
    const providerError = request.query.error;

    if (providerError || typeof authorizationCode !== 'string') {
      this.logger.warn('AuthSCH callback rejected by provider');
      this.failAuthentication();
      return;
    }

    try {
      const tokenResponse = await fetch(
        `${this.authSchProvider}/oauth2/token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${Buffer.from(
              `${this.authSchClientId}:${this.authSchClientSecret}`,
            ).toString('base64')}`,
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code: authorizationCode,
            redirect_uri: this.authSchRedirectUri,
          }),
          signal: AbortSignal.timeout(AUTHSCH_REQUEST_TIMEOUT_MS),
        },
      );

      if (!tokenResponse.ok) {
        this.logger.warn('AuthSCH token request failed');
        this.failAuthentication();
        return;
      }

      const token = (await tokenResponse.json()) as AuthSchTokenResponse;
      if (!token.access_token) {
        this.logger.warn('AuthSCH token response was invalid');
        this.failAuthentication();
        return;
      }

      const profileResponse = await fetch(
        `${this.authSchProvider}/oidc/userinfo`,
        {
          headers: { Authorization: `Bearer ${token.access_token}` },
          signal: AbortSignal.timeout(AUTHSCH_REQUEST_TIMEOUT_MS),
        },
      );

      if (!profileResponse.ok) {
        this.logger.warn('AuthSCH profile request failed');
        this.failAuthentication();
        return;
      }

      const rawProfile = (await profileResponse.json()) as RawAuthSchProfile;
      const validatedUser = await this.validate(
        parseAuthSchProfile(rawProfile),
      );

      if (!validatedUser) {
        this.failAuthentication();
        return;
      }

      this.completeAuthentication(validatedUser);
    } catch {
      this.logger.warn('AuthSCH callback failed');
      this.failAuthentication();
    }
  }

  private failAuthentication(): void {
    // Passport installs these action callbacks on a strategy at runtime.
    (this as unknown as { fail(status: number): void }).fail(401);
  }

  private completeAuthentication(user: unknown): void {
    (this as unknown as { success(user: unknown): void }).success(user);
  }

  async validate(profile: AuthSchProfile): Promise<any> {
    this.logger.log('Validating AuthSCH profile');

    // Check if user exists
    try {
      const existingUser = await this.usersService.findByEmail(profile.email);
      this.logger.log('AuthSCH user resolved');
      return existingUser;
    } catch {
      // User doesn't exist, create new one
      this.logger.log('Creating user from AuthSCH profile');
      const newUser = await this.usersService.create({
        email: profile.email,
        fullName: profile.fullName,
        githubUsername: profile.schAcc?.schAccUsername ?? undefined,
      });
      this.logger.log('AuthSCH user created');
      return newUser;
    }
  }
}

export { AUTHSCH_REQUEST_TIMEOUT_MS };

export function buildAuthSchRedirectUri(configService: ConfigService): string {
  const configuredUrl = configService.get<string>('BACKEND_PUBLIC_URL');
  const backendPublicUrl = configuredUrl
    ? configuredUrl.replace(/\/+$/, '')
    : `http://localhost:${configService.get<string>('PORT') || '3001'}`;

  return `${backendPublicUrl}/auth/callback`;
}
