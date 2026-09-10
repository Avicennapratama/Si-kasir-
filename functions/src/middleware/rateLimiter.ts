/**
 * Rate Limiting Middleware
 *
 * CATATAN PENTING soal akurasi: limiter in-memory TIDAK akurat di
 * Firebase Functions, karena instance bisa lebih dari satu dan di-scale
 * otomatis — tiap instance punya Map sendiri. Untuk produksi yang ketat,
 * ganti dengan Redis/Firestore-backed limiter. Versi ini cukup untuk
 * meredam penyalahgunaan ringan selama pengembangan.
 */

import { RATE_LIMITS } from '../config/limits.js';
import { Request, Response, NextFunction } from 'express';

interface Bucket {
  count: number;
  resetAt: number;
}

/**
 * Batasi ukuran Map supaya tidak bocor memori pada instance yang
 * hidup lama. Jika sudah penuh, kunci kedaluwarsa dibersihkan dulu;
 * bila masih penuh, kunci terlama dibuang.
 */
const MAX_ENTRIES = 5000;

export const rateLimiter = (limit?: number) => {
  const requests = new Map<string, Bucket>();
  const limitPerMin = limit || RATE_LIMITS.general;

  // Bersih-bersih berkala — tanpa ini Map tumbuh tanpa batas.
  // .unref() agar timer tidak menghalangi proses Node untuk exit.
  const sweeper = setInterval(() => {
    const now = Date.now();
    // Hindari `for...of` langsung di Map — beberapa konfigurasi TS (frontend)
    // menolak iterasi Map tanpa downlevelIteration. `forEach` aman.
    const stale: string[] = [];
    requests.forEach((bucket, key) => {
      if (bucket.resetAt <= now) stale.push(key);
    });
    for (const key of stale) requests.delete(key);
  }, 60_000);
  sweeper.unref?.();

  const evictIfNeeded = (now: number) => {
    if (requests.size < MAX_ENTRIES) return;
    // Bersihkan yang kedaluwarsa dulu (tanpa for...of di Map).
    const stale: string[] = [];
    requests.forEach((bucket, key) => {
      if (bucket.resetAt <= now) stale.push(key);
    });
    for (const key of stale) requests.delete(key);

    if (requests.size >= MAX_ENTRIES) {
      // Buang sebagian entri lama supaya Map tidak terus membesar.
      const target = Math.floor(MAX_ENTRIES / 2);
      let removed = 0;
      const keys: string[] = [];
      requests.forEach((_, key) => keys.push(key));
      for (const key of keys) {
        if (removed >= target) break;
        requests.delete(key);
        removed++;
      }
    }
  };

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const key = req.ip || 'unknown';
    const now = Date.now();

    evictIfNeeded(now);

    const entry = requests.get(key);
    if (entry && entry.resetAt > now) {
      if (entry.count >= limitPerMin) {
        res.status(429).json({ error: 'Too many requests, please try again later' });
        return;
      }
      entry.count++;
    } else {
      requests.set(key, { count: 1, resetAt: now + 60 * 1000 });
    }

    next();
  };
};
