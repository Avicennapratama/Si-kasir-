/**
 * Assistant Validators using Zod
 */

import { z } from 'zod';

export const assistantChatSchema = z.object({
  businessId: z.string().min(1, 'businessId is required'),
  message: z.string().min(1, 'message is required'),
  context: z.record(z.any()).optional(),
});

export const assistantReplySchema = z.object({
  reply: z.string(),
  suggestedActions: z.array(z.object({
    label: z.string(),
    type: z.enum(['navigate', 'action', 'link']),
    target: z.string(),
  })).optional(),
});