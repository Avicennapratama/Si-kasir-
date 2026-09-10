/**
 * Studio Assets Firestore repository
 */

import { db } from '../config/firebase.js';

export interface StudioAsset {
  id?: string;
  originalMediaAssetId: string;
  resultMediaAssetId: string;
  status: 'processing' | 'completed' | 'failed';
  resultUrl?: string;
  metadata?: Record<string, any>;
  createdAt?: string;
}

export const saveStudioAsset = async (businessId: string, data: Omit<StudioAsset, 'id' | 'createdAt'>) => {
  const asset = { ...data, createdAt: new Date().toISOString() };
  const docRef = await db.collection('businesses').doc(businessId).collection('studioAssets').add(asset);
  return { id: docRef.id, ...asset };
};

export const getStudioAssets = async (businessId: string) => {
  const snapshot = await db.collection('businesses').doc(businessId).collection('studioAssets').orderBy('createdAt', 'desc').get();
  return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
};