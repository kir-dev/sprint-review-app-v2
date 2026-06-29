import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name);

  constructor(private prisma: PrismaService) {}

  async create(data: {
    name: string;
    startDate: string;
    endDate: string;
    categoryId: number;
  }) {
    this.logger.log(`Creating event: ${data.name}`);
    try {
      const category = await this.prisma.eventCategory.findUnique({
        where: { id: data.categoryId },
      });
      if (!category) {
        throw new BadRequestException(`Event category with ID ${data.categoryId} not found`);
      }

      const event = await this.prisma.event.create({
        data: {
          name: data.name,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
          categoryId: data.categoryId,
        },
        include: {
          category: true,
          _count: {
            select: { logs: true },
          },
        },
      });
      this.logger.log(`Event created successfully: ID ${event.id}`);
      return event;
    } catch (error) {
      this.logger.error(
        `Failed to create event: ${data.name}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async findAll() {
    this.logger.log('Fetching all events');
    try {
      const events = await this.prisma.event.findMany({
        include: {
          category: true,
          _count: {
            select: { logs: true },
          },
        },
        orderBy: {
          startDate: 'desc',
        },
      });
      this.logger.log(`Found ${events.length} events`);
      return events;
    } catch (error) {
      this.logger.error('Failed to fetch events', (error as Error).stack);
      throw error;
    }
  }

  async findOne(id: number) {
    this.logger.log(`Fetching event with ID: ${id}`);
    try {
      const event = await this.prisma.event.findUnique({
        where: { id },
        include: {
          category: true,
          logs: true,
          _count: {
            select: { logs: true },
          },
        },
      });
      if (event) {
        this.logger.log(`Event found: ${event.name}`);
      } else {
        this.logger.warn(`Event with ID ${id} not found`);
      }
      return event;
    } catch (error) {
      this.logger.error(
        `Failed to fetch event with ID: ${id}`,
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
      categoryId?: number;
    },
  ) {
    this.logger.log(`Updating event with ID: ${id}`);
    try {
      const event = await this.prisma.event.update({
        where: { id },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.startDate && { startDate: new Date(data.startDate) }),
          ...(data.endDate && { endDate: new Date(data.endDate) }),
          ...(data.categoryId && { categoryId: data.categoryId }),
        },
        include: {
          category: true,
          _count: {
            select: { logs: true },
          },
        },
      });
      this.logger.log(`Event updated successfully: ${event.name}`);
      return event;
    } catch (error) {
      this.logger.error(
        `Failed to update event with ID: ${id}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async remove(id: number) {
    this.logger.log(`Deleting event with ID: ${id}`);
    try {
      const event = await this.prisma.event.delete({
        where: { id },
      });
      this.logger.log(`Event deleted successfully: ${event.name}`);
      return event;
    } catch (error) {
      this.logger.error(
        `Failed to delete event with ID: ${id}`,
        (error as Error).stack,
      );
      throw error;
    }
  }
}
