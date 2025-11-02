import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayUnique,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({
    description: 'Project name',
    example: 'Sprint Review App',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Project description',
    example: 'A comprehensive sprint review management application',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'GitHub repository URL',
    example: 'https://github.com/kir-dev/sprint-review-app-v2',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  githubUrl?: string;

  @ApiProperty({
    description: 'Project manager user ID',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  projectManagerId?: number;

  @ApiProperty({
    description: 'Array of member user IDs',
    example: [1, 2, 3],
    type: [Number],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  memberIds?: number[];
}
