import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { CustomError } from '../types/error';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.body) {
        throw new CustomError('Request body is required', 400);
      }

      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        throw new CustomError('Name, email and password are required', 400);
      }

      if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
        throw new CustomError('Invalid input types', 400);
      }

      if (name.trim().length === 0) {
        throw new CustomError('Name cannot be empty', 400);
      }

      if (!email.includes('@')) {
        throw new CustomError('Invalid email format', 400);
      }

      if (password.length < 6) {
        throw new CustomError('Password must be at least 6 characters long', 400);
      }

      const result = await AuthService.register(name, email, password);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.body) {
        throw new CustomError('Request body is required', 400);
      }

      const { email, password } = req.body;

      if (!email || !password) {
        throw new CustomError('Email and password are required', 400);
      }

      if (typeof email !== 'string' || typeof password !== 'string') {
        throw new CustomError('Invalid input types', 400);
      }

      if (!email.includes('@')) {
        throw new CustomError('Invalid email format', 400);
      }

      if (password.length < 6) {
        throw new CustomError('Password must be at least 6 characters long', 400);
      }

      const result = await AuthService.login(email, password);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
} 