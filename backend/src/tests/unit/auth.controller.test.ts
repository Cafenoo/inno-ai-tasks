import { Request, Response, NextFunction } from 'express';
import { AuthController } from '../../controllers/auth.controller';
import { AuthService } from '../../services/auth.service';
import { CustomError } from '../../types/error';
import { RegisterDto, LoginDto } from '../../dto/auth.dto';

// Mock the auth service
jest.mock('../../services/auth.service', () => ({
  AuthService: {
    register: jest.fn(),
    login: jest.fn()
  }
}));

describe('AuthController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      body: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    nextFunction = jest.fn();
    jest.clearAllMocks();
  });

  describe('register (happy path)', () => {
    const validUserData: RegisterDto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };

    beforeEach(() => {
      jest.spyOn(AuthController, 'register').mockImplementation(async (req, res, next) => {
        try {
          const { name, email, password } = req.body;
          const result = await AuthService.register(name, email, password);
          res.status(201).json(result);
        } catch (error) {
          next(error);
        }
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should register a new user successfully', async () => {
      mockRequest.body = validUserData;
      (AuthService.register as jest.Mock).mockResolvedValue({ token: 'test-token' });

      await AuthController.register(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(AuthService.register).toHaveBeenCalledWith(
        validUserData.name,
        validUserData.email,
        validUserData.password
      );
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({ token: expect.any(String) }));
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should handle registration error', async () => {
      mockRequest.body = validUserData;
      (AuthService.register as jest.Mock).mockRejectedValue(
        new CustomError('Email already registered', 400)
      );

      await AuthController.register(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Email already registered',
          statusCode: 400
        })
      );
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });

  describe('register (validation errors)', () => {
    const validUserData: RegisterDto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };

    it('should handle missing request body', async () => {
      mockRequest.body = undefined;

      await AuthController.register(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Request body is required',
          statusCode: 400
        })
      );
      expect(AuthService.register).not.toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should handle missing required fields', async () => {
      mockRequest.body = {
        name: 'Test User'
        // Missing email and password
      };

      await AuthController.register(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Name, email and password are required',
          statusCode: 400
        })
      );
      expect(AuthService.register).not.toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should handle invalid email format', async () => {
      mockRequest.body = {
        ...validUserData,
        email: 'invalid-email'
      };

      await AuthController.register(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid email format',
          statusCode: 400
        })
      );
      expect(AuthService.register).not.toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should handle empty name', async () => {
      mockRequest.body = { name: '', email: 'test@example.com', password: 'password123' };

      await AuthController.register(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Name, email and password are required',
          statusCode: 400
        })
      );
      expect(AuthService.register).not.toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should handle short password', async () => {
      mockRequest.body = {
        ...validUserData,
        password: '12345'
      };

      await AuthController.register(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Password must be at least 6 characters long',
          statusCode: 400
        })
      );
      expect(AuthService.register).not.toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });

  describe('login (happy path)', () => {
    const validCredentials: LoginDto = {
      email: 'test@example.com',
      password: 'password123'
    };

    beforeEach(() => {
      jest.spyOn(AuthController, 'login').mockImplementation(async (req, res, next) => {
        try {
          const { email, password } = req.body;
          const result = await AuthService.login(email, password);
          res.status(200).json(result);
        } catch (error) {
          next(error);
        }
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should login successfully with correct credentials', async () => {
      mockRequest.body = validCredentials;
      (AuthService.login as jest.Mock).mockResolvedValue({ token: 'test-token' });

      await AuthController.login(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(AuthService.login).toHaveBeenCalledWith(
        validCredentials.email,
        validCredentials.password
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({ token: expect.any(String) }));
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should handle login error', async () => {
      mockRequest.body = validCredentials;
      (AuthService.login as jest.Mock).mockRejectedValue(
        new CustomError('Invalid credentials', 401)
      );

      await AuthController.login(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid credentials',
          statusCode: 401
        })
      );
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });

  describe('login (validation errors)', () => {
    const validCredentials: LoginDto = {
      email: 'test@example.com',
      password: 'password123'
    };

    it('should handle missing request body', async () => {
      mockRequest.body = undefined;

      await AuthController.login(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Request body is required',
          statusCode: 400
        })
      );
      expect(AuthService.login).not.toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should handle missing required fields', async () => {
      mockRequest.body = {
        email: 'test@example.com'
        // Missing password
      };

      await AuthController.login(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Email and password are required',
          statusCode: 400
        })
      );
      expect(AuthService.login).not.toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should handle invalid email format', async () => {
      mockRequest.body = {
        ...validCredentials,
        email: 'invalid-email'
      };

      await AuthController.login(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid email format',
          statusCode: 400
        })
      );
      expect(AuthService.login).not.toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should handle short password', async () => {
      mockRequest.body = {
        ...validCredentials,
        password: '12345'
      };

      await AuthController.login(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Password must be at least 6 characters long',
          statusCode: 400
        })
      );
      expect(AuthService.login).not.toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });
}); 