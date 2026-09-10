/**
 * Google Gemini configuration and types
 */

export interface GeminiResponse {
  type: 'income' | 'expense' | null;
  amount: number | null;
  vendor: string | null;
  transactionDate: string | null;
  items: Array<{ name: string; qty: number | null; price: number | null }>;
  subtotal: number | null;
  discount: number | null;
  tax: number | null;
  total: number | null;
  paymentMethod: string | null;
  confidence: number;
  lowConfidenceFields: string[];
  imageQuality: 'good' | 'medium' | 'poor';
}

export const SUPPORTED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
export const GEMINI_BATCH_SIZE = 5;
export const GEMINI_MAX_TOKENS = 1000;
export const GEMINI_TEMPERATURE = 0.1;
