import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '../../prisma/generated/prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    switch (exception.code) {
      case 'P2002': {
        const fields = (exception.meta?.target as string[]) ?? [];
        response.status(HttpStatus.CONFLICT).json({
          statusCode: HttpStatus.CONFLICT,
          message: `Resource with duplicate ${fields.join(', ')} already exists`,
          error: 'Conflict',
        });
        break;
      }

      case 'P2003': {
        const field = (exception.meta?.field_name as string) ?? 'unknown';
        response.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          message: `Related resource not found (foreign key: ${field})`,
          error: 'Bad Request',
        });
        break;
      }

      case 'P2025': {
        response.status(HttpStatus.NOT_FOUND).json({
          statusCode: HttpStatus.NOT_FOUND,
          message: (exception.meta?.cause as string) ?? 'Resource not found',
          error: 'Not Found',
        });
        break;
      }

      default:
        response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal server error',
          error: 'Internal Server Error',
        });
    }
  }
}
