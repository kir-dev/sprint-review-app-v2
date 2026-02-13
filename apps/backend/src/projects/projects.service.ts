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
    
    const [project, features, logs] = await Promise.all([
      this.prisma.project.findUnique({
        where: { id: projectId },
        include: { members: true, projectManager: true },
      }),
      this.prisma.feature.findMany({
        where: { projectId },
      }),
      this.prisma.log.findMany({
        where: { projectId },
      }),
    ]);
    
    if (!project) {
        throw new Error('Project not found');
    }

    const totalTime = logs.reduce((acc, log) => acc + (log.timeSpent || 0), 0);
    
    const featureCounts = {
        TODO: features.filter(f => f.status === 'TODO').length,
        IN_PROGRESS: features.filter(f => f.status === 'IN_PROGRESS').length,
        DONE: features.filter(f => f.status === 'DONE').length,
        BLOCKED: features.filter(f => f.status === 'BLOCKED').length,
    };

    return {
        totalLogs: logs.length,
        totalTimeSpent: totalTime,
        featureCounts,
    };
  }
}
