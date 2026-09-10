/**
 * Gamification Firestore repository
 */

import { db, increment } from '../config/firebase.js';

export interface GamificationRecord {
  date: string;
  transactionCount?: number;
  totalIncome?: number;
  totalExpense?: number;
  updatedAt?: string;
}

export const incrementGamificationMetric = async (businessId: string, metric: string, value = 1) => {
  const today = new Date().toISOString().split('T')[0];
  await db.collection('businesses').doc(businessId).collection('gamification').doc(today).set({
    [metric]: increment(value),
    updatedAt: new Date().toISOString(),
  }, { merge: true });
};

export const getGamificationForDate = async (businessId: string, date: string) => {
  const doc = await db.collection('businesses').doc(businessId).collection('gamification').doc(date).get();
  return doc.exists ? { date, ...doc.data() } : null;
};

export const getGamificationRange = async (businessId: string, startDate: string, endDate: string) => {
  const snapshot = await db.collection('businesses').doc(businessId).collection('gamification')
    .where('date', '>=', startDate)
    .where('date', '<=', endDate)
    .get();
  return snapshot.docs.map((doc: any) => ({ date: doc.id, ...doc.data() }));
};