/**
 * MIME type validation for uploads
 */

import { SUPPORTED_IMAGE_MIME_TYPES } from '../ai/geminiClient.js';

export const ALLOWED_MIME_TYPES = [
  ...SUPPORTED_IMAGE_MIME_TYPES,
  'application/pdf',
];

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const validateMimeType = (mimeType: string): boolean => {
  return ALLOWED_MIME_TYPES.includes(mimeType);
};

export const validateFileSize = (size: number): boolean => {
  return size <= MAX_FILE_SIZE;
};

export const getMimeTypeFromExtension = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const mimeMap: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    heic: 'image/heic',
    pdf: 'application/pdf',
  };
  return mimeMap[ext] || 'application/octet-stream';
};