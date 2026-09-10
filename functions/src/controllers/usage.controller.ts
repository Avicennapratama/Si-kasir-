/**
 * Usage Controller
 */

import { Request, Response } from 'express';
import { db, increment } from '../config/firebase.js';

export const incrementUsage = async (req: Request, res: Response): Promise<void> => {
  try {
    const auth = (req as any).auth;
    const { businessId, feature } = req.body;

    if (!businessId || !feature) {
      res.status(400).json({ error: 'businessId and feature are required' });
      return;
    }

    // Verify ownership
    const businessSnap = await db.collection('businesses').doc(businessId).get();
    if (!businessSnap.exists || businessSnap.data()?.ownerId !== auth.uid) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const usageRef = db.collection('businesses').doc(businessId).collection('usage').doc(today);

    await usageRef.set({
      [feature]: increment(1),
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    res.json({
      success: true,
      data: { feature, incremented: true },
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};