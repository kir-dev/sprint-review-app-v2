import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkPeriodDto } from './create-work-period.dto';

export class UpdateWorkPeriodDto extends PartialType(CreateWorkPeriodDto) {}
