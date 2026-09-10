Roadmap - SiKasir AI

Overview

Roadmap ini membagi pembangunan SiKasir AI menjadi beberapa fase agar MVP cepat tervalidasi tanpa mengorbankan kualitas fitur manual, AI, keamanan, dan pengalaman pengguna.

Fase 0 - Persiapan

Durasi: 3-5 hari

Deliverables

[ ] Setup repository
[ ] Setup Next.js + TypeScript + Tailwind
[ ] Setup Firebase project
[ ] Setup Firestore
[ ] Setup Firebase Auth
[ ] Setup Firebase Storage
[ ] Setup Cloud Functions
[ ] Setup Gemini/Vertex access
[ ] Buat .env.example
[ ] Buat design system dasar
[ ] Finalisasi PRD dan Tech Spec

Exit Criteria

Proyek bisa run lokal
Auth Firebase bisa login test
Firestore bisa write/read test
Cloud Functions bisa deploy hello world

Fase 1 - MVP Core Manual

Durasi: 1-2 minggu

Deliverables

[ ] Google login
[ ] Onboarding ringan
[ ] Dashboard
[ ] Form catat manual
[ ] Validasi nominal
[ ] Kategori transaksi
[ ] Simpan transaksi
[ ] Riwayat transaksi
[ ] Edit transaksi
[ ] Hapus transaksi
[ ] Toast success/error
[ ] Empty state
[ ] Loading state

Exit Criteria

User bisa login dan mencatat transaksi manual
Data muncul di dashboard
Data bisa diedit dan dihapus
Tidak ada ketergantungan AI pada fase ini

Fase 2 - AI Voice & Receipt

Durasi: 2-3 minggu

Deliverables

[ ] Endpoint extract voice
[ ] UI recorder suara
[ ] Upload audio
[ ] AI draft transaksi suara
[ ] Review screen voice
[ ] Endpoint extract receipt
[ ] UI kamera/upload nota
[ ] Kompresi gambar
[ ] AI draft transaksi nota
[ ] Review screen receipt
[ ] Confidence indicator
[ ] Low confidence warning
[ ] Fallback manual
[ ] Simpan draft
[ ] Confirm draft
[ ] Reject draft

Exit Criteria

Voice dapat menghasilkan draft transaksi
Receipt dapat menghasilkan draft transaksi
Semua draft bisa diedit sebelum disimpan
Jika AI gagal, user tetap bisa mencatat manual

Fase 3 - Laporan & Retention

Durasi: 1-2 minggu

Deliverables

[ ] Ringkasan hari ini
[ ] Ringkasan 7 hari
[ ] Ringkasan 30 hari
[ ] Filter riwayat
[ ] Chart sederhana
[ ] Streak harian
[ ] Badge pertama
[ ] Badge 7 hari
[ ] Animasi ucapan selamat
[ ] Notification prompt ringan

Exit Criteria

User dapat melihat tren sederhana
Streak bertambah saat ada transaksi
Badge muncul sesuai aturan

Fase 4 - PWA & Offline

Durasi: 1 minggu

Deliverables

[ ] Web manifest
[ ] Install prompt
[ ] Service worker
[ ] Cache app shell
[ ] Offline page
[ ] Offline outbox untuk manual transaction
[ ] Sync saat online
[ ] Status sync pending/synced

Exit Criteria

Aplikasi dapat dibuka sebagai PWA
Form manual dapat dipakai offline
Data tersinkron saat online

Fase 5 - Studio AI

Durasi: 2 minggu

Deliverables

[ ] Upload foto produk
[ ] Preview foto
[ ] Background enhancement
[ ] Image result storage
[ ] Generate caption
[ ] Copy caption
[ ] Download hasil
[ ] Riwayat studio
[ ] Error handling
[ ] Loading state

Exit Criteria

User dapat menghasilkan foto yang lebih layak jual
User dapat menyalin caption promosi
Foto original tetap tersimpan

Fase 6 - Klinik Modal HKI

Durasi: 2-3 minggu

Deliverables

[ ] Form data karya
[ ] Upload bukti HKI
[ ] Ringkasan indikatif
[ ] Checklist kelengkapan
[ ] Confidence/indicative score
[ ] Generate PDF
[ ] Download PDF
[ ] Disclaimer wajib
[ ] Riwayat valuasi

Exit Criteria

User dapat membuat pra-valuasi HKI awal
PDF dapat diunduh
Disclaimer hukum tampil jelas

Fase 7 - Asisten Izin & Halal

Durasi: 1-2 minggu

Deliverables

[ ] UI chat
[ ] Endpoint chat
[ ] Prompt aman
[ ] Quick prompts
[ ] Checklist NIB
[ ] Checklist Halal
[ ] Simpan sesi chat
[ ] Disclaimer bukan nasihat hukum final

Exit Criteria

Chat dapat menjawab pertanyaan dasar
Jawaban tidak menyesatkan
User dapat menyimpan checklist

Fase 8 - Hardening & Scale

Durasi: 2 minggu

Deliverables

[ ] Rate limiting AI
[ ] Cost monitoring
[ ] Error alerting
[ ] Security audit rules
[ ] Data deletion flow
[ ] Export CSV
[ ] Export PDF laporan
[ ] Optimasi performa
[ ] Lighthouse audit
[ ] Accessibility audit
[ ] AI evaluation dataset

Exit Criteria

Sistem lebih aman dan stabil
Biaya AI terpantau
User dapat export data
Performa mobile membaik

Fase 9 - Growth Features

Durasi: lanjutan

Fitur Kandidat

[ ] Multi-staff
[ ] Role owner/admin/kasir
[ ] Produk favorit
[ ] Template transaksi
[ ] Reminder pencatatan harian
[ ] Insight AI mingguan
[ ] Integrasi payment QRIS
[ ] Integrasi marketplace
[ ] Integrasi laporan pajak sederhana
[ ] Rekomendasi promosi berdasarkan kategori
[ ] Scoring kelayakan modal internal

Milestone Ringkas

| Milestone | Target |
|---|---|
| M1 | Manual MVP selesai |
| M2 | Voice + Receipt selesai |
| M3 | PWA + offline selesai |
| M4 | Laporan + gamifikasi selesai |
| M5 | Studio AI selesai |
| M6 | HKI + PDF selesai |
| M7 | Assistant selesai |
| M8 | Production hardening selesai |

Rekomendasi Urutan Build

Manual first
Dashboard
Voice
Receipt
Review screen
Offline/PWA
Streak
Studio
HKI
Assistant

Urutan ini penting karena fitur manual adalah fondasi kepercayaan user.