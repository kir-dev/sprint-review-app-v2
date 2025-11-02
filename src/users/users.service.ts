import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private prisma: PrismaService) {}

  async create(data: {
    email: string;
    githubUsername?: string;
    fullName: string;
  }) {
    this.logger.log(`Creating user: ${data.email}`);
    try {
      const user = await this.prisma.user.create({
        data: {
          email: data.email,
          githubUsername: data.githubUsername,
          fullName: data.fullName,
        },
      });
      this.logger.log(`User created successfully: ID ${user.id}`);
      return user;
    } catch (error) {
      this.logger.error(
        `Failed to create user: ${data.email}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async findAll() {
    this.logger.log('Fetching all users');
    try {
      const users = await this.prisma.user.findMany({
        include: {
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
      return users;
    } catch (error) {
      this.logger.error('Failed to fetch users', (error as Error).stack);
      throw error;
    }
  }

  async findOne(id: number) {
    this.logger.log(`Fetching user with ID: ${id}`);
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        include: {
          logs: {
            include: {
              project: true,
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

      this.logger.log(`User found: ${user.email}`);
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to fetch user with ID: ${id}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async findByEmail(email: string) {
    this.logger.log(`Fetching user with email: ${email}`);
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        this.logger.warn(`User not found with email: ${email}`);
        throw new NotFoundException(`User with email ${email} not found`);
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to fetch user with email: ${email}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async update(
    id: number,
    data: {
      email?: string;
      githubUsername?: string;
      fullName?: string;
    },
  ) {
    this.logger.log(`Updating user with ID: ${id}`);
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: {
          email: data.email,
          githubUsername: data.githubUsername,
          fullName: data.fullName,
        },
      });
      this.logger.log(`User updated successfully: ID ${user.id}`);
      return user;
    } catch (error) {
      this.logger.error(
        `Failed to update user with ID: ${id}`,
        (error as Error).stack,
      );
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
      this.logger.error(
        `Failed to delete user with ID: ${id}`,
        (error as Error).stack,
      );
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
      this.logger.error(
        `Failed to fetch projects for user with ID: ${id}`,
        (error as Error).stack,
      );
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
      this.logger.error(
        `Failed to fetch logs for user with ID: ${id}`,
        (error as Error).stack,
      );
      throw error;
    }
  }
}
