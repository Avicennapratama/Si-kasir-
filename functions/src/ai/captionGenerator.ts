/**
 * Social media caption generator — memakai Gemini sungguhan.
 */

import { GeminiClient } from './geminiClient.js';
import { captionPrompt } from './prompts/caption.prompt.js';

const client = new GeminiClient();

export interface CaptionInput {
  productName: string;
  category: string;
  targetAudience?: string;
  tone: 'ramah' | 'santai' | 'profesional' | 'semangat';
  platform: 'whatsapp' | 'instagram' | 'facebook' | 'tiktok';
  keywords?: string[];
}

export interface CaptionOutput {
  captions: [string, string, string];
}

function captionsFromRaw(raw: string): string[] {
  let text = raw.trim();
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) text = fence[1].trim();
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed?.captions)) return parsed.captions.filter(Boolean);
    if (Array.isArray(parsed)) return parsed.filter(Boolean);
  } catch {
    /* fallthrough */
  }
  return text.split('\n').map((l) => l.replace(/^[-*\d.)\s]+/, '').trim()).filter(Boolean);
}

export const generateProductCaptions = async (input: CaptionInput): Promise<CaptionOutput> => {
  if (!client.isConfigured) {
    console.warn('[caption] GEMINI_API_KEY kosong — memakai caption mock.');
    return {
      captions: [
        `[MOCK] Dapatkan ${input.productName} kualitas terbaik! Hubungi kami sekarang.`,
        `[MOCK] ${input.productName} pilihan terpercaya. Pesan sebelum kehabisan!`,
        `[MOCK] ${input.productName} untuk harimu. Yuk chat kami sekarang!`,
      ],
    };
  }

  const prompt = [
    captionPrompt,
    `\n\nData produk:`,
    `- Nama: ${input.productName}`,
    `- Kategori: ${input.category}`,
    input.targetAudience ? `- Target: ${input.targetAudience}` : '',
    `- Gaya: ${input.tone}`,
    `- Platform: ${input.platform}`,
    input.keywords?.length ? `- Kata kunci: ${input.keywords.join(', ')}` : '',
  ].filter(Boolean).join('\n');

  const raw = await client.generateText(prompt, 400);
  const list = captionsFromRaw(raw);

  while (list.length < 3) list.push(list[list.length - 1] ?? `Cek ${input.productName} sekarang!`);

  return { captions: [list[0], list[1], list[2]] };
};
