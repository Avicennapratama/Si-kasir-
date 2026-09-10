/**
 * Transactions Firestore repository
 */

import adminSdk from 'firebase-admin';
// firebase-admin CJS + "type":"module": nilai runtime ada di .default,
// namespace tipe diimpor terpisah lewat 'import type'.
import type * as adminTypes from 'firebase-admin';
const admin = adminSdk;
import { db } from '../config/firebase.js';
import { TRANSACTION_LIMITS } from '../config/limits.js';

export interface Transaction {
  id?: string;
  type: 'income' | 'expense';
  amount: number;
  vendor?: string;
  transactionDate: string;
  notes?: string;
  items?: Array<{ name: string; qty?: number; price?: number }>;
  createdAt?: string;
  uid?: string;
}

export const getTransactions = async (businessId: string, options: {
  startDate?: string;
  endDate?: string;
  type?: 'income' | 'expense';
} = {}) => {
  let ref: adminTypes.firestore.Query = db.collection('businesses').doc(businessId).collection('transactions');

  if (options.startDate) {
    ref = ref.where('transactionDate', '>=', options.startDate);
  }
  if (options.endDate) {
    ref = ref.where('transactionDate', '<=', options.endDate);
  }
  if (options.type) {
    ref = ref.where('type', '==', options.type);
  }

  const snapshot = await ref.orderBy('transactionDate', 'desc').get();
  return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })) as Transaction[];
};

export const createTransaction = async (businessId: string, data: Transaction) => {
  const transaction: Transaction = {
    ...data,
    createdAt: new Date().toISOString(),
  };

  const docRef = await db.collection('businesses').doc(businessId).collection('transactions').add(transaction);
  return { id: docRef.id, ...transaction };
};

export const getTransactionSummary = async (businessId: string, startDate: string, endDate: string) => {
  const snapshot = await db.collection('businesses').doc(businessId).collection('transactions')
    .where('transactionDate', '>=', startDate)
    .where('transactionDate', '<=', endDate)
    .get();

  let totalIncome = 0;
  let totalExpense = 0;

  snapshot.docs.forEach((doc: any) => {
    const data = doc.data();
    if (data.type === 'income') totalIncome += (data.amount || 0);
    else totalExpense += (data.amount || 0);
  });

  return { totalIncome, totalExpense, net: totalIncome - totalExpense, transactionCount: snapshot.size };
};