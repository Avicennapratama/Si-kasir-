/**
 * Gamification routes
 */

import { Router, Request, Response } from 'express';
import { verifyAuthHeader } from '../middleware/authMiddleware.js';
import { getGamificationStatus, recordAction } from '../controllers/gamification.controller.js';

const router = Router();
router.use(verifyAuthHeader);

router.get('/status', async (req: Request, res: Response) => {
  try {
    await getGamificationStatus(req, res);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.post('/action', async (req: Request, res: Response) => {
  try {
    await recordAction(req, res);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;