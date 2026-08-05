import {
  createCorsOrigins,
  createSessionOptions,
  configureTrustProxy,
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

  it('allows only the configured frontend origin in production', () => {
    expect(
      createCorsOrigins({
        nodeEnv: 'production',
        frontendUrl: 'https://review.example.com/',
      }),
    ).toBe('https://review.example.com');
  });

  it('allows localhost only outside production', () => {
    expect(
      createCorsOrigins({
        nodeEnv: 'development',
        frontendUrl: 'https://review.example.com',
      }),
    ).toEqual([
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'https://review.example.com',
    ]);
  });

  it('trusts exactly one ingress proxy hop', () => {
    const set = jest.fn();

    configureTrustProxy({ set });

    expect(set).toHaveBeenCalledWith('trust proxy', 1);
  });
});
