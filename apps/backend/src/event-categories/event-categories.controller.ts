import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateEventCategoryDto } from './dto/create-event-category.dto';
import { UpdateEventCategoryDto } from './dto/update-event-category.dto';
import { EventCategoriesService } from './event-categories.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('event-categories')
@Controller('event-categories')
export class EventCategoriesController {
  constructor(private readonly eventCategoriesService: EventCategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all event categories' })
  @ApiResponse({ status: 200, description: 'Return all event categories' })
  findAll() {
    return this.eventCategoriesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an event category by ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'Event Category ID' })
  @ApiResponse({ status: 200, description: 'Return the event category' })
  @ApiResponse({ status: 404, description: 'Event category not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.eventCategoriesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('canManageSettings')
  @ApiOperation({ summary: 'Create a new event category (restricted to settings managers)' })
  @ApiBody({ type: CreateEventCategoryDto })
  @ApiResponse({ status: 201, description: 'Event category created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  create(@Body() dto: CreateEventCategoryDto) {
    return this.eventCategoriesService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('canManageSettings')
  @ApiOperation({ summary: 'Update an event category (restricted to settings managers)' })
  @ApiParam({ name: 'id', type: 'number', description: 'Event Category ID' })
  @ApiBody({ type: UpdateEventCategoryDto })
  @ApiResponse({ status: 200, description: 'Event category updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Event category not found' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEventCategoryDto) {
    return this.eventCategoriesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('canManageSettings')
  @ApiOperation({ summary: 'Delete an event category (restricted to settings managers)' })
  @ApiParam({ name: 'id', type: 'number', description: 'Event Category ID' })
  @ApiResponse({ status: 200, description: 'Event category deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Event category not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.eventCategoriesService.remove(id);
  }
}
