/**
 * Rate limiting and usage configuration
 */

// Request rate limits per minute per user/business
export const RATE_LIMITS = {
  general: 60,       // 60 requests/minute general
  upload: 10,        // 10 uploads/minute
  ai_extract: 20,    // 20 AI extractions/minute
  caption_generate: 15, // 15 caption generations/minute
  voice_process: 25, // 25 voice processing/minute
};

// AI usage caps per user per day
export const AI_USAGE_CAPS = {
  receiptsPerDay: 50,
  voicePerDay: 30,
  captionsPerDay: 40,
};

// Confidence thresholds
export const CONFIDENCE_THRESHOLDS = {
  autoApprove: 0.95,    // Auto-save if confidence >= 0.95
  reviewNeeded: 0.80,   // Review if 0.80 <= confidence < 0.95
  manualEntry: 0.80,    // Manual entry if confidence < 0.80
};

// Retry configuration
export const RETRY_CONFIG = {
  maxAttempts: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffFactor: 2,
};

// Transaction limits
export const TRANSACTION_LIMITS = {
  maxItemsPerTransaction: 50,
  maxAmountPerTransaction: 10_000_000, // 10M IDR
  minAmount: 100,       // Minimum 100 IDR
};

// Date/range limits
export const DATE_LIMITS = {
  futureDaysAllowed: 30,    // Allow transactions up to 30 days in future
  pastDaysAllowed: 3650,    // Allow transactions up to 10 years in past
};