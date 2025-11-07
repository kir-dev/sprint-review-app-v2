import { Injectable, Logger } from '@nestjs/common';
import { EventType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name);

  constructor(private prisma: PrismaService) {}

  async create(data: { name: string; date: string; type: EventType }) {
    this.logger.log(`Creating event: ${data.name}`);
    try {
      const event = await this.prisma.event.create({
        data: {
          name: data.name,
          date: new Date(data.date),
          type: data.type,
        },
        include: {
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
          _count: {
            select: { logs: true },
          },
        },
        orderBy: {
          date: 'desc',
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
    data: { name?: string; date?: string; type?: EventType },
  ) {
    this.logger.log(`Updating event with ID: ${id}`);
    try {
      const event = await this.prisma.event.update({
        where: { id },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.date && { date: new Date(data.date) }),
          ...(data.type && { type: data.type }),
        },
        include: {
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
