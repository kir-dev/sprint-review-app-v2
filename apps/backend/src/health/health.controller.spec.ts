import type { Response } from 'express';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('HealthController', () => {
  const status = jest.fn();
  const response = { status } as unknown as Response;
  const healthService = {
    isReady: jest.fn(),
  } as unknown as HealthService;
  const controller = new HealthController(healthService);

  beforeEach(() => {
    status.mockReset();
    (healthService.isReady as jest.Mock).mockReset();
  });

  it('returns the exact liveness response', () => {
    expect(controller.live()).toEqual({ status: 'ok' });
  });

  it('returns the exact readiness success response', async () => {
    (healthService.isReady as jest.Mock).mockResolvedValue(true);

    await expect(controller.ready(response)).resolves.toEqual({ status: 'ok' });
    expect(status).not.toHaveBeenCalled();
  });

  it('returns 503 without exposing readiness failure details', async () => {
    (healthService.isReady as jest.Mock).mockResolvedValue(false);

    await expect(controller.ready(response)).resolves.toEqual({
      status: 'unavailable',
    });
    expect(status).toHaveBeenCalledWith(503);
  });
});
