/**
 * Audit Logs Firestore repository
 */

import { db } from '../config/firebase.js';

export interface AuditLog {
  id?: string;
  uid: string;
  businessId?: string;
  action: string;
  details?: Record<string, any>;
  ip?: string;
  createdAt?: string;
}

export const logAudit = async (data: Omit<AuditLog, 'id' | 'createdAt'>) => {
  const audit = { ...data, createdAt: new Date().toISOString() };
  const docRef = await db.collection('auditLogs').add(audit);
  return { id: docRef.id, ...audit };
};

export const getAuditLogs = async (businessId: string, limit = 100) => {
  const snapshot = await db.collection('auditLogs')
    .where('businessId', '==', businessId)
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get();
  return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
};