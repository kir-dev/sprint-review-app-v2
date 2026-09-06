import { CurrentUser } from '@kir-dev/passport-authsch';
import type { AuthSchProfile } from '@kir-dev/passport-authsch';
import { Controller, Get, Res, UseFilters, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { Public } from '../common/decorators/public.decorator';
import { AuthCallbackFilter } from './auth-callback.filter';
import { AuthService } from './auth.service';
import { AuthSchDedupGuard } from './authsch-dedup.guard';

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
  @ApiOperation({ summary: 'Validate group membership and issue an application session' })
  @ApiResponse({ status: 302, description: 'Redirects to login with a session or an error code' })
  async oauthRedirect(@CurrentUser() profile: AuthSchProfile, @Res() res: Response) {
    const jwt = await this.auth.login(profile);
    const url = new URL(
      '/login',
      this.config.get<string>('FRONTEND_URL') || 'http://localhost:3000',
    );
    url.searchParams.set('jwt', jwt);
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Referrer-Policy', 'no-referrer');
    return res.redirect(url.toString());
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Return current user' })
  @ApiResponse({ status: 401, description: 'Invalid or expired membership session' })
  getProfile(@CurrentUser() user: { id: number }) {
    return this.auth.getUserById(user.id);
  }
}
