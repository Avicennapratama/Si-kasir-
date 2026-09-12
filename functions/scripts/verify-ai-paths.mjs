/**
 * Verifikasi semua jalur AI yang dipakai app benar-benar memanggil Gemini
 * (bukan mock). Jalankan: node scripts/verify-ai-paths.mjs
 */
import { config } from 'dotenv';
config({ path: new URL('../.env', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1') });

const { chatWithAssistant } = await import('../lib/ai/chatAssistant.js');
const { geminiClient } = await import('../lib/ai/geminiClient.js');
const { analyzeHki } = await import('../lib/ai/hkiAnalyzer.js');
const { generateProductCaptions } = await import('../lib/ai/captionGenerator.js');

let failed = 0;
const check = (name, ok, extra = '') => {
  console.log(`${ok ? 'OK    ' : 'GAGAL '} ${name}${extra ? ' — ' + extra : ''}`);
  if (!ok) failed++;
};

// 1. Asisten chat
try {
  const r = await chatWithAssistant({ businessId: 'x', message: 'Syarat NIB usaha kecil?' });
  check('asisten chat', !r.reply.includes('MOCK'), r.reply.slice(0, 60).replace(/\n/g, ' ') + '...');
} catch (e) { check('asisten chat', false, e.message); }

// 2. Voice -> transaksi
try {
  const v = await geminiClient.extractFromVoice('beli tepung 2 karung 90 ribu');
  check('voice extract', v.type === 'expense' && v.amount === 90000, JSON.stringify({ t: v.type, a: v.amount }));
} catch (e) { check('voice extract', false, e.message); }

// 3. HKI analyzer
try {
  const h = await analyzeHki({ businessId: 'x', brandName: 'Bakso Pak Budi', category: 'Merek Dagang' });
  check('hki analyzer', !!h && !JSON.stringify(h).includes('MOCK'), JSON.stringify(h).slice(0, 90) + '...');
} catch (e) { check('hki analyzer', false, e.message); }

// 4. Studio caption
try {
  const c = await generateProductCaptions({ productName: 'Bakso Sapi', category: 'Makanan', tone: 'promo', platform: 'instagram' });
  check('studio caption', !!c && !JSON.stringify(c).includes('MOCK'), JSON.stringify(c).slice(0, 90) + '...');
} catch (e) { check('studio caption', false, e.message); }

console.log('\n' + (failed === 0 ? 'SEMUA JALUR AI OK' : `${failed} GAGAL`));
process.exit(failed === 0 ? 0 : 1);
