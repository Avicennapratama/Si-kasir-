# 🏗️ SiKasir AI — Arsitektur Sistem

## Overview

SiKasir AI adalah aplikasi PWA untuk manajemen operasi bisnis UMKM/Ekraf Indonesia. Aplikasi ini menggabungkan **frontend Next.js** dengan **backend Firebase Functions** dan **AI Google Gemini** untuk fitur cerdas (OCR, caption, HKI valuation, chatbot).

Arsitektur dibagi ke 4 lapisan: **Presentation**, **Business**, **Data**, **AI**.

---

## 📦 Lapisan Presentation (Frontend)

- **Framework**: Next.js 14 (App Router) + TypeScript
- **UI Library**: Tailwind CSS + shadcn/ui + Lucide Icons
- **Routing**: File-based di `app/(app)/` dan `app/(auth)/`
- **State Management**: Zustand (stores di `lib/stores/`)
- **Auth**: Firebase Authentication (context di `lib/firebase/auth-context.tsx`)
- **Offline Support**: IndexedDB via `lib/offline/` (outbox/sync queue)
- **Build Output**: `.next/`, static assets di `public/`

**Entry points**:
- `app/page.tsx` — halaman utama (terproteksi auth)
- `app/(auth)/login/page.tsx` — onboarding/login
- `app/(app)/dashboard/page.tsx` — dashboard utama
- `app/(app)/studio/page.tsx` — fitur AI (caption, HKI, chat)

---

## 🧠 Lapisan AI & Backend

### Cloud Functions (Node.js + Express)

Semua pemanggilan AI dilakukan dari backend serverless, bukan langsung dari client. Alasan: menyembunyikan API key Gemini dan mengelola rate limiting.

**Fungsi utama** (`functions/lib/functions/`):

| Fungsi | Input | Output AI | Tujuan |
|---|---|---|---|
| `captionGenerator` | gambar produk | caption Ig/TikTok | media sosial |
| `chatAssistant` | pertanyaan user | jawaban regulasi UMKM/PIRT/Halal | asisten chatbot |
| `hkiAnalyzer` | dokumen/deskripsi | estimasi nilai HKI | pra-valuasi kekayaan intelektual |
| `receiptExtractor` | foto bon/nota | daftar barang, jumlah, harga | OCR otomatis |
| `voiceExtractor` | audio user | teks perintah | pencatatan suara |

**Middleware utama** (`functions/lib/middleware/`):
- `authMiddleware` — verifikasi token Firebase sebelum menjalankan fungsi
- `rateLimiter` — batasi request per user/per jam
- `uploadLimiter` — batasi ukuran unggahan media

**AI Client** (`functions/lib/ai/`):
- `geminiClient.js` — wrapper untuk Google Gemini API (model 1.5 Flash)
- `responseNormalizer.js` — konsisten format output antar fungsi
- `confidenceEvaluator.js` — skor kepercayaan hasil generasi AI

**Firestore Repos** (`functions/lib/firestore/`):
- `transactions.repo.js` — CRUD transaksi keuangan
- `drafts.repo.js` — pengelolaan draft (human-in-the-loop)
- `hkiValuations.repo.js` — catatan estimasi HKI
- `mediaAssets.repo.js` — referensi file gambar/video yang diunggah
- `studioAssets.repo.js — aset yang dihasilkan Studio Foto AI

### Flow AI Umum

1. **Client** → POST ke Cloud Function endpoint (dengan Firebase token)
2. **Middleware** — verifikasi otentikasi
3. **AI Processing** — panggil Google Gemini via `geminiClient.js`
4. **Normalization** — format output via `responseNormalizer.js`
5. **Simpan ke Firestore** — repo menulis ke collection sesuai tipe
6. **Response** → client diterima draft untuk review user

---

## 💾 Lapisan Data (Database)

### Firebase Firestore Structure

```
📁 firestore/
├── 📁 users/              {uid}
│   ├── profile            // nama, usaha, onboarding status
│   └── preferences        // tema, notifikasi, batas AI
├── 📁 businesses/         {uid}
│   ├── detail             // nama usaha, alamat, verifikasi
│   └── settings           // mata uang, format nota, AI settings
├── 📁 transactions/       // setiap baris = satu transaksi
│   ├── items              // array barang/jasa
│   ├── source             // manual/voice/scan
│   ├── ai_draft           // flag hasil AI draft
│   └── status             // draft/confirmed/cancelled
├── 📁 drafts/             // draft AI yang menunggu review
│   ├── type               // receipt/valuation/chat/caption
│   ├── source_id          // ID transaksi/photo asli
│   ├── content            // data hasil AI
│   ├── status             // pending/reviewed/rejected
│   └── reviewed_at        // timestamp review user
├── 📁 hki_valuations/     // estimasi HKI
│   ├── original_text      // teks asli yang dianalisis
│   ├── estimated_value    // nilai angka
│   ├── confidence         // skor kepercayaan
│   ├── created_at
│   └── reviewed_by        // uid user yang review
├── 📁 media_assets/       // referensi file yang diunggah
│   ├── path               // path di Cloud Storage
│   ├── type               // image/video/document
│   ├── associated_id      // transaksi atau draft
│   └── metadata           // dimensi, duration, etc
├── 📁 studio_assets/      // hasil Studio Foto AI
│   ├── source_id
│   ├── filtered_image     // path setelah filter otomatis
│   ├── generated_caption
│   └── created_at
├── 📁 audit_logs/         // activity tracking (opsional)
│   ├── user_id
│   ├── action             // create/update/delete
│   ├── timestamp
│   └── resource_type
└── 📁 offline_queue/      // antrean offline sync
    ├── batch_id
    ├── operations         // [type, path, payload]
    ├── status             // pending/synced/failed
    └── created_at
```

### Offline Sync Pattern

Aplikasi menggunakan strategi **Outbox Pattern** untuk mendukung offline:

1. **User action** (manual input, voice record, photo capture) → disimpan lokal ke `IndexedDB` (`lib/offline/outbox.ts`)
2. **Background sync** — saat koneksi pulih, `lib/offline/syncQueue.ts` mengirim batch ke Cloud Functions
3. **Conflict resolution** — `lib/offline/conflictResolver.ts` menangani versi yang bertabrakan menggunakan timestamp
4. **UI refleksi** — stores Zustand (`lib/stores/offline.store.ts`) memberi tahu status sync

---

## 🔐 Lapisan Keamanan

### Zero Credential Leak

- **API key Gemini** hanya ada di `functions/lib/config/gemini.js` (Cloud Functions environment)
- **Firebase config** hanya dibagikan ke client via `firebase.config.ts` (tidak ada `apiKey` di source code client)
- **Semua endpoint Cloud Functions** dilindungi oleh `authMiddleware` yang memeriksa Firebase ID token

### Data Validation

- **Firestore rules** (`firestore.rules`) — batasi akses berdasarkan `auth.uid`, validasi field sebelum write
- **Schema validation** — menggunakan zod atau manual validation di setiap controller sebelum write ke DB
- **Input sanitization** — semua input user di-*escape* sebelum dikirim ke Gemini API

### Rate Limiting & Abuse Prevention

- `functions/lib/config/limits.js` — konfigurasi per-user dan per-IP rate limit
- `functions/lib/middleware/rateLimiter.js` — middleware Express yang diterapkan ke semua AI endpoint
- **API key rotation** — konfigurasi di `functions/lib/config/gemini.js` mendukung 8+ kunci Gemini yang dirotasi otomatis

---

## 📊 Arsitektur Data Flow (EFK)

```
[User Client: Next.js]
        │
        ▼
[Firebase Auth]──┐
        │          ▼
[Firestore]────▶ [Cloud Functions]
        │          │
        │          ▼
[Gemini API]◄──┘
        │
        ▼
[Response → Client]
        │
        ▼
[Offline Queue → Sync]──▶ [Firestore]
```

---

## 🛠️ Development Workflow

### Local Development

```bash
# Frontend
cd sikasir-ai
npm run dev      # Next dev server (:3000)

# Backend Functions
cd sikasir-ai/functions
npm run dev      # Firebase emulators:start

# Together (via root package.json)
npm run dev      # (alias untuk menjalankan keduanya)
```

### CI/CD (didesain untuk GitHub Actions)

```yaml
# Minimal workflow: .github/workflows/ci.yml
name: CI/CD

on:
  push:
    branches: [main, release/*]
  pull_request:

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: {node-version: '20'}
      - run: npm install
      - run: npm run lint

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: {node-version: '20'}
      - run: npm install
      - run: npm test

  build:
    needs: [lint, test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: {node-version: '20'}
      - run: npm install
      - run: npm run build  # next build

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: {node-version: '20'}
      - run: npm install
      - run: npm run functions:deploy  # firebase deploy --only functions
```

---

## 📈 Monitoring & Observability

### Firebase Extensions yang digunakan (opsional)

- **Firebase Authentication** — login sosial/email
- **Firestore** — database NoSQL
- **Cloud Functions** — backend logic
- **Cloud Storage** — unggahan media
- **Cloud Logging** — error tracking

### Custom Metrics (didesain untuk add later)

- `ai_request_count` — total request AI per hari
- `ai_success_rate` — persentase request berhasil (bukan error)
- `offline_sync_success_rate` — persentase sync offline berhasil
- `user_session_duration` — lama user aktif di aplikasi

### Error Tracking

- **Firestore error documents** — error yang terjadi di Cloud Functions ditulis ke collection `audit_logs` dengan `action: 'error'`
- **Client error boundary** — Next.js `error.tsx` menangkap error runtime dan menampilkan fallback UI

---

## 🚀 Deployment Checklist

Sebelum push ke produksi:

- [ ] **API key Gemini** terverifikasi di `functions/lib/config/gemini.js`
- [ ] **Firebase project** sudah konfigurasi (google-services.json / google-services.ios.json)
- [ ] **Firestore rules** sesuai environment (development vs production)
- [ ] **Rate limiter** threshold sesuai target QPS
- [ ] **Env variables** ter-set di Firebase Dashboard (GEMINI_API_KEY, NODE_ENV=production)
- [ ] **Domain SSL** terpasang jika custom domain digunakan
- [ ] **Backup Firestore** — snapshot harian (atau Firebase Point-in-Time Recovery)
- [ ] **Monitoring** — error rates < 1% dari total request

---

## 📦 Dependencies Critical

| Category | Package | Version | Catatan |
|---|---|---|---|
| **Frontend** | next | ^14.2.15 | App Router |
| | react | ^18.3.1 | |
| | react-dom | ^18.3.1 | |
| | tailwindcss | ^3.4.14 | |
| | typescript | ^5.6.3 | |
| | zustand | ^5.0.0 | state management |
| | lucide-react | ^0.454.0 | icons |
| | @hookform/resolvers | ^3.9.0 | (jika ada) |
| **Backend** | firebase-admin | ^12.18.0 | di Cloud Functions |
| | firebase-functions | ^4.5.0 | |
| | express | ^4.19.2 | routing Functions |
| **AI** | @google/generative-ai | ^0.21.0 | Gemini client |
| **Utilities** | date-fns | ^3.6.0 | manipulasi tanggal |
| | clsx | ^2.1.1 | className conditional |
| | tailwind-merge | ^2.6.1 | UTW conflict resolution |

---

## 📚 Referensi Lain

- `SUMMARY.md` — struktur navigasi dokumentasi repo
- `audit_backend.json`, `audit_frontend.json`, `audit_infra.json` — catatan audit sistem
- `lib/api/` — kontrak API antar modul (type definitions)
- `tests/` — unit test konfigurasi