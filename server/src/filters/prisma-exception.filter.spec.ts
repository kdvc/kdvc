import { PrismaExceptionFilter } from './prisma-exception.filter';
import { ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Prisma } from '../../prisma/generated/prisma/client';

describe('PrismaExceptionFilter', () => {
  let filter: PrismaExceptionFilter;

  beforeEach(() => {
    filter = new PrismaExceptionFilter();
  });

  it('should catch P2002 (Conflict)', () => {
    const mockJson = jest.fn();
    const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    const mockGetResponse = jest.fn().mockReturnValue({ status: mockStatus });
    const mockHttpArgumentsHost = jest.fn().mockReturnValue({
      getResponse: mockGetResponse,
      getRequest: jest.fn(),
    });

    const host = {
      switchToHttp: mockHttpArgumentsHost,
    } as unknown as ArgumentsHost;

    const exception = new Prisma.PrismaClientKnownRequestError('message', {
      code: 'P2002',
      clientVersion: '1',
      meta: { target: ['email'] },
    });

    filter.catch(exception, host);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.CONFLICT,
        message: expect.stringContaining('already exists'),
      }),
    );
  });

  it('should catch P2003 (Bad Request)', () => {
    const mockJson = jest.fn();
    const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    const mockGetResponse = jest.fn().mockReturnValue({ status: mockStatus });
    const mockHttpArgumentsHost = jest.fn().mockReturnValue({
      getResponse: mockGetResponse,
      getRequest: jest.fn(),
    });

    const host = {
      switchToHttp: mockHttpArgumentsHost,
    } as unknown as ArgumentsHost;

    const exception = new Prisma.PrismaClientKnownRequestError('message', {
      code: 'P2003',
      clientVersion: '1',
      meta: { field_name: 'userId' },
    });

    filter.catch(exception, host);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
      }),
    );
  });

  it('should catch P2025 (Not Found)', () => {
    const mockJson = jest.fn();
    const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    const mockGetResponse = jest.fn().mockReturnValue({ status: mockStatus });
    const mockHttpArgumentsHost = jest.fn().mockReturnValue({
      getResponse: mockGetResponse,
      getRequest: jest.fn(),
    });

    const host = {
      switchToHttp: mockHttpArgumentsHost,
    } as unknown as ArgumentsHost;

    const exception = new Prisma.PrismaClientKnownRequestError('message', {
      code: 'P2025',
      clientVersion: '1',
    });

    filter.catch(exception, host);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.NOT_FOUND,
      }),
    );
  });

  it('should catch default (Internal Server Error)', () => {
    const mockJson = jest.fn();
    const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    const mockGetResponse = jest.fn().mockReturnValue({ status: mockStatus });
    const mockHttpArgumentsHost = jest.fn().mockReturnValue({
      getResponse: mockGetResponse,
      getRequest: jest.fn(),
    });

    const host = {
      switchToHttp: mockHttpArgumentsHost,
    } as unknown as ArgumentsHost;

    const exception = new Prisma.PrismaClientKnownRequestError('message', {
      code: 'UNKNOWN',
      clientVersion: '1',
    });

    filter.catch(exception, host);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });
});
