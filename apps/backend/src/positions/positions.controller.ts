import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { PositionsService } from './positions.service';

@ApiTags('positions')
@Controller('positions')
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all positions' })
  @ApiResponse({ status: 200, description: 'Return all positions' })
  findAll() {
    return this.positionsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a position by ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'Position ID' })
  @ApiResponse({ status: 200, description: 'Return the position' })
  @ApiResponse({ status: 404, description: 'Position not found' })
  findOne(@Param('id') id: string) {
    return this.positionsService.findOne(+id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('canManageSettings')
  @ApiOperation({ summary: 'Create a new position (restricted to settings managers)' })
  @ApiBody({ type: CreatePositionDto })
  @ApiResponse({ status: 201, description: 'Position created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  create(@Body() dto: CreatePositionDto) {
    return this.positionsService.create(dto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('canManageSettings')
  @ApiOperation({ summary: 'Update a position (restricted to settings managers)' })
  @ApiParam({ name: 'id', type: 'number', description: 'Position ID' })
  @ApiBody({ type: UpdatePositionDto })
  @ApiResponse({ status: 200, description: 'Position updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Position not found' })
  update(@Param('id') id: string, @Body() dto: UpdatePositionDto) {
    return this.positionsService.update(+id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('canManageSettings')
  @ApiOperation({ summary: 'Delete a position (restricted to settings managers)' })
  @ApiParam({ name: 'id', type: 'number', description: 'Position ID' })
  @ApiResponse({ status: 200, description: 'Position deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Position not found' })
  remove(@Param('id') id: string) {
    return this.positionsService.remove(+id);
  }
}
