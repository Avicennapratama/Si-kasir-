Technical Specification - SiKasir AI

Ringkasan Teknis

SiKasir AI dibangun sebagai PWA berbasis Next.js dengan backend serverless Firebase/Google Cloud. Sistem menggunakan Gemini/Vertex AI untuk ekstraksi suara, pembacaan nota, pembuatan konten promosi, dan analisis awal HKI.

Prinsip teknis utama:

frontend ringan,
AI diproses di backend,
hasil AI selalu menjadi draft,
manual input tetap tersedia,
data user terisolasi.

Arsitektur Sistem
mermaid
flowchart TD
  U["User UMKM"] --> PWA["Next.js PWA"]
  PWA --> AUTH["Firebase Auth / Google SSO"]
  PWA --> FS["Firestore"]
  PWA --> ST["Firebase Storage"]
  PWA --> CF["Cloud Functions / Cloud Run"]
  CF --> GEM["Gemini Flash"]
  CF --> VTX["Vertex AI"]
  CF --> PDF["PDF Generator"]
  CF --> LOG["Cloud Logging / Monitoring"]
  CF --> FS
  CF --> ST

Tech Stack

| Layer | Teknologi | Keterangan |
|---|---|---|
| Frontend Framework | Next.js | App Router |
| Language | TypeScript | Frontend & backend |
| Styling | Tailwind CSS | Utility-first |
| UI Components | shadcn/ui | Accessible components |
| Server State | TanStack Query | Fetching, cache, retry |
| Client State | Zustand | UI state ringan |
| Form | React Hook Form + Zod | Validasi |
| Auth | Firebase Auth | Google SSO |
| Database | Firestore | MVP database |
| Storage | Firebase Storage | Gambar, audio, PDF |
| Backend | Cloud Functions / Cloud Run | Serverless |
| AI | Gemini Flash | Voice, OCR, chat |
| Advanced AI | Vertex AI | Grounding/search, image tasks |
| PDF | pdfkit / react-pdf / Puppeteer | Laporan HKI |
| PWA | Workbox / next-pwa | Offline & install |
| Analytics | Firebase Analytics | Event tracking |
| Error Monitoring | Sentry / Crashlytics | Error tracking |

Frontend Architecture

4.1 Route Utama

| Route | Fungsi |
|---|---|
| / | Landing / redirect ke dashboard |
| /login | Google SSO |
| /onboarding | Setup usaha ringan |
| /dashboard | Pusat kasir |
| /catat | Hub input transaksi |
| /catat/manual | Form manual |
| /catat/suara | Rekam suara |
| /catat/nota | Upload/potret nota |
| /review/:draftId | Review hasil AI |
| /riwayat | Daftar transaksi |
| /laporan | Ringkasan keuangan |
| /studio | Studio AI |
| /hki | Klinik Modal HKI |
| /asisten | Chat assistant |
| /settings | Pengaturan |

4.2 Komponen Utama

Layout

AppShell
BottomNav
TopBar
BigActionButton
ToastProvider
LoadingOverlay
ErrorBoundary

Transaksi

ManualTransactionForm
VoiceRecorder
ReceiptUploader
DraftReviewScreen
TransactionCard
TransactionFilter
AmountInput
CategoryPicker
DatePicker

AI

ConfidenceBadge
AIResultField
FallbackManualButton
RetryAIButton

Studio

ImageUploader
ImagePreview
CaptionGenerator
CopyButton

HKI

HKIForm
EvidenceUploader
ValuationSummary
DownloadPDFButton

Chat

ChatWindow
MessageBubble
QuickPromptChips
DisclaimerBanner

Backend Architecture

5.1 Cloud Functions / HTTP Endpoints

Gunakan backend sebagai proxy aman ke AI.

| Function | Method | Fungsi |
|---|---|---|
| extractVoiceTransaction | POST | Ubah audio/transcript ke draft transaksi |
| extractReceiptTransaction | POST | Baca nota menjadi draft transaksi |
| generateProductCaption | POST | Buat caption promosi |
| enhanceProductImage | POST | Proses gambar produk |
| chatAssistant | POST | Chat izin/halal |
| createHkiPreValuation | POST | Ringkasan HKI awal |
| generateHkiPdf | POST | Generate PDF |
| getDashboardSummary | GET | Ringkasan hari ini |

5.2 Tanggung Jawab Backend

Validasi auth token.
Validasi ownership business.
Rate limiting.
Kompresi/validasi file.
Panggil AI.
Normalisasi output AI.
Simpan draft/media.
Logging dan error handling.

Data Flow

6.1 Manual Transaction Flow
mermaid
flowchart TD
  A["User buka form manual"] --> B["Isi nominal, kategori, catatan"]
  B --> C["Validasi client"]
  C --> D["Simpan ke Firestore"]
  D --> E["Update dashboard"]
  E --> F["Toast sukses"]

6.2 Voice Transaction Flow
mermaid
flowchart TD
  A["User rekam suara"] --> B["Upload audio"]
  B --> C["Backend panggil AI"]
  C --> D["AI return draft JSON"]
  D --> E["Frontend tampilkan review"]
  E --> F["User edit/konfirmasi"]
  F --> G["Simpan transaksi confirmed"]

6.3 Receipt Transaction Flow
mermaid
flowchart TD
  A["User foto/upload nota"] --> B["Kompres gambar"]
  B --> C["Upload ke storage"]
  C --> D["Backend panggil Gemini Vision"]
  D --> E["AI return draft JSON"]
  E --> F["Review screen"]
  F --> G["User edit/konfirmasi"]
  G --> H["Simpan transaksi confirmed"]

Transaction Draft Model

Semua hasil AI disimpan sebagai draft sebelum confirmed.
json
{
  "draftId": "draft_123",
  "businessId": "business_123",
  "source": "voice",
  "status": "draft",
  "data": {
    "type": "income",
    "amount": 30000,
    "category": "Penjualan produk",
    "note": "Laku dua porsi mie ayam",
    "transactionDate": "2026-01-01"
  },
  "aiMeta": {
    "confidence": 0.91,
    "transcript": "Laku dua porsi mie ayam, tiga puluh ribu",
    "lowConfidenceFields": []
  },
  "createdAt": "2026-01-01T10:00:00.000Z"
}

Amount Handling

Aturan

Simpan nominal sebagai integer Rupiah.
Jangan gunakan float untuk uang.
Gunakan formatter id-ID untuk tampilan.
Parser harus toleran terhadap format Indonesia.

Contoh parsing

| Input User | Normalisasi |
|---|---|
| 30000 | 30000 |
| 30.000 | 30000 |
| Rp 30.000 | 30000 |
| 30rb | 30000 |

Contoh utility TypeScript
ts
export function parseRupiah(input: string): number | null {
  const normalized = input
    .replace(/rp/gi, "")
    .replace(/[^0-9]/g, "");

  if (!normalized) return null;

  const value = Number(normalized);

  return Number.isFinite(value) && value > 0 ? value : null;
}

export function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0
  }).format(value);
}

Confidence Handling

| Confidence | Perlakuan UI |
|---|---|
| >= 0.85 | Auto-fill penuh, badge hijau |
| 0.60 - 0.84 | Auto-fill dengan highlight review |
|  Cloud Function -> Gemini/Vertex AI -> Client

Error Handling

Kategori Error

| Code | Arti | UX |
|---|---|---|
| AI_UNAVAILABLE | Layanan AI tidak dapat dihubungi | Tampilkan fallback manual |
| LOW_CONFIDENCE | AI tidak yakin | Highlight field |
| INVALID_AUDIO | Audio rusak/tidak jelas | Minta rekam ulang |
| INVALID_IMAGE | Gambar tidak valid | Minta upload ulang |
| BLURRY_RECEIPT | Nota buram | Minta foto ulang |
| FILETOOLARGE | File melebihi batas | Minta file lebih kecil |
| RATE_LIMITED | Terlalu banyak request | Tunggu dan coba lagi |
| UNAUTHORIZED | Tidak punya akses | Redirect/login |
| NETWORK_OFFLINE | Tidak ada koneksi | Aktifkan offline manual |

Security

14.1 Authentication

Firebase Auth wajib untuk semua route privat.
Validate UID di backend.
Jangan percaya payload user tanpa validasi ownership.

14.2 Firestore Isolation

Setiap transaksi harus terhubung ke businessId milik user.

14.3 Secret Management

Simpan GEMINIAPIKEY di server.
Gunakan Secret Manager.
Jangan commit .env.

14.4 Input Validation

Validasi:

uid,
businessId,
amount,
type,
file type,
file size,
payload schema.

14.5 Rate Limiting

Endpoint AI dibatasi per user/per menit untuk kontrol biaya.

Firestore Rules Example
js
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    function isSignedIn() {
      return request.auth != null;
    }

    match /users/{uid} {
      allow read, write: if isSignedIn() && request.auth.uid == uid;
    }

    match /businesses/{businessId} {
      allow read: if isSignedIn() && resource.data.ownerId == request.auth.uid;
      allow create: if isSignedIn() && request.resource.data.ownerId == request.auth.uid;
      allow update, delete: if isSignedIn() && resource.data.ownerId == request.auth.uid;
    }

    match /transactions/{transactionId} {
      allow read, write: if isSignedIn();
    }
  }
}

Untuk produksi, validasi ownership transaction terhadap business perlu diperketat menggunakan custom claims, denormalized ownerId, atau backend-only writes.

Observability

Logging

Catat:

request id,
uid hash,
businessId,
endpoint,
AI model,
duration,
confidence,
success/failure.

Metrics

AI latency
AI error rate
fallback manual rate
upload size average
transaction save success rate

Alert

AI error rate > 10%
function timeout meningkat
upload gagal meningkat
Firestore write error meningkat

Testing Strategy

Unit Test

parser rupiah
validator form manual
normalizer AI response
streak calculator

Integration Test

create manual transaction
voice extraction
receipt extraction
dashboard summary
auth ownership

E2E Test

login → manual → dashboard
login → voice → review → save
login → receipt → review → save
offline manual → sync

AI Evaluation

Siapkan dataset:

20 transcript suara
20 foto nota jelas
20 foto nota buram
10 nota multi-item
10 nota tanpa tanggal

Ukur akurasi:

type
amount
date
vendor
item

Performance Budget

| Item | Target |
|---|---|
| First Contentful Paint |  0 |
| category | wajib |
| note | opsional |
| transactionDate | wajib, format YYYY-MM-DD |
| items | opsional |

Response
json
{
  "success": true,
  "data": {
    "transactionId": "tx_123",
    "status": "confirmed",
    "source": "manual",
    "amount": 30000,
    "type": "income",
    "createdAt": "2026-01-01T10:05:00.000Z"
  }
}

GET /transactions

Query Parameters

| Param | Type |
|---|---|
| businessId | string |
| type | income/expense |
| source | manual/voice/receipt |
| startDate | string |
| endDate | string |
| limit | number |
| cursor | string |

Response
json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "transactionId": "tx_123",
        "type": "income",
        "amount": 30000,
        "category": "Penjualan produk",
        "note": "Laku dua porsi mie ayam",
        "source": "manual",
        "transactionDate": "2026-01-01",
        "createdAt": "2026-01-01T10:05:00.000Z"
      }
    ],
    "nextCursor": "abc123"
  }
}

GET /transactions/:transactionId

Mengambil detail transaksi.

Response
json
{
  "success": true,
  "data": {
    "transactionId": "tx_123",
    "businessId": "business_123",
    "type": "income",
    "amount": 30000,
    "category": "Penjualan produk",
    "note": "Laku dua porsi mie ayam",
    "source": "manual",
    "status": "confirmed",
    "createdAt": "2026-01-01T10:05:00.000Z"
  }
}

PATCH /transactions/:transactionId

Mengubah transaksi.

Request
json
{
  "amount": 35000,
  "category": "Penjualan produk",
  "note": "Koreksi harga"
}

Response
json
{
  "success": true,
  "data": {
    "transactionId": "tx_123",
    "updatedAt": "2026-01-01T10:10:00.000Z"
  }
}

DELETE /transactions/:transactionId

Response
json
{
  "success": true,
  "data": {
    "transactionId": "tx_123",
    "deleted": true
  }
}

AI Voice

POST /ai/extract-voice

Request

Multipart:

| Field | Type |
|---|---|
| businessId | string |
| audio | file |
| languageHint | string optional |

atau JSON transcript:
json
{
  "businessId": "business_123",
  "transcript": "Laku dua porsi mie ayam tiga puluh ribu"
}

Response
json
{
  "success": true,
  "data": {
    "draftId": "draft_123",
    "source": "voice",
    "status": "draft",
    "confidence": 0.91,
    "transcript": "Laku dua porsi mie ayam tiga puluh ribu",
    "transaction": {
      "type": "income",
      "amount": 30000,
      "category": "Penjualan produk",
      "note": "Laku dua porsi mie ayam",
      "items": [
        {
          "name": "Mie ayam",
          "qty": 2,
          "price": 15000
        }
      ]
    },
    "lowConfidenceFields": [],
    "fallback": {
      "required": false,
      "reason": null
    }
  }
}

Error Response
json
{
  "success": false,
  "error": {
    "code": "LOW_CONFIDENCE",
    "message": "Audio kurang jelas. Silakan periksa hasil atau gunakan catat manual.",
    "details": {
      "draftId": "draft_123",
      "confidence": 0.42
    }
  }
}

AI Receipt

POST /ai/extract-receipt

Request Multipart

| Field | Type |
|---|---|
| businessId | string |
| image | file |
| defaultType | income/expense optional |

Response
json
{
  "success": true,
  "data": {
    "draftId": "draft_124",
    "source": "receipt",
    "status": "draft",
    "confidence": 0.87,
    "mediaAssetId": "media_123",
    "transaction": {
      "type": "expense",
      "amount": 125000,
      "category": "Bahan baku",
      "vendor": "Toko Berkah",
      "note": "Belanja bahan baku",
      "transactionDate": "2026-01-01",
      "items": [
        {
          "name": "Tepung",
          "qty": 2,
          "price": 45000
        },
        {
          "name": "Minyak goreng",
          "qty": 1,
          "price": 35000
        }
      ]
    },
    "lowConfidenceFields": [
      "transactionDate"
    ],
    "fallback": {
      "required": false,
      "reason": null
    }
  }
}

Draft Confirmation

POST /drafts/:draftId/confirm

Mengubah draft menjadi transaksi final.

Request
json
{
  "businessId": "business_123",
  "transaction": {
    "type": "income",
    "amount": 30000,
    "category": "Penjualan produk",
    "note": "Laku dua porsi mie ayam",
    "transactionDate": "2026-01-01",
    "items": [
      {
        "name": "Mie ayam",
        "qty": 2,
        "price": 15000
      }
    ]
  },
  "userCorrections": {
    "amount": false,
    "category": true,
    "note": false
  }
}

Response
json
{
  "success": true,
  "data": {
    "transactionId": "tx_125",
    "draftId": "draft_123",
    "status": "confirmed",
    "source": "voice"
  }
}

POST /drafts/:draftId/reject

Request
json
{
  "businessId": "business_123",
  "reason": "audiotidakjelas"
}

Response
json
{
  "success": true,
  "data": {
    "draftId": "draft_123",
    "status": "rejected"
  }
}

Studio AI

POST /studio/enhance-image

Request Multipart

| Field | Type |
|---|---|
| businessId | string |
| image | file |
| style | string |

Style Values
text
clean-studio
marketplace
social-media
minimal
food
fashion
craft

Response
json
{
  "success": true,
  "data": {
    "studioAssetId": "studio_123",
    "originalMediaAssetId": "media_123",
    "resultMediaAssetId": "media_124",
    "status": "completed",
    "resultUrl": "https://..."
  }
}

POST /studio/generate-caption

Request
json
{
  "businessId": "business_123",
  "productName": "Mie Ayam Spesial",
  "category": "kuliner",
  "tone": "ramah",
  "platform": "whatsapp",
  "keywords": ["halal", "murah", "hangat"]
}

Response
json
{
  "success": true,
  "data": {
    "captions": [
      "Mie Ayam Spesial hangat siap manjakan harimu! Kuah gurih, porsi puas, harga bersahabat. Yuk pesan sekarang!",
      "Lagi cari yang hangat dan mengenyangkan? Mie Ayam Spesial jawabannya. Cocok untuk makan siang hari ini.",
      "Mie Ayam Spesial fresh setiap hari. Rasanya familiar, harganya ramah di kantong."
    ]
  }
}

Klinik HKI

POST /hki/pre-valuation

Request
json
{
  "businessId": "business_123",
  "title": "Logo Mie Ayam Budi",
  "type": "logo",
  "description": "Logo original dengan ilustrasi mangkuk mie dan typography khas.",
  "creationDate": "2025-12-01",
  "evidence": [
    {
      "mediaAssetId": "media_123",
      "label": "File logo PNG"
    }
  ]
}

Response
json
{
  "success": true,
  "data": {
    "valuationId": "hki_123",
    "status": "completed",
    "indicativeScore": 72,
    "summary": "Karya memiliki indikasi orisinalitas visual dan nilai branding untuk usaha kuliner.",
    "checklist": [
      "File karya tersedia",
      "Deskripsi karya lengkap",
      "Tanggal pembuatan diisi",
      "Perlu menambahkan proses pembuatan karya"
    ],
    "disclaimer": "Dokumen ini adalah ringkasan awal dan bukan penilaian hukum resmi.",
    "pdfUrl": "https://..."
  }
}

GET /hki/:valuationId/pdf

Menghasilkan atau mengambil PDF pra-valuasi.

Response
json
{
  "success": true,
  "data": {
    "valuationId": "hki_123",
    "pdfUrl": "https://...",
    "expiresAt": "2026-01-02T10:00:00.000Z"
  }
}

Assistant Chat

POST /assistant/chat

Request
json
{
  "businessId": "business_123",
  "topic": "nib",
  "message": "Cara mengurus NIB untuk usaha kecil gimana?",
  "chatId": "chat_123"
}

Response
json
{
  "success": true,
  "data": {
    "chatId": "chat_123",
    "message": {
      "role": "assistant",
      "content": "Secara umum, kamu bisa mulai dengan menyiapkan data usaha, lalu membuat akun di OSS...",
      "createdAt": "2026-01-01T10:00:00.000Z"
    },
    "suggestedNextSteps": [
      "Siapkan NIK",
      "Siapkan data usaha",
      "Cek kategori KBLI"
    ]
  }
}

Reports

GET /reports/summary

Query Parameters

| Param | Type |
|---|---|
| businessId | string |
| startDate | string |
| endDate | string |
| groupBy | day/category/source |

Response
json
{
  "success": true,
  "data": {
    "startDate": "2026-01-01",
    "endDate": "2026-01-07",
    "incomeTotal": 1750000,
    "expenseTotal": 520000,
    "netTotal": 1230000,
    "byCategory": [
      {
        "category": "Penjualan produk",
        "type": "income",
        "total": 1750000
      },
      {
        "category": "Bahan baku",
        "type": "expense",
        "total": 320000
      }
    ],
    "bySource": [
      {
        "source": "manual",
        "count": 12
      },
      {
        "source": "voice",
        "count": 8
      },
      {
        "source": "receipt",
        "count": 5
      }
    ]
  }
}

Gamification

GET /gamification

Response
json
{
  "success": true,
  "data": {
    "currentStreak": 3,
    "longestStreak": 10,
    "lastRecordedDate": "2026-01-01",
    "badges": [
      {
        "id": "first-transaction",
        "label": "Transaksi Pertama",
        "earnedAt": "2026-01-01T10:00:00.000Z"
      }
    ]
  }
}

Settings & Data Deletion

POST /settings/data-deletion

Request
json
{
  "businessId": "business_123",
  "scope": "mediaairaw"
}

Scope Values
text
mediaairaw
drafts
transactions
all
account

Response
json
{
  "success": true,
  "data": {
    "deletionJobId": "job_123",
    "status": "queued"
  }
}