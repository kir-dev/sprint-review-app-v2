import {
  IsString,
  IsOptional,
  IsUrl,
  IsInt,
  IsArray,
  ArrayUnique,
} from 'class-validator';

export class CreateProjectDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUrl()
  githubUrl?: string;

  @IsOptional()
  @IsInt()
  projectManagerId?: number;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  memberIds?: number[];
}
