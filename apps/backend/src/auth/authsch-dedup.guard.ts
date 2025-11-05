import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';

/**
 * Custom AuthSCH Guard that prevents duplicate authorization code usage.
 * 
 * OAuth authorization codes are single-use tokens. Due to browser behavior
 * (duplicate requests, redirects, etc.), the same code might be submitted twice.
 * This guard caches recently seen codes to prevent the second attempt.
 */
@Injectable()
export class AuthSchDedupGuard extends AuthGuard('authsch') {
  private readonly logger = new Logger(AuthSchDedupGuard.name);
  private readonly processedCodes = new Set<string>();

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse<Response>();
    const code = request.query?.code;

    this.logger.log(`🛡️  Guard checking code: ${code}`);
    this.logger.log(`🛡️  Request headers: ${JSON.stringify(request.headers)}`);

    // Check if code was already processed
    if (code && this.processedCodes.has(code)) {
      this.logger.warn(`⚠️  BLOCKED: Code already processed: ${code}`);
      
      // Return 204 No Content - acknowledges the request but provides no body
      // This is the cleanest way to handle duplicate requests
      response.status(204).end();
      
      // Return false to stop further processing
      return false;
    }

    // Mark code as being processed
    if (code) {
      this.logger.log(`✅ New code, marking as processed: ${code}`);
      this.processedCodes.add(code);

      // Cleanup after 5 minutes
      setTimeout(() => {
        this.processedCodes.delete(code);
        this.logger.log(`🗑️  Cleaned up code from cache: ${code}`);
      }, 300000);
    }

    // Proceed with normal AuthGuard logic
    const result = (await super.canActivate(context)) as boolean;
    this.logger.log(`🛡️  Guard result: ${result}`);
    
    return result;
  }
}
