/**
 * Benchmark KASUS SULIT — input berisik seperti ucapan nyata UMKM.
 * Jalankan: node scripts/benchmark-hard.mjs
 *
 * Kasus yang sengaja dipilih untuk menjebol parser heuristik:
 * singkatan, angka tanpa unit, campur kode, salah dengar, ambigu.
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

const CASES = [
  // --- Singkatan & angka mentah ---
  { text: 'laku mie ayam 30rb', type: 'income', amount: 30000 },
  { text: 'beli tepung 125k', type: 'expense', amount: 125000 },
  { text: 'omzet hari ini 2jt', type: 'income', amount: 2000000 },
  { text: 'jual 50rb', type: 'income', amount: 50000 },
  { text: 'bayar listrik 200rb', type: 'expense', amount: 200000 },
  { text: 'kulakan 1.5jt', type: 'expense', amount: 1500000 },

  // --- Angka tanpa unit (konvensi lisan: "dua lima" = 25 ribu) ---
  { text: 'laku dua lima', type: 'income', amount: 25000 },
  { text: 'beli gas tiga lima', type: 'expense', amount: 35000 },

  // --- Campur kode / bahasa gaul ---
  { text: 'closing nasi goreng 45 ribu', type: 'income', amount: 45000 },
  { text: 'restock minyak 250rb', type: 'expense', amount: 250000 },
  { text: 'cuan hari ini 800 ribu', type: 'income', amount: 800000 },

  // --- Tanpa kata kunci income/expense (ambigu, harus ditebak dari konteks) ---
  { text: 'tepung 125 ribu', type: 'expense', amount: 125000 },
  { text: 'mie ayam 30 ribu', type: 'income', amount: 30000 },
  { text: 'gaji karyawan 1.5jt', type: 'expense', amount: 1500000 },

  // --- Kalimat panjang dengan konteks ---
  { text: 'tadi pagi ada yang beli bakso lima porsi habis seratus ribu', type: 'income', amount: 100000 },
  { text: 'barusan bayar ongkir ke supplier lima puluh ribu', type: 'expense', amount: 50000 },
  { text: 'hari ini warung laku delapan ratus lima puluh ribu total', type: 'income', amount: 850000 },

  // --- Salah dengar / typo dari speech-to-text ---
  { text: 'laku mie ayam tiga puluh rebu', type: 'income', amount: 30000 },
  { text: 'beli telor dua puluh ribu', type: 'expense', amount: 20000 },

  // --- Negasi / koreksi ---
  { text: 'bukan pengeluaran, ini pemasukan lima ratus ribu', type: 'income', amount: 500000 },

  // --- Satuan non-rupiah yang harus diabaikan ---
  { text: 'beli 5 kilo tepung 60 ribu', type: 'expense', amount: 60000 },
  { text: 'laku 3 porsi sate 75 ribu', type: 'income', amount: 75000 },

  // --- Angka besar ---
  { text: 'omzet bulan ini 15jt', type: 'income', amount: 15000000 },
  { text: 'bayar sewa tahunan 12jt', type: 'expense', amount: 12000000 },
];

const pct = (n, d) => d === 0 ? '0.0' : ((n / d) * 100).toFixed(1);
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();

// ---------- LOKAL ----------
let lBoth = 0, lType = 0, lAmt = 0;
const lFails = [];
const t0 = performance.now();
for (const c of CASES) {
  const r = parseIndonesianVoice(c.text);
  const tOk = r.type === c.type, aOk = r.amount === c.amount;
  if (tOk) lType++; if (aOk) lAmt++;
  if (tOk && aOk) lBoth++;
  else lFails.push({ t: c.text, want: `${c.type}/${c.amount}`, got: `${r.type}/${r.amount}`, conf: r.confidence });
}
const lMs = performance.now() - t0;

// ---------- GEMINI ----------
const { geminiClient } = await import('../lib/ai/geminiClient.js');
let gBoth = 0, gType = 0, gAmt = 0, gErr = 0;
const gFails = [];
const lats = [];
for (const c of CASES) {
  const s = performance.now();
  try {
    const r = await geminiClient.extractFromVoice(c.text);
    lats.push(performance.now() - s);
    const tOk = r.type === c.type, aOk = r.amount === c.amount;
    if (tOk) gType++; if (aOk) gAmt++;
    if (tOk && aOk) gBoth++;
    else gFails.push({ t: c.text, want: `${c.type}/${c.amount}`, got: `${r.type}/${r.amount}` });
  } catch (e) {
    gErr++; lats.push(performance.now() - s);
    gFails.push({ t: c.text, want: `${c.type}/${c.amount}`, got: `ERR ${e.message.slice(0, 50)}` });
  }
}
lats.sort((a, b) => a - b);
const gAvg = lats.reduce((a, b) => a + b, 0) / lats.length;
const gP95 = lats[Math.floor(lats.length * 0.95)];

console.log('══════════════════════════════════════════════════════');
console.log(` KASUS SULIT (n=${CASES.length})`);
console.log('══════════════════════════════════════════════════════');
console.log(`                        LOKAL      GEMINI`);
console.log(`  type benar          ${String(lType).padStart(3)}/${CASES.length}     ${String(gType).padStart(3)}/${CASES.length}`);
console.log(`  amount benar        ${String(lAmt).padStart(3)}/${CASES.length}     ${String(gAmt).padStart(3)}/${CASES.length}`);
console.log(`  KEDUANYA benar      ${String(lBoth).padStart(3)}/${CASES.length}     ${String(gBoth).padStart(3)}/${CASES.length}`);
console.log(`  akurasi             ${pct(lBoth, CASES.length).padStart(5)}%    ${pct(gBoth, CASES.length).padStart(5)}%`);
console.log(`  latency/input       ${(lMs / CASES.length).toFixed(2).padStart(6)}ms  ${gAvg.toFixed(0).padStart(6)}ms`);
console.log(`  error               ${String(0).padStart(6)}      ${String(gErr).padStart(4)}`);

console.log('\n--- LOKAL GAGAL ---');
lFails.forEach(f => console.log(`  "${f.t}"\n     mau ${f.want} | dapat ${f.got} (conf ${f.conf})`));
console.log('\n--- GEMINI GAGAL ---');
gFails.length ? gFails.forEach(f => console.log(`  "${f.t}"\n     mau ${f.want} | dapat ${f.got}`)) : console.log('  (tidak ada)');

// Kesimpulan kuantitatif
console.log('\n══════════════════════════════════════════════════════');
const failRateLocal = 1 - lBoth / CASES.length;
const failRateGem = 1 - gBoth / CASES.length;
console.log(`  gagal lokal  : ${(failRateLocal * 100).toFixed(1)}%  (1 dari ${failRateLocal > 0 ? (1 / failRateLocal).toFixed(1) : '∞'} input)`);
console.log(`  gagal gemini : ${(failRateGem * 100).toFixed(1)}%  (1 dari ${failRateGem > 0 ? (1 / failRateGem).toFixed(1) : '∞'} input)`);
console.log(`  rasio akurasi: gemini ${(gBoth / Math.max(lBoth, 1)).toFixed(2)}x lebih akurat`);
console.log(`  rasio latency: gemini ${(gAvg / Math.max(lMs / CASES.length, 0.01)).toFixed(0)}x lebih lambat`);
