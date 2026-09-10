/**
 * Gamification Controller
 */

import { Request, Response } from 'express';
import { db } from '../config/firebase.js';

export const getGamificationStatus = async (req: Request, res: Response): Promise<void> => {
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

    // Calculate stats from transactions
    const transactionsRef = db.collection('businesses').doc(businessId).collection('transactions');
    const snapshot = await transactionsRef.get();

    let totalTransactions = 0;
    let totalIncome = 0;
    let totalExpense = 0;
    let totalItems = 0;
    const activeDays = new Set<string>();

    snapshot.docs.forEach((doc: any) => {
      const data = doc.data();
      totalTransactions++;
      if (data.type === 'income') totalIncome += (data.amount || 0);
      else totalExpense += (data.amount || 0);
      totalItems += (data.items?.length || 0);

      // Kumpulkan hari aktif untuk menghitung streak nyata.
      const d = data.transactionDate || data.createdAt;
      if (d) activeDays.add(String(d).slice(0, 10));
    });

    // Streak = jumlah hari berurutan mundur dari hari ini yang punya transaksi.
    // Bukan lagi angka hardcoded.
    let streak = 0;
    const cursor = new Date();
    // Kalau hari ini belum ada transaksi, mulai hitung dari kemarin.
    const key = (dt: Date) => dt.toISOString().slice(0, 10);
    if (!activeDays.has(key(cursor))) cursor.setDate(cursor.getDate() - 1);
    while (activeDays.has(key(cursor))) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }

    // Achievements dihitung dari statistik asli, bukan ditulis mati.
    const achievements = [
      { id: 'first-transaction', label: 'Transaksi Pertama', unlocked: totalTransactions >= 1 },
      { id: 'five-transactions', label: '5 Transaksi', unlocked: totalTransactions >= 5 },
      { id: 'ten-transactions', label: '10 Transaksi', unlocked: totalTransactions >= 10 },
      { id: 'first-income', label: 'Pendapatan Pertama', unlocked: totalIncome > 0 },
      { id: 'week-streak', label: 'Streak 7 Hari', unlocked: streak >= 7 },
    ];

    res.json({
      success: true,
      data: {
        totalTransactions,
        totalIncome,
        totalExpense,
        netIncome: totalIncome - totalExpense,
        totalItems,
        averageTicket: totalTransactions > 0 ? (totalIncome - totalExpense) / totalTransactions : 0,
        streak,
        activeDays: activeDays.size,
        achievements,
      },
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const recordAction = async (req: Request, res: Response): Promise<void> => {
  try {
    const auth = (req as any).auth;
    const { businessId, action } = req.body;

    if (!businessId || !action) {
      res.status(400).json({ error: 'businessId and action are required' });
      return;
    }

    // Verify ownership
    const businessSnap = await db.collection('businesses').doc(businessId).get();
    if (!businessSnap.exists || businessSnap.data()?.ownerId !== auth.uid) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    // Record the action
    const today = new Date().toISOString().split('T')[0];
    await db.collection('businesses').doc(businessId).collection('gamification').doc(today).set({
      action,
      count: 1,
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    res.json({ success: true, data: { action, recordedAt: new Date().toISOString() } });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};