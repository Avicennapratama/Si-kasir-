/**
 * Studio Controller
 */

import { Request, Response } from 'express';
import { db } from '../config/firebase.js';

export const aiStudioEnhanceImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const auth = (req as any).auth;
    const { businessId, image, style } = req.body;

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

    // Mock image enhancement
    const mockResponse = {
      studioAssetId: 'studio_' + Date.now(),
      originalMediaAssetId: 'media_' + Date.now(),
      resultMediaAssetId: 'media_' + (Date.now() + 1),
      status: 'completed',
      resultUrl: 'https://example.com/enhanced_' + Date.now() + '.jpg',
    };

    res.json({ success: true, data: mockResponse });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const aiStudioGenerateCaption = async (req: Request, res: Response): Promise<void> => {
  try {
    const auth = (req as any).auth;
    const { businessId, productName, category, tone, platform } = req.body;

    if (!businessId || !productName) {
      res.status(400).json({ error: 'businessId and productName are required' });
      return;
    }

    // Verify ownership
    const businessSnap = await db.collection('businesses').doc(businessId).get();
    if (!businessSnap.exists || businessSnap.data()?.ownerId !== auth.uid) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    // Mock caption generation
    const mockCaptions = [
      `Dapatkan ${productName} kualitas terbaik untuk kebutuhan Anda! Hubungi kami sekarang untuk promo spesial.`,
      `Mau ${productName} yang terpercaya? Kami siap melayani dengan sepenuh hati. Pesan sekarang sebelum kehabisan!`,
      `Hadirkan ${productName} pilihan untuk melengkapi harimu. Yuk langsung chat kami sekarang!`,
    ];

    res.json({
      success: true,
      data: {
        captions: mockCaptions,
        hashtags: ['#umkm', '#bisnisindonesia', '#sikasir'],
      },
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};