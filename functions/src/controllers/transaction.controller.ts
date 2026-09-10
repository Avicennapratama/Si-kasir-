/**
 * Transaction Controller
 */

import { Request, Response } from 'express';
import { db } from '../config/firebase.js';
const uuidv4 = () => 'id_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
import { TRANSACTION_LIMITS } from '../config/limits.js';

export const getTransactions = async (req: Request, res: Response): Promise<void> => {
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

    const transactionsRef = db.collection('businesses').doc(businessId).collection('transactions');
    const snapshot = await transactionsRef.orderBy('transactionDate', 'desc').get();

    const transactions = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({
      success: true,
      data: transactions,
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const createTransaction = async (req: Request, res: Response): Promise<void> => {
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

    // Validation
    if (!data.type || !['income', 'expense'].includes(data.type)) {
      res.status(400).json({ error: 'Valid transaction type required (income/expense)' });
      return;
    }

    if (data.amount === undefined || data.amount === null) {
      res.status(400).json({ error: 'Amount is required' });
      return;
    }

    if (data.amount > TRANSACTION_LIMITS.maxAmountPerTransaction) {
      res.status(400).json({ error: `Amount exceeds limit of ${TRANSACTION_LIMITS.maxAmountPerTransaction}` });
      return;
    }

    const transaction = {
      id: uuidv4(),
      type: data.type,
      amount: data.amount,
      vendor: data.vendor || null,
      transactionDate: data.transactionDate || new Date().toISOString().split('T')[0],
      notes: data.notes || null,
      items: data.items || [],
      createdAt: new Date().toISOString(),
      uid: auth.uid,
    };

    await db.collection('businesses').doc(businessId).collection('transactions').doc(transaction.id).set(transaction);

    res.json({
      success: true,
      data: transaction,
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const updateTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const auth = (req as any).auth;
    const { businessId, transactionId } = req.params;

    if (!businessId || !transactionId) {
      res.status(400).json({ error: 'businessId and transactionId are required' });
      return;
    }

    // Verify ownership
    const businessSnap = await db.collection('businesses').doc(businessId).get();
    if (!businessSnap.exists || businessSnap.data()?.ownerId !== auth.uid) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const data = req.body;

    await db.collection('businesses').doc(businessId).collection('transactions').doc(transactionId).update(data);

    res.json({
      success: true,
      data: { id: transactionId, ...data },
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};