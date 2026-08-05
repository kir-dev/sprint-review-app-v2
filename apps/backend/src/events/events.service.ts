import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { logServiceError } from '../common/logging/safe-logger';

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
    this.logger.log('Creating event');
    try {
      const category = await this.prisma.eventCategory.findUnique({
        where: { id: data.categoryId },
      });
      if (!category) {
        throw new BadRequestException(
          `Event category with ID ${data.categoryId} not found`,
        );
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
      logServiceError(this.logger, 'create_event');
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
      logServiceError(this.logger, 'list_events');
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
        this.logger.log(`Event found: ID ${event.id}`);
      } else {
        this.logger.warn(`Event with ID ${id} not found`);
      }
      return event;
    } catch (error) {
      logServiceError(this.logger, 'get_event');
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
      this.logger.log(`Event updated successfully: ID ${event.id}`);
      return event;
    } catch (error) {
      logServiceError(this.logger, 'update_event');
      throw error;
    }
  }

  async remove(id: number) {
    this.logger.log(`Deleting event with ID: ${id}`);
    try {
      const event = await this.prisma.event.delete({
        where: { id },
      });
      this.logger.log(`Event deleted successfully: ID ${event.id}`);
      return event;
    } catch (error) {
      logServiceError(this.logger, 'delete_event');
      throw error;
    }
  }
}
