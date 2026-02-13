
import { ApiProperty } from '@nestjs/swagger';
import { FeatureStatus, Priority } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateFeatureDto {
  @ApiProperty({
    description: 'Feature title',
    example: 'Implement login',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Feature description',
    example: 'Allow users to log in with email and password',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Feature status',
    enum: FeatureStatus,
    example: 'TODO',
    required: false,
  })
  @IsOptional()
  @IsEnum(FeatureStatus)
  status?: FeatureStatus;

  @ApiProperty({
    description: 'Feature priority',
    enum: Priority,
    example: 'MEDIUM',
    required: false,
  })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @ApiProperty({
    description: 'Project ID',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  projectId: number;

  @ApiProperty({
    description: 'Assignee User ID',
    example: 2,
    required: false,
  })
  @IsOptional()
  @IsInt()
  assigneeId?: number;
}
