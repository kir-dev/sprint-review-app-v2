import { CurrentUser } from '@kir-dev/passport-authsch';
import type { AuthSchProfile } from '@kir-dev/passport-authsch';
import {
  Controller,
  Get,
  HttpCode,
  Post,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { Public } from '../common/decorators/public.decorator';
import { appUrl } from '../config/app-url';
import { AuthCallbackFilter } from './auth-callback.filter';
import { AuthService } from './auth.service';
import { AuthSchDedupGuard } from './authsch-dedup.guard';
import { APP_SESSION_COOKIE, appSessionCookieOptions } from './session-cookie';

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
    status: 302,
    description: 'Sets the session cookie and redirects to the login page',
  })
  async oauthRedirect(
    @CurrentUser() profile: AuthSchProfile,
    @Res() res: Response,
  ) {
    const origin = appUrl(this.config);
    const jwt = await this.auth.login(profile);
    res.cookie(APP_SESSION_COOKIE, jwt, appSessionCookieOptions(origin));
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.redirect(new URL('/login', origin).toString());
  }

  @Public()
  @Post('logout')
  @HttpCode(204)
  @ApiOperation({ summary: 'Clear the application session cookie' })
  @ApiResponse({ status: 204, description: 'Session cookie removed' })
  logout(@Res({ passthrough: true }) res: Response) {
    const { maxAge: _maxAge, ...options } = appSessionCookieOptions(
      appUrl(this.config),
    );
    res.clearCookie(APP_SESSION_COOKIE, options);
    res.setHeader('Cache-Control', 'no-store');
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
