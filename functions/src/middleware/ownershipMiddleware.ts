/**
 * Ownership Middleware - verifies business ownership from auth.uid
 */

import { verifyOwnership } from '../firestore/businesses.repo.js';
import { Request, Response, NextFunction } from 'express';

export const ownershipMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const businessId = req.query.businessId as string || req.body?.businessId;
    if (!businessId) {
      const params = req.params as any;
      if (params?.businessId) {
        // Use it
      }
    }

    const auth = (req as any).auth;
    if (!auth) {
      res.status(401).json({ error: 'Unauthenticated' });
      return;
    }

    const isOwner = await verifyOwnership(businessId, auth.uid);
    if (!isOwner) {
      res.status(403).json({ error: 'Forbidden: Not business owner' });
      return;
    }

    next();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};