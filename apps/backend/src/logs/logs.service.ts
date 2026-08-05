import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { LogCategory, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { logServiceError } from '../common/logging/safe-logger';
import { CreateLogDto } from './dto/create-log.dto';
import { UpdateLogDto } from './dto/update-log.dto';

@Injectable()
export class LogsService {
  private readonly logger = new Logger(LogsService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateLogDto) {
    this.logger.log(`Creating log for user ID: ${dto.userId}`);
    try {
      const log = await this.prisma.log.create({
        data: {
          date: new Date(dto.date),
          category: dto.category,
          description: dto.description,
          difficulty: dto.difficulty,
          timeSpent: dto.timeSpent,
          user: { connect: { id: dto.userId } },
          workPeriod: { connect: { id: dto.workPeriodId } },
          ...(dto.projectId && {
            project: {
              connect: { id: dto.projectId },
            },
          }),
          ...(dto.eventId && {
            event: {
              connect: { id: dto.eventId },
            },
          }),
        },
        include: {
          user: true,
          project: true,
          event: true,
          workPeriod: true,
        },
      });
      this.logger.log(`Log created successfully: ID ${log.id}`);
      return log;
    } catch (error) {
      logServiceError(this.logger, 'create_log');
      throw error;
    }
  }

  async findAll(filters?: {
    userId?: number;
    projectId?: number;
    eventId?: number;
    workPeriodId?: number;
    category?: LogCategory;
    startDate?: string;
    endDate?: string;
  }) {
    this.logger.log('Fetching logs');
    try {
      const where: Prisma.LogWhereInput = {};

      if (filters?.userId) {
        where.userId = filters.userId;
      }
      if (filters?.projectId) {
        where.projectId = filters.projectId;
      }
      if (filters?.eventId) {
        where.eventId = filters.eventId;
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
          project: {
            select: {
              id: true,
              name: true,
            },
          },
          event: {
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
      logServiceError(this.logger, 'list_logs');
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
          project: true,
          event: true,
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
      logServiceError(this.logger, 'get_log');
      throw error;
    }
  }

  async update(id: number, dto: UpdateLogDto) {
    this.logger.log(`Updating log with ID: ${id}`);
    try {
      const { userId, workPeriodId, projectId, eventId, ...rest } = dto;

      const updateData: Prisma.LogUpdateInput = {
        ...rest,
        ...(dto.date && { date: new Date(dto.date) }),
        ...(userId && { user: { connect: { id: userId } } }),
        ...(workPeriodId && {
          workPeriod: { connect: { id: workPeriodId } },
        }),
      };

      if (dto.hasOwnProperty('projectId')) {
        updateData.project = projectId
          ? { connect: { id: projectId } }
          : { disconnect: true };
      }

      if (dto.hasOwnProperty('eventId')) {
        updateData.event = eventId
          ? { connect: { id: eventId } }
          : { disconnect: true };
      }

      const log = await this.prisma.log.update({
        where: { id },
        data: updateData,
        include: {
          user: true,
          project: true,
          event: true,
          workPeriod: true,
        },
      });
      this.logger.log(`Log updated successfully: ID ${log.id}`);
      return log;
    } catch (error) {
      logServiceError(this.logger, 'update_log');
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
      logServiceError(this.logger, 'delete_log');
      throw error;
    }
  }

  async exportLogs(filters: {
    userIds?: number[];
    workPeriodId?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<{ csv: string; filenameSuffix: string }> {
    this.logger.log('Exporting logs');

    const where: Prisma.LogWhereInput = {};

    if (filters.userIds && filters.userIds.length > 0) {
      where.userId = { in: filters.userIds };
    }
    if (filters.workPeriodId) {
      where.workPeriodId = filters.workPeriodId;
    }
    if (filters.startDate || filters.endDate) {
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
        user: { select: { id: true, fullName: true } },
        project: { select: { id: true, name: true } },
        event: { select: { id: true, name: true } },
        workPeriod: { select: { id: true, name: true } },
      },
      orderBy: { date: 'desc' },
    });

    const headers = [
      'Felhasználó',
      'Dátum',
      'Kategória',
      'Projekt',
      'Esemény',
      'Időszak',
      'Ráfordított idő (óra)',
      'Nehézség',
      'Leírás',
    ];

    const dateFormatter = new Intl.DateTimeFormat('hu-HU');

    const rows = logs.map((log) =>
      [
        log.user?.fullName ?? '',
        dateFormatter.format(log.date),
        log.category,
        log.project?.name ?? '',
        log.event?.name ?? '',
        log.workPeriod?.name ?? '',
        log.timeSpent != null ? String(log.timeSpent) : '',
        log.difficulty ?? '',
        log.description ?? '',
      ]
        .map(escapeCsvCell)
        .join(','),
    );

    const csv = [headers.map(escapeCsvCell).join(','), ...rows].join('\n');

    let filenameSuffix = new Date().toISOString().split('T')[0];
    if (filters.startDate && filters.endDate) {
      filenameSuffix = `${filters.startDate}_${filters.endDate}`;
    } else if (filters.startDate) {
      filenameSuffix = `${filters.startDate}_tol`;
    } else if (filters.endDate) {
      filenameSuffix = `${filters.endDate}_ig`;
    } else if (filters.workPeriodId && logs[0]?.workPeriod?.name) {
      filenameSuffix = sanitizeFilename(logs[0].workPeriod.name);
    }

    this.logger.log(`Exported ${logs.length} logs`);
    return { csv, filenameSuffix };
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

      const [aggregate, categoryStats, difficultyStats, projectStats] =
        await Promise.all([
          this.prisma.log.aggregate({
            where,
            _count: { id: true },
            _sum: { timeSpent: true },
          }),
          this.prisma.log.groupBy({
            by: ['category'],
            where,
            _count: { id: true },
          }),
          this.prisma.log.groupBy({
            by: ['difficulty'],
            where: { ...where, difficulty: { not: null } },
            _count: { id: true },
          }),
          this.prisma.log.groupBy({
            by: ['projectId'],
            where: { ...where, projectId: { not: null } },
            _count: { id: true },
          }),
        ]);

      // Get project names
      const projectIds = projectStats.map((p) => p.projectId as number);
      const projects = await this.prisma.project.findMany({
        where: { id: { in: projectIds } },
        select: { id: true, name: true },
      });
      const projectNameMap = projects.reduce(
        (acc, p) => {
          acc[p.id] = p.name;
          return acc;
        },
        {} as Record<number, string>,
      );

      const logsByCategory = categoryStats.reduce(
        (acc, c) => {
          acc[c.category] = c._count.id;
          return acc;
        },
        {} as Record<string, number>,
      );

      const logsByDifficulty = difficultyStats.reduce(
        (acc, d) => {
          if (d.difficulty) acc[d.difficulty] = d._count.id;
          return acc;
        },
        {} as Record<string, number>,
      );

      const logsByProject = projectStats.reduce(
        (acc, p) => {
          const name = projectNameMap[p.projectId as number] || 'Ismeretlen';
          acc[name] = p._count.id;
          return acc;
        },
        {} as Record<string, number>,
      );

      return {
        totalLogs: aggregate._count.id,
        totalTimeSpent: aggregate._sum.timeSpent || 0,
        logsByCategory,
        logsByDifficulty,
        logsByProject,
      };
    } catch (error) {
      logServiceError(this.logger, 'get_user_log_stats');
      throw error;
    }
  }

  async aggregateTimeSpent(where: Prisma.LogWhereInput) {
    const aggregate = await this.prisma.log.aggregate({
      where,
      _sum: {
        timeSpent: true,
      },
      _count: {
        id: true,
        userId: true,
        projectId: true,
      },
    });
    return aggregate;
  }

  async groupByProject(where: Prisma.LogWhereInput) {
    return this.prisma.log.groupBy({
      by: ['projectId'],
      where: {
        ...where,
        projectId: { not: null },
      },
      _sum: {
        timeSpent: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          timeSpent: 'desc',
        },
      },
    });
  }

  async groupByCategory(where: Prisma.LogWhereInput) {
    return this.prisma.log.groupBy({
      by: ['category'],
      where,
      _sum: {
        timeSpent: true,
      },
      _count: {
        id: true,
      },
    });
  }

  async groupByDifficulty(where: Prisma.LogWhereInput) {
    return this.prisma.log.groupBy({
      by: ['difficulty'],
      where: {
        ...where,
        difficulty: { not: null },
      },
      _count: {
        id: true,
      },
    });
  }

  async groupByDate(where: Prisma.LogWhereInput) {
    // Note: SQLite/Postgres date grouping might differ in Prisma
    // For simplicity, we can fetch dates and timeSpent only
    return this.prisma.log.findMany({
      where,
      select: {
        date: true,
        timeSpent: true,
      },
    });
  }

  async getStatsByProject(projectId: number, workPeriodId?: number) {
    this.logger.log(
      `Fetching stats for project ID: ${projectId}, work period: ${workPeriodId || 'all'}`,
    );
    try {
      const where: Prisma.LogWhereInput = { projectId };
      if (workPeriodId) {
        where.workPeriodId = workPeriodId;
      }

      const [aggregate, categoryStats, difficultyStats, userStats] =
        await Promise.all([
          this.prisma.log.aggregate({
            where,
            _count: { id: true },
            _sum: { timeSpent: true },
          }),
          this.prisma.log.groupBy({
            by: ['category'],
            where,
            _count: { id: true },
          }),
          this.prisma.log.groupBy({
            by: ['difficulty'],
            where: { ...where, difficulty: { not: null } },
            _count: { id: true },
          }),
          this.prisma.log.groupBy({
            by: ['userId'],
            where,
            _count: { id: true },
          }),
        ]);

      // Get user names
      const userIds = userStats.map((u) => u.userId);
      const users = await this.prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, fullName: true },
      });
      const userNameMap = users.reduce(
        (acc, u) => {
          acc[u.id] = u.fullName;
          return acc;
        },
        {} as Record<number, string>,
      );

      const logsByCategory = categoryStats.reduce(
        (acc, c) => {
          acc[c.category] = c._count.id;
          return acc;
        },
        {} as Record<string, number>,
      );

      const logsByDifficulty = difficultyStats.reduce(
        (acc, d) => {
          if (d.difficulty) acc[d.difficulty] = d._count.id;
          return acc;
        },
        {} as Record<string, number>,
      );

      const contributorsList = userStats.reduce(
        (acc, u) => {
          const name = userNameMap[u.userId] || 'Ismeretlen';
          acc[name] = u._count.id;
          return acc;
        },
        {} as Record<string, number>,
      );

      return {
        totalLogs: aggregate._count.id,
        totalTimeSpent: aggregate._sum.timeSpent || 0,
        uniqueContributors: userStats.length,
        logsByCategory,
        logsByDifficulty,
        contributorsList,
      };
    } catch (error) {
      logServiceError(this.logger, 'get_project_log_stats');
      throw error;
    }
  }
}

function escapeCsvCell(value: string): string {
  if (value === '') return '';

  // Mitigate CSV injection: prefix cells starting with formula triggers
  const safeValue = /^\s*[=+\-@]/.test(value) ? `'${value}` : value;

  if (/[",\n\r]/.test(safeValue)) {
    return `"${safeValue.replace(/"/g, '""')}"`;
  }
  return safeValue;
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, '_');
}
