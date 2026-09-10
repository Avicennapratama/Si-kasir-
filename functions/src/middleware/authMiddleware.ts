/**
 * Auth Middleware - extracted from index.ts
 */

import adminSdk from 'firebase-admin';
// firebase-admin CJS + "type":"module": nilai runtime ada di .default,
// namespace tipe diimpor terpisah lewat 'import type'.
import type * as adminTypes from 'firebase-admin';
const admin = adminSdk;
import * as functions from 'firebase-functions';
import { Request, Response, NextFunction } from 'express';

/**
 * Verify Firebase Auth ID token from request headers.
 * Replicates the logic from index.ts verifyAuthHeader.
 */
export async function verifyAuthHeader(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void>;

export async function verifyAuthHeader(headers: Record<string, any>): Promise<adminTypes.auth.DecodedIdToken>;

export async function verifyAuthHeader(
  reqOrHeaders: Request | Record<string, any>,
  res?: Response,
  next?: NextFunction
): Promise<void | adminTypes.auth.DecodedIdToken> {
  // Called as Express middleware (req, res, next)
  if (res && next) {
    const req = reqOrHeaders as Request;
    try {
      const decoded = await verifyToken(req.headers);
      (req as any).auth = decoded;
      next();
    } catch (err: any) {
      res.status(401).json({ error: err.message || 'Unauthenticated' });
    }
    return;
  }

  // Called as standalone function with headers object
  const headers = reqOrHeaders as Record<string, any>;
  return await verifyToken(headers);
}

async function verifyToken(headers: Record<string, any>): Promise<adminTypes.auth.DecodedIdToken> {
  const authHeader = headers.authorization || headers.Authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    throw new functions.https.HttpsError('unauthenticated', 'No Bearer token provided');
  }
  const token = authHeader.substring(7);
  return await admin.auth().verifyIdToken(token);
}