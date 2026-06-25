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
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        position: true,
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      simonyiEmail: user.simonyiEmail,
      fullName: user.fullName,
      githubUsername: user.githubUsername,
      profileImage: user.profileImage,
      position: user.position?.name || null,
      positionDetails: user.position || null,
    };
  }
}
