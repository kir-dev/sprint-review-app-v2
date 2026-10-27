import type { CookieOptions, Request } from 'express';
import { SESSION_MAX_AGE_SECONDS } from '../group-access/group-access.types';

/** HttpOnly cookie that carries the application JWT for every /api request. */
export const APP_SESSION_COOKIE = 'sprint-review-session';

/** Cookie settings for the application session; the cookie never leaves /api. */
export function appSessionCookieOptions(appOrigin: URL): CookieOptions {
  return {
    httpOnly: true,
    secure: appOrigin.protocol === 'https:',
    sameSite: 'lax',
    path: '/api',
    maxAge: SESSION_MAX_AGE_SECONDS * 1000,
  };
}

/** Reads one cookie from the raw header, without a cookie-parser dependency. */
export function readCookie(request: Request, name: string): string | null {
  const header = request.headers.cookie;
  if (!header) return null;
  for (const part of header.split(';')) {
    const separator = part.indexOf('=');
    if (separator === -1 || part.slice(0, separator).trim() !== name) continue;
    try {
      return decodeURIComponent(part.slice(separator + 1).trim());
    } catch {
      return null;
    }
  }
  return null;
}
