/**
 * Studio Validators using Zod
 */

import { z } from 'zod';

export const enhanceImageSchema = z.object({
  businessId: z.string().min(1, 'businessId is required'),
  image: z.any(), // File upload handling will vary
  style: z.string().optional(),
});

export const generateCaptionSchema = z.object({
  businessId: z.string().min(1, 'businessId is required'),
  productName: z.string().min(1, 'productName is required'),
  category: z.string().min(1, 'category is required'),
  tone: z.enum(['ramah', 'santai', 'profesional', 'semangat']),
  platform: z.enum(['whatsapp', 'instagram', 'facebook', 'tiktok']),
  keywords: z.array(z.string()).optional(),
});
