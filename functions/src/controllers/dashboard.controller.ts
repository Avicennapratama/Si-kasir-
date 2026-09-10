/**
 * Dashboard Controller
 */

import { Request, Response } from 'express';
import { db } from '../config/firebase.js';

export const getDashboardSummary = async (req: Request, res: Response): Promise<void> => {
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

    // Get date range
    const days = Number(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const transactionsRef = db.collection('businesses').doc(businessId).collection('transactions');
    const snapshot = await transactionsRef.where('transactionDate', '>=', startDate.toISOString().split('T')[0]).get();

    let totalIncome = 0;
    let totalExpense = 0;
    const dailyData: Record<string, { income: number; expense: number }> = {};

    snapshot.docs.forEach((doc: any) => {
      const data = doc.data();
      const date = data.transactionDate;
      if (!dailyData[date]) dailyData[date] = { income: 0, expense: 0 };
      if (data.type === 'income') {
        totalIncome += data.amount;
        dailyData[date].income += data.amount;
      } else {
        totalExpense += data.amount;
        dailyData[date].expense += data.amount;
      }
    });

    const chartData = Object.entries(dailyData).map(([date, values]) => ({
      date,
      income: values.income,
      expense: values.expense,
    })).sort((a, b) => a.date.localeCompare(b.date));

    res.json({
      success: true,
      data: {
        totalIncome,
        totalExpense,
        net: totalIncome - totalExpense,
        transactionCount: snapshot.size,
        chartData,
      },
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};