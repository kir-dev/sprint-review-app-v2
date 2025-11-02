import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    name: string;
    description?: string;
    githubUrl?: string;
    projectManagerId?: number;
    memberIds?: number[];
  }) {
    return this.prisma.project.create({
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
  }

  async findAll() {
    return this.prisma.project.findMany({
      include: {
        members: true,
        projectManager: true,
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.project.findUnique({
      where: { id },
      include: {
        members: true,
        projectManager: true,
      },
    });
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
    return this.prisma.project.update({
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
  }

  async remove(id: number) {
    return this.prisma.project.delete({
      where: { id },
    });
  }
}
