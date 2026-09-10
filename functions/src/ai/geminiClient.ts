/**
 * Gemini client — panggilan nyata ke Google Generative Language API.
 *
 * Sebelumnya file ini mengembalikan data hardcoded ("Toko Berkah", 125000)
 * sehingga hasil scan selalu sama. Sekarang benar-benar memanggil Gemini,
 * dengan fallback ke mock HANYA bila GEMINI_API_KEY belum diisi — supaya
 * UI tetap bisa dikembangkan tanpa key.
 */

import { GEMINI_API_KEY } from '../config/env.js';
import { receiptPrompt } from './prompts/receipt.prompt.js';
// voice.prompt.ts adalah file grab-bag: ia mengekspor
// VOICE_EXTRACTION_PROMPT (bukan `voicePrompt`) bersama beberapa
// prompt lain. Pakai nama yang benar-benar diekspor.
import { VOICE_EXTRACTION_PROMPT } from './prompts/voice.prompt.js';

export const SUPPORTED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
export const GEMINI_BATCH_SIZE = 5;
export const GEMINI_MAX_TOKENS = 1000;
export const GEMINI_TEMPERATURE = 0.1;

const MODEL = 'gemini-1.5-flash';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

export interface GeminiReceiptResult {
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

export interface GeminiVoiceResult {
  type: 'income' | 'expense' | null;
  amount: number | null;
  note: string | null;
  transactionDate: string | null;
  items: Array<{ name: string; qty: number | null; price: number | null }>;
  confidence: number;
  lowConfidenceFields: string[];
}

/** Gemini sering membungkus JSON dalam ```json ... ``` — bersihkan dulu. */
function parseJsonFromModel<T>(raw: string): T {
  let text = raw.trim();
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) text = fence[1].trim();
  const start = text.search(/[{[]/);
  if (start > 0) text = text.slice(start);
  const lastBrace = Math.max(text.lastIndexOf('}'), text.lastIndexOf(']'));
  if (lastBrace !== -1) text = text.slice(0, lastBrace + 1);
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Gemini mengembalikan JSON tidak valid: ${raw.slice(0, 200)}`);
  }
}

export class GeminiClient {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
  }

  get isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  /** Panggilan mentah ke Gemini. `parts` mengikuti format Generative Language API. */
  private async call(parts: unknown[], maxTokens = GEMINI_MAX_TOKENS): Promise<string> {
    const res = await fetch(`${ENDPOINT}?key=${this.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          temperature: GEMINI_TEMPERATURE,
          maxOutputTokens: maxTokens,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      throw new Error(`Gemini API error ${res.status}: ${detail.slice(0, 300)}`);
    }

    const data = (await res.json()) as any;
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Gemini tidak mengembalikan konten');
    return text;
  }

  /** Prompt bebas, balasan teks biasa (dipakai asisten chat). */
  async generateText(prompt: string, maxTokens = GEMINI_MAX_TOKENS): Promise<string> {
    if (!this.isConfigured) throw new Error('GEMINI_API_KEY not configured');
    const res = await fetch(`${ENDPOINT}?key=${this.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: maxTokens },
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      throw new Error(`Gemini API error ${res.status}: ${detail.slice(0, 300)}`);
    }
    const data = (await res.json()) as any;
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  async extractFromReceipt(
    imageBase64: string,
    mimeType = 'image/jpeg'
  ): Promise<GeminiReceiptResult> {
    if (!this.isConfigured) return mockReceipt();

    // Buang prefix data URL bila ada — API hanya mau base64 murni.
    const clean = imageBase64.replace(/^data:[^;]+;base64,/, '');

    const text = await this.call([
      { text: receiptPrompt },
      { inline_data: { mime_type: mimeType, data: clean } },
    ]);

    const parsed = parseJsonFromModel<Partial<GeminiReceiptResult>>(text);
    return {
      type: parsed.type ?? null,
      amount: parsed.amount ?? parsed.total ?? null,
      vendor: parsed.vendor ?? null,
      transactionDate: parsed.transactionDate ?? null,
      items: parsed.items ?? [],
      subtotal: parsed.subtotal ?? null,
      discount: parsed.discount ?? null,
      tax: parsed.tax ?? null,
      total: parsed.total ?? null,
      paymentMethod: parsed.paymentMethod ?? null,
      confidence: parsed.confidence ?? 0.5,
      lowConfidenceFields: parsed.lowConfidenceFields ?? [],
      imageQuality: parsed.imageQuality ?? 'medium',
    };
  }

  async extractFromVoice(transcript: string): Promise<GeminiVoiceResult> {
    if (!this.isConfigured) return mockVoice(transcript);

    const text = await this.call([
      { text: `${VOICE_EXTRACTION_PROMPT}\n\nTranskrip pengguna:\n"${transcript}"` },
    ]);

    const parsed = parseJsonFromModel<Partial<GeminiVoiceResult>>(text);
    return {
      type: parsed.type ?? null,
      amount: parsed.amount ?? null,
      note: parsed.note ?? transcript,
      transactionDate: parsed.transactionDate ?? null,
      items: parsed.items ?? [],
      confidence: parsed.confidence ?? 0.5,
      lowConfidenceFields: parsed.lowConfidenceFields ?? [],
    };
  }
}

// --- Fallback dev-only: dipakai hanya saat GEMINI_API_KEY kosong ---

function mockReceipt(): GeminiReceiptResult {
  console.warn('[gemini] GEMINI_API_KEY kosong — memakai data mock.');
  return {
    type: 'expense',
    amount: 125000,
    vendor: '[MOCK] Toko Berkah',
    transactionDate: new Date().toISOString().split('T')[0],
    items: [
      { name: 'Tepung', qty: 2, price: 45000 },
      { name: 'Minyak goreng', qty: 1, price: 35000 },
    ],
    subtotal: 125000,
    discount: 0,
    tax: 0,
    total: 125000,
    paymentMethod: 'tunai',
    confidence: 0.87,
    lowConfidenceFields: ['transactionDate'],
    imageQuality: 'medium',
  };
}

function mockVoice(transcript: string): GeminiVoiceResult {
  console.warn('[gemini] GEMINI_API_KEY kosong — memakai data mock.');
  return {
    type: 'income',
    amount: 30000,
    note: `[MOCK] ${transcript}`,
    transactionDate: null,
    items: [{ name: 'Mie ayam', qty: 2, price: 15000 }],
    confidence: 0.95,
    lowConfidenceFields: [],
  };
}

export const geminiClient = new GeminiClient();
