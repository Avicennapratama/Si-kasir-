/**
 * Transaction routes
 */

import { Router, Request, Response } from 'express';
import { verifyAuthHeader } from '../middleware/authMiddleware.js';
import { getTransactions, createTransaction, updateTransaction } from '../controllers/transaction.controller.js';

const router = Router();
router.use(verifyAuthHeader);

router.get('/', async (req: Request, res: Response) => {
  try {
    await getTransactions(req, res);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    await createTransaction(req, res);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    await updateTransaction(req, res);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;