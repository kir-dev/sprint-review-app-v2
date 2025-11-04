import { CurrentUser } from '@kir-dev/passport-authsch';
import { Controller, Get, Redirect, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
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
  @UseGuards(AuthGuard('authsch'))
  @Redirect()
  oauthRedirect(@CurrentUser() user: any) {
    const jwt = this.authService.login(user);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return {
      url: `${frontendUrl}/login?jwt=${jwt}`,
    };
  }

  /**
   * Get current user profile
   */
  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Return current user' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(AuthGuard('jwt'))
  getProfile(@CurrentUser() user: any) {
    return user;
  }
}
