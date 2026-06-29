import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateSettingsDto {
  @ApiProperty({
    description: 'The name of the application',
    example: 'Kir-Dev Sprint Review',
  })
  @IsString()
  @IsNotEmpty()
  appName: string;

  @ApiProperty({
    description: 'Primary theme color in HEX or HSL format',
    example: '#f15a29',
  })
  @IsString()
  @IsNotEmpty()
  primaryColor: string;

  @ApiProperty({
    description: 'URL or base64 of the logo for light theme',
    example: '/Kir-Dev-Black.png',
  })
  @IsString()
  @IsOptional()
  logoLightUrl?: string;

  @ApiProperty({
    description: 'URL or base64 of the logo for dark theme',
    example: '/Kir-Dev-White.png',
  })
  @IsString()
  @IsOptional()
  logoDarkUrl?: string;

  @ApiProperty({
    description: 'URL or base64 of the favicon',
    example: '/favicon.ico',
    required: false,
  })
  @IsString()
  @IsOptional()
  faviconUrl?: string;
}
