import { NextResponse } from 'next/server';
import { APP_SESSION_COOKIE, appSessionCookieOptions } from '@/lib/auth-cookies';

/** Removes the frontend HttpOnly application session. */
export async function POST() {
  const response = new NextResponse(null, { status: 204 });
  response.cookies.set(APP_SESSION_COOKIE, '', {
    ...appSessionCookieOptions(),
    maxAge: 0,
  });
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
