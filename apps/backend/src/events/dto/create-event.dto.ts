import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum EventType {
  KIR_DEV = 'KIR_DEV',
  SIMONYI = 'SIMONYI',
}

export class CreateEventDto {
  @ApiProperty({ example: 'Kir-Dev Sprint Review' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ enum: EventType, example: EventType.KIR_DEV })
  @IsEnum(EventType)
  @IsNotEmpty()
  type: EventType;
}
