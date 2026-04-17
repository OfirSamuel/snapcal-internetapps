import { Request, Response, NextFunction } from 'express';
import { protect } from './auth.middleware';

describe('auth Middleware (Mock)', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {};
  });

  test('should attach mock user to request and call next()', () => {
    protect(mockRequest as any, mockResponse as Response, nextFunction);

    expect((mockRequest as any).user).toEqual({
      id: '650af3b2e4b0a1a2b3c4d5e6',
      username: 'ofir_dev',
    });
    expect(nextFunction).toHaveBeenCalled();
  });
});
