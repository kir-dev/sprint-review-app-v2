import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

const CSS_COLOR_PATTERN =
  /^(?:#[0-9a-fA-F]{6}|hsl\(\s*(?:360|3[0-5]\d|[12]?\d?\d)(?:\s*,\s*|\s+)(?:100|\d{1,2})%(?:\s*,\s*|\s+)(?:100|\d{1,2})%\s*\))$/;

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
  @Matches(CSS_COLOR_PATTERN, {
    message: 'primaryColor must be a six-digit HEX or HSL color',
  })
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
