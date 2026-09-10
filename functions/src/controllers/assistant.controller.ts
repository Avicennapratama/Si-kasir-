/**
 * Assistant Controller
 */

import { Request, Response } from 'express';
import { db } from '../config/firebase.js';
import { chatWithAssistant } from '../ai/chatAssistant.js';

export const aiAssistantChat = async (req: Request, res: Response): Promise<void> => {
  try {
    const auth = (req as any).auth;
    const { businessId, message, context, history } = req.body;

    if (!businessId || !message) {
      res.status(400).json({ error: 'businessId and message are required' });
      return;
    }

    // Verify ownership
    const businessSnap = await db.collection('businesses').doc(businessId).get();
    if (!businessSnap.exists || businessSnap.data()?.ownerId !== auth.uid) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    // Panggil Gemini lewat layer AI (bukan lagi balasan hardcoded).
    const result = await chatWithAssistant({
      businessId,
      message,
      context,
      history: Array.isArray(history) ? history : [],
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};