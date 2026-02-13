
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFeatureDto } from './dto/create-feature.dto';
import { UpdateFeatureDto } from './dto/update-feature.dto';

@Injectable()
export class FeaturesService {
  private readonly logger = new Logger(FeaturesService.name);

  constructor(private prisma: PrismaService) {}

  async create(createFeatureDto: CreateFeatureDto) {
    this.logger.log(`Creating feature: ${createFeatureDto.title} for project ${createFeatureDto.projectId}`);
    return this.prisma.feature.create({
      data: createFeatureDto,
    });
  }

  async findAll() {
    this.logger.log('Fetching all features');
    return this.prisma.feature.findMany({
        include: {
            assignee: true,
            project: true
        }
    });
  }

  async findOne(id: number) {
    this.logger.log(`Fetching feature with ID: ${id}`);
    return this.prisma.feature.findUnique({
      where: { id },
      include: {
        assignee: true,
        project: true
      }
    });
  }

  async update(id: number, updateFeatureDto: UpdateFeatureDto) {
    this.logger.log(`Updating feature width ID: ${id}`);
    return this.prisma.feature.update({
      where: { id },
      data: updateFeatureDto,
    });
  }

  async remove(id: number) {
    this.logger.log(`Deleting feature with ID: ${id}`);
    return this.prisma.feature.delete({
      where: { id },
    });
  }
}
