import { createHash } from 'node:crypto';
import { ExecutionContext, Logger } from '@nestjs/common';
import { AuthSchDedupGuard } from './authsch-dedup.guard';

describe('AuthSchDedupGuard', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('blocks a duplicate without logging its OAuth code or headers', async () => {
    const oauthCode = 'duplicate-code-must-not-leak';
    const bearer = 'bearer-must-not-leak';
    const loggerLog = jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    const loggerWarn = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    const response = {
      status: jest.fn().mockReturnThis(),
      end: jest.fn(),
    };
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          query: { code: oauthCode },
          headers: { authorization: `Bearer ${bearer}` },
        }),
        getResponse: () => response,
      }),
    } as unknown as ExecutionContext;
    const guard = new AuthSchDedupGuard();
    (guard as unknown as { processedCodes: Set<string> }).processedCodes.add(
      createHash('sha256').update(oauthCode).digest('hex'),
    );

    await expect(guard.canActivate(context)).resolves.toBe(false);

    expect(response.status).toHaveBeenCalledWith(204);
    expect(response.end).toHaveBeenCalledTimes(1);
    const logged = JSON.stringify([...loggerLog.mock.calls, ...loggerWarn.mock.calls]);
    expect(logged).not.toContain(oauthCode);
    expect(logged).not.toContain(bearer);
    expect(logged).not.toContain('authorization');
  });
});
