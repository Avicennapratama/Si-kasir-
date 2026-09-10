/**
 * HKI Analyzer — valuasi indikatif kekayaan intelektual memakai Gemini.
 *
 * output prompt-nya (summary, indicativeScore, checklist, ...) dipetakan ke
 * bentuk HkiValuationResult yang dipakai controller agar kontrak tidak pecah.
 */

import { GeminiClient } from './geminiClient.js';
import { HkiPreValuationRequest, HkiValuationResult } from '../types/hki.js';
import { hkiPrompt } from './prompts/hki.prompt.js';

const client = new GeminiClient();

function parseJson(text: string): any {
  let t = text.trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) t = fence[1].trim();
  const start = t.search(/[{[]/);
  if (start > 0) t = t.slice(start);
  const end = Math.max(t.lastIndexOf('}'), t.lastIndexOf(']'));
  if (end !== -1) t = t.slice(0, end + 1);
  return JSON.parse(t);
}

export const analyzeHki = async (request: HkiPreValuationRequest): Promise<HkiValuationResult> => {
  if (!client.isConfigured) {
    console.warn('[hki] GEMINI_API_KEY kosong — memakai valuasi mock.');
    return {
      valuationId: 'hki_' + Date.now(),
      brandName: request.brandName,
      riskLevel: 'low',
      uniquenessScore: 85,
      suggestedClasses: ['30', '43'],
      recommendations: ['[MOCK] Isi GEMINI_API_KEY untuk analisis nyata'],
      estimatedCost: 1800000,
      confidence: 0.85,
      summary: '[MOCK] Analisis indikatif belum aktif.',
      createdAt: new Date().toISOString(),
    };
  }

  const prompt = [
    hkiPrompt,
    `\n\nData karya:`,
    `- Nama brand: ${request.brandName}`,
    request.category ? `- Kategori: ${request.category}` : '',
    request.description ? `- Deskripsi: ${request.description}` : '',
    request.creationDate ? `- Tanggal dibuat: ${request.creationDate}` : '',
    request.evidence?.length ? `- Bukti: ${request.evidence.join('; ')}` : '',
    request.usage ? `- Penggunaan: ${request.usage}` : '',
    request.targetMarket ? `- Pasar: ${request.targetMarket}` : '',
  ].filter(Boolean).join('\n');

  const raw = await client.generateText(prompt, 1500);
  let parsed: any = {};
  try {
    parsed = parseJson(raw);
  } catch {
    parsed = { summary: raw, confidence: 0.5 };
  }

  // Peta output prompt -> HkiValuationResult
  const clamp = (n: number) => Math.min(100, Math.max(0, Math.round(n)));
  return {
    valuationId: 'hki_' + Date.now(),
    brandName: request.brandName,
    riskLevel: 'medium',
    uniquenessScore: clamp(parsed.indicativeScore ?? 50),
    suggestedClasses: [],
    recommendations: [
      ...(Array.isArray(parsed.checklist) ? parsed.checklist : []),
      ...(Array.isArray(parsed.missingInformation)
        ? parsed.missingInformation.map((m: string) => `Lengkapi: ${m}`)
        : []),
    ],
    estimatedCost: 0, // biaya resmi berbeda tiap kelas; jangan dikarang AI
    confidence: parsed.confidence ?? 0.5,
    summary: parsed.summary ?? raw.slice(0, 400),
    disclaimer: parsed.disclaimer,
    createdAt: new Date().toISOString(),
  };
};
