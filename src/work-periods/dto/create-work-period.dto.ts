/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreateWorkPeriodDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;
}
