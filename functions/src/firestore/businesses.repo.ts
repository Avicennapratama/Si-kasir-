/**
 * Businesses Firestore repository
 */

import { db } from '../config/firebase.js';

export interface Business {
  id?: string;
  ownerId: string;
  name: string;
  category?: string;
  address?: string;
  phone?: string;
  logoUrl?: string;
  createdAt?: string;
}

export const getBusiness = async (businessId: string) => {
  const doc = await db.collection('businesses').doc(businessId).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
};

export const getBusinessByOwnerId = async (ownerId: string) => {
  const snapshot = await db.collection('businesses').where('ownerId', '==', ownerId).get();
  return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
};

export const createBusiness = async (businessId: string, data: Business) => {
  const business = {
    ...data,
    createdAt: new Date().toISOString(),
  };
  await db.collection('businesses').doc(businessId).set(business);
  return { id: businessId, ...business };
};

export const verifyOwnership = async (businessId: string, uid: string): Promise<boolean> => {
  const doc = await db.collection('businesses').doc(businessId).get();
  return doc.exists && doc.data()?.ownerId === uid;
};