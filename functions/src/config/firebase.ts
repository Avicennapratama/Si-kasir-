/**
 * Firebase Admin initialization and exports
 * Centralized admin SDK setup for all functions
 */

// firebase-admin adalah paket CommonJS, sedangkan package.json memakai
// "type": "module". Dengan `import * as admin`, properti seperti
// admin.apps jadi undefined karena namespace ESM membungkus CJS di
// bawah .default. Impor default adalah bentuk yang benar di sini.
import adminSdk from 'firebase-admin';
// `import type * as admin` menyediakan NAMESPACE TIPE (admin.firestore.*)
// yang tetap dipakai di signature di bawah, tanpa ikut mengimpor nilai.
import type * as admin from 'firebase-admin';

const adminApp = adminSdk;

// Initialize admin once (idempotent)
if (!adminApp.apps.length) {
  adminApp.initializeApp();
}

// Re-export commonly used types and functions
export type { admin };

export const db = adminApp.firestore();
export const auth = adminApp.auth();
export const storage = adminApp.storage();

// Firestore helpers
export const withConverter = <T>(ref: admin.firestore.DocumentReference | admin.firestore.CollectionReference, fromDoc?: (doc: admin.firestore.QueryDocumentSnapshot) => T | null) => {
  // Factory for firestore operations with data converters
  return { ref, fromDoc };
};

export const serverTimestamp = adminApp.firestore.FieldValue.serverTimestamp;
export const increment = adminApp.firestore.FieldValue.increment;

// Export for use in routes/controllers
export default { admin: adminApp, db, auth, storage, withConverter, serverTimestamp, increment };