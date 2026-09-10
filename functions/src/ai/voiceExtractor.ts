/**
 * Voice transaction extractor
 */

import { geminiClient, GeminiVoiceResult } from './geminiClient.js';
import { VOICE_EXTRACTION_PROMPT } from './prompts/voice.prompt.js';

export const extractVoiceTransaction = async (transcript: string): Promise<GeminiVoiceResult> => {
  // Use Gemini client for extraction
  return geminiClient.extractFromVoice(transcript);
};

export const normalizeVoiceAmount = (amountText: string): number | null => {
  // Convert Indonesian text amounts to integer
  const text = amountText.toLowerCase().replace(/[^0-9a-zA-Z]/g, '');
  if (text.includes('rb') || text.includes('ribu')) {
    const num = parseFloat(text.replace('ribu', '').replace('rb', ''));
    return Math.round(num * 1000);
  }
  if (text.includes('jt') || text.includes('juta')) {
    const num = parseFloat(text.replace('juta', '').replace('jt', ''));
    return Math.round(num * 1000000);
  }
  const num = parseFloat(text);
  return isNaN(num) ? null : num;
};