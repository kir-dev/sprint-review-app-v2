import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export enum LogCategory {
  RESPONSIBILITY = 'RESPONSIBILITY',
  PROJECT = 'PROJECT',
  EVENT = 'EVENT',
  MAINTENANCE = 'MAINTENANCE',
  SIMONYI = 'SIMONYI',
  OTHER = 'OTHER',
}

export enum Difficulty {
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
  LARGE = 'LARGE',
}

export class CreateLogDto {
  @ApiProperty({
    description: 'Date of the log entry',
    example: '2024-11-02',
    type: String,
    format: 'date',
  })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({
    description: 'Category of the log entry',
    enum: LogCategory,
    example: LogCategory.PROJECT,
  })
  @IsEnum(LogCategory)
  @IsNotEmpty()
  category: LogCategory;

  @ApiProperty({
    description: 'Description of the work done',
    example: 'Implemented user authentication feature',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Difficulty level of the task',
    enum: Difficulty,
    example: Difficulty.MEDIUM,
    required: false,
  })
  @IsEnum(Difficulty)
  @IsOptional()
  difficulty?: Difficulty;

  @ApiProperty({
    description: 'Time spent in minutes',
    example: 120,
    required: false,
  })
  @IsInt()
  @IsPositive()
  @IsOptional()
  timeSpent?: number;

  @ApiProperty({
    description: 'User ID who created the log',
    example: 1,
  })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({
    description: 'Project ID associated with the log',
    example: 1,
    required: false,
  })
  @IsInt()
  @IsPositive()
  @IsOptional()
  projectId?: number;

  @ApiProperty({
    description: 'Event ID associated with the log',
    example: 1,
    required: false,
  })
  @IsInt()
  @IsPositive()
  @IsOptional()
  eventId?: number;

  @ApiProperty({
    description: 'Work period ID associated with the log',
    example: 1,
  })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  workPeriodId: number;
}
