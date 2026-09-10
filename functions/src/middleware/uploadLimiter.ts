/**
 * Upload Limiter Middleware
 */

import { MAX_UPLOAD_SIZE } from '../config/env.js';
import { Request, Response, NextFunction } from 'express';

export const uploadLimiter = (maxSizeMB = 5): ((req: Request, res: Response, next: NextFunction) => void) => {
  const maxBytes = maxSizeMB * 1024 * 1024;

  return (req: Request, res: Response, next: NextFunction): void => {
    const file = (req as any).file || (req as any).files?.[0];
    if (file && file.size && file.size > maxBytes) {
      res.status(400).json({ error: `File too large. Max ${maxSizeMB}MB allowed` });
      return;
    }
    next();
  };
};