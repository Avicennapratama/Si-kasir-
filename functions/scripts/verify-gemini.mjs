/**
 * Verifikasi cepat integrasi Gemini: pastikan balasan ASLI, bukan mock.
 * Jalankan: node scripts/verify-gemini.mjs
 */
import { config } from 'dotenv';
config({ path: new URL('../.env', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1') });

const { chatWithAssistant } = await import('../lib/ai/chatAssistant.js');
const { geminiClient } = await import('../lib/ai/geminiClient.js');

let failed = 0;

// 1. Asisten chat (legalitas & bisnis UMKM)
const chat = await chatWithAssistant({
  businessId: 'test-biz',
  message: 'Apa saja syarat mengurus NIB untuk usaha kecil?',
});
const isMock = chat.reply.includes('MOCK');
console.log('--- ASISTEN ---');
console.log('mock?', isMock);
console.log(chat.reply.slice(0, 400));
if (isMock) failed++;

// 2. Ekstraksi suara -> transaksi (JSON mode)
const voice = await geminiClient.extractFromVoice('beli tepung 2 karung 90 ribu');
console.log('\n--- VOICE EXTRACT ---');
console.log(JSON.stringify(voice));
if (voice.note?.startsWith('[MOCK]')) failed++;

// 3. Pastikan rotasi key terbaca semua
console.log('\n--- KEY ROTATION ---');
console.log('jumlah key terbaca:', geminiClient.apiKeys.length);
if (geminiClient.apiKeys.length !== 8) failed++;

console.log('\n' + (failed === 0 ? 'SEMUA OK' : `${failed} GAGAL`));
process.exit(failed === 0 ? 0 : 1);
