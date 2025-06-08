import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { CustomError } from '../types/error';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        email: string;
      };
    }
  }
}

export const authenticateToken = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new CustomError('No token provided', 401);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new CustomError('Invalid token format', 401);
    }

    const decoded = await AuthService.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
}; 