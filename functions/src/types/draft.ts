/**
 * Draft domain types
 */

import { TransactionType, TransactionItem } from './transaction.js';

export type DraftStatus = 'pending_review' | 'approved' | 'rejected';
export type DraftSource = 'manual' | 'voice' | 'receipt' | 'ai';

export interface Draft {
  id: string;
  source: DraftSource;
  status: DraftStatus;
  type: TransactionType | null;
  amount: number | null;
  vendor: string | null;
  transactionDate: string | null;
  notes: string | null;
  items: TransactionItem[];
  confidence: number;
  lowConfidenceFields: string[];
  rawPayload?: any;
  createdAt: string;
  updatedAt?: string;
  uid: string;
  businessId?: string;
}