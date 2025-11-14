import { HttpStatus } from '../enums/HttpStatus';

/**
 * Clase base para errores personalizados de la aplicación
 */
export class AppError extends Error {
  public readonly statusCode: HttpStatus;
  public readonly error: string;
  public readonly details?: any;
  public readonly isOperational: boolean;

  constructor(
    error: string,
    message: string,
    statusCode: HttpStatus,
    details?: any,
    isOperational: boolean = true
  ) {
    super(message);
    
    this.error = error;
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
    
    this.name = this.constructor.name;
  }

  toJSON() {
    return {
      error: this.error,
      message: this.message,
      ...(this.details && { details: this.details }),
    };
  }
}
