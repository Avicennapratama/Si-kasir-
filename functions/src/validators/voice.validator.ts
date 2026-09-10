/**
 * Voice Validator using Zod
 */

import { z } from 'zod';

export const voiceExtractSchema = z.object({
  transcript: z.string().min(1, 'Transcript is required'),
});

export const voiceResultSchema = z.object({
  type: z.enum(['income', 'expense']).nullable(),
  amount: z.number().int().positive().nullable(),
  note: z.string().nullable(),
  transactionDate: z.string().nullable(),
  items: z.array(z.object({
    name: z.string(),
    qty: z.number().nullable(),
    price: z.number().nullable(),
  })),
  confidence: z.number().min(0).max(1),
  lowConfidenceFields: z.array(z.string()),
});
