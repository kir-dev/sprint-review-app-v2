import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { logServiceError } from '../common/logging/safe-logger';
import { WorkPeriod } from './entities/work-period.entity';

@Injectable()
export class WorkPeriodsService {
  private readonly logger = new Logger(WorkPeriodsService.name);

  constructor(private prisma: PrismaService) {}

  async create(data: { name: string; startDate: string; endDate: string }) {
    this.logger.log('Creating work period');
    try {
      const existing = await this.prisma.workPeriod.findUnique({
        where: { name: data.name },
      });
      if (existing) {
        throw new BadRequestException(
          `Work period with name "${data.name}" already exists`,
        );
      }

      const workPeriod = await this.prisma.workPeriod.create({
        data: {
          name: data.name,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
        },
      });
      this.logger.log(`Work period created successfully: ID ${workPeriod.id}`);
      return workPeriod;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException(
          `Work period with name "${data.name}" already exists`,
        );
      }
      logServiceError(this.logger, 'create_work_period');
      throw error;
    }
  }

  async findAll() {
    this.logger.log('Fetching all work periods');
    try {
      const workPeriods = await this.prisma.workPeriod.findMany({
        include: {
          _count: {
            select: {
              logs: true,
            },
          },
        },
        orderBy: {
          startDate: 'desc',
        },
      });
      this.logger.log(`Found ${workPeriods.length} work periods`);

      // Deduplicate by name if database contains legacy duplicates
      const seenNames = new Map<string, (typeof workPeriods)[0]>();
      for (const wp of workPeriods) {
        const existing = seenNames.get(wp.name);
        if (!existing) {
          seenNames.set(wp.name, wp);
        } else {
          // Keep the period that actually has logs or more logs
          if ((wp._count?.logs ?? 0) > (existing._count?.logs ?? 0)) {
            seenNames.set(wp.name, wp);
          }
        }
      }

      return Array.from(seenNames.values());
    } catch (error) {
      logServiceError(this.logger, 'list_work_periods');
      throw error;
    }
  }

  async findOne(id: number) {
    this.logger.log(`Fetching work period with ID: ${id}`);
    try {
      const workPeriod = await this.prisma.workPeriod.findUnique({
        where: { id },
        include: {
          logs: {
            include: {
              user: true,
              project: true,
              event: true,
            },
          },
        },
      });

      if (!workPeriod) {
        this.logger.warn(`Work period not found with ID: ${id}`);
        throw new NotFoundException(`Work period with ID ${id} not found`);
      }

      this.logger.log(`Work period found: ID ${workPeriod.id}`);
      return workPeriod;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      logServiceError(this.logger, 'get_work_period');
      throw error;
    }
  }

  async findCurrent() {
    this.logger.log('Fetching current work period');
    try {
      const now = new Date();
      let workPeriod = await this.prisma.workPeriod.findFirst({
        where: {
          startDate: {
            lte: now,
          },
          endDate: {
            gte: now,
          },
        },
        include: {
          _count: {
            select: {
              logs: true,
            },
          },
        },
      });

      if (!workPeriod) {
        this.logger.warn(
          'No current work period found, creating one automatically',
        );

        // Calculate semester period
        // Hungarian university semesters:
        // Fall semester (I. félév): September 1 - January 31
        // Spring semester (II. félév): February 1 - June 30
        const year = now.getFullYear();
        const month = now.getMonth(); // 0-11

        let name: string;
        let startDate: Date;
        let endDate: Date;

        if (month < 5) {
          // January - May: Spring semester (II. félév)
          // E.g., in Jan 2026, it is 2025/2026 II. félév
          const semesterYear = year - 1;
          name = `${semesterYear}/${year} II. félév`;
          startDate = new Date(year, 0, 1, 0, 0, 0, 0); // January 1
          endDate = new Date(year, 4, 31, 23, 59, 59, 999); // May 31
        } else {
          // June - December: Fall semester (I. félév)
          // E.g., in June 2026, it is 2026/2027 I. félév
          name = `${year} nyár + ${year}/${year + 1} I. félév`;
          startDate = new Date(year, 5, 1, 0, 0, 0, 0); // June 1
          endDate = new Date(year, 11, 31, 23, 59, 59, 999); // December 31
        }

        // Check if work period with this name already exists
        const existingByName = await this.prisma.workPeriod.findFirst({
          where: { name },
          include: {
            _count: {
              select: {
                logs: true,
              },
            },
          },
        });

        if (existingByName) {
          this.logger.log(
            `Found existing work period by name: ${name}, extending/updating date range`,
          );
          workPeriod = await this.prisma.workPeriod.update({
            where: { id: existingByName.id },
            data: {
              startDate:
                existingByName.startDate > startDate
                  ? startDate
                  : existingByName.startDate,
              endDate:
                existingByName.endDate < endDate
                  ? endDate
                  : existingByName.endDate,
            },
            include: {
              _count: {
                select: {
                  logs: true,
                },
              },
            },
          });
        } else {
          this.logger.log(`Creating current work period automatically: ${name}`);
          try {
            workPeriod = await this.prisma.workPeriod.create({
              data: {
                name,
                startDate,
                endDate,
              },
              include: {
                _count: {
                  select: {
                    logs: true,
                  },
                },
              },
            });
            this.logger.log('Current work period created automatically');
          } catch (err) {
            // Handle race condition if another concurrent request already created it
            if (
              err instanceof Prisma.PrismaClientKnownRequestError &&
              err.code === 'P2002'
            ) {
              this.logger.log(
                `Work period ${name} was created concurrently, fetching existing`,
              );
              workPeriod = await this.prisma.workPeriod.findFirst({
                where: { name },
                include: {
                  _count: {
                    select: {
                      logs: true,
                    },
                  },
                },
              });
              if (!workPeriod) throw err;
            } else {
              throw err;
            }
          }
        }
      } else {
        this.logger.log('Current work period found');
      }

      return workPeriod;
    } catch (error) {
      logServiceError(this.logger, 'get_or_create_current_work_period');
      throw error;
    }
  }

  async update(
    id: number,
    data: {
      name?: string;
      startDate?: string;
      endDate?: string;
    },
  ) {
    this.logger.log(`Updating work period with ID: ${id}`);
    try {
      if (data.name) {
        const existing = await this.prisma.workPeriod.findUnique({
          where: { name: data.name },
        });
        if (existing && existing.id !== id) {
          throw new BadRequestException(
            `Work period with name "${data.name}" already exists`,
          );
        }
      }

      const updateData: Partial<WorkPeriod> = {
        name: data.name,
      };

      if (data.startDate) {
        updateData.startDate = new Date(data.startDate);
      }
      if (data.endDate) {
        updateData.endDate = new Date(data.endDate);
      }

      const workPeriod = await this.prisma.workPeriod.update({
        where: { id },
        data: updateData,
      });
      this.logger.log(`Work period updated successfully: ID ${workPeriod.id}`);
      return workPeriod;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException(
          `Work period with name "${data.name}" already exists`,
        );
      }
      logServiceError(this.logger, 'update_work_period');
      throw error;
    }
  }

  async remove(id: number) {
    this.logger.log(`Deleting work period with ID: ${id}`);
    try {
      const workPeriod = await this.prisma.workPeriod.delete({
        where: { id },
      });
      this.logger.log(`Work period deleted successfully: ID ${workPeriod.id}`);
      return workPeriod;
    } catch (error) {
      logServiceError(this.logger, 'delete_work_period');
      throw error;
    }
  }

  async getWorkPeriodLogs(id: number) {
    this.logger.log(`Fetching logs for work period with ID: ${id}`);
    try {
      const workPeriod = await this.prisma.workPeriod.findUnique({
        where: { id },
        include: {
          logs: {
            include: {
              user: true,
              project: true,
              event: true,
            },
            orderBy: {
              date: 'desc',
            },
          },
        },
      });

      if (!workPeriod) {
        this.logger.warn(`Work period not found with ID: ${id}`);
        throw new NotFoundException(`Work period with ID ${id} not found`);
      }

      return workPeriod.logs;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      logServiceError(this.logger, 'get_work_period_logs');
      throw error;
    }
  }

  async getWorkPeriodStats(id: number) {
    this.logger.log(`Fetching stats for work period with ID: ${id}`);
    try {
      const workPeriod = await this.prisma.workPeriod.findUnique({
        where: { id },
        include: {
          logs: {
            include: {
              user: true,
              project: true,
              event: true,
            },
          },
        },
      });

      if (!workPeriod) {
        this.logger.warn(`Work period not found with ID: ${id}`);
        throw new NotFoundException(`Work period with ID ${id} not found`);
      }

      // Calculate statistics
      const totalLogs = workPeriod.logs.length;
      const totalTimeSpent = workPeriod.logs.reduce(
        (sum, log) => sum + (log.timeSpent || 0),
        0,
      );
      const uniqueUsers = new Set(workPeriod.logs.map((log) => log.userId))
        .size;
      const uniqueProjects = new Set(
        workPeriod.logs.map((log) => log.projectId).filter((id) => id !== null),
      ).size;

      const logsByCategory = workPeriod.logs.reduce(
        (acc, log) => {
          acc[log.category] = (acc[log.category] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      const logsByDifficulty = workPeriod.logs.reduce(
        (acc, log) => {
          if (log.difficulty) {
            acc[log.difficulty] = (acc[log.difficulty] || 0) + 1;
          }
          return acc;
        },
        {} as Record<string, number>,
      );

      this.logger.log(`Stats calculated for work period ID: ${workPeriod.id}`);

      return {
        workPeriod: {
          id: workPeriod.id,
          name: workPeriod.name,
          startDate: workPeriod.startDate,
          endDate: workPeriod.endDate,
        },
        stats: {
          totalLogs,
          totalTimeSpent,
          uniqueUsers,
          uniqueProjects,
          logsByCategory,
          logsByDifficulty,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      logServiceError(this.logger, 'get_work_period_stats');
      throw error;
    }
  }
}
