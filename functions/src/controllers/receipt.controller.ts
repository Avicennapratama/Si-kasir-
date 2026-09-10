/**
 * Receipt Controller — ekstraksi nota memakai Gemini Vision sungguhan.
 */

import { Request, Response } from 'express';
import { z } from 'zod';
import { geminiClient } from '../ai/geminiClient.js';

export const aiExtractReceipt = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'POST required' });
      return;
    }

    const receiptSchema = z.object({
      imageBase64: z.string().min(1, 'imageBase64 wajib diisi'),
      mimeType: z.string().optional(),
    });

    const parsed = receiptSchema.parse(req.body);

    // Panggil Gemini Vision asli (fallback ke mock bertanda [MOCK]
    // hanya bila GEMINI_API_KEY belum diisi).
    const result = await geminiClient.extractFromReceipt(
      parsed.imageBase64,
      parsed.mimeType || 'image/jpeg'
    );

    res.json({ success: true, data: result });
  } catch (err) {
    const e = err as Error & { issues?: unknown };
    // Zod error -> 400, error lain -> 500 dengan pesan aman.
    if (e.name === 'ZodError') {
      res.status(400).json({ error: 'Payload tidak valid', detail: e.issues });
      return;
    }
    res.status(500).json({ error: e.message || 'Gagal mengekstrak nota' });
  }
};
