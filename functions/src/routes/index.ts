/**
 * Main routing index — memasang seluruh router ke instance Express.
 *
 * Semua router di folder ini sudah memanggil verifyAuthHeader sendiri,
 * jadi jangan pasang auth global di sini (nanti token diverifikasi 2x).
 */

import type { Express } from 'express';

import authRoutes from './auth.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import transactionRoutes from './transaction.routes.js';
import draftRoutes from './draft.routes.js';
import aiVoiceRoutes from './aiVoice.routes.js';
import aiReceiptRoutes from './aiReceipt.routes.js';
import studioRoutes from './studio.routes.js';
import hkiRoutes from './hki.routes.js';
import assistantRoutes from './assistant.routes.js';
import reportRoutes from './report.routes.js';
import gamificationRoutes from './gamification.routes.js';
import settingsRoutes from './settings.routes.js';

export const setupRoutes = (app: Express): void => {
  // Legacy/agregat: auth.routes menampung endpoint AI versi lama
  // (/extract-receipt, /assistant/chat, dst). Dipertahankan agar
  // pemanggil lama tidak rusak.
  app.use('/auth', authRoutes);

  app.use('/dashboard', dashboardRoutes);
  app.use('/transactions', transactionRoutes);
  app.use('/drafts', draftRoutes);
  app.use('/ai/voice', aiVoiceRoutes);
  app.use('/ai/receipt', aiReceiptRoutes);
  app.use('/studio', studioRoutes);
  app.use('/hki', hkiRoutes);
  app.use('/assistant', assistantRoutes);
  app.use('/reports', reportRoutes);
  app.use('/gamification', gamificationRoutes);
  app.use('/settings', settingsRoutes);
};

export default setupRoutes;
