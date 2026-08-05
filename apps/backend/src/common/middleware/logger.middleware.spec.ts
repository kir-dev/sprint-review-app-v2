import { Logger } from '@nestjs/common';
import { EventEmitter } from 'events';
import { Request, Response } from 'express';
import { LoggerMiddleware } from './logger.middleware';

describe('LoggerMiddleware', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('logs only request ID, method, query-less path, status and duration', () => {
    const logger = jest
      .spyOn(Logger.prototype, 'log')
      .mockImplementation(() => undefined);
    const responseEmitter = Object.assign(new EventEmitter(), {
      statusCode: 200,
      setHeader: jest.fn(),
    });
    const response = responseEmitter as unknown as Response;
    const request = {
      method: 'GET',
      // Nest mounts middleware on a route pattern, so Express may expose only
      // the mount-relative path here. originalUrl preserves the useful route.
      path: '/',
      originalUrl:
        '/auth/callback?code=oauth-code-must-not-leak&jwt=jwt-must-not-leak',
      query: { code: 'oauth-code-must-not-leak' },
      headers: {
        authorization: 'Bearer bearer-must-not-leak',
        cookie: 'session=cookie-must-not-leak',
      },
    } as unknown as Request;
    const next = jest.fn();

    new LoggerMiddleware().use(request, response, next);
    responseEmitter.emit('finish');

    expect(next).toHaveBeenCalledTimes(1);
    expect(response.setHeader).toHaveBeenCalledWith(
      'X-Request-ID',
      expect.any(String),
    );
    expect(logger).toHaveBeenCalledWith({
      requestId: expect.any(String),
      method: 'GET',
      path: '/auth/callback',
      status: 200,
      durationMs: expect.any(Number),
    });

    const logged = JSON.stringify(logger.mock.calls);
    expect(logged).not.toContain('oauth-code-must-not-leak');
    expect(logged).not.toContain('jwt-must-not-leak');
    expect(logged).not.toContain('bearer-must-not-leak');
    expect(logged).not.toContain('cookie-must-not-leak');
    expect(logged).not.toContain('?');
  });
});
