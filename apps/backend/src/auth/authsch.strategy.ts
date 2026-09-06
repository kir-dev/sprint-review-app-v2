import { AuthSchProfile, AuthSchScope, Strategy } from '@kir-dev/passport-authsch';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';

/** Retrieves the authenticated profile; application authorization runs in the callback service. */
@Injectable()
export class AuthSchStrategy extends PassportStrategy(Strategy, 'authsch') {
  constructor(config: ConfigService) {
    const publicUrl = config.get<string>('BACKEND_PUBLIC_URL');
    super({
      clientId: config.get<string>('AUTHSCH_CLIENT_ID') || '',
      clientSecret: config.get<string>('AUTHSCH_CLIENT_SECRET') || '',
      scopes: [
        AuthSchScope.PROFILE,
        AuthSchScope.EMAIL,
        AuthSchScope.SCHACC_ID,
        AuthSchScope.PEK_PROFILE,
      ],
      ...(publicUrl ? { redirectUri: `${publicUrl.replace(/\/$/, '')}/auth/callback` } : {}),
    });
  }

  async validate(profile: AuthSchProfile): Promise<AuthSchProfile> {
    return profile;
  }
}
