import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { logServiceError } from '../common/logging/safe-logger';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Helper to map database User (with relation) to API User structure
   * maintaining backward compatibility by setting `position` as string
   */
  private mapUser(user: any) {
    if (!user) return null;
    return {
      ...user,
      position: user.position?.name || null,
      positionDetails: user.position || null,
    };
  }

  async create(data: {
    email: string;
    simonyiEmail?: string;
    githubUsername?: string;
    fullName: string;
    profileImage?: string;
    position?: string;
  }) {
    this.logger.log('Creating user');
    try {
      const positionName = data.position || 'UJONC';
      const positionRecord = await this.prisma.position.findUnique({
        where: { name: positionName.toUpperCase() },
      });

      if (!positionRecord) {
        throw new BadRequestException(`Position ${positionName} not found`);
      }

      const user = await this.prisma.user.create({
        data: {
          email: data.email,
          simonyiEmail: data.simonyiEmail,
          githubUsername: data.githubUsername,
          fullName: data.fullName,
          profileImage: data.profileImage,
          positionId: positionRecord.id,
        },
        include: {
          position: true,
        },
      });
      this.logger.log(`User created successfully: ID ${user.id}`);
      return this.mapUser(user);
    } catch (error) {
      logServiceError(this.logger, 'create_user');
      throw error;
    }
  }

  async findAll() {
    this.logger.log('Fetching all users');
    try {
      const users = await this.prisma.user.findMany({
        include: {
          position: true,
          _count: {
            select: {
              logs: true,
              managedProjects: true,
              projects: true,
            },
          },
        },
      });
      this.logger.log(`Found ${users.length} users`);
      return users.map((user) => this.mapUser(user));
    } catch (error) {
      logServiceError(this.logger, 'list_users');
      throw error;
    }
  }

  async findOne(id: number) {
    this.logger.log(`Fetching user with ID: ${id}`);
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        include: {
          position: true,
          logs: {
            include: {
              project: true,
              event: true,
              workPeriod: true,
            },
          },
          managedProjects: {
            include: {
              members: true,
            },
          },
          projects: {
            include: {
              projectManager: true,
            },
          },
        },
      });

      if (!user) {
        this.logger.warn(`User not found with ID: ${id}`);
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      this.logger.log(`User found: ID ${user.id}`);
      return this.mapUser(user);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      logServiceError(this.logger, 'get_user');
      throw error;
    }
  }

  async findByEmail(email: string) {
    this.logger.log('Fetching user by email');
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
        include: {
          position: true,
        },
      });

      if (!user) {
        this.logger.warn('User not found by email lookup');
        throw new NotFoundException(`User with email ${email} not found`);
      }

      return this.mapUser(user);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      logServiceError(this.logger, 'get_user_by_email');
      throw error;
    }
  }

  async update(
    id: number,
    data: {
      email?: string;
      simonyiEmail?: string;
      githubUsername?: string;
      fullName?: string;
      profileImage?: string;
      position?: string;
    },
  ) {
    this.logger.log(`Updating user with ID: ${id}`);
    try {
      let positionIdToSet: number | undefined;

      if (data.position) {
        const currentUser = await this.prisma.user.findUnique({
          where: { id },
          include: { position: true },
        });

        if (
          currentUser &&
          currentUser.position &&
          currentUser.position.name !== data.position.toUpperCase()
        ) {
          const now = new Date();

          const newPositionRecord = await this.prisma.position.findUnique({
            where: { name: data.position.toUpperCase() },
          });

          if (!newPositionRecord) {
            throw new BadRequestException(
              `Position ${data.position} not found`,
            );
          }
          positionIdToSet = newPositionRecord.id;

          // 1. Close active history if exists
          const activeHistory = await this.prisma.positionHistory.findFirst({
            where: {
              userId: id,
              endDate: null,
            },
          });

          if (activeHistory) {
            await this.prisma.positionHistory.update({
              where: { id: activeHistory.id },
              data: { endDate: now },
            });
          } else {
            // Save the OLD position as a history entry ending now
            await this.prisma.positionHistory.create({
              data: {
                userId: id,
                positionId: currentUser.positionId,
                startDate: currentUser.createdAt,
                endDate: now,
              },
            });
          }

          // 2. Open new history
          await this.prisma.positionHistory.create({
            data: {
              userId: id,
              positionId: positionIdToSet,
              startDate: now,
              endDate: null,
            },
          });
        }
      }

      const updateData: any = {
        email: data.email,
        simonyiEmail: data.simonyiEmail,
        githubUsername: data.githubUsername,
        fullName: data.fullName,
        profileImage: data.profileImage,
      };

      if (positionIdToSet !== undefined) {
        updateData.positionId = positionIdToSet;
      }

      const user = await this.prisma.user.update({
        where: { id },
        data: updateData,
        include: {
          position: true,
        },
      });
      this.logger.log(`User updated successfully: ID ${user.id}`);
      return this.mapUser(user);
    } catch (error) {
      logServiceError(this.logger, 'update_user');
      throw error;
    }
  }

  async remove(id: number) {
    this.logger.log(`Deleting user with ID: ${id}`);
    try {
      const user = await this.prisma.user.delete({
        where: { id },
      });
      this.logger.log(`User deleted successfully: ID ${user.id}`);
      return user;
    } catch (error) {
      logServiceError(this.logger, 'delete_user');
      throw error;
    }
  }

  async getUserProjects(id: number) {
    this.logger.log(`Fetching projects for user with ID: ${id}`);
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        include: {
          projects: {
            include: {
              projectManager: true,
              _count: {
                select: {
                  members: true,
                  logs: true,
                },
              },
            },
          },
        },
      });

      if (!user) {
        this.logger.warn(`User not found with ID: ${id}`);
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      return user.projects;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      logServiceError(this.logger, 'get_user_projects');
      throw error;
    }
  }

  async getUserLogs(id: number) {
    this.logger.log(`Fetching logs for user with ID: ${id}`);
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        include: {
          logs: {
            include: {
              project: true,
              event: true,
              workPeriod: true,
            },
            orderBy: {
              date: 'desc',
            },
          },
        },
      });

      if (!user) {
        this.logger.warn(`User not found with ID: ${id}`);
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      return user.logs;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      logServiceError(this.logger, 'get_user_logs');
      throw error;
    }
  }
}
