import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const requestId = randomUUID();
    const { method } = request;
    const path = request.originalUrl.split('?', 1)[0] || request.path;
    const startTime = Date.now();

    response.setHeader('X-Request-ID', requestId);

    response.on('finish', () => {
      const { statusCode } = response;
      const logEntry = {
        requestId,
        method,
        path,
        status: statusCode,
        durationMs: Date.now() - startTime,
      };

      if (statusCode >= 500) {
        this.logger.error(logEntry);
      } else if (statusCode >= 400) {
        this.logger.warn(logEntry);
      } else {
        this.logger.log(logEntry);
      }
    });

    next();
  }
}
