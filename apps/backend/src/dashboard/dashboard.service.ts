import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EventService } from '../events/events.service';
import { LogsService } from '../logs/logs.service';
import { ProjectService } from '../projects/projects.service';
import { WorkPeriodsService } from '../work-periods/work-periods.service';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly logsService: LogsService,
    private readonly projectsService: ProjectService,
    private readonly workPeriodsService: WorkPeriodsService,
    private readonly eventService: EventService,
  ) {}

  async getSummary(userId: number) {
    this.logger.log(`Getting dashboard summary for user ${userId}`);
    const currentPeriod = await this.workPeriodsService.findCurrent();
    const wpId = currentPeriod?.id;

    // User specific stats
    const userAggregate = await this.logsService.aggregateTimeSpent({
      userId,
      workPeriodId: wpId,
    });

    const userProjects = await this.logsService.groupByProject({
      userId,
      workPeriodId: wpId,
    });

    // Global stats
    const globalAggregate = await this.logsService.aggregateTimeSpent({
      workPeriodId: wpId,
    });

    // Count unique contributors (users who have logs in this period)
    const activeContributorsResult = await this.prisma.log.groupBy({
      by: ['userId'],
      where: { workPeriodId: wpId },
    });
    const activeContributors = activeContributorsResult.length;

    // Count unique projects
    const totalProjectsResult = await this.prisma.log.groupBy({
      by: ['projectId'],
      where: {
        workPeriodId: wpId,
        projectId: { not: null },
      },
    });
    const totalProjectsCount = totalProjectsResult.length;

    const groupTotalHours = globalAggregate._sum.timeSpent || 0;
    const averageHoursPerUser =
      activeContributors > 0 ? groupTotalHours / activeContributors : 0;

    return {
      totalHours: userAggregate._sum.timeSpent || 0,
      activeProjects: userProjects.length,
      groupTotalHours,
      activeContributors,
      totalProjectsCount,
      averageHoursPerUser,
      currentPeriod: currentPeriod
        ? {
            id: currentPeriod.id,
            name: currentPeriod.name,
            startDate: currentPeriod.startDate,
            endDate: currentPeriod.endDate,
          }
        : null,
    };
  }

  async getProjectsStats(_userId: number) {
    this.logger.log(`Getting project stats (global)`);
    const currentPeriod = await this.workPeriodsService.findCurrent();
    const wpId = currentPeriod?.id;

    const groupedProjects = await this.logsService.groupByProject({
      workPeriodId: wpId,
    });

    // Get project names for the top 5
    const top5Grouped = groupedProjects.slice(0, 5);
    const topProjectIds = top5Grouped.map((p) => p.projectId as number);

    const projects = await this.prisma.project.findMany({
      where: {
        id: { in: topProjectIds },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const projectNamesMap = projects.reduce(
      (acc, p) => {
        acc[p.id] = p.name;
        return acc;
      },
      {} as Record<number, string>,
    );

    const topProjects = top5Grouped.map((p) => ({
      id: p.projectId,
      name: projectNamesMap[p.projectId as number] || 'Ismeretlen',
      count: p._sum.timeSpent || 0,
    }));

    return {
      topProjects,
    };
  }

  async getTopUsers() {
    const currentPeriod = await this.workPeriodsService.findCurrent();
    const wpId = currentPeriod?.id;

    const groupedUsers = await this.prisma.log.groupBy({
      by: ['userId'],
      where: { workPeriodId: wpId },
      _sum: {
        timeSpent: true,
      },
      orderBy: {
        _sum: {
          timeSpent: 'desc',
        },
      },
      take: 5,
    });

    const userIds = groupedUsers.map((u) => u.userId);
    const users = await this.prisma.user.findMany({
      where: {
        id: { in: userIds },
      },
      select: {
        id: true,
        fullName: true,
      },
    });

    const userNamesMap = users.reduce(
      (acc, u) => {
        acc[u.id] = u.fullName;
        return acc;
      },
      {} as Record<number, string>,
    );

    const topUsers = groupedUsers.map((u) => ({
      id: u.userId,
      name: userNamesMap[u.userId] || 'Ismeretlen',
      hours: u._sum.timeSpent || 0,
    }));

    return topUsers;
  }

  // Activity Feed removed as requested
  async getFeed(_userId: number) {
    return [];
  }

  async getStats(userId: number) {
    this.logger.log(`Getting extended stats for user ${userId}`);
    const currentPeriod = await this.workPeriodsService.findCurrent();
    const wpId = currentPeriod?.id;

    // 1. Category Breakdown (Global - all users)
    const categoryStats = await this.logsService.groupByCategory({
      workPeriodId: wpId,
    });

    const categoryBreakdown = categoryStats.map((c) => ({
      name: c.category,
      value: c._sum.timeSpent || 0,
    }));

    // 2. Heatmap Data (User specific)
    const heatmapRaw = await this.logsService.groupByDate({
      userId,
      workPeriodId: wpId,
    });

    const heatmapMap = heatmapRaw.reduce(
      (acc, log) => {
        const date = log.date.toLocaleDateString('en-CA', {
          timeZone: 'Europe/Budapest',
        });
        acc[date] = (acc[date] || 0) + (log.timeSpent || 0);
        return acc;
      },
      {} as Record<string, number>,
    );

    const heatmapData = Object.entries(heatmapMap).map(([date, count]) => ({
      date,
      count,
    }));

    // 3. Difficulty Breakdown (Global)
    const difficultyStats = await this.logsService.groupByDifficulty({
      workPeriodId: wpId,
    });

    const difficultyBreakdown = difficultyStats.map((d) => ({
      name: d.difficulty,
      value: d._count.id,
    }));

    return {
      categoryBreakdown,
      heatmapData,
      difficultyBreakdown,
    };
  }

  async getEvents(userId: number) {
    this.logger.log(`Getting events for user ${userId}`);
    const events = await this.eventService.findAll();
    const now = new Date();

    const upcoming = events
      .filter((e) => new Date(e.startDate) >= now)
      .sort(
        (a, b) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
      )
      .slice(0, 5);
    const past = events
      .filter((e) => new Date(e.startDate) < now)
      .sort(
        (a, b) =>
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
      )
      .slice(0, 5);

    return {
      upcoming,
      past,
    };
  }
}
