import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../types/error';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof CustomError) {
    res.status(err.statusCode).json({
      message: err.message,
      errors: err.validationErrors
    });
    return;
  }

  // Handle other types of errors
  console.error('Unhandled error:', err);
  res.status(500).json({
    message: 'Internal server error'
  });
}; 