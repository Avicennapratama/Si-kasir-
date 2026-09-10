/**
 * AI-related types
 */

export interface AIConfig {
  provider: 'gemini' | 'vertex';
  temperature: number;
  maxTokens: number;
}

export interface ExtractedTransaction {
  id: string;
  type: 'income' | 'expense' | null;
  amount: number | null;
  vendor: string | null;
  transactionDate: string | null;
  notes: string | null;
  items: Array<{ name: string; qty?: number | null; price?: number | null }>;
  confidence: number;
  lowConfidenceFields: string[];
  source: 'voice' | 'receipt' | 'manual';
  createdAt: string;
}

export interface CaptionVariation {
  caption: string;
  platform: string;
  tone: string;
}

export interface AIUsageRecord {
  id: string;
  businessId: string;
  feature: 'receipt_extraction' | 'voice_extraction' | 'caption_generation' | 'image_enhancement' | 'hki_valuation' | 'assistant_chat';
  count: number;
  date: string;
  createdAt: string;
}

export interface ImageEnhancementResult {
  resultMediaAssetId: string;
  originalMediaAssetId: string;
  resultUrl: string;
  status: 'processing' | 'completed' | 'failed';
}