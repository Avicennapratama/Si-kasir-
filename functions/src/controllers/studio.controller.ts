/**
 * Studio Controller
 */

import { Request, Response } from 'express';
import { db } from '../config/firebase.js';
import { v4 as uuidv4 } from 'uuid';
import { generateProductCaptions } from '../ai/captionGenerator.js';
import { enhanceImageForMarketplace } from '../ai/imageEnhancer.js';

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

    // Call image enhancer logic
    const enhanced = await enhanceImageForMarketplace(image);
    
    const responseData = {
      studioAssetId: 'studio_' + uuidv4(),
      ...enhanced,
      status: 'completed',
    };

    res.json({ success: true, data: responseData });
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

    // Call real caption generator
    const { captions } = await generateProductCaptions({
      productName,
      category,
      tone: tone || 'ramah',
      platform: platform || 'instagram',
      keywords: []
    });

    res.json({
      success: true,
      data: {
        captions: captions,
        hashtags: ['#umkm', '#bisnisindonesia', '#sikasir', `#${category.replace(/\s+/g, '')}`],
      },
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};