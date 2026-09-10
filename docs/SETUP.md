# Setup & Menjalankan SiKasir AI

## Arsitektur singkat

Backend **bukan** Next.js API routes — folder `app/api/` sengaja kosong.
Backend adalah **Firebase Functions**: satu Express app di
`functions/src/index.ts`, diekspor sebagai HTTPS function bernama `api`.

```
Browser → Next.js (:3000) → apiFetch() → Firebase Functions (:5001) → Firestore
                                ↑                    ↓
                       Firebase ID token         Gemini API
```

## 1. Isi environment

```bash
cp .env.example .env                     # kalau belum ada
cp functions/.env.example functions/.env # kalau belum ada
```

| Nilai | Ambil di mana |
|---|---|
| 6 var `NEXT_PUBLIC_FIREBASE_*` | Firebase Console → Project Settings → Your apps → Web → Config |
| `GEMINI_API_KEY` | https://aistudio.google.com/apikey (gratis) |

Jangan taruh `GEMINI_API_KEY` di `.env` root. Var berprefix
`NEXT_PUBLIC_` ikut ter-bundle ke browser dan key-nya akan bocor.

Aktifkan juga: Firebase Console → Authentication → Sign-in method → Google → Enable.

Cek hasilnya:

```bash
npm run check:env
```

## 2. Jalankan

Butuh **dua terminal**.

```bash
# Terminal 1 — backend
npm run functions:dev      # build TS lalu start Express di :5001

# Terminal 2 — frontend
npm run dev                # Next.js di :3000
```

Verifikasi backend:

```bash
curl http://localhost:5001/health
# {"status":"ok","geminiConfigured":true}
```

`geminiConfigured: false` berarti `GEMINI_API_KEY` belum terbaca.

### Kalau butuh Firestore/Auth emulator

`npm run functions:dev` hanya menjalankan Express — cukup untuk cek
routing, tapi query Firestore akan gagal. Untuk stack penuh
(perlu Java + `firebase login`):

```bash
npm run functions:emulator   # Functions + Firestore + Auth + Storage
```

## 3. Daftar endpoint

Semua route selain `/health` butuh header `Authorization: Bearer <ID token>`.
`apiFetch()` di `lib/types/api.ts` sudah melampirkannya otomatis.

| Method | Path |
|---|---|
| GET | `/health` (publik) |
| GET | `/dashboard/summary`, `/dashboard/charts/:period` |
| GET POST PUT | `/transactions` |
| GET POST PUT DELETE | `/drafts` |
| POST | `/ai/receipt/extract` |
| POST | `/ai/voice/extract` |
| POST | `/assistant/chat` |
| POST | `/studio/enhance-image`, `/studio/generate-caption` |
| POST | `/hki/pre-valuation` |
| GET POST | `/reports` |
| GET | `/gamification/status` |
| GET PUT | `/settings` |

Tanpa token semuanya membalas **401**. Kalau dapat **404**, berarti
salah path atau `setupRoutes` tidak terpasang.

## Troubleshooting

**`Cannot find the middleware module` / semua halaman 500**
Cache dev korup. Stop dev server, lalu:
```bash
rm -rf .next && npm run dev
```

**`NEXT_PUBLIC_API_BASE_URL belum diset`**
Isi di `.env`, lalu **restart** `npm run dev`. Next hanya membaca env saat startup.

**Semua request 401 padahal sudah login**
Token hanya ada setelah Firebase Auth selesai inisialisasi. Pastikan
pemanggilan API terjadi sesudah `onAuthStateChanged`, bukan saat render pertama.

**Jawaban AI berawalan `[MOCK]`**
`GEMINI_API_KEY` kosong. Sistem sengaja fallback ke mock supaya UI tetap
bisa dikembangkan. Isi key lalu restart backend.

## Catatan teknis

`functions/package.json` memakai `"type": "module"`, sedangkan
`firebase-admin` adalah paket CommonJS. Karena itu impornya harus:

```ts
import admin from 'firebase-admin';              // nilai runtime
import type * as adminTypes from 'firebase-admin'; // namespace tipe
```

Dengan `import * as admin`, properti seperti `admin.apps` menjadi
`undefined` dan proses crash saat start.
