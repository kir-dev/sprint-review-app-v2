import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreateWorkPeriodDto {
  @ApiProperty({
    description: 'Name of the work period',
    example: '2024 Fall Semester',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Start date of the work period',
    example: '2024-09-01',
    type: String,
    format: 'date',
  })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({
    description: 'End date of the work period',
    example: '2024-12-31',
    type: String,
    format: 'date',
  })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;
}
