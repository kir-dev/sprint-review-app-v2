import { validateEnvironment } from './environment';

const productionEnvironment = {
  NODE_ENV: 'production',
  DATABASE_URL: 'postgresql://database.internal/sprint_review',
  AUTHSCH_CLIENT_ID: 'authsch-client-id',
  AUTHSCH_CLIENT_SECRET: 'authsch-client-secret',
  JWT_SECRET: 'jwt-secret-with-at-least-32-random-characters-123',
  SESSION_SECRET: 'session-secret-with-at-least-32-random-chars-456',
  FRONTEND_URL: 'https://review.example.com',
  BACKEND_PUBLIC_URL: 'https://api.review.example.com',
};

describe('validateEnvironment', () => {
  it('applies production-safe defaults', () => {
    expect(validateEnvironment(productionEnvironment)).toMatchObject({
      NODE_ENV: 'production',
      PORT: 3001,
      ENABLE_SWAGGER: false,
    });
  });

  it.each([
    ['http://review.example.com', 'https scheme'],
    ['https://localhost:3000', 'localhost'],
    ['https://user:password@review.example.com', 'credentials'],
    ['https://review.example.com/path', 'path'],
    ['https://review.example.com?token=value', 'query'],
    ['https://review.example.com#fragment', 'fragment'],
  ])('rejects a production frontend URL with %s (%s)', (url) => {
    expect(() =>
      validateEnvironment({ ...productionEnvironment, FRONTEND_URL: url }),
    ).toThrow('FRONTEND_URL');
  });

  it('rejects missing and weak secrets without including their values', () => {
    const leakedSecret = 'weak-value';

    expect(() =>
      validateEnvironment({
        ...productionEnvironment,
        JWT_SECRET: leakedSecret,
        SESSION_SECRET: '',
      }),
    ).toThrow(/JWT_SECRET.*SESSION_SECRET/);

    try {
      validateEnvironment({
        ...productionEnvironment,
        JWT_SECRET: leakedSecret,
        SESSION_SECRET: '',
      });
    } catch (error) {
      expect((error as Error).message).not.toContain(leakedSecret);
    }
  });

  it('rejects identical JWT and session secrets', () => {
    expect(() =>
      validateEnvironment({
        ...productionEnvironment,
        SESSION_SECRET: productionEnvironment.JWT_SECRET,
      }),
    ).toThrow('must be different');
  });

  it.each(['0', '65536', '3.14', 'not-a-port'])(
    'rejects invalid port %s',
    (port) => {
      expect(() =>
        validateEnvironment({ ...productionEnvironment, PORT: port }),
      ).toThrow('PORT');
    },
  );

  it('allows localhost outside production', () => {
    expect(
      validateEnvironment({
        NODE_ENV: 'development',
        FRONTEND_URL: 'http://localhost:3000',
      }),
    ).toMatchObject({ NODE_ENV: 'development', PORT: 3001 });
  });
});
