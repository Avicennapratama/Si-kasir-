/**
 * Settings Controller
 */

import { Request, Response } from 'express';
import { db } from '../config/firebase.js';

export const getSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const auth = (req as any).auth;
    const businessId = req.query.businessId as string;

    if (!businessId) {
      res.status(400).json({ error: 'businessId is required' });
      return;
    }

    // Verify ownership
    const businessSnap = await db.collection('businesses').doc(businessId).get();
    if (!businessSnap.exists || businessSnap.data()?.ownerId !== auth.uid) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const settingsDoc = await db.collection('businesses').doc(businessId).collection('config').doc('settings').get();

    res.json({
      success: true,
      data: settingsDoc.exists ? settingsDoc.data() : {
        currency: 'IDR',
        language: 'id',
        notifications: { email: true, push: false },
        taxRate: 0,
        enableAI: true,
      },
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const updateSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const auth = (req as any).auth;
    const { businessId, settings } = req.body;

    if (!businessId || !settings) {
      res.status(400).json({ error: 'businessId and settings are required' });
      return;
    }

    // Verify ownership
    const businessSnap = await db.collection('businesses').doc(businessId).get();
    if (!businessSnap.exists || businessSnap.data()?.ownerId !== auth.uid) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    await db.collection('businesses').doc(businessId).collection('config').doc('settings').set(settings, { merge: true });

    res.json({
      success: true,
      data: settings,
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};