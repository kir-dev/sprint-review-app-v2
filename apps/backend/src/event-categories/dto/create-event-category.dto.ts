import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateEventCategoryDto {
  @ApiProperty({
    description: 'Unique name key (uppercase)',
    example: 'KIR_DEV',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z0-9_]+$/, {
    message: 'Name must contain only uppercase letters, numbers, and underscores',
  })
  name: string;

  @ApiProperty({
    description: 'Display label of the event category',
    example: 'Kir-Dev',
  })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty({
    description: 'HEX color code of the category',
    example: '#f15a29',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'Color must be a valid 6-character HEX code (e.g. #ffffff)',
  })
  color: string;
}
