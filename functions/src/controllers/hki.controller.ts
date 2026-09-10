/**
 * HKI Controller
 */

import { Request, Response } from 'express';
import { db } from '../config/firebase.js';
import { analyzeHki } from '../ai/hkiAnalyzer.js';

export const aiHkiPreValuation = async (req: Request, res: Response): Promise<void> => {
  try {
    const auth = (req as any).auth;
    const { businessId, brandName, category, description } = req.body;

    if (!businessId || !brandName) {
      res.status(400).json({ error: 'businessId and brandName are required' });
      return;
    }

    // Verify ownership
    const businessSnap = await db.collection('businesses').doc(businessId).get();
    if (!businessSnap.exists || businessSnap.data()?.ownerId !== auth.uid) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    // Panggil Gemini lewat layer AI — bukan lagi mock hardcoded.
    const valuation = await analyzeHki({
      businessId,
      brandName,
      category,
      description,
    });

    res.json({ success: true, data: valuation });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};