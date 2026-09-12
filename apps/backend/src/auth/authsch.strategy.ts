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
import type { Session, SessionData } from 'express-session';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { parseBrowserOrigin, parseHttpsProvider } from '../config/public-url';

const AUTHSCH_REQUEST_TIMEOUT_MS = 5000;
const AUTHSCH_STATE_TTL_MS = 10 * 60 * 1000;
const AUTHSCH_STATE_PATTERN = /^[a-z0-9]{8,12}\.[A-Za-z0-9_-]{43}$/;
const AUTHSCH_SCOPES = [
  AuthSchScope.PROFILE,
  AuthSchScope.EMAIL,
  AuthSchScope.SCHACC_ID,
  AuthSchScope.PEK_PROFILE,
];

type AuthSchRequest = Request & {
  authSchState?: string;
  session: Session &
    Partial<SessionData> & {
      authSchLogin?: {
        providerState: string;
        clientNonce: string;
        createdAt: number;
      };
    };
};

function statesMatch(actual: string, expected: string): boolean {
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);
  return (
    actualBuffer.length === expectedBuffer.length &&
    timingSafeEqual(actualBuffer, expectedBuffer)
  );
}

/** Retrieves AuthSCH profiles without exposing provider credentials in callback errors. */
@Injectable()
export class AuthSchStrategy extends PassportStrategy(Strategy, 'authsch') {
  private readonly logger = new Logger(AuthSchStrategy.name);
  private readonly authSchClientId: string;
  private readonly authSchClientSecret: string;
  private readonly authSchRedirectUri: string;
  private readonly authSchProvider: string;

  constructor(configService: ConfigService) {
    const redirectUri = buildAuthSchRedirectUri(configService);
    const clientId = configService.get<string>('AUTHSCH_CLIENT_ID') || '';
    const clientSecret =
      configService.get<string>('AUTHSCH_CLIENT_SECRET') || '';
    const provider = parseHttpsProvider(
      configService.get<string>('AUTHSCH_PROVIDER') ||
        'https://auth.sch.bme.hu',
      'AUTHSCH_PROVIDER',
    );

    super({
      clientId,
      clientSecret,
      scopes: AUTHSCH_SCOPES,
      redirectUri,
    });

    this.authSchClientId = clientId;
    this.authSchClientSecret = clientSecret;
    this.authSchRedirectUri = redirectUri;
    this.authSchProvider = provider.toString().replace(/\/+$/, '');

    this.logger.log('AuthSCH strategy initialized');
  }

  /** Starts or completes an AuthSCH authorization flow with state validation. */
  async authenticate(request: AuthSchRequest): Promise<void> {
    if (!this.authSchClientId || !this.authSchClientSecret) {
      this.failAuthentication();
      return;
    }

    if (request.path.endsWith('login')) {
      this.startLogin(request);
      return;
    }
    if (request.path.endsWith('callback')) {
      await this.callback(request);
      return;
    }
    this.passAuthentication();
  }

  /** Persists the frontend nonce in the backend session and forwards it to AuthSCH. */
  private startLogin(request: AuthSchRequest): void {
    const clientNonce = request.query.state;
    if (
      !request.session ||
      typeof clientNonce !== 'string' ||
      !AUTHSCH_STATE_PATTERN.test(clientNonce)
    ) {
      this.failAuthentication();
      return;
    }

    const providerState = `${Date.now().toString(36)}.${randomBytes(32).toString('base64url')}`;
    request.session.authSchLogin = {
      providerState,
      clientNonce,
      createdAt: Date.now(),
    };
    const url = new URL('/site/login', this.authSchProvider);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', this.authSchClientId);
    url.searchParams.set('scope', ['openid', ...AUTHSCH_SCOPES].join(' '));
    url.searchParams.set('redirect_uri', this.authSchRedirectUri);
    url.searchParams.set('state', providerState);
    this.redirectAuthentication(url.toString());
  }

  /**
   * The upstream strategy logs raw callback errors, whose HTTP client context
   * can contain the OAuth code, client secret and bearer token. Keep its login
   * redirect behavior, but handle the callback locally with metadata-only logs.
   */
  async callback(request: AuthSchRequest): Promise<void> {
    const authorizationCode = request.query.code;
    const providerError = request.query.error;
    const state = request.query.state;
    const pendingLogin = request.session?.authSchLogin;
    if (!request.session) {
      this.logger.warn('AuthSCH callback session missing');
      this.failAuthentication();
      return;
    }
    delete request.session.authSchLogin;

    const stateAge = pendingLogin ? Date.now() - pendingLogin.createdAt : -1;

    const stateIsValid =
      typeof state === 'string' &&
      AUTHSCH_STATE_PATTERN.test(state) &&
      pendingLogin !== undefined &&
      stateAge >= 0 &&
      stateAge <= AUTHSCH_STATE_TTL_MS &&
      statesMatch(state, pendingLogin.providerState);

    if (!stateIsValid) {
      this.logger.warn('AuthSCH callback state rejected');
      this.failAuthentication();
      return;
    }

    request.authSchState = pendingLogin.clientNonce;

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

  private redirectAuthentication(url: string): void {
    (this as unknown as { redirect(url: string): void }).redirect(url);
  }

  private passAuthentication(): void {
    (this as unknown as { pass(): void }).pass();
  }

  /** Leaves local account access to the callback service, after membership authorization. */
  async validate(profile: AuthSchProfile): Promise<AuthSchProfile> {
    return profile;
  }
}

export { AUTHSCH_REQUEST_TIMEOUT_MS, AUTHSCH_STATE_TTL_MS };

/** Builds a validated public callback URL, allowing HTTP only on loopback. */
export function buildAuthSchRedirectUri(configService: ConfigService): string {
  const configuredUrl = configService.get<string>('BACKEND_PUBLIC_URL');
  const value =
    configuredUrl ||
    `http://localhost:${configService.get<string>('PORT') || '3001'}`;
  const backendPublicUrl = parseBrowserOrigin(value, 'BACKEND_PUBLIC_URL');

  return new URL('/auth/callback', backendPublicUrl).toString();
}
