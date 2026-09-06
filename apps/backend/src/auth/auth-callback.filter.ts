import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { isRecord } from '../group-access/group-access.types';

const CALLBACK_CODES = new Set([
  'GROUP_MEMBERSHIP_REQUIRED',
  'GROUP_MEMBERSHIP_UNVERIFIABLE',
  'GROUP_ACCESS_UNAVAILABLE',
]);

/** Converts callback failures to a fixed frontend destination without exposing provider errors. */
@Catch()
export class AuthCallbackFilter implements ExceptionFilter {
  constructor(private readonly config: ConfigService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const body = exception instanceof HttpException ? exception.getResponse() : undefined;
    const code =
      isRecord(body) && typeof body.code === 'string' && CALLBACK_CODES.has(body.code)
        ? body.code
        : 'AUTHSCH_FAILED';
    const url = new URL(
      '/login',
      this.config.get<string>('FRONTEND_URL') || 'http://localhost:3000',
    );
    url.searchParams.set('error', code);
    const response = host.switchToHttp().getResponse<Response>();
    response.setHeader('Cache-Control', 'no-store');
    response.redirect(url.toString());
  }
}
