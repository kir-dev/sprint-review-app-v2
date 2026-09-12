import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { parseBrowserOrigin } from '../config/public-url';
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
    const body =
      exception instanceof HttpException ? exception.getResponse() : undefined;
    const code =
      isRecord(body) &&
      typeof body.code === 'string' &&
      CALLBACK_CODES.has(body.code)
        ? body.code
        : 'AUTHSCH_FAILED';
    const request = host
      .switchToHttp()
      .getRequest<Request & { authSchState?: string }>();
    const frontendOrigin = parseBrowserOrigin(
      this.config.get<string>('FRONTEND_URL') || 'http://localhost:3000',
      'FRONTEND_URL',
    );
    const url = new URL(
      request.authSchState ? '/api/auth/session' : '/login',
      frontendOrigin,
    );
    url.searchParams.set('error', code);
    if (request.authSchState) {
      url.searchParams.set('state', request.authSchState);
    }
    const response = host.switchToHttp().getResponse<Response>();
    response.setHeader('Cache-Control', 'no-store');
    response.redirect(url.toString());
  }
}
