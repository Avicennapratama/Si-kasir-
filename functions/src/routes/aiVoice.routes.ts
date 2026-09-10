/**
 * AI Voice routes
 */

import { Router, Request, Response } from 'express';
import { verifyAuthHeader } from '../middleware/authMiddleware.js';
import { aiExtractVoice } from '../controllers/voice.controller.js';

const router = Router();
router.use(verifyAuthHeader);

router.post('/extract', async (req: Request, res: Response) => {
  try {
    await aiExtractVoice(req, res);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;