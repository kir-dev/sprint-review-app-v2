import { ApiProperty } from '@nestjs/swagger';
import { EventType } from '@prisma/client';
import { IsDateString, IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateEventDto {
  @ApiProperty({ example: 'Kir-Dev Sprint Review' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ example: '2024-01-16' })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiProperty({ enum: EventType, example: EventType.KIR_DEV })
  @IsEnum(EventType)
  @IsNotEmpty()
  type: EventType;
}
