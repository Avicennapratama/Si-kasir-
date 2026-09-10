/**
 * Media Assets Firestore repository
 */

import { db } from '../config/firebase.js';
const uuidv4 = () => 'id_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

export interface MediaAsset {
  id?: string;
  type: 'image' | 'pdf' | 'audio';
  url: string;
  fileName: string;
  mimeType: string;
  size: number;
  metadata?: Record<string, any>;
  createdAt?: string;
}

export const saveMediaAsset = async (businessId: string, data: Omit<MediaAsset, 'id' | 'createdAt'>) => {
  const asset: MediaAsset = {
    id: uuidv4(),
    ...data,
    createdAt: new Date().toISOString(),
  };

  const id = asset.id || uuidv4();
  await db.collection('businesses').doc(businessId).collection('mediaAssets').doc(id).set({ ...asset, id });
  return { id, ...asset };
};

export const getMediaAsset = async (businessId: string, assetId: string) => {
  const doc = await db.collection('businesses').doc(businessId).collection('mediaAssets').doc(assetId).get();
  return doc.exists ? { id: doc.id, ...doc.data() } as MediaAsset : null;
};

export const deleteMediaAsset = async (businessId: string, assetId: string) => {
  await db.collection('businesses').doc(businessId).collection('mediaAssets').doc(assetId).delete();
  return { deleted: true };
};