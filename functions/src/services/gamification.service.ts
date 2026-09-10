/**
 * Gamification Service
 */

import { db } from '../config/firebase.js';

export const recordTransactionForGamification = async (businessId: string, transactionData: any) => {
  const today = new Date().toISOString().split('T')[0];
  await db.collection('businesses').doc(businessId).collection('gamification').doc(today).set({
    transactionCount: (await db.collection('businesses').doc(businessId).collection('gamification').doc(today).get()).data()?.transactionCount + 1 || 1,
    totalIncome: (await db.collection('businesses').doc(businessId).collection('gamification').doc(today).get()).data()?.totalIncome + (transactionData.type === 'income' ? transactionData.amount : 0) || 0,
    totalExpense: (await db.collection('businesses').doc(businessId).collection('gamification').doc(today).get()).data()?.totalExpense + (transactionData.type === 'expense' ? transactionData.amount : 0) || 0,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
};

export const getUserAchievements = async (businessId: string) => {
  // Will track achievements based on transaction patterns
  return { achievements: [], unlocked: [] };
};