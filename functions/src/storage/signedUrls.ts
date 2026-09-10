/**
 * Generate signed URLs for temporary client access
 */

import adminSdk from 'firebase-admin';
// firebase-admin CJS + "type":"module": nilai runtime ada di .default,
// namespace tipe diimpor terpisah lewat 'import type'.
import type * as adminTypes from 'firebase-admin';
const admin = adminSdk;

export interface SignedUrlOptions {
  action: 'read' | 'write' | 'delete' | 'resumable';
  expiresInSeconds?: number;
  contentType?: string;
}

export const getSignedUrl = async (
  bucketName: string,
  filePath: string,
  options: SignedUrlOptions = { action: 'read', expiresInSeconds: 3600 }
): Promise<string> => {
  const bucket = admin.storage().bucket(bucketName);
  const file = bucket.file(filePath);

  const [url] = await file.getSignedUrl({
    action: options.action,
    expires: Date.now() + (options.expiresInSeconds || 3600) * 1000,
    contentType: options.contentType,
  });

  return url;
};

export const getUploadSignedUrl = async (
  bucketName: string,
  filePath: string,
  contentType: string,
  expiresInSeconds = 900
): Promise<{ uploadUrl: string; path: string }> => {
  const url = await getSignedUrl(bucketName, filePath, {
    action: 'write',
    expiresInSeconds,
    contentType,
  });
  return { uploadUrl: url, path: filePath };
};