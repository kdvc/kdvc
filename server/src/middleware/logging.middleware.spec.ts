import { LoggingMiddleware } from './logging.middleware';
import { Request, Response, NextFunction } from 'express';
import { Logger } from '@nestjs/common';

describe('LoggingMiddleware', () => {
  let middleware: LoggingMiddleware;
  let loggerSpy: jest.SpyInstance;

  beforeEach(() => {
    middleware = new LoggingMiddleware();
    loggerSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should log incoming request and outgoing response', () => {
    const req = {
      method: 'GET',
      originalUrl: '/test',
      body: { key: 'value' },
      query: { q: 'search' },
      headers: { 'content-type': 'application/json' },
    } as unknown as Request;

    const res = {
      statusCode: 200,
      json: jest.fn(),
    } as unknown as Response;

    const next: NextFunction = jest.fn();

    // Call middleware
    middleware.use(req, res, next);

    // Verify incoming log
    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining('INCOMING REQUEST GET /test'),
    );
    expect(next).toHaveBeenCalled();

    // Verify outgoing log (trigger res.json)
    res.json({ success: true });
    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining('OUTGOING RESPONSE GET /test 200'),
    );
  });
});
