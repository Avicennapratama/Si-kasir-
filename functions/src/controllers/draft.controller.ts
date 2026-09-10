/**
 * Draft Controller
 */

import { Request, Response } from 'express';
import { db } from '../config/firebase.js';
const uuidv4 = () => 'id_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

export const getDrafts = async (req: Request, res: Response): Promise<void> => {
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

    const draftsRef = db.collection('businesses').doc(businessId).collection('drafts');
    const snapshot = await draftsRef.orderBy('createdAt', 'desc').get();

    const drafts = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({
      success: true,
      data: drafts,
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const createDraft = async (req: Request, res: Response): Promise<void> => {
  try {
    const auth = (req as any).auth;
    const businessId = req.body.businessId;

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

    const data = req.body;

    const draft = {
      id: uuidv4(),
      source: data.source || 'manual',
      status: 'pending_review',
      type: data.type || null,
      amount: data.amount || null,
      vendor: data.vendor || null,
      transactionDate: data.transactionDate || null,
      notes: data.notes || null,
      items: data.items || [],
      confidence: data.confidence || 1.0,
      lowConfidenceFields: data.lowConfidenceFields || [],
      rawPayload: data.rawPayload || null,
      createdAt: new Date().toISOString(),
      uid: auth.uid,
    };

    await db.collection('businesses').doc(businessId).collection('drafts').doc(draft.id).set(draft);

    res.json({
      success: true,
      data: draft,
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const updateDraft = async (req: Request, res: Response): Promise<void> => {
  try {
    const auth = (req as any).auth;
    const { businessId, draftId } = req.params;

    if (!businessId || !draftId) {
      res.status(400).json({ error: 'businessId and draftId are required' });
      return;
    }

    // Verify ownership
    const businessSnap = await db.collection('businesses').doc(businessId).get();
    if (!businessSnap.exists || businessSnap.data()?.ownerId !== auth.uid) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const data = req.body;
    await db.collection('businesses').doc(businessId).collection('drafts').doc(draftId).update(data);

    res.json({
      success: true,
      data: { id: draftId, ...data },
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const deleteDraft = async (req: Request, res: Response): Promise<void> => {
  try {
    const auth = (req as any).auth;
    const { businessId, draftId } = req.params;

    if (!businessId || !draftId) {
      res.status(400).json({ error: 'businessId and draftId are required' });
      return;
    }

    // Verify ownership
    const businessSnap = await db.collection('businesses').doc(businessId).get();
    if (!businessSnap.exists || businessSnap.data()?.ownerId !== auth.uid) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    await db.collection('businesses').doc(businessId).collection('drafts').doc(draftId).delete();

    res.json({
      success: true,
      data: { id: draftId, deleted: true },
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const saveTransactionAfterReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const auth = (req as any).auth;
    const { businessId, draftId, transactionData } = req.body;

    if (!businessId || !transactionData) {
      res.status(400).json({ error: 'businessId and transactionData are required' });
      return;
    }

    // Verify ownership
    const businessSnap = await db.collection('businesses').doc(businessId).get();
    if (!businessSnap.exists || businessSnap.data()?.ownerId !== auth.uid) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const transaction = {
      id: uuidv4(),
      ...transactionData,
      createdAt: new Date().toISOString(),
      uid: auth.uid,
    };

    // Save transaction
    await db.collection('businesses').doc(businessId).collection('transactions').doc(transaction.id).set(transaction);

    // Delete draft if it was created from one
    if (draftId) {
      await db.collection('businesses').doc(businessId).collection('drafts').doc(draftId).delete();
    }

    res.json({
      success: true,
      data: transaction,
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};