import {
  ArgumentsHost,
  BadRequestException,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { HttpExceptionFilter } from '../../common/filters/http-exception.filter';

const mockLogger = {
  error: jest.fn(),
} as unknown as Logger;

function buildMockHost(method = 'GET', url = '/test') {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  const getResponse = jest.fn().mockReturnValue({ status });
  const getRequest = jest.fn().mockReturnValue({ method, url });
  const switchToHttp = jest.fn().mockReturnValue({ getResponse, getRequest });
  const host = { switchToHttp } as unknown as ArgumentsHost;
  return { host, status, json };
}

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;

  beforeEach(() => {
    jest.clearAllMocks();
    filter = new HttpExceptionFilter(mockLogger);
  });

  it('returns 400 with string message for BadRequestException with string body', () => {
    const { host, status, json } = buildMockHost();
    filter.catch(new BadRequestException('email is invalid'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(json).toHaveBeenCalledWith({ message: 'email is invalid' });
  });

  it('returns 404 with message for NotFoundException', () => {
    const { host, status, json } = buildMockHost();
    filter.catch(new NotFoundException('Student not found'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(json).toHaveBeenCalledWith({ message: 'Student not found' });
  });

  it('joins array message from ValidationPipe into a single string', () => {
    const { host, json } = buildMockHost();
    const exception = new BadRequestException(['error one', 'error two']);
    filter.catch(exception, host);

    expect(json).toHaveBeenCalledWith({ message: 'error one; error two' });
  });

  it('falls back to exception.message when body message is not a string or array', () => {
    const { host, json } = buildMockHost();
    const exception = new HttpException(
      { message: 42 },
      HttpStatus.BAD_REQUEST,
    );
    filter.catch(exception, host);

    expect((json.mock.calls[0][0] as { message: string }).message).toBeTruthy();
  });

  it('returns 500 with generic message for non-HttpException errors', () => {
    const { host, status, json } = buildMockHost();
    filter.catch(new Error('unexpected'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(json).toHaveBeenCalledWith({ message: 'Internal server error' });
  });

  it('logs 5xx errors via the logger', () => {
    const { host } = buildMockHost('POST', '/api/register');
    const error = new Error('db connection lost');
    filter.catch(error, host);

    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        err: error,
        method: 'POST',
        url: '/api/register',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      }),
      'Unhandled server error',
    );
  });

  it('does not log 4xx errors', () => {
    const { host } = buildMockHost();
    filter.catch(new BadRequestException('bad input'), host);

    expect(mockLogger.error).not.toHaveBeenCalled();
  });

  it('handles plain string body (not an object)', () => {
    const { host, json } = buildMockHost();
    const exception = new HttpException(
      'plain string body',
      HttpStatus.FORBIDDEN,
    );
    filter.catch(exception, host);

    expect(json).toHaveBeenCalledWith({ message: 'plain string body' });
  });
});
