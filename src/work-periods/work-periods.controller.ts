import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateWorkPeriodDto } from './dto/create-work-period.dto';
import { UpdateWorkPeriodDto } from './dto/update-work-period.dto';
import { WorkPeriodsService } from './work-periods.service';

@ApiTags('work-periods')
@Controller('work-periods')
export class WorkPeriodsController {
  constructor(private readonly workPeriodsService: WorkPeriodsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new work period' })
  @ApiBody({ type: CreateWorkPeriodDto })
  @ApiResponse({
    status: 201,
    description: 'Work period created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() dto: CreateWorkPeriodDto) {
    return this.workPeriodsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all work periods' })
  @ApiResponse({ status: 200, description: 'Return all work periods' })
  findAll() {
    return this.workPeriodsService.findAll();
  }

  @Get('current')
  @ApiOperation({ summary: 'Get the current active work period' })
  @ApiResponse({ status: 200, description: 'Return the current work period' })
  @ApiResponse({ status: 404, description: 'No current work period found' })
  findCurrent() {
    return this.workPeriodsService.findCurrent();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a work period by ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'Work period ID' })
  @ApiResponse({ status: 200, description: 'Return the work period' })
  @ApiResponse({ status: 404, description: 'Work period not found' })
  findOne(@Param('id') id: string) {
    return this.workPeriodsService.findOne(+id);
  }

  @Get(':id/logs')
  @ApiOperation({ summary: 'Get all logs for a work period' })
  @ApiParam({ name: 'id', type: 'number', description: 'Work period ID' })
  @ApiResponse({ status: 200, description: 'Return work period logs' })
  @ApiResponse({ status: 404, description: 'Work period not found' })
  getWorkPeriodLogs(@Param('id') id: string) {
    return this.workPeriodsService.getWorkPeriodLogs(+id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get statistics for a work period' })
  @ApiParam({ name: 'id', type: 'number', description: 'Work period ID' })
  @ApiResponse({ status: 200, description: 'Return work period statistics' })
  @ApiResponse({ status: 404, description: 'Work period not found' })
  getWorkPeriodStats(@Param('id') id: string) {
    return this.workPeriodsService.getWorkPeriodStats(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a work period' })
  @ApiParam({ name: 'id', type: 'number', description: 'Work period ID' })
  @ApiBody({ type: UpdateWorkPeriodDto })
  @ApiResponse({
    status: 200,
    description: 'Work period updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Work period not found' })
  update(@Param('id') id: string, @Body() dto: UpdateWorkPeriodDto) {
    return this.workPeriodsService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a work period' })
  @ApiParam({ name: 'id', type: 'number', description: 'Work period ID' })
  @ApiResponse({
    status: 200,
    description: 'Work period deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Work period not found' })
  remove(@Param('id') id: string) {
    return this.workPeriodsService.remove(+id);
  }
}
