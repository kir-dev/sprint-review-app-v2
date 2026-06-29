import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsInt } from 'class-validator';

export class UpdatePositionOrderDto {
  @ApiProperty({ type: [Number], description: 'Ordered list of position IDs' })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  ids: number[];
}
