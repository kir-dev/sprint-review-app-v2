import { Injectable, Logger } from '@nestjs/common';
import { format, startOfWeek, subWeeks } from 'date-fns';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StatsService {
  private readonly logger = new Logger(StatsService.name);

  constructor(private prisma: PrismaService) {}

  async getBreakdown(userId: number) {
    this.logger.log(`Fetching breakdown stats for user ${userId}`);
    
    // Get current work period (assuming active one, or just all logs for now as per requirement "Aktuális periódus")
    // For simplicity, I'll fetch *all* logs for the user to match general "stats" request or maybe filter by recent.
    // The requirement says "Aktuális periódus". I should try to find the active work period.
    const now = new Date();
    const activeWorkPeriod = await this.prisma.workPeriod.findFirst({
      where: {
        startDate: { lte: now },
        endDate: { gte: now },
      },
    });

    const where: any = { userId };
    if (activeWorkPeriod) {
      where.workPeriodId = activeWorkPeriod.id;
    }

    const logs = await this.prisma.log.findMany({
      where,
    });

    const totalLogs = logs.length;
    
    // Category Breakdown
    const categoryBreakdown = logs.reduce((acc, log) => {
      acc[log.category] = (acc[log.category] || 0) + (log.timeSpent || 0);
      return acc;
    }, {} as Record<string, number>);

    // Difficulty Breakdown
    const difficultyBreakdown = logs.reduce((acc, log) => {
      if (log.difficulty) {
        acc[log.difficulty] = (acc[log.difficulty] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Event Stats
    const eventLogs = await this.prisma.log.findMany({
      where: {
        ...where,
        eventId: { not: null }
      },
      include: { event: true }
    });
    
    const eventCount = eventLogs.length;
    const uniqueEvents = new Set(eventLogs.map(l => l.eventId)).size;
    const avgTimePerEvent = eventCount > 0 
      ? eventLogs.reduce((sum, l) => sum + (l.timeSpent || 0), 0) / eventCount 
      : 0;

    // Large difficulty count
    const largeCount = logs.filter(l => l.difficulty === 'LARGE').length;

    return {
      totalLogs,
      categoryBreakdown: Object.entries(categoryBreakdown).map(([name, value]) => ({ name, value })),
      difficultyBreakdown: Object.entries(difficultyBreakdown).map(([name, value]) => ({ name, value })),
      eventStats: {
        totalEvents: uniqueEvents,
        totalLogEntries: eventCount,
        avgTimePerEvent
      },
      largeCount,
    };
  }

  async getHistory(userId: number) {
    this.logger.log(`Fetching history stats for user ${userId}`);
    
    // Fetch all logs to compute different views
    const logs = await this.prisma.log.findMany({
      where: { userId },
      include: { workPeriod: true },
      orderBy: { date: 'asc' },
    });

    const now = new Date();
    const twelveWeeksAgo = subWeeks(startOfWeek(now), 12);

    // 1. Weekly Trend (Last 12 Weeks) - Existing
    const weeklyTrend: Record<string, number> = {};
    // 2. Heatmap (Daily) - Existing
    const heatmap: Record<string, number> = {};
    // 3. Monthly Trend (All time or last year?) - Let's do all time grouped by month
    const monthlyTrend: Record<string, number> = {};
    // 4. Work Period Trend
    const workPeriodTrend: Record<string, number> = {};
    // 5. All Time Weekly
    const allTimeWeeklyTrend: Record<string, number> = {};

    logs.forEach(log => {
      const dayKey = format(log.date, 'yyyy-MM-dd');
      const weekKey = format(startOfWeek(log.date), 'yyyy-MM-dd');
      const monthKey = format(log.date, 'yyyy-MM');
      const wpName = log.workPeriod?.name || 'Unknown';

      // Heatmap (Daily) - limit to reasonable range? Or just send all. Visualization currently handles 12 weeks equivalent. 
      // Let's send all for heatmap for now or keep logic consistent if frontend expects something specific.
      // Frontend currently doesn't visualize heatmap yet (commented out), but logic was there.
      // Let's filter heatmap to last year perhaps if needed, but simplest is all.
      heatmap[dayKey] = (heatmap[dayKey] || 0) + (log.timeSpent || 0);

      // Weekly (Last 12 weeks)
      if (new Date(weekKey) >= twelveWeeksAgo) {
          weeklyTrend[weekKey] = (weeklyTrend[weekKey] || 0) + (log.timeSpent || 0);
      }
      
      // All Time Weekly
      allTimeWeeklyTrend[weekKey] = (allTimeWeeklyTrend[weekKey] || 0) + (log.timeSpent || 0);

      // Monthly
      monthlyTrend[monthKey] = (monthlyTrend[monthKey] || 0) + (log.timeSpent || 0);

      // Work Period
      workPeriodTrend[wpName] = (workPeriodTrend[wpName] || 0) + (log.timeSpent || 0);
    });

    return {
      weeklyTrend: Object.entries(weeklyTrend).map(([date, hours]) => ({ date, hours })).sort((a,b) => a.date.localeCompare(b.date)),
      allTimeWeeklyTrend: Object.entries(allTimeWeeklyTrend).map(([date, hours]) => ({ date, hours })).sort((a,b) => a.date.localeCompare(b.date)),
      monthlyTrend: Object.entries(monthlyTrend).map(([date, hours]) => ({ date, hours })).sort((a,b) => a.date.localeCompare(b.date)),
      workPeriodTrend: Object.entries(workPeriodTrend).map(([name, hours]) => ({ name, hours })), // Sort by usage or name? Let's keep distinct.
      heatmap: Object.entries(heatmap).map(([date, count]) => ({ date, count })),
    };
  }

  async getGamification(userId: number) {
    this.logger.log(`Fetching gamification stats for user ${userId}`);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!user) return null;

    const now = new Date();
    const activeWorkPeriod = await this.prisma.workPeriod.findFirst({
        where: {
            startDate: { lte: now },
            endDate: { gte: now },
        },
    });

    const logs = await this.prisma.log.findMany({
      where: { 
        userId,
        // Since streaks are easier to calculate on *all* history usually, or maybe just this period.
        // Let's do all recent history for streak.
         date: {
            gte: subWeeks(new Date(), 4), // check last month for active streak
         }
      },
      orderBy: { date: 'desc' },
    });

    // Streak calculation
    let currentStreak = 0;
    if (logs.length > 0) {
        const uniqueDates = Array.from(new Set(logs.map(l => format(l.date, 'yyyy-MM-dd')))).sort().reverse();
        // Simple streak: consecutive days looking back from today (or last log)
        // If the last log was today or yesterday, streak is alive.
        const today = format(new Date(), 'yyyy-MM-dd');
        const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');
        
        let lastDate = uniqueDates[0];
        
        if (lastDate === today || lastDate === yesterday) {
            currentStreak = 1;
            let checkDate = new Date(lastDate);
            
            for (let i = 1; i < uniqueDates.length; i++) {
                checkDate.setDate(checkDate.getDate() - 1);
                const expectedDate = format(checkDate, 'yyyy-MM-dd');
                if (uniqueDates[i] === expectedDate) {
                    currentStreak++;
                } else {
                    break;
                }
            }
        }
    }

    // Role specific goals
    let goalProgress = 0;
    let goalTarget = 0;
    let goalLabel = '';

    const logsInPeriod = await this.prisma.log.findMany({
        where: { 
            userId, 
            workPeriodId: activeWorkPeriod?.id 
        } 
    });
    const hoursInPeriod = logsInPeriod.reduce((sum, l) => sum + (l.timeSpent || 0), 0);

    // Logic based on requirements - Unified for all users
    // 60 hours target, excluding RESPONSIBILITY and SIMONYI
    goalLabel = 'Szemeszter Küldetés';
    goalTarget = 60;
    
    goalProgress = logsInPeriod
        .filter(l => !['RESPONSIBILITY', 'SIMONYI'].includes(l.category))
        .reduce((sum, l) => sum + (l.timeSpent || 0), 0);

    return {
        currentStreak,
        goal: {
            label: goalLabel,
            current: goalProgress,
            target: goalTarget,
            percentage: Math.min((goalProgress / goalTarget) * 100, 100).toFixed(1)
        },
        largeTaskCount: logsInPeriod.filter(l => l.difficulty === 'LARGE').length
    };
  }
}
