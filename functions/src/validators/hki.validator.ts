/**
 * HKI Validators using Zod
 */

import { z } from 'zod';

export const hkiPreValuationSchema = z.object({
  businessId: z.string().min(1, 'businessId is required'),
  brandName: z.string().min(1, 'brandName is required'),
  category: z.string().optional(),
  description: z.string().optional(),
});

export const hkiValuationResultSchema = z.object({
  valuationId: z.string(),
  brandName: z.string(),
  riskLevel: z.enum(['low', 'medium', 'high']),
  uniquenessScore: z.number().int().min(0).max(100),
  suggestedClasses: z.array(z.string()),
  recommendations: z.array(z.string()),
  estimatedCost: z.number().int().nonnegative(),
});