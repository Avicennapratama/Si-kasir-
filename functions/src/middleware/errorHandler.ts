/**
 * Error Handler Middleware
 */

import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  console.error('Error handler caught:', err);

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';

  // Don't leak stack in production
  const response = status === 500
    ? 'Internal server error'
    : message;

  res.status(status).json({ error: response });
};