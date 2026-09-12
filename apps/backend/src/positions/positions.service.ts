import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';

@Injectable()
export class PositionsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns all positions ordered by their display priority
   */
  async findAll() {
    return this.prisma.position.findMany({
      orderBy: { order: 'asc' },
    });
  }

  /**
   * Finds a single position by ID
   */
  async findOne(id: number) {
    const position = await this.prisma.position.findUnique({
      where: { id },
    });

    if (!position) {
      throw new NotFoundException(`Position with ID ${id} not found`);
    }

    return position;
  }

  /**
   * Finds a position by its unique name identifier
   */
  async findByName(name: string) {
    return this.prisma.position.findUnique({
      where: { name: name.toUpperCase() },
    });
  }

  /**
   * Creates a new position
   */
  async create(dto: CreatePositionDto) {
    const normalizedName = dto.name.toUpperCase();

    // Check if name is unique
    const existing = await this.findByName(normalizedName);
    if (existing) {
      throw new BadRequestException(
        `Position with name ${normalizedName} already exists`,
      );
    }

    return this.prisma.$transaction(
      async (transaction) => {
        if (dto.isLeader) {
          const leader = await transaction.position.findFirst({
            where: { isLeader: true },
          });
          if (leader) {
            throw new BadRequestException('A leader position already exists');
          }
        }

        const lastPosition = await transaction.position.findFirst({
          orderBy: { order: 'desc' },
        });
        return transaction.position.create({
          data: {
            ...dto,
            name: normalizedName,
            order: lastPosition ? lastPosition.order + 1 : 0,
          },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  /**
   * Updates order values for positions based on a list of IDs
   */
  async updateOrder(ids: number[]) {
    await this.prisma.$transaction(async (transaction) => {
      const currentPositions = await transaction.position.findMany({
        select: { id: true },
      });
      const uniqueIds = new Set(ids);
      const currentIds = new Set(currentPositions.map(({ id }) => id));
      if (
        uniqueIds.size !== ids.length ||
        currentIds.size !== uniqueIds.size ||
        ids.some((id) => !currentIds.has(id))
      ) {
        throw new BadRequestException(
          'Position order must contain every position exactly once',
        );
      }

      await Promise.all(
        ids.map((id, index) =>
          transaction.position.update({
            where: { id },
            data: { order: index },
          }),
        ),
      );
    });
    return { success: true };
  }

  /**
   * Updates an existing position
   */
  async update(id: number, dto: UpdatePositionDto) {
    const position = await this.findOne(id);

    // Prevent changing name or leader status of the core leader role
    if (position.isLeader) {
      if (dto.name && dto.name.toUpperCase() !== position.name) {
        throw new BadRequestException('Cannot rename the leader position');
      }
      if (dto.isLeader === false) {
        throw new BadRequestException(
          'Cannot remove leader status from the leader position',
        );
      }
    }

    const data: Prisma.PositionUpdateInput = { ...dto };
    if (dto.name) {
      const normalizedName = dto.name.toUpperCase();
      data.name = normalizedName;

      // Check uniqueness if renaming
      if (normalizedName !== position.name) {
        const existing = await this.findByName(normalizedName);
        if (existing) {
          throw new BadRequestException(
            `Position with name ${normalizedName} already exists`,
          );
        }
      }
    }

    if (dto.isLeader === true && !position.isLeader) {
      return this.prisma.$transaction(
        async (transaction) => {
          const leader = await transaction.position.findFirst({
            where: { isLeader: true, id: { not: id } },
          });
          if (leader) {
            throw new BadRequestException('A leader position already exists');
          }
          return transaction.position.update({ where: { id }, data });
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    }

    return this.prisma.position.update({ where: { id }, data });
  }

  /**
   * Deletes a position
   */
  async remove(id: number) {
    const position = await this.findOne(id);

    // Prevent deleting the leader position
    if (position.isLeader) {
      throw new BadRequestException('Cannot delete the leader position');
    }

    // Check if position is currently assigned to users
    const userCount = await this.prisma.user.count({
      where: { positionId: id },
    });

    if (userCount > 0) {
      throw new BadRequestException(
        `Cannot delete position because it is currently assigned to ${userCount} users. Please reassign them first.`,
      );
    }

    return this.prisma.position.delete({
      where: { id },
    });
  }
}
