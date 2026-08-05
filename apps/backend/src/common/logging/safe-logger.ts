import { Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';

/**
 * Log an application error without serialising the originating exception.
 *
 * Database clients and HTTP libraries commonly attach connection strings,
 * headers and request payloads to errors. Keeping the exception out of the log
 * entry makes the operation name and opaque error ID the entire log surface.
 */
export function logServiceError(logger: Logger, operation: string): string {
  const errorId = randomUUID();

  logger.error({
    event: 'service_error',
    operation,
    errorId,
  });

  return errorId;
}
