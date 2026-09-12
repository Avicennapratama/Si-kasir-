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
import { NODE_ENV, FIREBASE_PROJECT_ID } from '../config/env.js';

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
  // DEV-ONLY bypass: dev-server lokal (scripts/dev-server.mjs) tidak punya
  // credential Admin untuk mint ID token, jadi pengujian end-to-end pakai
  // header x-dev-uid. Di production NODE_ENV=production -> jalur ini mati
  // total dan token asli tetap wajib.
  if (NODE_ENV !== 'production' && headers['x-dev-uid']) {
    return {
      uid: String(headers['x-dev-uid']),
      sub: String(headers['x-dev-uid']),
      aud: FIREBASE_PROJECT_ID,
      firebase: { sign_in_provider: 'dev-bypass' },
    } as unknown as adminTypes.auth.DecodedIdToken;
  }

  const authHeader = headers.authorization || headers.Authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    throw new functions.https.HttpsError('unauthenticated', 'No Bearer token provided');
  }
  const token = authHeader.substring(7);
  return await admin.auth().verifyIdToken(token);
}