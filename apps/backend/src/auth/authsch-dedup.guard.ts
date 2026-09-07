import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { createHash } from 'node:crypto';
import type { Request, Response } from 'express';

const CODE_CACHE_TTL_MS = 5 * 60 * 1000;

/** Prevents repeat authorization-code use without retaining or logging credentials. */
@Injectable()
export class AuthSchDedupGuard extends AuthGuard('authsch') {
  private readonly processedCodes = new Set<string>();

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const code = request.query.code;
    if (typeof code === 'string') {
      const hash = createHash('sha256').update(code).digest('hex');
      if (this.processedCodes.has(hash)) {
        response.status(204).end();
        return false;
      }
      this.processedCodes.add(hash);
      setTimeout(() => this.processedCodes.delete(hash), CODE_CACHE_TTL_MS).unref();
    }
    return (await super.canActivate(context)) as boolean;
  }
}
