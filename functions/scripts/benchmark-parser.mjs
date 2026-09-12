/**
 * Benchmark jujur: parser lokal vs Gemini, pada input kasir UMKM nyata.
 * Jalankan: node scripts/benchmark-parser.mjs
 *
 * Metrik: akurasi field (type/amount), latency, dan kasus gagal.
 */
import { config } from 'dotenv';
config({ path: new URL('../.env', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1') });

// Parser lokal ada di TypeScript di root project. Compile sekali ke _bench/
// supaya skrip ini bisa dijalankan langsung tanpa langkah manual.
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
const root = new URL('../../', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const benchDir = new URL('./_bench/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
if (!existsSync(benchDir)) mkdirSync(benchDir, { recursive: true });
execSync(
  'npx tsc lib/ai/voice-parser.ts --outDir functions/scripts/_bench --module esnext --target es2022 --moduleResolution bundler',
  { cwd: root, stdio: 'ignore' }
);
const { parseIndonesianVoice } = await import('./_bench/voice-parser.js');

// Test set: kalimat yang realistis diucapkan pemilik warung/toko.
// `expect` = hasil yang BENAR menurut manusia.
const CASES = [
  { text: 'laku dua porsi mie ayam tiga puluh ribu', type: 'income', amount: 30000 },
  { text: 'beli tepung lima kilo seratus dua puluh lima ribu', type: 'expense', amount: 125000 },
  { text: 'bayar listrik dua ratus ribu', type: 'expense', amount: 200000 },
  { text: 'omzet dua juta', type: 'income', amount: 2000000 },
  { text: 'terima lima puluh ribu dari pelanggan', type: 'income', amount: 50000 },
  { text: 'beli gas tiga puluh lima ribu', type: 'expense', amount: 35000 },
  { text: 'jual es teh lima ribu', type: 'income', amount: 5000 },
  { text: 'bayar gaji karyawan satu juta lima ratus ribu', type: 'expense', amount: 1500000 },
  { text: 'kulakan minyak goreng dua ratus lima puluh ribu', type: 'expense', amount: 250000 },
  { text: 'laku nasi goreng empat puluh lima ribu', type: 'income', amount: 45000 },
  { text: 'beli sayur tujuh puluh lima ribu', type: 'expense', amount: 75000 },
  { text: 'pendapatan hari ini delapan ratus ribu', type: 'income', amount: 800000 },
  { text: 'bayar wifi seratus lima puluh ribu', type: 'expense', amount: 150000 },
  { text: 'jual seratus bungkus kue dua ratus ribu', type: 'income', amount: 200000 },
  { text: 'belanja bahan baku enam ratus ribu', type: 'expense', amount: 600000 },
  { text: 'dapat dua ratus lima puluh ribu dari catering', type: 'income', amount: 250000 },
  { text: 'bayar sewa lapak satu juta dua ratus ribu', type: 'expense', amount: 1200000 },
  { text: 'laku tiga puluh gelas kopi empat ratus lima puluh ribu', type: 'income', amount: 450000 },
  { text: 'beli telur dua puluh ribu', type: 'expense', amount: 20000 },
  { text: 'omzet seminggu tiga juta lima ratus ribu', type: 'income', amount: 3500000 },
];

const pct = (n, d) => d === 0 ? '0.0' : ((n / d) * 100).toFixed(1);

// ---------- 1. PARSER LOKAL ----------
console.log('══════════════════════════════════════════════════════');
console.log(' 1. PARSER LOKAL (lib/ai/voice-parser.ts)');
console.log('══════════════════════════════════════════════════════');
let localTypeOk = 0, localAmtOk = 0, localBothOk = 0;
const localFailures = [];
const t0 = performance.now();
for (const c of CASES) {
  const r = parseIndonesianVoice(c.text);
  const tOk = r.type === c.type;
  const aOk = r.amount === c.amount;
  if (tOk) localTypeOk++;
  if (aOk) localAmtOk++;
  if (tOk && aOk) localBothOk++;
  else localFailures.push({ text: c.text, want: `${c.type} ${c.amount}`, got: `${r.type} ${r.amount}` });
}
const localMs = performance.now() - t0;
console.log(`  type  benar : ${localTypeOk}/${CASES.length}  (${pct(localTypeOk, CASES.length)}%)`);
console.log(`  amount benar: ${localAmtOk}/${CASES.length}  (${pct(localAmtOk, CASES.length)}%)`);
console.log(`  KEDUANYA benar: ${localBothOk}/${CASES.length}  (${pct(localBothOk, CASES.length)}%)`);
console.log(`  total waktu : ${localMs.toFixed(1)} ms untuk ${CASES.length} input  (${(localMs / CASES.length).toFixed(2)} ms/input)`);
if (localFailures.length) {
  console.log('  GAGAL:');
  localFailures.forEach(f => console.log(`    "${f.text}"\n       mau: ${f.want}  |  dapat: ${f.got}`));
}

// ---------- 2. GEMINI ----------
console.log('\n══════════════════════════════════════════════════════');
console.log(' 2. GEMINI (gemini-2.5-flash, thinking off)');
console.log('══════════════════════════════════════════════════════');
const { geminiClient } = await import('../lib/ai/geminiClient.js');
let gTypeOk = 0, gAmtOk = 0, gBothOk = 0, gErr = 0;
const gFailures = [];
const latencies = [];
for (const c of CASES) {
  const s = performance.now();
  try {
    const r = await geminiClient.extractFromVoice(c.text);
    latencies.push(performance.now() - s);
    const tOk = r.type === c.type;
    const aOk = r.amount === c.amount;
    if (tOk) gTypeOk++;
    if (aOk) gAmtOk++;
    if (tOk && aOk) gBothOk++;
    else gFailures.push({ text: c.text, want: `${c.type} ${c.amount}`, got: `${r.type} ${r.amount}` });
  } catch (e) {
    gErr++;
    latencies.push(performance.now() - s);
    gFailures.push({ text: c.text, want: `${c.type} ${c.amount}`, got: `ERROR ${e.message.slice(0, 60)}` });
  }
}
latencies.sort((a, b) => a - b);
const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;
const p50 = latencies[Math.floor(latencies.length * 0.5)];
const p95 = latencies[Math.floor(latencies.length * 0.95)];
console.log(`  type  benar : ${gTypeOk}/${CASES.length}  (${pct(gTypeOk, CASES.length)}%)`);
console.log(`  amount benar: ${gAmtOk}/${CASES.length}  (${pct(gAmtOk, CASES.length)}%)`);
console.log(`  KEDUANYA benar: ${gBothOk}/${CASES.length}  (${pct(gBothOk, CASES.length)}%)`);
console.log(`  error       : ${gErr}`);
console.log(`  latency     : avg ${avg.toFixed(0)}ms | p50 ${p50.toFixed(0)}ms | p95 ${p95.toFixed(0)}ms`);
if (gFailures.length) {
  console.log('  GAGAL:');
  gFailures.forEach(f => console.log(`    "${f.text}"\n       mau: ${f.want}  |  dapat: ${f.got}`));
}

// ---------- RINGKASAN ----------
console.log('\n══════════════════════════════════════════════════════');
console.log(' RINGKASAN');
console.log('══════════════════════════════════════════════════════');
console.log(`  akurasi lokal : ${pct(localBothOk, CASES.length)}%  |  ${(localMs / CASES.length).toFixed(2)} ms/input  |  biaya Rp0  |  offline OK`);
console.log(`  akurasi gemini: ${pct(gBothOk, CASES.length)}%  |  ${avg.toFixed(0)} ms/input  |  biaya quota   |  butuh internet`);
