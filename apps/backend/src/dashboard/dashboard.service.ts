import { Injectable, Logger } from '@nestjs/common';
import { EventService } from '../events/events.service';
import { LogsService } from '../logs/logs.service';
import { ProjectService } from '../projects/projects.service';
import { WorkPeriodsService } from '../work-periods/work-periods.service';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    private readonly logsService: LogsService,
    private readonly projectsService: ProjectService,
    private readonly workPeriodsService: WorkPeriodsService,
    private readonly eventService: EventService,
  ) {}

  async getSummary(userId: number) {
    this.logger.log(`Getting dashboard summary for user ${userId}`);
    const currentPeriod = await this.workPeriodsService.findCurrent();
    const stats = await this.logsService.getStatsByUser(userId, currentPeriod?.id);

    // Global stats for comparison/display
    const allLogs = await this.logsService.findAll({ workPeriodId: currentPeriod?.id });
    const groupTotalHours = allLogs.reduce((sum, log) => sum + (log.timeSpent || 0), 0);
    const activeContributors = new Set(allLogs.map(l => l.userId)).size;

    // Calculate active projects count from logs
    const activeProjectsCount = Object.keys(stats.logsByProject).length;
    
    // Global total active projects (unique projects in all logs)
    const allProjectNames = new Set(allLogs.map(l => l.project?.id).filter(Boolean));
    const totalProjectsCount = allProjectNames.size;

    const averageHoursPerUser = activeContributors > 0 ? (groupTotalHours / activeContributors) : 0;

    return {
      totalHours: stats.totalTimeSpent,
      activeProjects: activeProjectsCount,
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

  async getProjectsStats(userId: number) {
    this.logger.log(`Getting project stats (global)`);
    const currentPeriod = await this.workPeriodsService.findCurrent();
    
    // Fetch ALL logs for the period to calculate global top projects
    const allLogs = await this.logsService.findAll({ workPeriodId: currentPeriod?.id });
    
    const logsByProject: Record<string, number> = {};
    allLogs.forEach(log => {
        if (log.project) {
            logsByProject[log.project.name] = (logsByProject[log.project.name] || 0) + (log.timeSpent || 0); // Using hours now
        }
    });

    const topProjects = Object.entries(logsByProject)
      .map(([name, count]) => ({ name, count })) // count is actually hours
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      topProjects,
    };
  }

  async getTopUsers() {
      const currentPeriod = await this.workPeriodsService.findCurrent();
      const allLogs = await this.logsService.findAll({ workPeriodId: currentPeriod?.id });
      
      const hoursByUser: Record<string, number> = {};
      
      allLogs.forEach(log => {
          if (log.user) {
             hoursByUser[log.user.fullName] = (hoursByUser[log.user.fullName] || 0) + (log.timeSpent || 0);
          }
      });

      const topUsers = Object.entries(hoursByUser)
        .map(([name, hours]) => ({ name, hours }))
        .sort((a, b) => b.hours - a.hours)
        .slice(0, 5);
        
      return topUsers;
  }

  // Activity Feed removed as requested
  async getFeed(userId: number) {
     return [];
  }

  async getStats(userId: number) {
    this.logger.log(`Getting extended stats for user ${userId}`);
    const currentPeriod = await this.workPeriodsService.findCurrent();
    const logs = await this.logsService.findAll({
      userId,
      workPeriodId: currentPeriod?.id,
    });

    // 1. Category Breakdown (Global - all users)
    const allLogs = await this.logsService.findAll({
      workPeriodId: currentPeriod?.id,
    });

    const categoryBreakdown = allLogs.reduce(
      (acc, log) => {
        acc[log.category] = (acc[log.category] || 0) + (log.timeSpent || 0);
        return acc;
      },
      {} as Record<string, number>,
    );

    // 2. Heatmap Data (full current work period)
    const heatmapLogs = await this.logsService.findAll({
      userId,
      workPeriodId: currentPeriod?.id,
    });

    const heatmapMap = heatmapLogs.reduce((acc, log) => {
      // Use Hungarian timezone to determine the "day" of the log
      // en-CA locale gives YYYY-MM-DD format
      const date = log.date.toLocaleDateString('en-CA', { timeZone: 'Europe/Budapest' });
      acc[date] = (acc[date] || 0) + (log.timeSpent || 0);
      return acc;
    }, {} as Record<string, number>);

    const heatmapData = Object.entries(heatmapMap).map(([date, count]) => ({
      date,
      count,
    }));

    // 3. Difficulty Breakdown (Global)
    const difficultyBreakdown = allLogs.reduce(
        (acc, log) => {
            if (log.difficulty) {
                acc[log.difficulty] = (acc[log.difficulty] || 0) + 1;
            }
            return acc;
        },
        {} as Record<string, number>
    );

    return {
      categoryBreakdown: Object.entries(categoryBreakdown).map(
        ([name, value]) => ({ name, value }),
      ),
      heatmapData,
      difficultyBreakdown: Object.entries(difficultyBreakdown).map(
        ([name, value]) => ({ name, value }),
      ),
    };
  }

  async getEvents(userId: number) {
    this.logger.log(`Getting events for user ${userId}`);
    const events = await this.eventService.findAll();
    const now = new Date();

    const upcoming = events
      .filter((e) => new Date(e.startDate) >= now)
      .slice(0, 5);
    const past = events.filter((e) => new Date(e.startDate) < now).slice(0, 5);

    return {
      upcoming,
      past,
    };
  }
}
