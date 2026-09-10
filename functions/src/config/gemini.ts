/**
 * Google Gemini Flash Vision client wrapper
 * Lightweight client using native fetch to avoid external SDK dependency
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

export class GeminiClient {
  private apiKey: string;
  private endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || '';
  }

  async generateText(prompt: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }
    const response = await fetch(`${this.endpoint}?key=${this.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: GEMINI_TEMPERATURE,
          maxOutputTokens: GEMINI_MAX_TOKENS,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data: any = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }
}

export const geminiClient = new GeminiClient();
