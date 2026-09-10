/**
 * HKI Valuations Firestore repository
 */

import { db } from '../config/firebase.js';

export interface HkiValuation {
  id?: string;
  brandName: string;
  category: string;
  riskLevel: 'low' | 'medium' | 'high';
  uniquenessScore: number;
  suggestedClasses: string[];
  recommendations: string[];
  estimatedCost: number;
  uid?: string;
  createdAt?: string;
}

export const saveHkiValuation = async (businessId: string, data: Omit<HkiValuation, 'id' | 'createdAt'>) => {
  const valuation = { ...data, createdAt: new Date().toISOString() };
  const docRef = await db.collection('businesses').doc(businessId).collection('hkiValuations').add(valuation);
  return { id: docRef.id, ...valuation };
};

export const getHkiValuations = async (businessId: string) => {
  const snapshot = await db.collection('businesses').doc(businessId).collection('hkiValuations').orderBy('createdAt', 'desc').get();
  return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
};