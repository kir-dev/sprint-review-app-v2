import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  // Default fallback settings
  private readonly defaults = {
    appName: 'Sprint Review App',
    primaryColor: '#f15a29',
    logoLightUrl: '/Kir-Dev-Black.png',
    logoDarkUrl: '/Kir-Dev-White.png',
    faviconUrl: '/favicon.ico',
  };

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper to fetch setting from database or return default
   */
  private async getSettingWithDefault(key: string, defaultValue: string): Promise<string> {
    try {
      const setting = await this.prisma.systemSetting.findUnique({
        where: { key },
      });
      return setting ? setting.value : defaultValue;
    } catch (error) {
      this.logger.error(`Error fetching setting: ${key}`, error);
      return defaultValue;
    }
  }

  /**
   * Retrieves public branding settings
   */
  async getPublicSettings() {
    const appName = await this.getSettingWithDefault('appName', this.defaults.appName);
    const primaryColor = await this.getSettingWithDefault('primaryColor', this.defaults.primaryColor);
    const logoLightUrl = await this.getSettingWithDefault('logoLightUrl', this.defaults.logoLightUrl);
    const logoDarkUrl = await this.getSettingWithDefault('logoDarkUrl', this.defaults.logoDarkUrl);
    const faviconUrl = await this.getSettingWithDefault('faviconUrl', this.defaults.faviconUrl);

    return {
      appName,
      primaryColor,
      logoLightUrl,
      logoDarkUrl,
      faviconUrl,
    };
  }

  /**
   * Updates multiple settings in the database
   */
  async updateSettings(dto: UpdateSettingsDto) {
    this.logger.log('Updating system settings');

    const updatePromises = Object.entries(dto).map(([key, value]) => {
      if (value === undefined || value === null) {
        return Promise.resolve();
      }

      return this.prisma.systemSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
    });

    await Promise.all(updatePromises);
    return this.getPublicSettings();
  }
}
