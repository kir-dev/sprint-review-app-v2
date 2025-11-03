import {
    AuthSchProfile,
    AuthSchScope,
    Strategy,
} from '@kir-dev/passport-authsch';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthSchStrategy extends PassportStrategy(Strategy, 'authsch') {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      clientId: configService.get<string>('AUTHSCH_CLIENT_ID') || '',
      clientSecret: configService.get<string>('AUTHSCH_CLIENT_SECRET') || '',
      scopes: [
        AuthSchScope.PROFILE,
        AuthSchScope.EMAIL,
        AuthSchScope.SCHACC_ID,
      ],
    });
  }

  async validate(profile: AuthSchProfile): Promise<any> {
    // Log profile for debugging
    console.log('AuthSCH Profile:', JSON.stringify(profile, null, 2));
    
    // Check if user exists
    try {
      const existingUser = await this.usersService.findByEmail(profile.email);
      return existingUser;
    } catch (error) {
      // User doesn't exist, create new one
      console.log('Creating new user from profile');
      const newUser = await this.usersService.create({
        email: profile.email,
        fullName: profile.fullName,
        githubUsername: profile.schAcc?.schAccUsername ?? undefined,
      });
      return newUser;
    }
  }
}
