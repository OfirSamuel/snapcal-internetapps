import { Request, Response, NextFunction } from 'express';
import { errorHandler } from './error.middleware';

describe('errorHandler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      statusCode: 200,
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  test('should return 500 status code if res.statusCode is 200', () => {
    const error = new Error('Test Error');
    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Test Error',
      stack: expect.any(String),
    });
  });

  test('should return existing status code if res.statusCode is not 200', () => {
    mockResponse.statusCode = 404;
    const error = new Error('Not Found');
    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Not Found',
      stack: expect.any(String),
    });
  });

  test('should hide stack in production', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    
    mockResponse.statusCode = 500;
    const error = new Error('Internal Server Error');
    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Internal Server Error',
      stack: null,
    });

    process.env.NODE_ENV = originalEnv;
  });
});
