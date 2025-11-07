import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { WorkPeriod } from './entities/work-period.entity';

@Injectable()
export class WorkPeriodsService {
  private readonly logger = new Logger(WorkPeriodsService.name);

  constructor(private prisma: PrismaService) {}

  async create(data: { name: string; startDate: string; endDate: string }) {
    this.logger.log(`Creating work period: ${data.name}`);
    try {
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
      this.logger.error(
        `Failed to create work period: ${data.name}`,
        (error as Error).stack,
      );
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
      return workPeriods;
    } catch (error) {
      this.logger.error('Failed to fetch work periods', (error as Error).stack);
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
              Project: true,
            },
          },
        },
      });

      if (!workPeriod) {
        this.logger.warn(`Work period not found with ID: ${id}`);
        throw new NotFoundException(`Work period with ID ${id} not found`);
      }

      this.logger.log(`Work period found: ${workPeriod.name}`);
      return workPeriod;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to fetch work period with ID: ${id}`,
        (error as Error).stack,
      );
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
        this.logger.warn('No current work period found, creating one automatically');
        
        // Calculate semester period
        // Hungarian university semesters:
        // Fall semester (I. félév): September 1 - January 31
        // Spring semester (II. félév): February 1 - June 30
        const year = now.getFullYear();
        const month = now.getMonth(); // 0-11
        
        let name: string;
        let startDate: Date;
        let endDate: Date;
        
        if (month >= 8 || month <= 0) {
          // September - January: Fall semester (I. félév)
          const semesterYear = month >= 8 ? year : year - 1;
          name = `${semesterYear} nyár + ${semesterYear}/${semesterYear + 1} I. félév`;
          startDate = new Date(semesterYear, 8, 1); // September 1
          endDate = new Date(semesterYear + 1, 0, 31); // January 31
        } else {
          // February - August: Spring semester (II. félév)
          name = `${year - 1}/${year} II. félév`;
          startDate = new Date(year, 1, 1); // February 1
          endDate = new Date(year, 5, 30); // June 30
        }
        
        this.logger.log(`Creating new work period: ${name}`);
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
        
        this.logger.log(`Work period created automatically: ${workPeriod.name}`);
      } else {
        this.logger.log(`Current work period found: ${workPeriod.name}`);
      }

      return workPeriod;
    } catch (error) {
      this.logger.error(
        'Failed to fetch or create current work period',
        (error as Error).stack,
      );
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
      this.logger.error(
        `Failed to update work period with ID: ${id}`,
        (error as Error).stack,
      );
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
      this.logger.error(
        `Failed to delete work period with ID: ${id}`,
        (error as Error).stack,
      );
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
              Project: true,
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
      this.logger.error(
        `Failed to fetch logs for work period with ID: ${id}`,
        (error as Error).stack,
      );
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
              Project: true,
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
        workPeriod.logs.map((log) => log.Project).filter((id) => id !== null),
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

      this.logger.log(`Stats calculated for work period: ${workPeriod.name}`);

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
      this.logger.error(
        `Failed to fetch stats for work period with ID: ${id}`,
        (error as Error).stack,
      );
      throw error;
    }
  }
}
