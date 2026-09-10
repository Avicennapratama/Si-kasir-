/**
 * Users Firestore repository
 */

import { db } from '../config/firebase.js';

export interface UserProfile {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  createdAt: string;
  lastLoginAt?: string;
  businessId?: string;
}

export const saveUserProfile = async (uid: string, profile: Partial<UserProfile>) => {
  await db.collection('users').doc(uid).set({
    ...profile,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
  return { uid, ...profile };
};

export const getUserProfile = async (uid: string) => {
  const doc = await db.collection('users').doc(uid).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
};

export const updateUserProfile = async (uid: string, profile: Partial<UserProfile>) => {
  // `update()` crash kalau dokumen belum ada; pakai set merge agar upsert aman.
  await db.collection('users').doc(uid).set(profile, { merge: true });
  return { uid, ...profile };
};