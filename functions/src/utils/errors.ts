/**
 * Error types and helpers for the application
 */

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'NOT_FOUND_ERROR'
  | 'RATE_LIMIT_ERROR'
  | 'UPLOAD_ERROR'
  | 'AI_EXTRACTION_ERROR'
  | 'INTERNAL_ERROR';

export interface AppError {
  code: ErrorCode;
  message: string;
  details?: any;
}

export const createError = (code: ErrorCode, message: string, details?: any): AppError => ({
  code,
  message,
  details,
});

export const isAppError = (err: any): err is AppError => {
  return err && typeof err.code === 'string' && typeof err.message === 'string';
};