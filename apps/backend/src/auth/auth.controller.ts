import { CurrentUser } from '@kir-dev/passport-authsch';
import { Controller, Get, Logger, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { AuthSchDedupGuard } from './authsch-dedup.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private authService: AuthService) {}

  /**
   * Redirects to the authsch login page
   */
  @Get('login')
  @ApiOperation({ summary: 'Initiate AuthSCH login' })
  @ApiResponse({ status: 302, description: 'Redirects to AuthSCH login page' })
  @UseGuards(AuthGuard('authsch'))
  login() {
    // never called, AuthGuard redirects to AuthSCH
  }

  /**
   * Endpoint for authsch to call after login
   * Redirects to the frontend with the jwt token
   */
  @Get('callback')
  @ApiOperation({ summary: 'AuthSCH callback endpoint' })
  @ApiResponse({
    status: 302,
    description: 'Redirects to frontend with JWT token',
  })
  @UseGuards(AuthSchDedupGuard)
  oauthRedirect(@CurrentUser() user: any, @Res() res: Response) {
    this.logger.log(`🔵 Controller: Processing successful auth for ${user?.email}`);
    
    const jwt = this.authService.login(user);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    this.logger.log(`🚀 Redirecting to: ${frontendUrl}/login?jwt=...`);
    return res.redirect(`${frontendUrl}/login?jwt=${jwt}`);
  }

  /**
   * Get current user profile
   */
  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Return current user' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@CurrentUser() user: any) {
    // Fetch fresh user data from database to include latest updates
    const freshUser = await this.authService.getUserById(user.id);
    return freshUser || user;
  }
}
