/**
 * Firebase Storage upload utility using Firebase Admin SDK
 */

import adminSdk from 'firebase-admin';
// firebase-admin CJS + "type":"module": nilai runtime ada di .default,
// namespace tipe diimpor terpisah lewat 'import type'.
import type * as adminTypes from 'firebase-admin';
const admin = adminSdk;

export const uploadFile = async (
  bucketName: string,
  filePath: string,
  fileBuffer: Buffer,
  contentType: string
): Promise<{ downloadURL: string; path: string }> => {
  const bucket = admin.storage().bucket(bucketName);
  const file = bucket.file(filePath);

  await file.save(fileBuffer, {
    metadata: {
      contentType,
      cacheControl: 'public, max-age=31536000',
    },
  });

  // Get signed URL that lasts for 1 year
  const [downloadURL] = await file.getSignedUrl({
    action: 'read',
    expires: Date.now() + 365 * 24 * 60 * 60 * 1000,
  });

  return { downloadURL, path: filePath };
};

export const deleteFile = async (bucketName: string, filePath: string): Promise<{ deleted: boolean }> => {
  const bucket = admin.storage().bucket(bucketName);
  await bucket.file(filePath).delete();
  return { deleted: true };
};
