/**
 * AI Receipt routes
 */

import { Router, Request, Response } from 'express';
import { verifyAuthHeader } from '../middleware/authMiddleware.js';
import { aiExtractReceipt } from '../controllers/receipt.controller.js';

const router = Router();
router.use(verifyAuthHeader);

router.post('/extract', async (req: Request, res: Response) => {
  try {
    await aiExtractReceipt(req, res);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;