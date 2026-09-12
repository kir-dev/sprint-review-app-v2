import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { GroupAccessService } from '../group-access/group-access.service';
import { isGroupId, isRecord } from '../group-access/group-access.types';

/** Validates signed membership evidence against the current installation policy. */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private readonly access: GroupAccessService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') || 'your-secret-key',
    });
  }

  async validate(payload: unknown): Promise<{ id: number }> {
    if (!isRecord(payload) || !isGroupId(payload.id) || payload.sub !== payload.id) {
      throw new UnauthorizedException();
    }
    await this.access.assertSession(payload.groupAccess);
    return { id: payload.id };
  }
}
