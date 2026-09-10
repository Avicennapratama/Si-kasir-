/**
 * Receipt extraction from image
 */

import { geminiClient, GeminiReceiptResult } from './geminiClient.js';
// RECEIPT_EXTRACTION_PROMPT is defined in voice.prompt.ts for voice extraction context
// For receipt-specific prompt, see docs/AI_PROMPTS.md

export const extractReceiptFromImage = async (imageBase64: string): Promise<GeminiReceiptResult> => {
  return geminiClient.extractFromReceipt(imageBase64);
};

export const validateReceiptResult = (result: any): result is GeminiReceiptResult => {
  return result && typeof result.confidence === 'number' && typeof result.type === 'string';
};