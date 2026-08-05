import {
  ArgumentsHost,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { SafeExceptionFilter } from './safe-exception.filter';

describe('SafeExceptionFilter', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('replaces an unknown production error with an opaque error ID', () => {
    const logger = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
    const response = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    const host = {
      switchToHttp: () => ({
        getRequest: () => ({ method: 'GET', path: '/users' }),
        getResponse: () => response,
      }),
    } as unknown as ArgumentsHost;
    const secret = 'postgresql://user:password@private-db.example/users';
    const error = new Error(secret);

    new SafeExceptionFilter().catch(error, host);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.send).toHaveBeenCalledWith({
      statusCode: 500,
      message: 'Internal server error',
      errorId: expect.any(String),
    });
    const logged = JSON.stringify(logger.mock.calls);
    expect(logged).not.toContain(secret);
    expect(logged).not.toContain(error.stack);
    expect(logged).not.toContain('private-db.example');
  });

  it('also redacts the response body of an explicit 5xx HTTP exception', () => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    const response = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    const host = {
      switchToHttp: () => ({
        getRequest: () => ({ method: 'GET', path: '/health/ready' }),
        getResponse: () => response,
      }),
    } as unknown as ArgumentsHost;
    const secret = 'postgresql://user:password@private-db.example/database';

    new SafeExceptionFilter().catch(
      new InternalServerErrorException(secret),
      host,
    );

    expect(response.send).toHaveBeenCalledWith({
      statusCode: 500,
      message: 'Internal server error',
      errorId: expect.any(String),
    });
    expect(JSON.stringify(response.send.mock.calls)).not.toContain(secret);
  });
});
