/**
 * Storage cleanup utility for orphaned files
 */

import adminSdk from 'firebase-admin';
// firebase-admin CJS + "type":"module": nilai runtime ada di .default,
// namespace tipe diimpor terpisah lewat 'import type'.
import type * as adminTypes from 'firebase-admin';
const admin = adminSdk;

export const cleanupOrphanedFiles = async (
  bucketName: string,
  prefix: string,
  ageInDays: number
): Promise<{ deletedCount: number }> => {
  const bucket = admin.storage().bucket(bucketName);
  const [files] = await bucket.getFiles({ prefix });

  const now = Date.now();
  const maxAgeMs = ageInDays * 24 * 60 * 60 * 1000;
  let deletedCount = 0;

  const deletePromises = files.map(async (file) => {
    const [metadata] = await file.getMetadata();
    const createdDate = metadata.timeCreated ? new Date(metadata.timeCreated).getTime() : now;

    if (now - createdDate > maxAgeMs) {
      // It's possible the file is being actively used, but typically temporary directories
      // like /temp or /uploads can be cleaned up safely this way.
      await file.delete();
      deletedCount++;
    }
  });

  await Promise.all(deletePromises);

  return { deletedCount };
};