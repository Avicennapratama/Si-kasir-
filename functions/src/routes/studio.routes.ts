/**
 * Studio routes
 */

import { Router, Request, Response } from 'express';
import { verifyAuthHeader } from '../middleware/authMiddleware.js';
import { aiStudioEnhanceImage, aiStudioGenerateCaption } from '../controllers/studio.controller.js';

const router = Router();
router.use(verifyAuthHeader);

router.post('/enhance-image', async (req: Request, res: Response) => {
  try {
    await aiStudioEnhanceImage(req, res);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.post('/generate-caption', async (req: Request, res: Response) => {
  try {
    await aiStudioGenerateCaption(req, res);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;