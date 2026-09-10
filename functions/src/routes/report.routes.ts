/**
 * Report routes
 */

import { Router, Request, Response } from 'express';
import { verifyAuthHeader } from '../middleware/authMiddleware.js';
import { getReports, createReport } from '../controllers/report.controller.js';

const router = Router();
router.use(verifyAuthHeader);

router.get('/', async (req: Request, res: Response) => {
  try {
    await getReports(req, res);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    await createReport(req, res);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;