/**
 * Draft Service
 */

import { db } from '../config/firebase.js';
const uuidv4 = () => 'id_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

export interface DraftData {
  source: string;
  type: string | null;
  amount: number | null;
  vendor: string | null;
  transactionDate: string | null;
  notes: string | null;
  items: Array<{ name: string; qty?: number; price?: number }>;
  confidence: number;
  lowConfidenceFields: string[];
  rawPayload: any;
}

export const createDraft = async (businessId: string, data: DraftData, uid: string) => {
  const draft = {
    id: uuidv4(),
    source: data.source,
    status: 'pending_review',
    type: data.type,
    amount: data.amount,
    vendor: data.vendor,
    transactionDate: data.transactionDate,
    notes: data.notes,
    items: data.items,
    confidence: data.confidence,
    lowConfidenceFields: data.lowConfidenceFields,
    rawPayload: data.rawPayload,
    createdAt: new Date().toISOString(),
    uid,
  };

  const docRef = await db.collection('businesses').doc(businessId).collection('drafts').add(draft);
  const { id: _, ...rest } = draft;
  return { id: docRef.id, ...rest };
};

export const getDraft = async (businessId: string, draftId: string) => {
  const doc = await db.collection('businesses').doc(businessId).collection('drafts').doc(draftId).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
};

export const updateDraft = async (businessId: string, draftId: string, data: Partial<DraftData>) => {
  await db.collection('businesses').doc(businessId).collection('drafts').doc(draftId).update(data);
  return { id: draftId, ...data };
};

export const deleteDraft = async (businessId: string, draftId: string) => {
  await db.collection('businesses').doc(businessId).collection('drafts').doc(draftId).delete();
  return { deleted: true };
};

export const getAllDrafts = async (businessId: string) => {
  const snapshot = await db.collection('businesses').doc(businessId).collection('drafts').orderBy('createdAt', 'desc').get();
  return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
};