import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, body, query, headers } = req;
    const start = Date.now();

    this.logger.log(
      `INCOMING REQUEST ${method} ${originalUrl}\n` +
        `  Headers: ${JSON.stringify({ 'content-type': headers['content-type'], authorization: headers.authorization ? '[REDACTED]' : undefined })}\n` +
        `  Query: ${JSON.stringify(query)}\n` +
        `  Body: ${JSON.stringify(body)}`,
    );

    const originalJson = res.json.bind(res);

    res.json = (resBody: any) => {
      const duration = Date.now() - start;
      this.logger.log(
        `OUTGOING RESPONSE ${method} ${originalUrl} ${res.statusCode} (${duration}ms)\n` +
          `  Body: ${JSON.stringify(Object.fromEntries(Object.entries(resBody).filter(([key]) => key !== 'password')))}`,
      );
      return originalJson(resBody);
    };

    next();
  }
}
