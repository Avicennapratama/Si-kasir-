/**
 * Drafts Firestore repository
 */

import { db } from '../config/firebase.js';
const uuidv4 = () => 'id_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

export interface Draft {
  id?: string;
  source: string;
  status: 'pending_review' | 'approved' | 'rejected';
  type: string | null;
  amount: number | null;
  vendor: string | null;
  transactionDate: string | null;
  notes: string | null;
  items: Array<{ name: string; qty?: number; price?: number }>;
  confidence: number;
  lowConfidenceFields: string[];
  rawPayload: any;
  createdAt?: string;
  uid?: string;
}

export const getDrafts = async (businessId: string) => {
  const snapshot = await db.collection('businesses').doc(businessId).collection('drafts')
    .orderBy('createdAt', 'desc').get();
  return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })) as Draft[];
};

export const createDraft = async (businessId: string, data: Omit<Draft, 'id' | 'createdAt' | 'uid'>) => {
  const draft: Draft = {
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
  };

  const id = draft.id || uuidv4();
  await db.collection('businesses').doc(businessId).collection('drafts').doc(id).set({ ...draft, id });
  return { id, ...draft };
};

export const updateDraft = async (businessId: string, draftId: string, data: Partial<Draft>) => {
  // `update()` crash kalau draft belum ada; set merge = upsert yang aman.
  await db.collection('businesses').doc(businessId).collection('drafts').doc(draftId).set(data, { merge: true });
  return { id: draftId, ...data };
};

export const deleteDraft = async (businessId: string, draftId: string) => {
  await db.collection('businesses').doc(businessId).collection('drafts').doc(draftId).delete();
  return { deleted: true };
};