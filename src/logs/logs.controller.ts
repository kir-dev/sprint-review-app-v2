import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateLogDto, LogCategory } from './dto/create-log.dto';
import { UpdateLogDto } from './dto/update-log.dto';
import { LogsService } from './logs.service';

@Controller('logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Post()
  create(@Body() dto: CreateLogDto) {
    return this.logsService.create(dto);
  }

  @Get()
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
  getStatsByProject(
    @Param('projectId') projectId: string,
    @Query('workPeriodId') workPeriodId?: string,
  ) {
    return this.logsService.getStatsByProject(
      +projectId,
      workPeriodId ? +workPeriodId : undefined,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.logsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLogDto) {
    return this.logsService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.logsService.remove(+id);
  }
}
