/**
 * Media Service
 */

import { db } from '../config/firebase.js';
const uuidv4 = () => 'id_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

export const saveMediaAsset = async (businessId: string, data: {
  type: 'image' | 'pdf' | 'audio';
  url: string;
  fileName: string;
  mimeType: string;
  size: number;
  metadata?: any;
}) => {
  const asset = {
    id: uuidv4(),
    ...data,
    createdAt: new Date().toISOString(),
  };

  const docRef = await db.collection('businesses').doc(businessId).collection('mediaAssets').add(asset);
  const { id: _, ...rest } = asset;
  return { id: docRef.id, ...rest };
};

export const getMediaAsset = async (businessId: string, assetId: string) => {
  const doc = await db.collection('businesses').doc(businessId).collection('mediaAssets').doc(assetId).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
};

export const deleteMediaAsset = async (businessId: string, assetId: string) => {
  await db.collection('businesses').doc(businessId).collection('mediaAssets').doc(assetId).delete();
  return { deleted: true };
};