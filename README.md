SiKasir AI

SiKasir AI adalah Progressive Web App (PWA) asisten kasir pintar untuk UMKM dan pelaku ekonomi kreatif Indonesia.

Produk ini memungkinkan pencatatan keuangan melalui:

Input manual
Perintah suara
Foto nota

Prinsip utamanya adalah AI-assisted, manual-first fallback. Semua hasil AI bersifat draft dan harus melewati layar review sebelum disimpan.

Dokumen Proyek

PRD
Technical Specification
Database Design
API Specification
AI Prompts
Security & Privacy
Roadmap
Task Backlog

Target Program

Ekraf x Google
Google for Startups Accelerator
Inisiatif Ekonomi Kreatif

Stack Utama

| Layer | Teknologi |
|---|---|
| Frontend | Next.js + TypeScript |
| UI | Tailwind CSS + shadcn/ui |
| State & Data | TanStack Query + Zustand |
| Auth | Firebase Auth / Google SSO |
| Database | Firestore |
| File Storage | Firebase Storage / Cloud Storage |
| Backend | Firebase Cloud Functions (Node.js + TypeScript) |
| AI | Google Gemini Flash + Vertex AI |
| PWA | Workbox / next-pwa |
| PDF | pdfkit / react-pdf / Puppeteer |
| Analytics | Firebase Analytics / GA4 |
| Monitoring | Sentry / Firebase Crashlytics |
| Deployment | Firebase Hosting / Cloud Run |

Bahasa Pemrograman

MVP

TypeScript / JavaScript
HTML
CSS
JSON

Opsional untuk fase lanjutan

Python untuk pipeline AI/analitik
SQL untuk migrasi database relasional

Struktur Folder yang Disarankan
bash
sikasir-ai/
├── app/
│   ├── (auth)/
│   ├── dashboard/
│   ├── catat/
│   │   ├── manual/
│   │   ├── suara/
│   │   └── nota/
│   ├── riwayat/
│   ├── laporan/
│   ├── studio/
│   ├── hki/
│   ├── asisten/
│   └── settings/
├── components/
│   ├── ui/
│   ├── layout/
│   ├── transactions/
│   ├── ai/
│   ├── charts/
│   └── gamification/
├── lib/
│   ├── firebase/
│   ├── ai/
│   ├── hooks/
│   ├── utils/
│   └── validations/
├── functions/
│   ├── src/
│   │   ├── ai/
│   │   ├── transactions/
│   │   ├── reports/
│   │   ├── hki/
│   │   └── utils/
│   └── package.json
├── public/
│   ├── icons/
│   ├── manifest.json
│   └── offline.html
├── docs/
│   ├── PRD.md
│   ├── TECH_SPEC.md
│   ├── DATABASE.md
│   ├── API.md
│   ├── AI_PROMPTS.md
│   ├── SECURITY.md
│   ├── ROADMAP.md
│   └── TASKS.md
├── .env.example
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md

Prinsip Produk

Input manual harus selalu tersedia.
AI tidak boleh menjadi satu-satunya jalur pencatatan.
Hasil AI harus bisa diedit sebelum disimpan.
Jika AI gagal, sistem fallback ke form manual.
UI harus besar, kontras tinggi, dan mudah dipakai satu tangan.
Data keuangan user harus privat dan terisolasi.
Semua proses AI berat berjalan di backend, bukan langsung dari client dengan secret.

Quickstart
bash
npm install
cp .env.example .env.local
npm run dev

Scripts yang Disarankan
json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "functions:dev": "npm --prefix functions run dev",
    "functions:deploy": "npm --prefix functions run deploy"
  }
}

Environment Variables

Frontend .env.local
env
NEXTPUBLICFIREBASEAPIKEY=
NEXTPUBLICFIREBASEAUTHDOMAIN=
NEXTPUBLICFIREBASEPROJECTID=
NEXTPUBLICFIREBASESTORAGEBUCKET=
NEXTPUBLICFIREBASEMESSAGINGSENDER_ID=
NEXTPUBLICFIREBASEAPPID=
NEXTPUBLICAPP_ENV=development

Backend .env
env
GOOGLECLOUDPROJECT=
GEMINIAPIKEY=
VERTEXAILOCATION=
VERTEXAIPROJECT_ID=
PDFSERVICEURL=
RATELIMITPER_MINUTE=
MAXUPLOADSIZE_MB=

MVP Definition of Done

MVP dianggap selesai jika:

[ ] User bisa login dengan Google.
[ ] User bisa melihat dashboard uang masuk dan keluar hari ini.
[ ] User bisa mencatat transaksi secara manual.
[ ] User bisa mencatat transaksi melalui suara.
[ ] User bisa mencatat transaksi melalui foto nota.
[ ] Semua hasil AI masuk ke review screen.
[ ] User bisa mengedit hasil AI sebelum disimpan.
[ ] Jika AI gagal, user tetap bisa input manual.
[ ] User bisa melihat riwayat transaksi.
[ ] User bisa mengedit atau menghapus transaksi.
[ ] Aplikasi bisa dibuka sebagai PWA.
[ ] Data user terisolasi dan aman.