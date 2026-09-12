import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, Equals, IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class UpdateGroupAccessDto {
  @ApiHideProperty()
  @Equals(undefined, {
    message: 'The group ID is configured through AUTHSCH_GROUP_ID, not the API',
  })
  groupId?: never;

  @ApiProperty({ description: 'Display name; never used to authorize membership' })
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  groupName: string;

  @ApiProperty({ default: false })
  @IsBoolean()
  allowAlumni: boolean;

  @ApiProperty({ description: 'Configuration version returned by the last read' })
  @IsUUID()
  version: string;

  @ApiProperty({ description: 'Access revision returned by the last read' })
  @IsUUID()
  revision: string;
}
