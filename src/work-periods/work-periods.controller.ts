import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateWorkPeriodDto } from './dto/create-work-period.dto';
import { UpdateWorkPeriodDto } from './dto/update-work-period.dto';
import { WorkPeriodsService } from './work-periods.service';

@Controller('work-periods')
export class WorkPeriodsController {
  constructor(private readonly workPeriodsService: WorkPeriodsService) {}

  @Post()
  create(@Body() dto: CreateWorkPeriodDto) {
    return this.workPeriodsService.create(dto);
  }

  @Get()
  findAll() {
    return this.workPeriodsService.findAll();
  }

  @Get('current')
  findCurrent() {
    return this.workPeriodsService.findCurrent();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workPeriodsService.findOne(+id);
  }

  @Get(':id/logs')
  getWorkPeriodLogs(@Param('id') id: string) {
    return this.workPeriodsService.getWorkPeriodLogs(+id);
  }

  @Get(':id/stats')
  getWorkPeriodStats(@Param('id') id: string) {
    return this.workPeriodsService.getWorkPeriodStats(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateWorkPeriodDto) {
    return this.workPeriodsService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.workPeriodsService.remove(+id);
  }
}
