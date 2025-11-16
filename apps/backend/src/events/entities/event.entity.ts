import { ApiProperty } from '@nestjs/swagger';
import { EventType } from '@prisma/client';

export class Event {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  startDate: Date;

  @ApiProperty()
  endDate: Date;

  @ApiProperty({ enum: EventType })
  type: EventType;
}
