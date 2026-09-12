import type { AuthSchProfile } from '@kir-dev/passport-authsch';
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { GroupAccessService } from '../group-access/group-access.service';
import { UsersService } from '../users/users.service';

/** Creates local sessions only after AuthSCH group membership has been verified. */
@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly access: GroupAccessService,
    private readonly users: UsersService,
  ) {}

  async login(profile: AuthSchProfile): Promise<string> {
    const groupAccess = await this.access.authorizeProfile(profile);
    if (
      typeof profile.email !== 'string' ||
      !profile.email.trim() ||
      typeof profile.fullName !== 'string' ||
      !profile.fullName.trim()
    ) {
      throw new UnauthorizedException({ code: 'AUTHSCH_FAILED' });
    }
    let user: { id: number };
    try {
      user = await this.users.findByEmail(profile.email);
    } catch (error) {
      if (!(error instanceof NotFoundException)) throw error;
      user = await this.users.create({
        email: profile.email,
        fullName: profile.fullName,
        githubUsername: profile.schAcc?.schAccUsername ?? undefined,
      });
    }
    return this.jwtService.sign({ sub: user.id, id: user.id, groupAccess });
  }

  async getUserById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { position: true },
    });
    if (!user) throw new UnauthorizedException();
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
