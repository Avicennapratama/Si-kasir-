/**
 * Environment configuration for Firebase Functions
 * Read from process.env with defaults for local development
 */

// Firebase project config
export const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'sikasir-ai';

// AI service configuration
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
export const VERTEX_AI_PROJECT = process.env.VERTEX_AI_PROJECT || '';
export const VERTEX_AI_LOCATION = process.env.VERTEX_AI_LOCATION || 'us-central1';

// Rate limiting
export const DEFAULT_RATE_LIMIT = Number(process.env.DEFAULT_RATE_LIMIT) || 100; // requests per minute
export const UPLOAD_RATE_LIMIT = Number(process.env.UPLOAD_RATE_LIMIT) || 10; // requests per minute

// Storage configuration
export const MAX_UPLOAD_SIZE = Number(process.env.MAX_UPLOAD_SIZE) || 5 * 1024 * 1024; // 5MB
export const ALLOWED_MIME_TYPES = process.env.ALLOWED_MIME_TYPES || 'image/*,application/pdf';

// Feature flags
export const ENABLE_VERTEX_AI = process.env.ENABLE_VERTEX_AI === 'true';
export const ENABLE_ANALYTICS = process.env.ENABLE_ANALYTICS !== 'false';

export const NODE_ENV = process.env.NODE_ENV || 'development';

if (NODE_ENV === 'production') {
  if (!GEMINI_API_KEY) {
    console.warn('WARNING: GEMINI_API_KEY not set in production environment');
  }
  if (!VERTEX_AI_PROJECT) {
    console.warn('WARNING: VERTEX_AI_PROJECT not set in production environment');
  }
}