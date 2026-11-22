/**
 * Global error handling middleware
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';
import { ApiResponse } from '../types';
import { config } from '../config/config';

/**
 * Custom application error
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handler middleware
 */
export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log error
  logger.error('Error occurred', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
  });

  // Determine status code
  let statusCode = 500;
  let code = 'INTERNAL_SERVER_ERROR';
  let message = 'An unexpected error occurred';

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    code = error.code;
    message = error.message;
  } else if (error.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = error.message;
  } else if (error.name === 'UnauthorizedError') {
    statusCode = 401;
    code = 'UNAUTHORIZED';
    message = 'Unauthorized access';
  }

  // Build error response
  const errorResponse: ApiResponse<never> = {
    status: 'error',
    error: {
      code,
      message,
    },
    metadata: {
      timestamp: new Date().toISOString(),
      version: config.apiVersion,
      cached: false,
    },
  };

  // Include stack trace in development
  if (config.nodeEnv === 'development') {
    (errorResponse.error as unknown as Record<string, unknown>).stack = error.stack;
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = new AppError(
    404,
    'NOT_FOUND',
    `Route ${req.method} ${req.url} not found`
  );
  next(error);
};
