import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProjectService {
  private readonly logger = new Logger(ProjectService.name);

  constructor(private prisma: PrismaService) {}

  async create(data: {
    name: string;
    description?: string;
    githubUrl?: string;
    projectManagerId?: number;
    memberIds?: number[];
  }) {
    this.logger.log(
      `Creating project: ${data.name} with ${data.memberIds?.length || 0} members`,
    );
    try {
      const project = await this.prisma.project.create({
        data: {
          name: data.name,
          description: data.description,
          githubUrl: data.githubUrl,
          projectManagerId: data.projectManagerId,
          members: {
            connect: data.memberIds?.map((id) => ({ id })) || [],
          },
        },
        include: {
          members: true,
          projectManager: true,
        },
      });
      this.logger.log(`Project created successfully: ID ${project.id}`);
      return project;
    } catch (error) {
      this.logger.error(
        `Failed to create project: ${data.name}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async findAll() {
    this.logger.log('Fetching all projects');
    try {
      const projects = await this.prisma.project.findMany({
        include: {
          members: true,
          projectManager: true,
        },
      });
      this.logger.log(`Found ${projects.length} projects`);
      return projects;
    } catch (error) {
      this.logger.error('Failed to fetch projects', (error as Error).stack);
      throw error;
    }
  }

  async findOne(id: number) {
    this.logger.log(`Fetching project with ID: ${id}`);
    try {
      const project = await this.prisma.project.findUnique({
        where: { id },
        include: {
          members: true,
          projectManager: true,
        },
      });
      if (project) {
        this.logger.log(`Project found: ${project.name}`);
      } else {
        this.logger.warn(`Project with ID ${id} not found`);
      }
      return project;
    } catch (error) {
      this.logger.error(
        `Failed to fetch project with ID: ${id}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async update(
    id: number,
    data: {
      name?: string;
      description?: string;
      githubUrl?: string;
      projectManagerId?: number;
      memberIds?: number[];
    },
  ) {
    this.logger.log(`Updating project with ID: ${id}`);
    try {
      const project = await this.prisma.project.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
          githubUrl: data.githubUrl,
          projectManagerId: data.projectManagerId,
          members: data.memberIds
            ? {
                set: data.memberIds.map((id) => ({ id })),
              }
            : undefined,
        },
        include: {
          members: true,
          projectManager: true,
        },
      });
      this.logger.log(`Project updated successfully: ${project.name}`);
      return project;
    } catch (error) {
      this.logger.error(
        `Failed to update project with ID: ${id}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async remove(id: number) {
    this.logger.log(`Deleting project with ID: ${id}`);
    try {
      const project = await this.prisma.project.delete({
        where: { id },
      });
      this.logger.log(`Project deleted successfully: ${project.name}`);
      return project;
    } catch (error) {
      this.logger.error(
        `Failed to delete project with ID: ${id}`,
        (error as Error).stack,
      );
      throw error;
    }
  }
  async getFeatures(projectId: number) {
    this.logger.log(`Fetching features for project ID: ${projectId}`);
    return this.prisma.feature.findMany({
      where: { projectId },
      include: {
        assignee: true,
      },
    });
  }

  async getStats(projectId: number) {
    this.logger.log(`Fetching stats for project ID: ${projectId}`);

    const [logAggregate, featureStats, bugStats, featureCountsRaw] =
      await Promise.all([
        this.prisma.log.aggregate({
          where: { projectId },
          _count: { id: true },
          _sum: { timeSpent: true },
        }),
        this.prisma.feature.aggregate({
          where: { projectId, isFeature: true },
          _count: { id: true },
        }),
        this.prisma.feature.aggregate({
          where: { projectId, isBug: true },
          _count: { id: true },
        }),
        this.prisma.feature.groupBy({
          by: ['status'],
          where: { projectId },
          _count: { id: true },
        }),
      ]);

    // Also need completed counts
    const [completedFeatures, completedBugs] = await Promise.all([
      this.prisma.feature.count({
        where: { projectId, isFeature: true, status: 'DONE' },
      }),
      this.prisma.feature.count({
        where: { projectId, isBug: true, status: 'DONE' },
      }),
    ]);

    const featureCounts = {
      TODO: featureCountsRaw.find((f) => f.status === 'TODO')?._count.id || 0,
      IN_PROGRESS:
        featureCountsRaw.find((f) => f.status === 'IN_PROGRESS')?._count.id ||
        0,
      DONE: featureCountsRaw.find((f) => f.status === 'DONE')?._count.id || 0,
      BLOCKED:
        featureCountsRaw.find((f) => f.status === 'BLOCKED')?._count.id || 0,
    };

    return {
      totalLogs: logAggregate._count.id,
      totalTimeSpent: logAggregate._sum.timeSpent || 0,
      featureCounts,
      bugStats: {
        total: bugStats._count.id,
        completed: completedBugs,
      },
      featureStats: {
        total: featureStats._count.id,
        completed: completedFeatures,
      },
    };
  }
}
