Task Backlog - SiKasir AI

Dokumen ini berisi backlog task pengembangan yang bisa langsung dipindahkan ke GitHub Issues, Linear, Trello, atau Notion.

Epic 1 - Project Setup

Tasks

[x] Init Next.js dengan TypeScript
[x] Install Tailwind CSS
[ ] Setup shadcn/ui
[ ] Setup ESLint & Prettier
[x] Setup folder structure
[ ] Setup Firebase config
[ ] Setup Firebase Auth
[ ] Setup Firestore
[ ] Setup Firebase Storage
[ ] Setup Firebase Functions
[ ] Setup .env.example
[ ] Setup GitHub repository
[ ] Setup deployment environment
[x] Add README

Definition of Done

Project bisa run lokal
Firebase terhubung
Deploy preview berhasil

Epic 2 - Authentication & Onboarding

Tasks

[ ] Buat halaman login
[ ] Implement Google Sign-In
[ ] Buat auth context/provider
[ ] Protect private routes
[ ] Buat halaman onboarding
[ ] Form nama usaha
[ ] Form kategori usaha
[ ] Create business document
[ ] Redirect ke dashboard setelah onboarding
[ ] Handle auth error

Acceptance Criteria

User bisa login dengan Google
User baru diarahkan ke onboarding
User lama langsung ke dashboard

Epic 3 - Dashboard

Tasks

[x] Buat layout dashboard
[x] Card Uang Masuk Hari Ini
[x] Card Uang Keluar Hari Ini
[x] Card saldo bersih
[x] Tombol Catat Manual
[x] Tombol Catat Suara
[x] Tombol Pindai Nota
[ ] Fetch summary dari API/Firestore
[ ] Loading skeleton
[ ] Empty state
[ ] Error state
[ ] Refresh setelah transaksi

Acceptance Criteria

Dashboard menampilkan total hari ini
Tombol input utama jelas
Data update setelah transaksi disimpan

Epic 4 - Catat Manual

Tasks

[x] Route /catat/manual
[x] Toggle income/expense
[x] Input nominal besar
[x] Parser Rupiah
[x] Category picker
[x] Note input
[ ] Date picker
[ ] React Hook Form
[ ] Zod validation
[ ] Save transaction function
[ ] Toast success
[ ] Undo optional
[ ] Redirect dashboard
[ ] Offline outbox support
[ ] Edit transaction page
[ ] Delete transaction confirmation

Acceptance Criteria

User bisa simpan transaksi manual
Validasi nominal berjalan
Offline draft tersimpan
Transaksi muncul di riwayat

Epic 5 - Riwayat Transaksi

Tasks

[ ] Route /riwayat
[ ] List transaksi terbaru
[ ] Filter tanggal
[ ] Filter type
[ ] Filter source
[ ] Transaction card component
[ ] Detail transaction page
[ ] Edit button
[ ] Delete button
[ ] Infinite scroll/pagination
[ ] Empty state

Acceptance Criteria

User dapat melihat riwayat
Filter bekerja
Detail transaksi akurat

Epic 6 - Voice Transaction

Tasks

[ ] Route /catat/suara
[ ] Permission mikrofon
[ ] MediaRecorder implementation
[ ] Record UI
[ ] Timer rekaman
[ ] Stop recording
[ ] Re-record
[ ] Upload audio
[ ] Backend endpoint extract voice
[ ] Gemini integration
[ ] Normalize AI response
[ ] Create draft document
[ ] Review screen
[ ] Confidence badge
[ ] Editable fields
[ ] Confirm draft
[ ] Reject draft
[ ] Fallback manual
[ ] Error handling

Acceptance Criteria

User dapat merekam suara
AI menghasilkan draft
Draft dapat diedit
Jika gagal, fallback manual tersedia

Epic 7 - Receipt Transaction

Tasks

[ ] Route /catat/nota
[ ] Camera input
[ ] File upload input
[ ] Image compression
[ ] Upload to storage
[ ] Backend endpoint extract receipt
[ ] Gemini Vision integration
[ ] Normalize receipt response
[ ] Create draft document
[ ] Preview image
[ ] Review screen
[ ] Low confidence highlight
[ ] Editable fields
[ ] Confirm draft
[ ] Reject draft
[ ] Blurry receipt handling
[ ] Fallback manual

Acceptance Criteria

User dapat upload/potret nota
AI menghasilkan draft
User dapat review/edit
Jika gagal, fallback manual tersedia

Epic 8 - Review Screen Shared

Tasks

[ ] Component DraftReviewScreen
[ ] Display source type
[ ] Display confidence
[ ] Highlight low confidence fields
[ ] Edit amount
[ ] Edit category
[ ] Edit note
[ ] Edit date
[ ] Edit items
[ ] Confirm draft API
[ ] Reject draft API
[ ] Move to manual CTA
[ ] Success toast

Acceptance Criteria

Semua AI draft melewati review
User dapat mengubah semua field penting
Draft dapat dikonfirmasi atau ditolak

Epic 9 - Reports

Tasks

[ ] Route /laporan
[ ] Summary hari ini
[ ] Summary 7 hari
[ ] Summary 30 hari
[ ] Income vs expense chart
[ ] Category summary
[ ] Source usage summary
[ ] Date range filter
[ ] Export CSV later
[ ] Export PDF later

Acceptance Criteria

Laporan menampilkan data akurat
User dapat memilih periode

Epic 10 - Gamification

Tasks

[ ] Gamification collection
[ ] Streak calculation
[ ] Update streak on transaction save
[ ] Badge first transaction
[ ] Badge 7 day streak
[ ] Dashboard badge widget
[ ] Celebration animation
[ ] Prevent duplicate badge
[ ] Handle timezone/date boundary

Acceptance Criteria

Streak bertambah saat user mencatat transaksi
Badge 7 hari muncul setelah syarat terpenuhi

Epic 11 - PWA & Offline

Tasks

[ ] manifest.json
[ ] App icons
[ ] Service worker
[ ] Cache app shell
[ ] Offline fallback page
[ ] IndexedDB/outbox local storage
[ ] Pending sync indicator
[ ] Sync worker when online
[ ] Handle conflict
[ ] Lighthouse PWA audit

Acceptance Criteria

Aplikasi dapat dipasang sebagai PWA
Manual transaction dapat dibuat offline
Data sync saat online

Epic 12 - Studio AI

Tasks

[ ] Route /studio
[ ] Upload product photo
[ ] Preview original
[ ] Backend enhance image endpoint
[ ] Vertex AI/Gemini image integration
[ ] Store result asset
[ ] Loading/progress UI
[ ] Error handling
[ ] Caption generation endpoint
[ ] Caption variations
[ ] Copy caption
[ ] Download image
[ ] Studio history

Acceptance Criteria

User dapat memproses foto produk
User dapat menyalin caption
Original dan result tersimpan

Epic 13 - Klinik HKI

Tasks

[ ] Route /hki
[ ] HKI form
[ ] Evidence upload
[ ] Backend pre-valuation endpoint
[ ] AI summary generation
[ ] Checklist generation
[ ] Indicative score
[ ] Disclaimer component
[ ] PDF generation
[ ] Download PDF
[ ] HKI history
[ ] Delete valuation data

Acceptance Criteria

User dapat membuat pra-valuasi awal
PDF dapat diunduh
Disclaimer terlihat jelas

Epic 14 - Assistant Chat

Tasks

[ ] Route /asisten
[ ] Chat UI
[ ] Message list
[ ] Quick prompts
[ ] Backend chat endpoint
[ ] Gemini integration
[ ] Topic selection
[ ] Save chat session
[ ] Disclaimer banner
[ ] Error state
[ ] Suggested next steps

Acceptance Criteria

User dapat bertanya soal NIB/Halal
Jawaban aman dan sederhana
Disclaimer ditampilkan

Epic 15 - Security & Privacy

Tasks

[ ] Firestore rules
[ ] Storage rules
[ ] Backend token verification
[ ] Ownership validation
[ ] Rate limiting
[ ] File size limit
[ ] MIME validation
[ ] Secret Manager
[ ] Input validation
[ ] Audit logs
[ ] Data deletion flow
[ ] Privacy policy page
[ ] Terms page
[ ] Consent dialogs

Acceptance Criteria

User tidak bisa mengakses data user lain
Secret tidak bocor ke client
Endpoint AI dibatasi

Epic 16 - Testing & QA

Tasks

[ ] Unit test parser Rupiah
[ ] Unit test validators
[ ] Unit test AI normalizer
[ ] Integration test manual transaction
[ ] Integration test voice draft
[ ] Integration test receipt draft
[ ] E2E login to manual save
[ ] E2E voice review save
[ ] E2E receipt review save
[ ] Offline sync test
[ ] Accessibility test
[ ] Mobile usability test
[ ] AI dataset evaluation
[ ] Error fallback test

Acceptance Criteria

Happy path berjalan
Failure path tidak membuat user kehilangan data
Manual fallback selalu tersedia

Epic 17 - Deployment

Tasks

[ ] Production Firebase project
[ ] Hosting deploy
[ ] Functions deploy
[ ] Firestore indexes
[ ] Storage rules deploy
[ ] Environment variables production
[ ] Error monitoring setup
[ ] Analytics events setup
[ ] Domain & HTTPS
[ ] Smoke test production
[ ] Rollback plan

Acceptance Criteria

Production dapat diakses
Login dan transaksi manual berfungsi
AI endpoint berfungsi dengan rate limit

Sprint Plan Awal

Sprint 1 - Core Manual

Durasi: 2 minggu

[ ] Setup project
[ ] Auth
[ ] Onboarding
[ ] Dashboard
[ ] Manual transaction
[ ] History

Sprint 2 - AI Input

Durasi: 2 minggu

[ ] Voice
[ ] Receipt
[ ] Draft review
[ ] Fallback manual

Sprint 3 - PWA & Retention

Durasi: 2 minggu

[ ] PWA
[ ] Offline manual
[ ] Streak
[ ] Badge
[ ] Reports dasar

Sprint 4 - Ekraf Features

Durasi: 2-3 minggu

[ ] Studio AI
[ ] HKI pre-valuation
[ ] Assistant chat

Priority Matrix

| Fitur | Dampak | Effort | Prioritas |
|---|---:|---:|---|
| Catat manual | Tinggi | Rendah | P0 |
| Dashboard | Tinggi | Rendah | P0 |
| Riwayat | Tinggi | Rendah | P0 |
| Voice input | Tinggi | Sedang | P0 |
| Receipt input | Tinggi | Sedang-Tinggi | P0 |
| Review draft | Tinggi | Sedang | P0 |
| Offline manual | Tinggi | Sedang | P1 |
| Streak/badge | Sedang | Rendah | P1 |
| Laporan | Sedang | Sedang | P1 |
| Studio AI | Sedang-Tinggi | Tinggi | P1 |
| HKI | Tinggi untuk ekraf | Tinggi | P1 |
| Chat assistant | Sedang | Sedang | P2 |
| Export CSV/PDF | Sedang | Sedang | P2 |
| Multi-staff | Sedang | Tinggi | P2 |