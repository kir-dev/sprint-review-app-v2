/* eslint-disable @typescript-eslint/no-unsafe-call */
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
  OPERATIONS = 'OPERATIONS',
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
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsEnum(LogCategory)
  @IsNotEmpty()
  category: LogCategory;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(Difficulty)
  @IsOptional()
  difficulty?: Difficulty;

  @IsInt()
  @IsPositive()
  @IsOptional()
  timeSpent?: number;

  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  userId: number;

  @IsInt()
  @IsPositive()
  @IsOptional()
  projectId?: number;

  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  workPeriodId: number;
}
