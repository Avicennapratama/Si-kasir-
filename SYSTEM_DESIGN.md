# 🔧 SiKasir AI — System Design

Tata kelola teknis lengkap untuk pengembangan, testing, dan deployment.

---

## 📊 Database Schema (Firestore)

### Collection: `users`
| Field | Type | Description |
|---|---|---|
| `uid` | string | Firebase UID (primary key) |
| `displayName` | string | Nama lengkap pengguna |
| `email` | string | Email verifikasi |
| `onboardingCompleted` | boolean | Status selesai onboarding |
| `createdAt` | timestamp | Waktu registrasi |
| `updatedAt` | timestamp | Waktu terakhir update |

### Collection: `businesses`
| Field | Type | Description |
|---|---|---|
| `uid` | string | FK → users.uid |
| `name` | string | Nama usaha |
| `category` | string | Kategori usaha (foto/retail/jasa) |
| `currency` | string | Mata uang (IDR) |
| `address` | string | Alamat usaha |
| `phone` | string | Nomor telepon |
| `logoUrl` | string | Path Cloud Storage |
| `settings` | object | Setelan usaha (format nota, dll) |

### Collection: `transactions`
| Field | Type | Description |
|---|---|---|
| `id` | string | UUID unik |
| `uid` | string | FK → users.uid |
| `businessId` | string | FK → businesses.doc id |
| `source` | enum ['manual', 'voice', 'scan'] | Sumber transaksi |
| `items` | array | Array items transaksi |
| `subtotal` | number | Jumlah sebelum tax |
| `tax` | number | Persentase tax |
| `total` | number | Total akhir |
| `ai_draft` | boolean | Flag hasil AI draft |
| `status` | enum ['draft', 'confirmed', 'cancelled'] | Status transaksi |
| `createdAt` | timestamp | Waktu ciptaan |
| `updatedAt` | timestamp | Waktu update terakhir |

### Collection: `drafts`
| Field | Type | Description |
|---|---|---|
| `id` | string | UUID unik |
| `uid` | string | FK → users.uid |
| `type` | enum ['receipt', 'valuation', 'chat', 'caption'] | Tipe draft AI |
| `sourceId` | string | Referensi ke transaksi/photo asli |
| `content` | object | Data hasil AI (structured) |
| `status` | enum ['pending', 'reviewed', 'rejected'] | Status review |
| `reviewedBy` | string | UID user yang review (jika reviewed) |
| `reviewedAt` | timestamp | Waktu review |
| `createdAt` | timestamp | Waktu ciptaan |

### Collection: `hki_valuations`
| Field | Type | Description |
|---|---|---|
| `id` | string | UUID unik |
| `uid` | string | FK → users.uid |
| `originalText` | string | Teks asli yang dianalisis |
| `estimatedValue` | number | Nilai estimasi |
| `confidence` | number | Skor kepercayaan (0-1) |
| `createdAt` | timestamp | Waktu ciptaan |
| `reviewedBy` | string | UID user yang review |

### Collection: `media_assets`
| Field | Type | Description |
|---|---|---|
| `id` | string | UUID unik |
| `uid` | string | FK → users.uid |
| `path` | string | Path Cloud Storage |
| `type` | enum ['image', 'video', 'document'] | Jenis media |
| `associatedId` | string | FK → transactions.id / drafts.id |
| `metadata` | object | Metadata file (dimensi, duration) |
| `createdAt` | timestamp | Waktu unggah |

### Collection: `studio_assets`
| Field | Type | Description |
|---|---|---|
| `id` | string | UUID unik |
| `uid` | string | FK → users.uid |
| `sourceId` | string | ID produk asli |
| `filteredImage` | string | Path hasil filter AI |
| `generatedCaption` | string | Caption untuk media sosial |
| `createdAt` | timestamp | Waktu ciptaan |

### Collection: `offline_queue`
| Field | Type | Description |
|---|---|---|
| `batchId` | string | UUID batch ID |
| `operations` | array | Array operasi [type, path, payload] |
| `status` | enum ['pending', 'synced', 'failed'] | Status sync |
| `createdAt` | timestamp | Waktu antrean dibuat |
| `retryCount` | number | Jumlah percobaan ulang |

---

## 🌐 API Endpoints (Cloud Functions)

### Base URL: `https://us-central1-{project-id}.cloudfunctions.net/sikasir`

| Endpoint | Method | Auth | Request | Response |
|---|---|---|---|---|
| `/ai/caption` | POST | ✅ token | `{image: file, productName: string}` | `{caption: string, confidence: number}` |
| `/ai/chat` | POST | ✅ token | `{message: string, context: object}` | `{response: string, source: string}` |
| `/ai/hki` | POST | ✅ token | `{text: string, type: enum}` | `{estimatedValue: number, confidence: number}` |
| `/ai/receipt` | POST | ✅ token | `{image: file}` | `{items: array, totals: object}` |
| `/auth/refresh` | POST | ✅ token | `{}` | `{token: string, expiresAt: timestamp}` |
| `/transactions` | GET | ✅ token | `{uid?: string}` | `{transactions: array}` |
| `/transactions` | POST | ✅ token | `{businessId, items, source}` | `{transactionId: string}` |
| `/drafts` | GET | ✅ token | `{type, sourceId}` | `{drafts: array}` |
| `/drafts/:id` | PUT | ✅ token | `{status: enum}` | `{draftId: string, status: enum}` |
| `/hki-valuations` | POST | ✅ token | `{text, type}` | `{valuationId: string}` |
| `/studio` | POST | ✅ token | `{image, productName}` | `{filteredImage: string, caption: string}` |
| `/usage` | GET | ✅ token | `{}` | `{remaining: number, resetAt: timestamp}` |

**Middleware yang diterapkan:**
- `authMiddleware` — verifikasi Firebase ID token di setiap request
- `rateLimiter` — batasi per-user/per-IP
- `uploadLimiter` — batasi ukuran unggahan media (max 10MB)

---

## ⚙️ Environment Variables

### Frontend (`/sikasir-ai/.env.example` / `.env.local`)

| Variabel | Deskripsi | Contoh |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | API key Firebase web | `AIzaSyABC123...` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Auth domain | `sikasir-ai.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Project ID | `sikasir-ai` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Storage bucket | `sikasir-ai.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Sender ID | `123456789` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | App ID | `1:123456789:web:abcdef...` |

### Backend (`/sikasir-ai/functions/.env`)

| Variabel | Deskripsi | Contoh |
|---|---|---|
| `GEMINI_API_KEY` | Komma-pisah kunci API Gemini | `KEY_1,KEY_2,KEY_3,KEY_4,KEY_5` |
| `NODE_ENV` | Environment | `development` / `production` |
| `FIRESTORE_PROJECT_ID` | Project ID Firestore | `sikasir-ai` |

**Penting:** `GEMINI_API_KEY` tidak boleh diekspos ke frontend. Semua request AI lewat Cloud Functions.

---

## 🧪 Testing Strategy

### Unit Tests (Jest)

| Area | File | Coverage Target |
|---|---|---|
| AI Helpers | `lib/ai/*.test.ts` | 80% |
| Utils | `lib/utils/*.test.ts` | 80% |
| Stores | `lib/stores/*.test.ts` | 80% |
| API Routes | `functions/lib/api/*.test.js` | 80% |

**Cara jalankan:**

```bash
# Root
npm run test:unit

# Functions
cd functions && npm test
```

### Test Setup

```typescript
// tests/setup.ts
import { test, expect } from '@jest/globals'
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

// Mock Firebase sebelum setiap test
beforeEach(() => {
  const app = initializeApp({
    projectId: 'test-sikasir-ai',
  })
  global.db = getFirestore(app)
})
```

### Integration Tests (Firebase Emulators)

```bash
# Jalankan emulators
cd sikasir-ai/functions
npm run emulator

# Test script contoh
node tests/integration/receipt-extractor.test.js
```

---

## 🚀 Deployment Checklist

### Sebelum Push ke Main

- [ ] `npm run lint` — Semua file lolos ESLint
- [ ] `npm run test:unit` — 80% minimum coverage
- [ ] `npm run build` — Next.js build sukses (`.next/`)
- [ ] `cd functions && npm run build` — Functions build sukses
- [ ] `.env` di Functions sudah berisi API keys yang valid
- [ ] Firestore rules production sudah diterapkan (bukan hanya development)
- [ ] Rate limiter threshold sudah disesuaikan target QPS
- [ ] Google OAuth client ID sudah reconfigure untuk domain produksi
- [ ] Custom domain (jika ada) sudah terpasang SSL

### Proses Deploy

```bash
# Frontend ke Firebase Hosting
cd sikasir-ai
npm run build
firebase deploy --only hosting

# Functions ke Cloud Functions
cd functions
npm run functions:deploy
# atau: firebase deploy --only functions
```

### After Deploy

- [ ] Verifikasi endpoint AI bisa diakses (POST `/ai/caption`)
- [ ] Cek Firestore data muncul di console
- [ ] Test offline mode (matikan internet, buka app, enable kembali)
- [ ] Monitor error rates di Firebase Console (harus < 1%)
- [ ] Set up alerting jika error rate melebih 5%

---

## 📦 Dependencies Critical

| Group | Package | Version | Catatan |
|---|---|---|---|
| **Core** | next | ^14.2.15 | Wajib App Router |
| | react | ^18.3.1 | |
| | react-dom | ^18.3.1 | |
| | typescript | ^5.6.3 | Strict mode |
| | zustand | ^5.0.0 | State management |
| **UI** | tailwindcss | ^3.4.14 | |
| | postcss | ^8.4.47 | |
| | autoprefixer | ^10.4.20 | |
| | @hookform/resolvers | ^3.9.0 | (jika pakai react-hook-form) |
| **Backend** | firebase-admin | ^12.18.0 | di Cloud Functions |
| | firebase-functions | ^4.5.0 | |
| | express | ^4.19.2 | Routing |
| **AI** | @google/generative-ai | ^0.21.0 | Gemini client |
| **Date** | date-fns | ^3.6.0 | |
| **Utils** | clsx | ^2.1.1 | className conditional |
| | tailwind-merge | ^2.6.1 | UTW conflict resolution |

---

## 🐛 Error Handling Pattern

### Client-side (Next.js)

```tsx
// app/error.tsx — tangkap semua runtime error
export default function Error({ error, reset }) {
  return (
    <div>
      <h2>Something went wrong</h2>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
```

### Server-side (Cloud Functions)

```js
// functions/lib/controllers/assistant.controller.js
export async function handler(req, res) {
  try {
    // ... processing
    res.json(result)
  } catch (error) {
    // Log ke Firestore audit_logs
    await admin.firestore().collection('audit_logs').add({
      userId: req.user.uid,
      action: 'error',
      resource: 'ai_endpoint',
      message: error.message,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    })
    res.status(500).json({ error: 'Internal server error' })
  }
}
```

### User Feedback

- Semua error dari AI ditampilkan sebagai draft yang bisa di-review
- User bisa reject dan laporkan error ke tim melalui toast
- Error messages user-friendly (bukan stack trace langsung)

---

## 📊 Monitoring & Alerts

### Custom Metrics (via Firebase Extensions atau manual)

| Metric | Deskripsi | Target |
|---|---|---|
| `ai_requests_total` | Total request AI per hari | < 1000/hari |
| `ai_success_rate` | Persentase request berhasil | > 99% |
| `ai_error_rate` | Persentase request error | < 1% |
| `offline_sync_success` | Persentase sync offline sukses | > 95% |
| `user_sessions_total` | Total session harian | - |
| `concurrent_users` | User simultaneous | - |

### Alert Thresholds

- **Critical**: ai_error_rate > 5% → notify via email/Slack
- **Warning**: offline_sync_success < 90% → cek network/cloud functions logs
- **Info**: ai_requests_total melebih target → verify rate limiter

### Log Storage

- **Firebase Functions logs** — tersimpan otomatis 30 hari
- **Custom audit_logs di Firestore** — untuk tracking spesifik (action, user, resource)
- **Suggestion**: Setup scheduled cleanup untuk collection `audit_logs` (TTL 90 hari)

---

## 🔒 Keamanan Quick Reference

- **API key Gemini** hanya di Cloud Functions environment (never frontend)
- **Firestore rules**: hanya `auth.uid` yang bisa read/write collection-nya
- **Rate limiter**: max 10 request/jam per user untuk AI endpoints
- **Input validation**: semua input di-validate sebelum panggil Gemini (prevent prompt injection)
- **Output sanitization**: hasil AI disanitize sebelum tampil ke UI (prevent XSS)
- **Human-in-the-loop**: semua hasil AI harus review user sebelum permanent

---

## 🛠️ Development Workflow Shortcuts

### Jalankan Semua (Frontend + Functions)

```bash
# Root package.json punya script proxy
npm run dev
# atau manual
# Terminal 1: cd sikasir-ai && npm run dev
# Terminal 2: cd sikasir-ai/functions && npm run emulator
```

### Generate Types dari Firestore

```bash
npx firebase-types gen types --project sikasir-ai > src/types/firebase.d.ts
```

### Cek Coverage Test

```bash
npm run test:unit -- --coverage
# Output → lcov-report di coverage/lcov-report/
```

---

## 📄 Lisensi

**MIT License** — Copyright (c) 2026 Avicennapratama. Lihat `LICENSE`.