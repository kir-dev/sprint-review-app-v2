import type { NextFunction, Request, Response } from 'express';
import type { SessionOptions } from 'express-session';

const SESSION_TTL_MS = 15 * 60 * 1000;

export interface HttpRuntimeConfiguration {
  nodeEnv: string;
  sessionSecret: string;
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

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Rejects state-changing browser requests sent from another origin. The API
 * authenticates with a SameSite=Lax cookie, which sibling sites under the same
 * registrable domain would still attach to their requests. Clients that send
 * no Origin header (curl, scripts) authenticate with a Bearer token instead.
 */
export function rejectCrossOriginWrites(appOrigin: string) {
  return (request: Request, response: Response, next: NextFunction) => {
    const origin = request.headers.origin;
    if (
      SAFE_METHODS.has(request.method) ||
      origin === undefined ||
      origin === appOrigin
    ) {
      next();
      return;
    }
    response.status(403).json({ statusCode: 403, message: 'Forbidden' });
  };
}

export function configureTrustProxy(target: TrustProxyTarget): void {
  target.set('trust proxy', 1);
}

export { SESSION_TTL_MS };
