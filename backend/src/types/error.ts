export class CustomError extends Error {
  statusCode: number;
  validationErrors?: any[];

  constructor(
    message: string,
    statusCode: number,
    validationErrors?: any[]
  ) {
    super(message);
    this.statusCode = statusCode;
    this.validationErrors = validationErrors;
    this.name = 'CustomError';
  }
} 