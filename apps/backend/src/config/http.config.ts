import type { SessionOptions } from 'express-session';

const SESSION_TTL_MS = 15 * 60 * 1000;

export interface HttpRuntimeConfiguration {
  nodeEnv: string;
  sessionSecret: string;
}

export interface CorsRuntimeConfiguration {
  nodeEnv: string;
  frontendUrl?: string;
}

interface TrustProxyTarget {
  set(name: 'trust proxy', value: number): void;
}

export function createSessionOptions(
  configuration: HttpRuntimeConfiguration,
): SessionOptions {
  const isProduction = configuration.nodeEnv === 'production';

  return {
    secret: configuration.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: SESSION_TTL_MS,
    },
  };
}

export function createCorsOrigins(
  configuration: CorsRuntimeConfiguration,
): string | string[] {
  const frontendOrigin = configuration.frontendUrl
    ? new URL(configuration.frontendUrl).origin
    : undefined;

  if (configuration.nodeEnv === 'production') {
    return frontendOrigin || '';
  }

  return [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    frontendOrigin,
  ].filter((origin): origin is string => Boolean(origin));
}

export function configureTrustProxy(target: TrustProxyTarget): void {
  target.set('trust proxy', 1);
}

export { SESSION_TTL_MS };
