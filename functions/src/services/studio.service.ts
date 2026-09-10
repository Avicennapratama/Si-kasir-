/**
 * Studio Service
 */

import { db } from '../config/firebase.js';

export const saveStudioAsset = async (businessId: string, data: {
  originalMediaAssetId: string;
  resultMediaAssetId: string;
  status: string;
  resultUrl: string;
  metadata?: any;
}) => {
  const asset = {
    ...data,
    createdAt: new Date().toISOString(),
  };

  const docRef = await db.collection('businesses').doc(businessId).collection('studioAssets').add(asset);
  return { id: docRef.id, ...asset };
};

export const getStudioAssets = async (businessId: string) => {
  const snapshot = await db.collection('businesses').doc(businessId).collection('studioAssets').orderBy('createdAt', 'desc').get();
  return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
};