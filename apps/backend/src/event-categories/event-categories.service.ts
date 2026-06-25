import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEventCategoryDto } from './dto/create-event-category.dto';
import { UpdateEventCategoryDto } from './dto/update-event-category.dto';

@Injectable()
export class EventCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns all event categories
   */
  async findAll() {
    return this.prisma.eventCategory.findMany({
      orderBy: { id: 'asc' },
    });
  }

  /**
   * Finds a single event category by ID
   */
  async findOne(id: number) {
    const category = await this.prisma.eventCategory.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Event category with ID ${id} not found`);
    }

    return category;
  }

  /**
   * Finds a category by its unique name identifier
   */
  async findByName(name: string) {
    return this.prisma.eventCategory.findUnique({
      where: { name: name.toUpperCase() },
    });
  }

  /**
   * Creates a new event category
   */
  async create(dto: CreateEventCategoryDto) {
    const normalizedName = dto.name.toUpperCase();

    // Check if name is unique
    const existing = await this.findByName(normalizedName);
    if (existing) {
      throw new BadRequestException(`Event category with name ${normalizedName} already exists`);
    }

    return this.prisma.eventCategory.create({
      data: {
        ...dto,
        name: normalizedName,
      },
    });
  }

  /**
   * Updates an existing event category
   */
  async update(id: number, dto: UpdateEventCategoryDto) {
    const category = await this.findOne(id);

    const data: any = { ...dto };
    if (dto.name) {
      data.name = dto.name.toUpperCase();

      // Check uniqueness if renaming
      if (data.name !== category.name) {
        const existing = await this.findByName(data.name);
        if (existing) {
          throw new BadRequestException(`Event category with name ${data.name} already exists`);
        }
      }
    }

    return this.prisma.eventCategory.update({
      where: { id },
      data,
    });
  }

  /**
   * Deletes an event category
   */
  async remove(id: number) {
    await this.findOne(id);

    // Check if category has events assigned to it
    const eventCount = await this.prisma.event.count({
      where: { categoryId: id },
    });

    if (eventCount > 0) {
      throw new BadRequestException(
        `Cannot delete event category because it has ${eventCount} events associated with it. Please reassign or delete them first.`,
      );
    }

    return this.prisma.eventCategory.delete({
      where: { id },
    });
  }
}
