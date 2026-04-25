import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Position } from '@prisma/client';
import { Response } from 'express';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateLogDto, LogCategory } from './dto/create-log.dto';
import { UpdateLogDto } from './dto/update-log.dto';
import { LogsService } from './logs.service';

@ApiTags('logs')
@Controller('logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new log entry' })
  @ApiBody({ type: CreateLogDto })
  @ApiResponse({ status: 201, description: 'Log created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() dto: CreateLogDto) {
    return this.logsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all logs with optional filters' })
  @ApiQuery({
    name: 'userId',
    required: false,
    type: Number,
    description: 'Filter by user ID',
  })
  @ApiQuery({
    name: 'projectId',
    required: false,
    type: Number,
    description: 'Filter by project ID',
  })
  @ApiQuery({
    name: 'workPeriodId',
    required: false,
    type: Number,
    description: 'Filter by work period ID',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    enum: LogCategory,
    description: 'Filter by log category',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Filter by start date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'Filter by end date (YYYY-MM-DD)',
  })
  @ApiResponse({ status: 200, description: 'Return filtered logs' })
  findAll(
    @Query('userId') userId?: string,
    @Query('projectId') projectId?: string,
    @Query('workPeriodId') workPeriodId?: string,
    @Query('category') category?: LogCategory,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const filters = {
      userId: userId ? +userId : undefined,
      projectId: projectId ? +projectId : undefined,
      workPeriodId: workPeriodId ? +workPeriodId : undefined,
      category,
      startDate,
      endDate,
    };
    return this.logsService.findAll(filters);
  }

  @Get('stats/user/:userId')
  @ApiOperation({ summary: 'Get statistics for a user' })
  @ApiParam({ name: 'userId', type: 'number', description: 'User ID' })
  @ApiQuery({
    name: 'workPeriodId',
    required: false,
    type: Number,
    description: 'Filter by work period ID',
  })
  @ApiResponse({ status: 200, description: 'Return user statistics' })
  getStatsByUser(
    @Param('userId') userId: string,
    @Query('workPeriodId') workPeriodId?: string,
  ) {
    return this.logsService.getStatsByUser(
      +userId,
      workPeriodId ? +workPeriodId : undefined,
    );
  }

  @Get('stats/project/:projectId')
  @ApiOperation({ summary: 'Get statistics for a project' })
  @ApiParam({ name: 'projectId', type: 'number', description: 'Project ID' })
  @ApiQuery({
    name: 'workPeriodId',
    required: false,
    type: Number,
    description: 'Filter by work period ID',
  })
  @ApiResponse({ status: 200, description: 'Return project statistics' })
  getStatsByProject(
    @Param('projectId') projectId: string,
    @Query('workPeriodId') workPeriodId?: string,
  ) {
    return this.logsService.getStatsByProject(
      +projectId,
      workPeriodId ? +workPeriodId : undefined,
    );
  }

  @Get('export')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(
    Position.KORVEZETO,
    Position.KORVEZETO_HELYETTES,
    Position.GAZDASAGIS,
  )
  @ApiOperation({
    summary:
      'Export logs as CSV (restricted to KORVEZETO, KORVEZETO_HELYETTES, GAZDASAGIS)',
  })
  @ApiQuery({
    name: 'userIds',
    required: false,
    type: String,
    description: 'Comma-separated user IDs. Omit to export logs for all users.',
  })
  @ApiQuery({
    name: 'workPeriodId',
    required: false,
    type: Number,
  })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiResponse({ status: 200, description: 'CSV file' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async exportLogs(
    @Res() res: Response,
    @Query('userIds') userIds?: string,
    @Query('workPeriodId') workPeriodId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const parsedUserIds = userIds
      ? userIds
          .split(',')
          .map((id) => Number(id.trim()))
          .filter((id) => Number.isFinite(id) && id > 0)
      : undefined;

    const { csv, filenameSuffix } = await this.logsService.exportLogs({
      userIds: parsedUserIds,
      workPeriodId: workPeriodId ? +workPeriodId : undefined,
      startDate,
      endDate,
    });

    const filename = `munkanaplok_${filenameSuffix}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${filename}"`,
    );
    res.send('\uFEFF' + csv);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a log by ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'Log ID' })
  @ApiResponse({ status: 200, description: 'Return the log' })
  @ApiResponse({ status: 404, description: 'Log not found' })
  findOne(@Param('id') id: string) {
    return this.logsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a log' })
  @ApiParam({ name: 'id', type: 'number', description: 'Log ID' })
  @ApiBody({ type: UpdateLogDto })
  @ApiResponse({ status: 200, description: 'Log updated successfully' })
  @ApiResponse({ status: 404, description: 'Log not found' })
  update(@Param('id') id: string, @Body() dto: UpdateLogDto) {
    return this.logsService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a log' })
  @ApiParam({ name: 'id', type: 'number', description: 'Log ID' })
  @ApiResponse({ status: 200, description: 'Log deleted successfully' })
  @ApiResponse({ status: 404, description: 'Log not found' })
  remove(@Param('id') id: string) {
    return this.logsService.remove(+id);
  }
}
