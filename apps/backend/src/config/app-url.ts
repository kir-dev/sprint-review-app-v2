import type { ConfigService } from '@nestjs/config';
import { parseBrowserOrigin } from './public-url';

const DEVELOPMENT_APP_URL = 'http://localhost:3000';

/**
 * The single public origin of the app. The frontend pages and the API (under
 * /api) are both served from it, so it is also where AuthSCH returns.
 */
export function appUrl(config: ConfigService): URL {
  return parseBrowserOrigin(
    config.get<string>('APP_URL') || DEVELOPMENT_APP_URL,
    'APP_URL',
  );
}
