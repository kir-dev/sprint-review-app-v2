import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Simonyi BME email address',
    example: 'john.doe@simonyi.bme.hu',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  simonyiEmail?: string;

  @ApiProperty({
    description: 'GitHub username',
    example: 'johndoe',
    required: false,
  })
  @IsString()
  @IsOptional()
  githubUsername?: string;

  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({
    description: 'Profile image as base64 string',
    example: 'data:image/png;base64,iVBORw0KGgoAAAANS...',
    required: false,
  })
  @IsString()
  @IsOptional()
  profileImage?: string;
}
