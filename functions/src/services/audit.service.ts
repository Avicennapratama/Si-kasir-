/**
 * Audit Service
 */

import { db } from '../config/firebase.js';

export type AuditAction =
  | 'transaction.create'
  | 'transaction.update'
  | 'transaction.delete'
  | 'draft.create'
  | 'draft.approve'
  | 'draft.reject'
  | 'ai.extract_receipt'
  | 'ai.extract_voice'
  | 'ai.generate_caption'
  | 'ai.enhance_image'
  | 'ai.hki_valuation'
  | 'ai.assistant_chat'
  | 'settings.update';

export const logAudit = async (data: {
  uid: string;
  businessId: string;
  action: AuditAction;
  details?: any;
  ip?: string;
}) => {
  const log = {
    ...data,
    createdAt: new Date().toISOString(),
  };

  await db.collection('auditLogs').add(log);
  return log;
};

export const getAuditLogs = async (businessId: string, limit = 100) => {
  const snapshot = await db.collection('auditLogs')
    .where('businessId', '==', businessId)
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get();

  return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
};