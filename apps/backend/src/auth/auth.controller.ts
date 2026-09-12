import { CurrentUser } from '@kir-dev/passport-authsch';
import type { AuthSchProfile } from '@kir-dev/passport-authsch';
import {
  Controller,
  Get,
  InternalServerErrorException,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { randomBytes } from 'node:crypto';
import { Public } from '../common/decorators/public.decorator';
import { parseBrowserOrigin } from '../config/public-url';
import { AuthCallbackFilter } from './auth-callback.filter';
import { AuthService } from './auth.service';
import { AuthSchDedupGuard } from './authsch-dedup.guard';

function frontendLoginUrl(config: ConfigService): URL {
  const configuredUrl = config.get<string>('FRONTEND_URL');
  if (!configuredUrl) {
    throw new InternalServerErrorException('FRONTEND_URL must be configured');
  }

  try {
    return new URL(
      '/api/auth/session',
      parseBrowserOrigin(configuredUrl, 'FRONTEND_URL'),
    );
  } catch (error) {
    throw new InternalServerErrorException(
      error instanceof Error ? error.message : 'FRONTEND_URL is invalid',
    );
  }
}

function escapeHtmlAttribute(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function sessionHandoffPage(
  destination: URL,
  state: string,
  jwt: string,
  nonce: string,
): string {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Signing in</title></head>
<body><form id="session-handoff" method="post" action="${escapeHtmlAttribute(destination.toString())}">
<input type="hidden" name="state" value="${escapeHtmlAttribute(state)}">
<input type="hidden" name="jwt" value="${escapeHtmlAttribute(jwt)}">
</form><script nonce="${nonce}">document.getElementById('session-handoff').submit();</script></body></html>`;
}

/** Handles AuthSCH redirects and current-user reads. */
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Public()
  @Get('login')
  @UseFilters(AuthCallbackFilter)
  @ApiOperation({ summary: 'Initiate AuthSCH login' })
  @ApiResponse({ status: 302, description: 'Redirects to AuthSCH login page' })
  @UseGuards(AuthGuard('authsch'))
  login() {}

  @Public()
  @Get('callback')
  @UseFilters(AuthCallbackFilter)
  @UseGuards(AuthSchDedupGuard)
  @ApiOperation({
    summary: 'Validate group membership and issue an application session',
  })
  @ApiResponse({
    status: 200,
    description: 'Posts a state-bound session handoff to the frontend',
  })
  async oauthRedirect(
    @CurrentUser() profile: AuthSchProfile,
    @Req() req: Request & { authSchState?: string },
    @Res() res: Response,
  ) {
    const url = frontendLoginUrl(this.config);
    if (!req.authSchState) {
      throw new InternalServerErrorException(
        'AuthSCH callback state is missing',
      );
    }
    const jwt = await this.auth.login(profile);
    const nonce = randomBytes(18).toString('base64url');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader(
      'Content-Security-Policy',
      `default-src 'none'; script-src 'nonce-${nonce}'; form-action ${url.origin}; base-uri 'none'; frame-ancestors 'none'`,
    );
    return res
      .status(200)
      .type('html')
      .send(sessionHandoffPage(url, req.authSchState, jwt, nonce));
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Return current user' })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired membership session',
  })
  getProfile(@CurrentUser() user: { id: number }) {
    return this.auth.getUserById(user.id);
  }
}
