import type { NextFunction, Request, Response } from 'express';
import {
  createSessionOptions,
  configureTrustProxy,
  rejectCrossOriginWrites,
  SESSION_TTL_MS,
} from './http.config';

describe('HTTP runtime configuration', () => {
  it('creates a secure, short-lived production session cookie', () => {
    const options = createSessionOptions({
      nodeEnv: 'production',
      sessionSecret: 'a-production-session-secret',
    });

    expect(options).toMatchObject({
      secret: 'a-production-session-secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: SESSION_TTL_MS,
      },
    });
  });

  describe('cross-origin write protection', () => {
    const guard = rejectCrossOriginWrites('https://review.example.com');
    const run = (method: string, origin?: string) => {
      const next = jest.fn() as NextFunction;
      const response = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      guard(
        { method, headers: origin ? { origin } : {} } as Request,
        response as unknown as Response,
        next,
      );
      return { next, response };
    };

    it.each([
      ['a same-origin write', 'POST', 'https://review.example.com'],
      ['a write without an Origin header', 'DELETE', undefined],
      ['a cross-origin read', 'GET', 'https://other.example.com'],
    ])('allows %s', (_case, method, origin) => {
      const { next, response } = run(method, origin);
      expect(next).toHaveBeenCalled();
      expect(response.status).not.toHaveBeenCalled();
    });

    it.each([
      ['a sibling subdomain', 'https://other.example.com'],
      ['an opaque origin', 'null'],
      ['the same host over HTTP', 'http://review.example.com'],
    ])('rejects writes from %s', (_case, origin) => {
      const { next, response } = run('PATCH', origin);
      expect(next).not.toHaveBeenCalled();
      expect(response.status).toHaveBeenCalledWith(403);
    });
  });

  it('trusts exactly one ingress proxy hop', () => {
    const set = jest.fn();

    configureTrustProxy({ set });

    expect(set).toHaveBeenCalledWith('trust proxy', 1);
  });
});
