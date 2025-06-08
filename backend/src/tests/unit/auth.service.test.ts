jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
  let AuthService: any;
  let CustomError: any;
  let bcrypt: any;
  let jwt: any;
  let mockRepository: any;
  let mockDataSource: any;

  beforeEach(() => {
    jest.resetModules();
    AuthService = require('../../services/auth.service').AuthService;
    CustomError = require('../../types/error').CustomError;
    bcrypt = require('bcrypt');
    jwt = require('jsonwebtoken');

    mockRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    mockDataSource = {
      getRepository: jest.fn().mockReturnValue(mockRepository),
      getMetadata: jest.fn().mockReturnValue({
        name: 'Auth',
        columns: [
          { propertyName: 'id', type: 'int' },
          { propertyName: 'name', type: 'string' },
          { propertyName: 'email', type: 'string' },
          { propertyName: 'password_hash', type: 'string' }
        ]
      })
    };

    AuthService.setDataSource(mockDataSource);

    (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue('mockToken');
    (jwt.verify as jest.Mock).mockReturnValue({ userId: 1, email: 'test@example.com' });
  });

  describe('register', () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    };

    it('should register a new user successfully', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue({ ...userData, id: 1 });
      mockRepository.save.mockResolvedValue({ ...userData, id: 1 });

      const result = await AuthService.register(userData.name, userData.email, userData.password);

      expect(result).toBeDefined();
      expect(result.token).toBeDefined();
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { email: userData.email } });
      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: 1, email: userData.email },
        expect.any(String),
        { expiresIn: '24h' }
      );
    });

    it('should throw error if email already exists', async () => {
      mockRepository.findOne.mockResolvedValue({ id: 1, ...userData });

      await expect(AuthService.register(userData.name, userData.email, userData.password))
        .rejects.toThrow(CustomError);
      await expect(AuthService.register(userData.name, userData.email, userData.password))
        .rejects.toThrow('Email already registered');
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { email: userData.email } });
      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
      expect(bcrypt.hash).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const credentials = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login successfully with correct credentials', async () => {
      const hashedPassword = 'hashedPassword';
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: credentials.email,
        password_hash: hashedPassword,
      };

      mockRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await AuthService.login(credentials.email, credentials.password);

      expect(result).toBeDefined();
      expect(result.token).toBe('mockToken');
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { email: credentials.email } });
      expect(bcrypt.compare).toHaveBeenCalledWith(credentials.password, hashedPassword);
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: mockUser.id, email: mockUser.email },
        expect.any(String),
        { expiresIn: '24h' }
      );
    });

    it('should throw error if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(AuthService.login(credentials.email, credentials.password))
        .rejects.toThrow(CustomError);
      await expect(AuthService.login(credentials.email, credentials.password))
        .rejects.toThrow('Invalid credentials');
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { email: credentials.email } });
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    it('should throw error if password is incorrect', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: credentials.email,
        password_hash: 'hashedPassword',
      };

      mockRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(AuthService.login(credentials.email, credentials.password))
        .rejects.toThrow(CustomError);
      await expect(AuthService.login(credentials.email, credentials.password))
        .rejects.toThrow('Invalid credentials');
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { email: credentials.email } });
      expect(bcrypt.compare).toHaveBeenCalledWith(credentials.password, mockUser.password_hash);
      expect(jwt.sign).not.toHaveBeenCalled();
    });
  });

  describe('verifyToken', () => {
    const token = 'valid.token.here';

    it('should verify token successfully', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
      };

      (jwt.verify as jest.Mock).mockReturnValue({ userId: 1, email: mockUser.email });
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await AuthService.verifyToken(token);

      expect(result).toBeDefined();
      expect(result.userId).toBe(1);
      expect(result.email).toBe(mockUser.email);
      expect(jwt.verify).toHaveBeenCalledWith(token, expect.any(String));
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw error if token is invalid', async () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new jwt.JsonWebTokenError('Invalid token');
      });

      await expect(AuthService.verifyToken(token)).rejects.toThrow(CustomError);
      await expect(AuthService.verifyToken(token)).rejects.toThrow('Invalid token');
      expect(jwt.verify).toHaveBeenCalledWith(token, expect.any(String));
      expect(mockRepository.findOne).not.toHaveBeenCalled();
    });

    it('should throw error if user not found', async () => {
      (jwt.verify as jest.Mock).mockReturnValue({ userId: 1, email: 'test@example.com' });
      mockRepository.findOne.mockResolvedValue(null);

      await expect(AuthService.verifyToken(token)).rejects.toThrow(CustomError);
      await expect(AuthService.verifyToken(token)).rejects.toThrow('User not found');
      expect(jwt.verify).toHaveBeenCalledWith(token, expect.any(String));
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw error if token is expired', async () => {
      const expiredError = new jwt.TokenExpiredError('Token expired', new Date());
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw expiredError;
      });

      await expect(AuthService.verifyToken(token)).rejects.toThrow(CustomError);
      await expect(AuthService.verifyToken(token)).rejects.toThrow('Token expired');
      expect(jwt.verify).toHaveBeenCalledWith(token, expect.any(String));
      expect(mockRepository.findOne).not.toHaveBeenCalled();
    });
  });
}); 