import { NextRequest, NextResponse } from 'next/server';
import {
  APP_SESSION_COOKIE,
  AUTHSCH_STATE_COOKIE,
  appSessionCookieOptions,
  authSchStateCookieOptions,
  authSchStatesMatch,
} from '@/lib/auth-cookies';

const CALLBACK_ERROR_CODES = new Set([
  'GROUP_MEMBERSHIP_REQUIRED',
  'GROUP_MEMBERSHIP_UNVERIFIABLE',
  'GROUP_ACCESS_UNAVAILABLE',
  'AUTHSCH_FAILED',
]);
const JWT_PATTERN = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
const MAX_JWT_LENGTH = 4096;

function loginRedirect(request: NextRequest, error?: string): NextResponse {
  const destination = new URL('/login', request.url);
  if (error) destination.searchParams.set('error', error);
  const response = NextResponse.redirect(destination);
  response.cookies.set(AUTHSCH_STATE_COOKIE, '', {
    ...authSchStateCookieOptions(),
    maxAge: 0,
  });
  response.headers.set('Cache-Control', 'no-store');
  response.headers.set('Referrer-Policy', 'no-referrer');
  return response;
}

function completeSession(
  request: NextRequest,
  state: string | null,
  callbackError: string | null,
  jwt: string | null,
): NextResponse {
  const expectedState = request.cookies.get(AUTHSCH_STATE_COOKIE)?.value;
  if (!authSchStatesMatch(state, expectedState)) {
    return loginRedirect(request, 'AUTHSCH_FAILED');
  }

  if (callbackError) {
    return loginRedirect(
      request,
      CALLBACK_ERROR_CODES.has(callbackError)
        ? callbackError
        : 'AUTHSCH_FAILED',
    );
  }

  if (!jwt || jwt.length > MAX_JWT_LENGTH || !JWT_PATTERN.test(jwt)) {
    return loginRedirect(request, 'AUTHSCH_FAILED');
  }

  const response = loginRedirect(request);
  response.cookies.set(APP_SESSION_COOKIE, jwt, appSessionCookieOptions());
  return response;
}

/** Accepts provider failures redirected without an application credential. */
export function GET(request: NextRequest) {
  return completeSession(
    request,
    request.nextUrl.searchParams.get('state'),
    request.nextUrl.searchParams.get('error'),
    null,
  );
}

/** Exchanges a state-bound backend POST handoff for a frontend HttpOnly session cookie. */
export async function POST(request: NextRequest) {
  const form = await request.formData();
  const state = form.get('state');
  const jwt = form.get('jwt');
  return completeSession(
    request,
    typeof state === 'string' ? state : null,
    null,
    typeof jwt === 'string' ? jwt : null,
  );
}
