import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { SettingsService } from './settings.service';

@ApiTags('settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Public()
  @Get('public')
  @ApiOperation({ summary: 'Get public branding settings (app name, colors, logos)' })
  @ApiResponse({ status: 200, description: 'Return public settings' })
  getPublicSettings() {
    return this.settingsService.getPublicSettings();
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('canManageSettings')
  @ApiOperation({ summary: 'Get all settings (restricted to settings managers)' })
  @ApiResponse({ status: 200, description: 'Return all settings' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  getAllSettings() {
    return this.settingsService.getPublicSettings(); // In this case, public and all settings are the same configuration
  }

  @Put()
  @UseGuards(RolesGuard)
  @Roles('canManageSettings')
  @ApiOperation({ summary: 'Update system settings (restricted to settings managers)' })
  @ApiBody({ type: UpdateSettingsDto })
  @ApiResponse({ status: 200, description: 'Settings updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  updateSettings(@Body() dto: UpdateSettingsDto) {
    return this.settingsService.updateSettings(dto);
  }
}
