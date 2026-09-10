/**
 * Draft Validators using Zod
 */

import { z } from 'zod';
import { transactionItemSchema } from './transaction.validator.js';

export const createDraftSchema = z.object({
  businessId: z.string().min(1, 'businessId is required'),
  source: z.enum(['manual', 'voice', 'receipt', 'ai']),
  type: z.enum(['income', 'expense']).optional().nullable(),
  amount: z.number().int().positive().optional().nullable(),
  vendor: z.string().optional().nullable(),
  transactionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  notes: z.string().optional().nullable(),
  items: z.array(transactionItemSchema).optional(),
  confidence: z.number().min(0).max(1).optional(),
  lowConfidenceFields: z.array(z.string()).optional(),
  rawPayload: z.any().optional(),
});

export const updateDraftSchema = createDraftSchema.partial().omit({ businessId: true });
