import type { AuthSchProfile } from '@kir-dev/passport-authsch';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { GroupAccessService } from '../group-access/group-access.service';
import { UsersService } from '../users/users.service';

/** Creates local sessions only after AuthSCH group membership has been verified. */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly access: GroupAccessService,
    private readonly users: UsersService,
  ) {}

  async login(profile: AuthSchProfile): Promise<string> {
    const groupAccess = await this.access.authorizeProfile(profile);
    if (
      typeof profile.authSchId !== 'string' ||
      !profile.authSchId.trim() ||
      typeof profile.email !== 'string' ||
      !profile.email.trim() ||
      typeof profile.fullName !== 'string' ||
      !profile.fullName.trim()
    ) {
      throw new UnauthorizedException({ code: 'AUTHSCH_FAILED' });
    }
    const user = await this.findOrCreateUser(profile);
    return this.jwtService.sign({ sub: user.id, id: user.id, groupAccess });
  }

  /**
   * Resolves the local account by the stable AuthSCH id, so an email change in
   * AuthSCH does not create a duplicate profile. Accounts created before the id
   * was stored are linked once through their email address.
   */
  private async findOrCreateUser(profile: AuthSchProfile): Promise<{ id: number }> {
    const { authSchId, email } = profile;
    const linked = await this.prisma.user.findUnique({
      where: { authSchId },
      select: { id: true, email: true },
    });
    if (linked) {
      if (linked.email !== email) await this.syncEmail(linked.id, email);
      return { id: linked.id };
    }

    const byEmail = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, authSchId: true },
    });
    if (byEmail) {
      // The address now belongs to another AuthSCH account; never hand over the profile.
      if (byEmail.authSchId) {
        this.logger.warn('AuthSCH login email is linked to another account');
        throw new UnauthorizedException({ code: 'AUTHSCH_FAILED' });
      }
      const { count } = await this.prisma.user.updateMany({
        where: { id: byEmail.id, authSchId: null },
        data: { authSchId },
      });
      if (count === 0) {
        // A concurrent login may have linked it first; accept only the same identity.
        const relinked = await this.prisma.user.findUnique({
          where: { authSchId },
          select: { id: true },
        });
        if (relinked?.id !== byEmail.id) {
          throw new UnauthorizedException({ code: 'AUTHSCH_FAILED' });
        }
      }
      return { id: byEmail.id };
    }

    return this.users.create({
      authSchId,
      email,
      fullName: profile.fullName,
      githubUsername: profile.schAcc?.schAccUsername ?? undefined,
    });
  }

  /** Follows AuthSCH email changes unless the new address is taken locally. */
  private async syncEmail(userId: number, email: string): Promise<void> {
    try {
      await this.prisma.user.update({ where: { id: userId }, data: { email } });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        this.logger.warn('AuthSCH email change conflicts with another account');
        return;
      }
      throw error;
    }
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
