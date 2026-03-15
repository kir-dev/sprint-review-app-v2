import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { format, startOfWeek, subWeeks } from 'date-fns';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StatsService {
  private readonly logger = new Logger(StatsService.name);

  constructor(private prisma: PrismaService) {}

  async getBreakdown(userId: number) {
    this.logger.log(`Fetching breakdown stats for user ${userId}`);

    const now = new Date();
    const activeWorkPeriod = await this.prisma.workPeriod.findFirst({
      where: {
        startDate: { lte: now },
        endDate: { gte: now },
      },
    });

    const where: Prisma.LogWhereInput = { userId };
    if (activeWorkPeriod) {
      where.workPeriodId = activeWorkPeriod.id;
    }

    // 1. Total count and Large difficulty count
    const totalLogs = await this.prisma.log.count({ where });
    const largeCount = await this.prisma.log.count({
      where: { ...where, difficulty: 'LARGE' },
    });

    // 2. Category Breakdown
    const categoryStats = await this.prisma.log.groupBy({
      by: ['category'],
      where,
      _sum: { timeSpent: true },
    });

    const categoryBreakdown = categoryStats.map((c) => ({
      name: c.category,
      value: c._sum.timeSpent || 0,
    }));

    // 3. Difficulty Breakdown
    const difficultyStats = await this.prisma.log.groupBy({
      by: ['difficulty'],
      where: { ...where, difficulty: { not: null } },
      _count: { id: true },
    });

    const difficultyBreakdown = difficultyStats.map((d) => ({
      name: d.difficulty,
      value: d._count.id,
    }));

    // 4. Event Stats
    const eventStatsResult = await this.prisma.log.aggregate({
      where: { ...where, eventId: { not: null } },
      _count: { id: true, eventId: true },
      _sum: { timeSpent: true },
    });

    const uniqueEventsResult = await this.prisma.log.groupBy({
      by: ['eventId'],
      where: { ...where, eventId: { not: null } },
    });

    const eventCount = eventStatsResult._count.id;
    const avgTimePerEvent =
      eventCount > 0 ? (eventStatsResult._sum.timeSpent || 0) / eventCount : 0;

    return {
      totalLogs,
      categoryBreakdown,
      difficultyBreakdown,
      eventStats: {
        totalEvents: uniqueEventsResult.length,
        totalLogEntries: eventCount,
        avgTimePerEvent,
      },
      largeCount,
    };
  }

  async getHistory(userId: number) {
    this.logger.log(`Fetching history stats for user ${userId}`);

    // Fetch minimal data for history instead of everything
    const logs = await this.prisma.log.findMany({
      where: { userId },
      select: {
        date: true,
        timeSpent: true,
        workPeriod: {
          select: { name: true },
        },
      },
      orderBy: { date: 'asc' },
    });

    const now = new Date();
    const twelveWeeksAgo = subWeeks(startOfWeek(now), 12);

    const weeklyTrend: Record<string, number> = {};
    const heatmap: Record<string, number> = {};
    const monthlyTrend: Record<string, number> = {};
    const workPeriodTrend: Record<string, number> = {};
    const allTimeWeeklyTrend: Record<string, number> = {};

    logs.forEach((log) => {
      const dayKey = format(log.date, 'yyyy-MM-dd');
      const weekKey = format(startOfWeek(log.date), 'yyyy-MM-dd');
      const monthKey = format(log.date, 'yyyy-MM');
      const wpName = log.workPeriod?.name || 'Ismeretlen';
      const time = log.timeSpent || 0;

      heatmap[dayKey] = (heatmap[dayKey] || 0) + time;

      if (new Date(weekKey) >= twelveWeeksAgo) {
        weeklyTrend[weekKey] = (weeklyTrend[weekKey] || 0) + time;
      }

      allTimeWeeklyTrend[weekKey] = (allTimeWeeklyTrend[weekKey] || 0) + time;
      monthlyTrend[monthKey] = (monthlyTrend[monthKey] || 0) + time;
      workPeriodTrend[wpName] = (workPeriodTrend[wpName] || 0) + time;
    });

    return {
      weeklyTrend: Object.entries(weeklyTrend)
        .map(([date, hours]) => ({ date, hours }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      allTimeWeeklyTrend: Object.entries(allTimeWeeklyTrend)
        .map(([date, hours]) => ({ date, hours }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      monthlyTrend: Object.entries(monthlyTrend)
        .map(([date, hours]) => ({ date, hours }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      workPeriodTrend: Object.entries(workPeriodTrend).map(([name, hours]) => ({
        name,
        hours,
      })),
      heatmap: Object.entries(heatmap).map(([date, count]) => ({
        date,
        count,
      })),
    };
  }

  async getGamification(userId: number) {
    this.logger.log(`Fetching gamification stats for user ${userId}`);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) return null;

    const now = new Date();
    const activeWorkPeriod = await this.prisma.workPeriod.findFirst({
      where: {
        startDate: { lte: now },
        endDate: { gte: now },
      },
    });

    // Optimized streak calculation: only fetch dates
    const logsForStreak = await this.prisma.log.findMany({
      where: {
        userId,
        date: { gte: subWeeks(new Date(), 4) },
      },
      select: { date: true },
      orderBy: { date: 'desc' },
    });

    let currentStreak = 0;
    if (logsForStreak.length > 0) {
      const uniqueDates = Array.from(
        new Set(logsForStreak.map((l) => format(l.date, 'yyyy-MM-dd'))),
      )
        .sort()
        .reverse();

      const today = format(new Date(), 'yyyy-MM-dd');
      const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');

      if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
        currentStreak = 1;
        let currentStreakDate = new Date(uniqueDates[0]);

        for (let i = 1; i < uniqueDates.length; i++) {
          currentStreakDate.setDate(currentStreakDate.getDate() - 1);
          if (uniqueDates[i] === format(currentStreakDate, 'yyyy-MM-dd')) {
            currentStreak++;
          } else {
            break;
          }
        }
      }
    }

    // Role specific goals - optimized with aggregate
    const wpId = activeWorkPeriod?.id;
    const missionStats = await this.prisma.log.aggregate({
      where: {
        userId,
        workPeriodId: wpId,
        category: { notIn: ['RESPONSIBILITY', 'SIMONYI'] },
      },
      _sum: { timeSpent: true },
    });

    const largeCount = await this.prisma.log.count({
      where: {
        userId,
        workPeriodId: wpId,
        difficulty: 'LARGE',
      },
    });

    const goalTarget = 60;
    const goalProgress = missionStats._sum.timeSpent || 0;

    return {
      currentStreak,
      goal: {
        label: 'Szemeszter Küldetés',
        current: goalProgress,
        target: goalTarget,
        percentage: Math.min((goalProgress / goalTarget) * 100, 100).toFixed(1),
      },
      largeTaskCount: largeCount,
    };
  }
  async getPositionHistory(userId: number) {
    this.logger.log(`Fetching position history for user ${userId}`);

    const history = await this.prisma.positionHistory.findMany({
      where: { userId },
      orderBy: { startDate: 'desc' },
    });

    // Also get current position to make sure it's included if not in history explicitly?
    // Or just rely on history entries.
    // Let's assume history table will eventually be populated.
    // BUT for now, let's also return the current user position as the "latest" if no history exists or just as active.
    // Actually, UI usually wants a list.

    return history;
  }
}
