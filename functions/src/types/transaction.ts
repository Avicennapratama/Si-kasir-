/**
 * Transaction domain types
 */

export type TransactionType = 'income' | 'expense';

export interface TransactionItem {
  id?: string;
  name: string;
  qty?: number | null;
  price?: number | null;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  vendor?: string | null;
  transactionDate: string;
  notes?: string | null;
  items?: TransactionItem[];
  createdAt: string;
  updatedAt?: string;
  uid: string;
  businessId?: string;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  net: number;
  transactionCount: number;
  period?: string;
}