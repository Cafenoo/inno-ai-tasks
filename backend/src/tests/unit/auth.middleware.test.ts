import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../../services/auth.service';
import { CustomError } from '../../types/error';

// Mock the auth service
jest.mock('../../services/auth.service', () => ({
  AuthService: {
    verifyToken: jest.fn()
  }
}));

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        throw new CustomError('No token provided', 401);
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        throw new CustomError('Invalid token format', 401);
      }

      const user = await AuthService.verifyToken(token);
      (req as any).user = user;
      next();
    } catch (error) {
      next(error);
    }
  };

  beforeEach(() => {
    mockRequest = {
      headers: {
        authorization: 'Bearer test-token'
      }
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    nextFunction = jest.fn();
  });

  it('should call next() when token is valid', async () => {
    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com'
    };

    (AuthService.verifyToken as jest.Mock).mockResolvedValue(mockUser);

    await authMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(AuthService.verifyToken).toHaveBeenCalledWith('test-token');
    expect(nextFunction).toHaveBeenCalled();
    expect((mockRequest as any).user).toEqual(mockUser);
  });

  it('should return 401 when no token is provided', async () => {
    mockRequest.headers = {};

    await authMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'No token provided',
        statusCode: 401
      })
    );
  });

  it('should return 401 when token is invalid', async () => {
    (AuthService.verifyToken as jest.Mock).mockRejectedValue(
      new CustomError('Invalid token', 401)
    );

    await authMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Invalid token',
        statusCode: 401
      })
    );
  });
}); 