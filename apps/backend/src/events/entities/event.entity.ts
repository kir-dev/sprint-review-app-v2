import { ApiProperty } from '@nestjs/swagger';

export class Event {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  startDate: Date;

  @ApiProperty()
  endDate: Date;

  @ApiProperty()
  categoryId: number;
}
