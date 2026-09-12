import { NextResponse } from 'next/server';
import { publicBackendUrl } from '@/lib/backend';
import {
  AUTHSCH_STATE_COOKIE,
  authSchStateCookieOptions,
  createAuthSchState,
} from '@/lib/auth-cookies';

/** Starts AuthSCH login with a short-lived state bound to the frontend origin. */
export async function GET() {
  const state = createAuthSchState();
  const destination = new URL('/auth/login', publicBackendUrl());
  destination.searchParams.set('state', state);
  const response = NextResponse.redirect(destination);
  response.cookies.set(AUTHSCH_STATE_COOKIE, state, authSchStateCookieOptions());
  response.headers.set('Cache-Control', 'no-store');
  response.headers.set('Referrer-Policy', 'no-referrer');
  return response;
}
