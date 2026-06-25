import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';

@Injectable()
export class PositionsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns all positions
   */
  async findAll() {
    return this.prisma.position.findMany({
      orderBy: { id: 'asc' },
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
      throw new BadRequestException(`Position with name ${normalizedName} already exists`);
    }

    return this.prisma.position.create({
      data: {
        ...dto,
        name: normalizedName,
      },
    });
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
        throw new BadRequestException('Cannot remove leader status from the leader position');
      }
    }

    const data: any = { ...dto };
    if (dto.name) {
      data.name = dto.name.toUpperCase();

      // Check uniqueness if renaming
      if (data.name !== position.name) {
        const existing = await this.findByName(data.name);
        if (existing) {
          throw new BadRequestException(`Position with name ${data.name} already exists`);
        }
      }
    }

    return this.prisma.position.update({
      where: { id },
      data,
    });
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
