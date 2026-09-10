/**
 * Report Service
 */

import { db } from '../config/firebase.js';

export const generateReport = async (businessId: string, period: string) => {
  const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const snapshot = await db.collection('businesses').doc(businessId).collection('transactions')
    .where('transactionDate', '>=', startDate.toISOString().split('T')[0])
    .orderBy('transactionDate', 'desc')
    .get();

  let totalIncome = 0;
  let totalExpense = 0;
  const transactions = snapshot.docs.map((doc: any) => {
    const data = doc.data();
    if (data.type === 'income') totalIncome += (data.amount || 0);
    else totalExpense += (data.amount || 0);
    return { id: doc.id, ...data };
  });

  return {
    period,
    totalIncome,
    totalExpense,
    net: totalIncome - totalExpense,
    transactionCount: snapshot.size,
    transactions,
    generatedAt: new Date().toISOString(),
  };
};