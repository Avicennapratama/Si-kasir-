/**
 * Transaction Service
 */

import { db } from '../config/firebase.js';

export interface TransactionData {
  type: 'income' | 'expense';
  amount: number;
  vendor?: string;
  transactionDate: string;
  notes?: string;
  items?: Array<{ name: string; qty?: number; price?: number }>;
}

export const createTransaction = async (businessId: string, data: TransactionData, uid: string) => {
  const transaction = {
    ...data,
    createdAt: new Date().toISOString(),
    uid,
  };

  const docRef = await db.collection('businesses').doc(businessId).collection('transactions').add(transaction);
  return { id: docRef.id, ...transaction };
};

export const getTransaction = async (businessId: string, transactionId: string) => {
  const doc = await db.collection('businesses').doc(businessId).collection('transactions').doc(transactionId).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
};

export const updateTransaction = async (businessId: string, transactionId: string, data: Partial<TransactionData>) => {
  await db.collection('businesses').doc(businessId).collection('transactions').doc(transactionId).update(data);
  return { id: transactionId, ...data };
};

export const deleteTransaction = async (businessId: string, transactionId: string) => {
  await db.collection('businesses').doc(businessId).collection('transactions').doc(transactionId).delete();
  return { deleted: true };
};

export const getTransactionSummary = async (businessId: string, startDate: string, endDate: string) => {
  const snapshot = await db.collection('businesses').doc(businessId).collection('transactions')
    .where('transactionDate', '>=', startDate)
    .where('transactionDate', '<=', endDate)
    .get();

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

  return {
    totalIncome,
    totalExpense,
    net: totalIncome - totalExpense,
    transactionCount: snapshot.size,
    dailyData,
  };
};