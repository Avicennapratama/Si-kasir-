/**
 * HKI routes
 */

import { Router, Request, Response } from 'express';
import { verifyAuthHeader } from '../middleware/authMiddleware.js';
import { aiHkiPreValuation } from '../controllers/hki.controller.js';

const router = Router();
router.use(verifyAuthHeader);

router.post('/pre-valuation', async (req: Request, res: Response) => {
  try {
    await aiHkiPreValuation(req, res);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;