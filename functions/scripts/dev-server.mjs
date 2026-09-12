/**
 * Runner Express lokal — TANPA Firebase emulator.
 *
 * Berguna untuk cek cepat bahwa routing/middleware benar tanpa
 * menunggu emulator (yang butuh Java + login firebase).
 *
 * Jalankan:  node scripts/dev-server.mjs
 * Catatan: route ber-auth tetap butuh Firebase ID token asli.
 */
import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';

config({ path: new URL('../.env', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1') });

// Dev-server berjalan di luar Firebase runtime, jadi Google Auth butuh tahu
// project-nya secara eksplisit (di produksi ini disediakan oleh runtime).
process.env.GCLOUD_PROJECT ||= process.env.FIREBASE_PROJECT_ID || 'kasir-2a2c6';
process.env.FIREBASE_CONFIG ||= JSON.stringify({ projectId: process.env.GCLOUD_PROJECT });

const { setupRoutes } = await import('../lib/routes/index.js');
const { errorHandler } = await import('../lib/middleware/errorHandler.js');
const { requestLogger } = await import('../lib/middleware/requestLogger.js');

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: '10mb' }));
app.use(requestLogger);

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    mode: 'local-express',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

setupRoutes(app);

app.use((req, res) => {
  res.status(404).json({ error: `Not found: ${req.method} ${req.originalUrl}` });
});
app.use(errorHandler);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`[dev-server] http://localhost:${PORT}`);
  console.log(`[dev-server] health: http://localhost:${PORT}/health`);
});
