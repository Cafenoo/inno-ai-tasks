import { Request, Response, NextFunction } from 'express';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CustomError } from '../types/error';

function getErrorMessage(error: ValidationError): string {
  if (!error.constraints) return 'Validation failed';
  
  const constraints = Object.values(error.constraints);
  if (constraints.includes('email must be an email')) {
    return 'Invalid email format';
  }
  if (constraints.some(c => c.includes('should not be empty'))) {
    return 'Missing required field';
  }
  return 'Validation failed';
}

function flattenValidationErrors(errors: ValidationError[]): any[] {
  const result: any[] = [];
  for (const error of errors) {
    if (error.constraints) {
      result.push({ property: error.property, constraints: error.constraints });
    }
    if (error.children && error.children.length > 0) {
      const children = flattenValidationErrors(error.children).map(child => ({
        property: `${error.property}.${child.property}`,
        constraints: child.constraints
      }));
      result.push(...children);
    }
  }
  return result;
}

export const validateDto = (dtoClass: any) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const dtoObject = plainToInstance(dtoClass, req.body);
      const errors = await validate(dtoObject, {
        whitelist: true,
        forbidNonWhitelisted: true,
        skipMissingProperties: false,
        forbidUnknownValues: true,
        validationError: { target: false, value: false },
      });

      if (errors.length > 0) {
        const errorMessages = flattenValidationErrors(errors);
        const message = getErrorMessage(errors[0]);
        return next(new CustomError(message, 400, errorMessages));
      }

      req.body = dtoObject;
      next();
    } catch (error) {
      next(error);
    }
  };
}; 