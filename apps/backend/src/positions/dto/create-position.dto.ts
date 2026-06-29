import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CreatePositionDto {
  @ApiProperty({
    description: 'Unique uppercase name identifier for the position',
    example: 'PR_FELELOS',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z0-9_]+$/, {
    message: 'Name must contain only uppercase letters, numbers, and underscores',
  })
  name: string;

  @ApiProperty({
    description: 'User-friendly label for the position',
    example: 'PR-felelős',
  })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty({
    description: 'Tailwind CSS classes for position badge color styling',
    example: 'bg-pink-500/10 text-foreground border-pink-500/20',
  })
  @IsString()
  @IsNotEmpty()
  color: string;

  @ApiProperty({
    description: 'Permission to manage system settings and branding',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  canManageSettings?: boolean;

  @ApiProperty({
    description: 'Permission to export all logs to CSV',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  canExportLogs?: boolean;

  @ApiProperty({
    description: 'Permission to manage events',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  canManageEvents?: boolean;

  @ApiProperty({
    description: 'Permission to manage projects and work periods',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  canManageProjects?: boolean;

  @ApiProperty({
    description: 'Whether this role is the circle leader (cannot be deleted)',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isLeader?: boolean;
}
