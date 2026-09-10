/**
 * Receipt Validator using Zod
 */

import { z } from 'zod';
import { transactionItemSchema } from './transaction.validator.js';

export const receiptExtractSchema = z.object({
  imageBase64: z.string().min(1, 'imageBase64 is required'),
});

export const receiptResultSchema = z.object({
  type: z.enum(['income', 'expense']).nullable(),
  amount: z.number().int().positive().nullable(),
  vendor: z.string().nullable(),
  transactionDate: z.string().nullable(),
  items: z.array(transactionItemSchema),
  subtotal: z.number().nullable(),
  discount: z.number().nullable(),
  tax: z.number().nullable(),
  total: z.number().nullable(),
  paymentMethod: z.string().nullable(),
  confidence: z.number().min(0).max(1),
  lowConfidenceFields: z.array(z.string()),
  imageQuality: z.enum(['good', 'medium', 'poor']),
});
