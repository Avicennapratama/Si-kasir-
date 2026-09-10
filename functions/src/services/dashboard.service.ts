/**
 * Dashboard Service
 */

import { db } from '../config/firebase.js';

export const getDashboardMetrics = async (businessId: string, days = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const snapshot = await db.collection('businesses').doc(businessId).collection('transactions')
    .where('transactionDate', '>=', startDate.toISOString().split('T')[0])
    .get();

  let totalIncome = 0;
  let totalExpense = 0;
  let transactionCount = 0;

  snapshot.docs.forEach((doc: any) => {
    const data = doc.data();
    transactionCount++;
    if (data.type === 'income') totalIncome += (data.amount || 0);
    else totalExpense += (data.amount || 0);
  });

  return {
    totalIncome,
    totalExpense,
    net: totalIncome - totalExpense,
    transactionCount,
  };
};