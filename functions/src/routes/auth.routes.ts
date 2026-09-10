/**
 * Route handlers for auth-related endpoints
 * Exported from index.ts via routes/index.ts
 */

import { Router, Request, Response } from 'express';
import { verifyAuthHeader } from '../middleware/authMiddleware.js';
import { saveTransactionAfterReview } from '../controllers/draft.controller.js';
import { aiExtractReceipt } from '../controllers/receipt.controller.js';
import { aiExtractVoice } from '../controllers/voice.controller.js';
import { aiStudioEnhanceImage } from '../controllers/studio.controller.js';
import { aiStudioGenerateCaption } from '../controllers/studio.controller.js';
import { aiHkiPreValuation } from '../controllers/hki.controller.js';
import { aiAssistantChat } from '../controllers/assistant.controller.js';
import { incrementUsage } from '../controllers/usage.controller.js';

const router = Router();

// Auth middleware applies to all routes below
router.use(verifyAuthHeader);

router.post('/extract-receipt', async (req: Request, res: Response) => {
  try {
    await aiExtractReceipt(req, res);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.post('/extract-voice', async (req: Request, res: Response) => {
  try {
    await aiExtractVoice(req, res);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.post('/studio/enhance-image', async (req: Request, res: Response) => {
  try {
    await aiStudioEnhanceImage(req, res);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.post('/studio/generate-caption', async (req: Request, res: Response) => {
  try {
    await aiStudioGenerateCaption(req, res);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.post('/hki/pre-valuation', async (req: Request, res: Response) => {
  try {
    await aiHkiPreValuation(req, res);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.post('/assistant/chat', async (req: Request, res: Response) => {
  try {
    await aiAssistantChat(req, res);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.post('/usage/increment', async (req: Request, res: Response) => {
  try {
    await incrementUsage(req, res);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;