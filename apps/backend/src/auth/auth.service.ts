import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  login(user: any): string {
    const payload = {
      sub: user.id,
      id: user.id,
      email: user.email,
      simonyiEmail: user.simonyiEmail,
      fullName: user.fullName,
      githubUsername: user.githubUsername,
      position: user.position,
      // NOTE: profileImage is NOT included in JWT to keep token size small
      // Profile image should be fetched separately via /auth/me endpoint
    };

    return this.jwtService.sign(payload);
  }

  async getUserById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        simonyiEmail: true,
        fullName: true,
        githubUsername: true,
        profileImage: true,
        position: true,
      },
    });
  }
}
