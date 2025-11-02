import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  login(user: any): string {
    const payload = {
      sub: user.id,
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      githubUsername: user.githubUsername,
    };

    return this.jwtService.sign(payload);
  }
}
