import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { Public } from '../common/decorators/public.decorator';
import { HealthService } from './health.service';

interface HealthResponse {
  status: 'ok' | 'unavailable';
}

@Public()
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('live')
  live(): HealthResponse {
    return { status: 'ok' };
  }

  @Get('ready')
  async ready(
    @Res({ passthrough: true }) response: Response,
  ): Promise<HealthResponse> {
    if (await this.healthService.isReady()) {
      return { status: 'ok' };
    }

    response.status(503);
    return { status: 'unavailable' };
  }
}
