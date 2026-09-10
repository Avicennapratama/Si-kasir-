/**
 * Report Controller
 */

import { Request, Response } from 'express';
import { db } from '../config/firebase.js';

export const getReports = async (req: Request, res: Response): Promise<void> => {
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

    const period = req.query.period as string || '30d';
    const endDate = new Date();
    let startDate: Date;

    switch (period) {
      case '7d': startDate = new Date(); startDate.setDate(startDate.getDate() - 7); break;
      case '30d': startDate = new Date(); startDate.setDate(startDate.getDate() - 30); break;
      case '90d': startDate = new Date(); startDate.setDate(startDate.getDate() - 90); break;
      default: startDate = new Date(); startDate.setDate(startDate.getDate() - 30);
    }

    const transactionsRef = db.collection('businesses').doc(businessId).collection('transactions');
    const snapshot = await transactionsRef.where('transactionDate', '>=', startDate.toISOString().split('T')[0]).orderBy('transactionDate', 'desc').get();

    let totalIncome = 0;
    let totalExpense = 0;
    const transactions = snapshot.docs.map((doc: any) => {
      const data = doc.data();
      if (data.type === 'income') totalIncome += data.amount;
      else totalExpense += data.amount;
      return { id: doc.id, ...data };
    });

    res.json({
      success: true,
      data: {
        totalIncome,
        totalExpense,
        net: totalIncome - totalExpense,
        transactionCount: snapshot.size,
        period,
        transactions,
      },
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const createReport = async (req: Request, res: Response): Promise<void> => {
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

    const report = {
      id: 'report_' + Date.now(),
      businessId,
      generatedAt: new Date().toISOString(),
      period: req.body.period || '30d',
      totalIncome: req.body.totalIncome,
      totalExpense: req.body.totalExpense,
      net: req.body.totalIncome - req.body.totalExpense,
    };

    // Store in reports collection
    await db.collection('reports').doc(report.id).set(report);

    res.json({ success: true, data: report });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};