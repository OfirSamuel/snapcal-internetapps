import { Request, Response, NextFunction } from 'express';
import { protect } from './auth.middleware';
import { signAccessToken } from '../modules/auth/auth.utils';
import { clearTestDB, connectTestDB, disconnectTestDB } from '../test/testDb';

jest.setTimeout(30000);

describe('auth Middleware (JWT)', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeAll(async () => {
    process.env.JWT_ACCESS_SECRET = 'test_access_secret';
    process.env.JWT_REFRESH_SECRET = 'test_refresh_secret';
    process.env.JWT_ACCESS_EXPIRES_IN = '15m';
    process.env.JWT_REFRESH_EXPIRES_IN = '7d';
    await connectTestDB();
  });

  beforeEach(() => {
    mockRequest = { headers: {} };
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    mockResponse = { status: statusMock } as unknown as Partial<Response>;
    nextFunction = jest.fn();
  });

  afterEach(async () => {
    await clearTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  test('returns 401 when authorization header is missing', () => {
    protect(mockRequest as any, mockResponse as Response, nextFunction);

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({ message: 'Unauthorized: missing bearer token' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  test('returns 401 when bearer token is invalid', () => {
    mockRequest.headers = { authorization: 'Bearer invalid.token.value' };

    protect(mockRequest as any, mockResponse as Response, nextFunction);

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({ message: 'Unauthorized: invalid or expired token' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  test('attaches user and calls next when token is valid', () => {
    const token = signAccessToken({
      userId: '650af3b2e4b0a1a2b3c4d5e6',
      email: 'middleware@test.com',
    });
    mockRequest.headers = { authorization: `Bearer ${token}` };

    protect(mockRequest as any, mockResponse as Response, nextFunction);

    expect((mockRequest as any).user).toEqual({
      id: '650af3b2e4b0a1a2b3c4d5e6',
      email: 'middleware@test.com',
    });
    expect(nextFunction).toHaveBeenCalled();
  });
});
