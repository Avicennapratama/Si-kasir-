/**
 * Transaction Validators using Zod
 */

import { z } from 'zod';

export const transactionItemSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  qty: z.number().int().positive().optional().nullable(),
  price: z.number().int().nonnegative().optional().nullable(),
});

export const createTransactionSchema = z.object({
  businessId: z.string().min(1, 'businessId is required'),
  type: z.enum(['income', 'expense']),
  amount: z.number().int().positive('Amount must be positive'),
  vendor: z.string().optional().nullable(),
  transactionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  notes: z.string().optional().nullable(),
  items: z.array(transactionItemSchema).optional(),
});

export const updateTransactionSchema = createTransactionSchema.partial().omit({ businessId: true });
