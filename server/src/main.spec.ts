import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// Mock dependencies
jest.mock('@nestjs/core');
jest.mock('./app.module');
jest.mock('cookie-parser', () => jest.fn());

// Mock Swagger
jest.mock('@nestjs/swagger', () => ({
  SwaggerModule: {
    createDocument: jest.fn(),
    setup: jest.fn(),
  },
  DocumentBuilder: jest.fn().mockImplementation(() => ({
    setTitle: jest.fn().mockReturnThis(),
    setDescription: jest.fn().mockReturnThis(),
    setVersion: jest.fn().mockReturnThis(),
    addTag: jest.fn().mockReturnThis(),
    addBearerAuth: jest.fn().mockReturnThis(),
    addSecurityRequirements: jest.fn().mockReturnThis(),
    build: jest.fn(),
  })),
  ApiTags: jest.fn(() => jest.fn()),
  ApiOperation: jest.fn(() => jest.fn()),
  ApiBody: jest.fn(() => jest.fn()),
  ApiResponse: jest.fn(() => jest.fn()),
  ApiParam: jest.fn(() => jest.fn()),
  ApiQuery: jest.fn(() => jest.fn()),
  ApiHeader: jest.fn(() => jest.fn()),
  ApiBearerAuth: jest.fn(() => jest.fn()),
  ApiProperty: jest.fn(() => jest.fn()),
  ApiPropertyOptional: jest.fn(() => jest.fn()),
}));

describe('Main', () => {
  it('should bootstrap', () => {
    const mockApp = {
      use: jest.fn(),
      enableCors: jest.fn(),
      useGlobalPipes: jest.fn(),
      useGlobalFilters: jest.fn(),
      listen: jest.fn(),
    };

    (NestFactory.create as jest.Mock).mockResolvedValue(mockApp);

    // Import main to trigger execution
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('./main');

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(NestFactory.create).toHaveBeenCalledWith(AppModule);
    expect(mockApp.listen).toHaveBeenCalled(expect.anything());
  });
});
