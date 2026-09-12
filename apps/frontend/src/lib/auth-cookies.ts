import { randomBytes, timingSafeEqual } from 'node:crypto';

export const APP_SESSION_COOKIE = 'sprint-review-session';
export const AUTHSCH_STATE_COOKIE = 'sprint-review-authsch-state';
export const APP_SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;
export const AUTHSCH_STATE_TTL_SECONDS = 10 * 60;

const STATE_RANDOM_BYTES = 32;
const STATE_PATTERN = /^[a-z0-9]{8,12}\.[A-Za-z0-9_-]{43}$/;

/** Creates an unguessable OAuth state with an embedded server-verifiable issue time. */
export function createAuthSchState(now: number = Date.now()): string {
  return `${now.toString(36)}.${randomBytes(STATE_RANDOM_BYTES).toString('base64url')}`;
}

/** Validates state syntax, expiry, and exact value without timing-dependent comparison. */
export function authSchStatesMatch(
  actual: string | null,
  expected: string | undefined,
  now: number = Date.now(),
): boolean {
  if (!actual || !expected || !STATE_PATTERN.test(actual)) return false;
  const issuedAt = Number.parseInt(actual.split('.')[0], 36);
  if (
    !Number.isFinite(issuedAt) ||
    issuedAt > now ||
    now - issuedAt > AUTHSCH_STATE_TTL_SECONDS * 1000
  ) {
    return false;
  }
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);
  return (
    actualBuffer.length === expectedBuffer.length &&
    timingSafeEqual(actualBuffer, expectedBuffer)
  );
}

/** Returns secure frontend-owned session cookie settings for the current runtime. */
export function appSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/api',
    maxAge: APP_SESSION_TTL_SECONDS,
  };
}

/** Returns short-lived OAuth state cookie settings. */
export function authSchStateCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite:
      process.env.NODE_ENV === 'production'
        ? ('none' as const)
        : ('lax' as const),
    path: '/api/auth',
    maxAge: AUTHSCH_STATE_TTL_SECONDS,
  };
}
