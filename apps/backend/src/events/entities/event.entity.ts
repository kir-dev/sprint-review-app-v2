import { ApiProperty } from '@nestjs/swagger';
import { EventType } from '@prisma/client';

export class Event {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  date: Date;

  @ApiProperty({ enum: EventType })
  type: EventType;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
