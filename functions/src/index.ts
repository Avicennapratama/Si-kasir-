/**
 * Main Firebase Functions entry point
 *
 * Membangun satu Express app dan mengekspornya sebagai HTTPS function `api`.
 * Seluruh routing didelegasikan ke routes/index.ts.
 */

import * as functions from 'firebase-functions';
// firebase-admin adalah CJS; dengan "type":"module" nilai runtime
// hanya tersedia lewat default export.
import admin from 'firebase-admin';
import express from 'express';
import cors from 'cors';

import { setupRoutes } from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';
import { rateLimiter } from './middleware/rateLimiter.js';

// Initialize admin (idempotent)
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const app = express();

app.use(cors({ origin: true }));

// Payload nota/gambar base64 bisa besar; default Express 100kb terlalu kecil.
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(requestLogger);
app.use(rateLimiter());

// Health check — publik, tanpa auth. Berguna untuk memastikan
// emulator/deploy benar-benar hidup sebelum debug hal lain.
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'sikasir-ai-functions',
    time: new Date().toISOString(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

setupRoutes(app);

// 404 untuk route tak dikenal — sertakan path agar salah ketik cepat kelihatan.
app.use((req, res) => {
  res.status(404).json({ error: `Not found: ${req.method} ${req.originalUrl}` });
});

// Error handler harus dipasang paling akhir.
app.use(errorHandler);

export const api = functions.https.onRequest(app);

// Endpoint callable lama — dihapus untuk keamanan.
