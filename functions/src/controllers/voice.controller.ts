/**
 * Voice Controller — ekstraksi transaksi dari transkrip suara lewat Gemini.
 */

import { Request, Response } from 'express';
import { z } from 'zod';
import { geminiClient } from '../ai/geminiClient.js';

export const aiExtractVoice = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'POST required' });
      return;
    }

    const voiceSchema = z.object({
      transcript: z.string().min(1, 'transcript wajib diisi'),
    });

    const parsed = voiceSchema.parse(req.body);

    // Fallback ke mock bertanda [MOCK] hanya saat GEMINI_API_KEY kosong.
    const result = await geminiClient.extractFromVoice(parsed.transcript);

    res.json({ success: true, data: result });
  } catch (err) {
    const e = err as Error & { issues?: unknown };
    if (e.name === 'ZodError') {
      res.status(400).json({ error: 'Payload tidak valid', detail: e.issues });
      return;
    }
    res.status(500).json({ error: e.message || 'Gagal memproses suara' });
  }
};
