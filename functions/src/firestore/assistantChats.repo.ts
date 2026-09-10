/**
 * Assistant Chats Firestore repository
 */

import { db } from '../config/firebase.js';

export interface AssistantChat {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  context?: Record<string, any>;
  createdAt?: string;
}

export const saveChatMessage = async (businessId: string, data: Omit<AssistantChat, 'id' | 'createdAt'>) => {
  const message = { ...data, createdAt: new Date().toISOString() };
  const docRef = await db.collection('businesses').doc(businessId).collection('assistantChats').add(message);
  return { id: docRef.id, ...message };
};

export const getChatHistory = async (businessId: string, limit = 50) => {
  const snapshot = await db.collection('businesses').doc(businessId).collection('assistantChats')
    .orderBy('createdAt', 'asc')
    .limit(limit)
    .get();
  return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
};