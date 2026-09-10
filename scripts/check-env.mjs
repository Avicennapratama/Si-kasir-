#!/usr/bin/env node
/**
 * Cek kelengkapan .env tanpa membocorkan nilainya.
 * Jalankan: node scripts/check-env.mjs
 */
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const PLACEHOLDERS = [
  'AIzaSyFakeKeyForDevelopmentOnly',
  '1234567890',
  '1:1234567890:web:abcdef123456',
  'sikasir-ai.firebaseapp.com',
  'sikasir-ai.appspot.com',
  'your-api-key',
  'xxx',
  '',
];

function parseEnv(path) {
  if (!existsSync(path)) return null;
  const out = {};
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i === -1) continue;
    out[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
  return out;
}

// Firebase config asli punya bentuk yang khas — cek format, bukan isi.
const SHAPES = {
  NEXT_PUBLIC_FIREBASE_API_KEY: [/^AIza[0-9A-Za-z_-]{35}$/, 'harus diawali "AIza" + 35 karakter'],
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: [/\.firebaseapp\.com$/, 'harus berakhiran .firebaseapp.com'],
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: [/\.(appspot\.com|firebasestorage\.app)$/, 'harus .appspot.com atau .firebasestorage.app'],
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: [/^\d{6,}$/, 'harus angka saja'],
  NEXT_PUBLIC_FIREBASE_APP_ID: [/^\d+:\d+:web:[0-9a-f]+$/, 'format 1:123:web:abc'],
  NEXT_PUBLIC_BASE_URL: [/^https?:\/\/.+/, 'harus diawali http:// atau https://'],
  GEMINI_API_KEY: [/^AIza[0-9A-Za-z_-]{35}$/, 'harus diawali "AIza" + 35 karakter'],
};

let bad = 0, warn = 0;

function check(label, path, required, optional = []) {
  console.log(`\n${label}`);
  console.log('─'.repeat(58));
  const env = parseEnv(path);
  if (!env) {
    console.log(`  ✗ TIDAK ADA — ${path.replace(root, '.')}`);
    bad++;
    return;
  }
  for (const key of required) {
    const v = env[key];
    if (v === undefined) { console.log(`  ✗ ${key}\n      hilang dari file`); bad++; continue; }
    if (PLACEHOLDERS.includes(v)) { console.log(`  ✗ ${key}\n      masih placeholder/kosong`); bad++; continue; }
    const shape = SHAPES[key];
    if (shape && !shape[0].test(v)) { console.log(`  ⚠ ${key}\n      format aneh — ${shape[1]}`); warn++; continue; }
    console.log(`  ✓ ${key}  (${v.length} char)`);
  }
  for (const key of optional) {
    const v = env[key];
    if (!v || PLACEHOLDERS.includes(v)) console.log(`  · ${key}  (opsional, kosong)`);
    else console.log(`  ✓ ${key}  (${v.length} char)`);
  }
}

console.log('\n╔══════════════════════════════════════════════════════╗');
console.log('║  SiKasir AI — Environment Check                      ║');
console.log('╚══════════════════════════════════════════════════════╝');

check('FRONTEND  .env', join(root, '.env'), [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
  'NEXT_PUBLIC_BASE_URL',
]);

check('BACKEND   functions/.env', join(root, 'functions', '.env'),
  ['GEMINI_API_KEY'],
  ['VERTEX_AI_PROJECT', 'FIREBASE_PROJECT_ID']);

// Secret tidak boleh bocor ke bundle browser.
const fe = parseEnv(join(root, '.env')) || {};
const leaked = Object.keys(fe).filter(k => k.startsWith('NEXT_PUBLIC_') && /GEMINI|SECRET|PRIVATE|SERVICE_ACCOUNT/i.test(k));
if (leaked.length) {
  console.log('\n🚨 BAHAYA — secret ter-expose ke browser');
  console.log('─'.repeat(58));
  leaked.forEach(k => console.log(`  ✗ ${k} — hapus prefix NEXT_PUBLIC_ & pindah ke functions/.env`));
  bad += leaked.length;
}

console.log('\n' + '═'.repeat(58));
if (bad === 0 && warn === 0) console.log('✅ Semua env siap.');
else console.log(`${bad ? '❌' : '⚠️ '} ${bad} error, ${warn} warning.`);
console.log('═'.repeat(58) + '\n');
process.exit(bad ? 1 : 0);
