import {
  isLoopbackHostname,
  parseBrowserOrigin,
  parseHttpsProvider,
} from './public-url';

const DEFAULT_PORT = 3001;
const MIN_SECRET_LENGTH = 32;

const PLACEHOLDER_VALUES = new Set([
  'change-me',
  'changeme',
  'development',
  'example',
  'jwt-secret',
  'placeholder',
  'secret',
  'session-secret',
  'test',
]);

type Environment = Record<string, unknown>;

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function isPlaceholder(value: string): boolean {
  const normalized = value.toLowerCase();
  return (
    PLACEHOLDER_VALUES.has(normalized) ||
    normalized.includes('replace-me') ||
    normalized.includes('replace-with') ||
    normalized.includes('your-') ||
    normalized.includes('<') ||
    normalized.includes('>')
  );
}

function validateSecret(
  errors: string[],
  name: string,
  value: string,
  requireStrength: boolean,
): void {
  if (!value) {
    errors.push(`${name} is required`);
    return;
  }

  if (isPlaceholder(value)) {
    errors.push(`${name} must not be a placeholder`);
    return;
  }

  if (
    requireStrength &&
    (value.length < MIN_SECRET_LENGTH || new Set(value).size < 8)
  ) {
    errors.push(`${name} must be a strong secret`);
  }
}

function validatePublicOrigin(
  errors: string[],
  name: string,
  value: string,
  required: boolean,
  rejectLoopback: boolean,
): void {
  if (!value) {
    if (required) errors.push(`${name} is required`);
    return;
  }

  try {
    const url = parseBrowserOrigin(value, name);
    if (rejectLoopback && isLoopbackHostname(url.hostname)) {
      errors.push(`${name} must not use a loopback host in production`);
    }
  } catch (error) {
    errors.push(error instanceof Error ? error.message : `${name} is invalid`);
  }
}

function validateAuthSchProvider(errors: string[], value: string): void {
  try {
    parseHttpsProvider(value || 'https://auth.sch.bme.hu', 'AUTHSCH_PROVIDER');
  } catch (error) {
    errors.push(
      error instanceof Error ? error.message : 'AUTHSCH_PROVIDER is invalid',
    );
  }
}

function parsePort(value: unknown, errors: string[]): number {
  const rawValue = stringValue(value) || String(DEFAULT_PORT);
  const port = Number(rawValue);

  if (
    !/^\d+$/.test(rawValue) ||
    !Number.isInteger(port) ||
    port < 1 ||
    port > 65535
  ) {
    errors.push('PORT must be an integer between 1 and 65535');
    return DEFAULT_PORT;
  }

  return port;
}

function parseBoolean(
  name: string,
  value: unknown,
  defaultValue: boolean,
  errors: string[],
): boolean {
  const rawValue = stringValue(value);
  if (!rawValue) {
    return defaultValue;
  }
  if (rawValue === 'true') {
    return true;
  }
  if (rawValue === 'false') {
    return false;
  }

  errors.push(`${name} must be either true or false`);
  return defaultValue;
}

export function validateEnvironment(environment: Environment): Environment {
  const errors: string[] = [];
  const nodeEnv = stringValue(environment.NODE_ENV) || 'development';
  const port = parsePort(environment.PORT, errors);
  const enableSwagger = parseBoolean(
    'ENABLE_SWAGGER',
    environment.ENABLE_SWAGGER,
    false,
    errors,
  );

  if (!['development', 'test', 'production'].includes(nodeEnv)) {
    errors.push('NODE_ENV must be development, test, or production');
  }

  const isProduction = nodeEnv === 'production';
  const frontendUrl = stringValue(environment.FRONTEND_URL);
  const backendPublicUrl = stringValue(environment.BACKEND_PUBLIC_URL);
  validatePublicOrigin(
    errors,
    'FRONTEND_URL',
    frontendUrl,
    isProduction,
    isProduction,
  );
  validatePublicOrigin(
    errors,
    'BACKEND_PUBLIC_URL',
    backendPublicUrl,
    isProduction,
    isProduction,
  );
  validateAuthSchProvider(errors, stringValue(environment.AUTHSCH_PROVIDER));

  if (isProduction) {
    const databaseUrl = stringValue(environment.DATABASE_URL);
    const authSchClientId = stringValue(environment.AUTHSCH_CLIENT_ID);
    const authSchClientSecret = stringValue(environment.AUTHSCH_CLIENT_SECRET);
    const jwtSecret = stringValue(environment.JWT_SECRET);
    const sessionSecret = stringValue(environment.SESSION_SECRET);

    validateSecret(errors, 'DATABASE_URL', databaseUrl, false);
    validateSecret(errors, 'AUTHSCH_CLIENT_ID', authSchClientId, false);
    validateSecret(errors, 'AUTHSCH_CLIENT_SECRET', authSchClientSecret, false);
    validateSecret(errors, 'JWT_SECRET', jwtSecret, true);
    validateSecret(errors, 'SESSION_SECRET', sessionSecret, true);
    if (jwtSecret && sessionSecret && jwtSecret === sessionSecret) {
      errors.push('JWT_SECRET and SESSION_SECRET must be different');
    }
  }

  if (errors.length > 0) {
    throw new Error(`Invalid environment configuration: ${errors.join('; ')}`);
  }

  return {
    ...environment,
    NODE_ENV: nodeEnv,
    PORT: port,
    ENABLE_SWAGGER: enableSwagger,
  };
}

export { DEFAULT_PORT };
