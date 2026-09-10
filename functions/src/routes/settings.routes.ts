/**
 * Settings routes
 */

import { Router, Request, Response } from 'express';
import { verifyAuthHeader } from '../middleware/authMiddleware.js';
import { getSettings, updateSettings } from '../controllers/settings.controller.js';

const router = Router();
router.use(verifyAuthHeader);

router.get('/', async (req: Request, res: Response) => {
  try {
    await getSettings(req, res);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.put('/', async (req: Request, res: Response) => {
  try {
    await updateSettings(req, res);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;