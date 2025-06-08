import { DataSource, Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { Auth } from '../entities/auth.entity';
import { CustomError } from '../types/error';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

export class AuthService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET ?? 'your-secret-key';
  private static readonly SALT_ROUNDS = 10;
  private static dataSource: DataSource = AppDataSource;

  static setDataSource(ds: DataSource) {
    this.dataSource = ds;
  }

  private static get authRepository(): Repository<Auth> {
    return this.dataSource.getRepository(Auth);
  }

  static async register(name: string, email: string, password: string): Promise<{ token: string }> {
    // Check if user already exists
    const existingUser = await this.authRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new CustomError('Email already registered', 400);
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, this.SALT_ROUNDS);

    // Create new user
    const user = this.authRepository.create({
      name,
      email,
      password_hash
    });

    await this.authRepository.save(user);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      this.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return { token };
  }

  static async login(email: string, password: string): Promise<{ token: string }> {
    // Find user
    const user = await this.authRepository.findOne({ where: { email } });
    if (!user) {
      throw new CustomError('Invalid credentials', 401);
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new CustomError('Invalid credentials', 401);
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      this.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return { token };
  }

  static async verifyToken(token: string): Promise<{ userId: number; email: string }> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as { userId: number; email: string };
      
      // Verify user exists
      const user = await this.authRepository.findOne({ where: { id: decoded.userId } });
      if (!user) {
        throw new CustomError('User not found', 404);
      }
      
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new CustomError('Token expired', 401);
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new CustomError('Invalid token', 401);
      }
      throw error; // Re-throw unexpected errors
    }
  }
} 