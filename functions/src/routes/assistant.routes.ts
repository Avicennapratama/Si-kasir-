/**
 * Assistant routes
 */

import { Router, Request, Response } from 'express';
import { verifyAuthHeader } from '../middleware/authMiddleware.js';
import { aiAssistantChat } from '../controllers/assistant.controller.js';

const router = Router();
router.use(verifyAuthHeader);

router.post('/chat', async (req: Request, res: Response) => {
  try {
    await aiAssistantChat(req, res);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;