import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Difficulty, LogCategory, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LogsService {
  private readonly logger = new Logger(LogsService.name);

  constructor(private prisma: PrismaService) {}

  async create(data: {
    date: string;
    category: LogCategory;
    description: string;
    difficulty?: Difficulty;
    timeSpent?: number;
    userId: number;
    projectId?: number;
    workPeriodId: number;
  }) {
    this.logger.log(`Creating log for user ID: ${data.userId}`);
    try {
      const log = await this.prisma.log.create({
        data: {
          date: new Date(data.date),
          category: data.category,
          description: data.description,
          difficulty: data.difficulty,
          timeSpent: data.timeSpent,
          userId: data.userId,
          workPeriodId: data.workPeriodId,
          ...(data.projectId && {
            Project: {
              connect: { id: data.projectId },
            },
          }),
        },
        include: {
          user: true,
          Project: true,
          workPeriod: true,
        },
      });
      this.logger.log(`Log created successfully: ID ${log.id}`);
      return log;
    } catch (error) {
      this.logger.error(
        `Failed to create log for user ID: ${data.userId}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async findAll(filters?: {
    userId?: number;
    projectId?: number;
    workPeriodId?: number;
    category?: LogCategory;
    startDate?: string;
    endDate?: string;
  }) {
    this.logger.log('Fetching logs with filters', filters);
    try {
      const where: Prisma.LogWhereInput = {};

      if (filters?.userId) {
        where.userId = filters.userId;
      }
      if (filters?.projectId) {
        where.Project = {
          some: {
            id: filters.projectId,
          },
        };
      }
      if (filters?.workPeriodId) {
        where.workPeriodId = filters.workPeriodId;
      }
      if (filters?.category) {
        where.category = filters.category;
      }
      if (filters?.startDate || filters?.endDate) {
        where.date = {};
        if (filters.startDate) {
          where.date.gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          where.date.lte = new Date(filters.endDate);
        }
      }

      const logs = await this.prisma.log.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
          Project: {
            select: {
              id: true,
              name: true,
            },
          },
          workPeriod: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          date: 'desc',
        },
      });
      this.logger.log(`Found ${logs.length} logs`);
      return logs;
    } catch (error) {
      this.logger.error('Failed to fetch logs', (error as Error).stack);
      throw error;
    }
  }

  async findOne(id: number) {
    this.logger.log(`Fetching log with ID: ${id}`);
    try {
      const log = await this.prisma.log.findUnique({
        where: { id },
        include: {
          user: true,
          Project: true,
          workPeriod: true,
        },
      });

      if (!log) {
        this.logger.warn(`Log not found with ID: ${id}`);
        throw new NotFoundException(`Log with ID ${id} not found`);
      }

      this.logger.log(`Log found: ID ${log.id}`);
      return log;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to fetch log with ID: ${id}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async update(
    id: number,
    data: {
      date?: string;
      category?: LogCategory;
      description?: string;
      difficulty?: Difficulty;
      timeSpent?: number;
      userId?: number;
      projectId?: number;
      workPeriodId?: number;
    },
  ) {
    this.logger.log(`Updating log with ID: ${id}`);
    try {
      const updateData: Prisma.LogUpdateInput = {
        category: data.category,
        description: data.description,
        difficulty: data.difficulty,
        timeSpent: data.timeSpent,
      };

      if (data.date) {
        updateData.date = new Date(data.date);
      }

      if (data.userId) {
        updateData.user = { connect: { id: data.userId } };
      }

      if (data.projectId) {
        updateData.Project = { 
          set: [{ id: data.projectId }]
        };
      }

      if (data.workPeriodId) {
        updateData.workPeriod = { connect: { id: data.workPeriodId } };
      }

      const log = await this.prisma.log.update({
        where: { id },
        data: updateData,
        include: {
          user: true,
          Project: true,
          workPeriod: true,
        },
      });
      this.logger.log(`Log updated successfully: ID ${log.id}`);
      return log;
    } catch (error) {
      this.logger.error(
        `Failed to update log with ID: ${id}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async remove(id: number) {
    this.logger.log(`Deleting log with ID: ${id}`);
    try {
      const log = await this.prisma.log.delete({
        where: { id },
      });
      this.logger.log(`Log deleted successfully: ID ${log.id}`);
      return log;
    } catch (error) {
      this.logger.error(
        `Failed to delete log with ID: ${id}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async getStatsByUser(userId: number, workPeriodId?: number) {
    this.logger.log(
      `Fetching stats for user ID: ${userId}, work period: ${workPeriodId || 'all'}`,
    );
    try {
      const where: Prisma.LogWhereInput = { userId };
      if (workPeriodId) {
        where.workPeriodId = workPeriodId;
      }

      const logs = await this.prisma.log.findMany({
        where,
        include: {
          Project: true,
        },
      });

      const totalLogs = logs.length;
      const totalTimeSpent = logs.reduce(
        (sum, log) => sum + (log.timeSpent || 0),
        0,
      );

      const logsByCategory = logs.reduce(
        (acc, log) => {
          acc[log.category] = (acc[log.category] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      const logsByDifficulty = logs.reduce(
        (acc, log) => {
          if (log.difficulty) {
            acc[log.difficulty] = (acc[log.difficulty] || 0) + 1;
          }
          return acc;
        },
        {} as Record<string, number>,
      );

      const logsByProject = logs.reduce(
        (acc, log) => {
          if (log.Project && log.Project.length > 0) {
            log.Project.forEach((project) => {
              acc[project.name] = (acc[project.name] || 0) + 1;
            });
          }
          return acc;
        },
        {} as Record<string, number>,
      );

      return {
        totalLogs,
        totalTimeSpent,
        logsByCategory,
        logsByDifficulty,
        logsByProject,
      };
    } catch (error) {
      this.logger.error(
        `Failed to fetch stats for user ID: ${userId}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async getStatsByProject(projectId: number, workPeriodId?: number) {
    this.logger.log(
      `Fetching stats for project ID: ${projectId}, work period: ${workPeriodId || 'all'}`,
    );
    try {
      const where: Prisma.LogWhereInput = { 
        Project: { 
          some: { 
            id: projectId 
          } 
        } 
      };
      if (workPeriodId) {
        where.workPeriodId = workPeriodId;
      }

      const logs = await this.prisma.log.findMany({
        where,
        include: {
          user: true,
        },
      });

      const totalLogs = logs.length;
      const totalTimeSpent = logs.reduce(
        (sum, log) => sum + (log.timeSpent || 0),
        0,
      );
      const uniqueContributors = new Set(logs.map((log) => log.userId)).size;

      const logsByCategory = logs.reduce(
        (acc, log) => {
          acc[log.category] = (acc[log.category] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      const logsByDifficulty = logs.reduce(
        (acc, log) => {
          if (log.difficulty) {
            acc[log.difficulty] = (acc[log.difficulty] || 0) + 1;
          }
          return acc;
        },
        {} as Record<string, number>,
      );

      const contributorsList = logs.reduce(
        (acc, log) => {
          const userName = log.user.fullName;
          acc[userName] = (acc[userName] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      return {
        totalLogs,
        totalTimeSpent,
        uniqueContributors,
        logsByCategory,
        logsByDifficulty,
        contributorsList,
      };
    } catch (error) {
      this.logger.error(
        `Failed to fetch stats for project ID: ${projectId}`,
        (error as Error).stack,
      );
      throw error;
    }
  }
}
