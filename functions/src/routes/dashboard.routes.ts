/**
 * Dashboard routes
 */

import { Router, Request, Response } from 'express';
import { verifyAuthHeader } from '../middleware/authMiddleware.js';
import { getDashboardSummary } from '../controllers/dashboard.controller.js';

const router = Router();
router.use(verifyAuthHeader);

router.get('/summary', async (req: Request, res: Response) => {
  try {
    await getDashboardSummary(req, res);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.get('/charts/:period', async (req: Request, res: Response) => {
  try {
    // TODO: implement getDashboardCharts
    res.json({ success: true, data: [] });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;