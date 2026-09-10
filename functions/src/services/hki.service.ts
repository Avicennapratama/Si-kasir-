/**
 * HKI Service
 */

import { db } from '../config/firebase.js';

export const saveHKIValuation = async (businessId: string, data: {
  brandName: string;
  category: string;
  riskLevel: string;
  uniquenessScore: number;
  suggestedClasses: string[];
  recommendations: string[];
  estimatedCost: number;
  uid: string;
}) => {
  const valuation = {
    ...data,
    createdAt: new Date().toISOString(),
  };

  const docRef = await db.collection('businesses').doc(businessId).collection('hkiValuations').add(valuation);
  return { id: docRef.id, ...valuation };
};

export const getHKIValuations = async (businessId: string) => {
  const snapshot = await db.collection('businesses').doc(businessId).collection('hkiValuations').orderBy('createdAt', 'desc').get();
  return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
};