/**
 * Auth Controller
 */

import { Request, Response } from 'express';

export const verifyUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const auth = (req as any).auth;
    res.json({ success: true, user: auth });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};
