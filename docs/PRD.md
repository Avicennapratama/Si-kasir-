PRD - SiKasir AI

Informasi Dokumen

| Field | Nilai |
|---|---|
| Nama Produk | SiKasir AI |
| Versi Dokumen | 1.0 |
| Status | Draft for Development |
| Target Program | Ekraf x Google |
| Platform | Progressive Web App (PWA) |
| Bahasa UI | Bahasa Indonesia |
| Target Pengguna | UMKM & pelaku ekonomi kreatif Indonesia |

Ringkasan Eksekutif

SiKasir AI adalah PWA yang membantu UMKM dan pelaku ekonomi kreatif mencatat keuangan tanpa hambatan. Pengguna dapat mencatat transaksi melalui:

form manual,
perintah suara,
foto nota.

Berbeda dengan aplikasi kasir konvensional yang memaksa user memahami sistem kompleks, SiKasir AI menggunakan pendekatan Absolute Frictionless Input. Namun, produk tetap menyediakan jalur manual sebagai fallback utama agar semua pengguna tetap dapat mencatat transaksi meskipun AI gagal, koneksi buruk, audio berisik, atau foto nota tidak terbaca.

Problem Statement

2.1 Hambatan Adopsi Teknologi

Banyak pelaku UMKM tidak memiliki waktu untuk mempelajari aplikasi kasir kompleks. Input berbasis keyboard sering terasa lambat saat harus melayani pelanggan.

2.2 Hambatan Harga

Aplikasi kasir atau akuntansi yang ada sering memiliki biaya langganan yang kurang ramah untuk usaha mikro.

2.3 Hambatan Pemasaran

Banyak UMKM kesulitan membuat materi visual produk yang layak jual di media sosial.

2.4 Hambatan Akses Modal

Pelaku ekonomi kreatif sering kesulitan membuktikan nilai karya atau kekayaan intelektual mereka untuk kebutuhan pembiayaan.

2.5 Risiko Ketergantungan AI

Jika sistem hanya bergantung pada AI, pengguna akan frustrasi saat:

suara tidak terbaca,
foto nota buram,
koneksi internet buruk,
AI salah menafsirkan transaksi.

Karena itu, input manual wajib tersedia.

Product Goals

3.1 Tujuan Utama

Membuat pencatatan transaksi sangat cepat dan mudah.
Menyediakan tiga jalur input: manual, suara, dan foto nota.
Mengurangi kesalahan pencatatan UMKM.
Membantu UMKM membuat konten promosi dengan AI.
Membantu pelaku ekraf menyiapkan dokumen pra-valuasi HKI.
Meningkatkan retensi pengguna dengan gamifikasi ringan.

3.2 Non-Goals

Bukan aplikasi akuntansi penuh.
Bukan sistem ERP.
Bukan lembaga penilai HKI resmi.
Bukan penjamin pencairan KUR.
Bukan aplikasi kasir hardware untuk printer/EDC pada MVP.

Target Users

4.1 Persona: Pedagang Kuliner Mikro

| Atribut | Detail |
|---|---|
| Profil | Warung makan, mie ayam, gorengan, minuman |
| Usia | 25-55 tahun |
| Kebutuhan | Catat cepat saat melayani pelanggan |
| Hambatan | Tidak punya waktu mengetik panjang |
| Device | Android menengah ke bawah |
| Behavior | Transaksi tunai, pencatatan manual di buku |

4.2 Persona: Pelaku Ekonomi Kreatif

| Atribut | Detail |
|---|---|
| Profil | Kriya, fashion, desain, seni, kuliner kreatif |
| Kebutuhan | Promosi visual dan akses modal |
| Hambatan | Sulit membuat materi profesional dan valuasi karya |
| Device | Smartphone |
| Behavior | Berjualan lewat WhatsApp/Instagram |

4.3 Persona: UMKM Siap Scale

| Atribut | Detail |
|---|---|
| Profil | Usaha mulai stabil dan ingin berkembang |
| Kebutuhan | Laporan sederhana, dokumen pendukung modal |
| Hambatan | Data keuangan belum rapi |

Value Proposition

SiKasir AI membantu UMKM mencatat keuangan dalam hitungan detik tanpa memaksa mereka memahami pembukuan rumit.

Nilai utama:

Cepat: catat lewat suara atau foto.
Aman: ada jalur manual jika AI gagal.
Sederhana: UI besar dan bahasa mudah dimengerti.
Bernilai tambah: membantu promosi dan persiapan modal.
Ringan: PWA tanpa perlu install dari app store.

Core Product Principles

6.1 Manual First Fallback

Setiap fitur AI harus memiliki fallback manual.

6.2 AI-Assisted, Not AI-Forced

Hasil AI adalah draft, bukan kebenaran final.

6.3 Review Before Save

Semua ekstraksi suara dan nota harus melewati layar review.

6.4 Inclusive Design

UI harus nyaman untuk pengguna paruh baya, pengguna outdoor, dan pengguna dengan perangkat lama.

6.5 Trust by Transparency

Tampilkan confidence score, pesan error jelas, dan kontrol edit penuh.

6.6 Offline Aware

Form manual tetap bisa dipakai offline, lalu disinkronkan saat online.

Information Architecture

7.1 Menu Utama

Beranda / Pusat Kasir
Catat
Riwayat
Studio AI
Klinik Modal HKI
Asisten
Laporan
Pengaturan

7.2 Menu Catat

Catat Manual
Catat Suara
Pindai Nota

End-to-End User Flow

8.1 Onboarding

Flow

User membuka web SiKasir AI.
User login dengan Google.
Sistem membuat profil dasar.
User mengisi informasi usaha minimal:
   - nama usaha,
   - kategori usaha.
User masuk ke dashboard.

Acceptance Criteria

Tidak ada formulir panjang.
Onboarding maksimal 1-2 langkah.
User bisa skip detail opsional.

8.2 Dashboard Pusat Kasir

Flow

User login.
Dashboard menampilkan:
   - Uang Masuk Hari Ini
   - Uang Keluar Hari Ini
User melihat tombol besar:
   - Catat Manual
   - Catat Suara
   - Pindai Nota

Acceptance Criteria

Dashboard menampilkan total hari ini.
Setelah transaksi disimpan, dashboard langsung update.
Tombol aksi mudah dijangkau ibu jari.

8.3 Catat Manual

Flow

User menekan Catat Manual.
User memilih tipe transaksi:
   - Masuk
   - Keluar
User memasukkan nominal.
User memilih kategori.
User mengisi catatan opsional.
User memilih tanggal transaksi.
User menekan Simpan.
Sistem menyimpan transaksi.
Dashboard dan riwayat diperbarui.

Acceptance Criteria

Form manual tidak memerlukan AI.
Nominal wajib diisi.
Nominal harus lebih besar dari 0.
Tanggal default hari ini.
Kategori memiliki opsi populer.
Catatan bersifat opsional.
Setelah simpan, muncul toast sukses.
Jika offline, transaksi disimpan ke outbox lokal.
Setelah online, transaksi tersinkron.
User bisa mengedit transaksi setelah disimpan.
User bisa menghapus transaksi dengan konfirmasi.

8.4 Catat Suara

Flow

User menekan tombol mikrofon.
User meminta izin mikrofon.
User mengucapkan transaksi.
Sistem merekam audio.
Audio dikirim ke backend.
AI mengekstrak transaksi menjadi draft.
Sistem menampilkan review screen.
User mengedit atau konfirmasi.
User menyimpan transaksi.

Contoh Input

Laku dua porsi mie ayam, tiga puluh ribu.

Contoh Output Draft

| Field | Nilai |
|---|---|
| Tipe | Uang Masuk |
| Nominal | Rp30.000 |
| Catatan | Laku dua porsi mie ayam |
| Item | Mie ayam |
| Qty | 2 |
| Confidence | Tinggi |

Acceptance Criteria

User bisa merekam ulang.
Hasil AI tidak langsung disimpan.
User bisa edit semua field.
Jika confidence rendah, sistem menandai field yang perlu dicek.
Jika AI gagal, sistem membuka form manual.
Audio asli dapat disimpan untuk audit/debug jika user memberi izin.

8.5 Pindai Nota

Flow

User menekan Pindai Nota.
User memotret nota atau mengunggah gambar.
Gambar dikompresi di client.
Gambar dikirim ke backend.
AI membaca nota.
Sistem menampilkan draft hasil baca.
User review dan edit.
User menyimpan transaksi.

Output yang Diekstrak

tipe transaksi,
nominal total,
tanggal,
nama toko/vendor,
daftar item,
catatan,
confidence score.

Acceptance Criteria

Support JPG, PNG, WEBP.
Maksimal ukuran file sesuai konfigurasi.
Gambar buram menghasilkan pesan yang jelas.
User bisa mengganti foto.
User bisa mengedit hasil ekstraksi.
Jika total tidak terbaca, user diminta mengisi manual.
Jika AI gagal, fallback ke form manual.

8.6 Review & Edit Hasil AI

Flow

Sistem menampilkan draft transaksi.
Field yang confidence-nya rendah diberi highlight.
User dapat mengubah:
   - tipe,
   - nominal,
   - kategori,
   - tanggal,
   - catatan.
User menekan Benar & Simpan.

Acceptance Criteria

Semua hasil AI berstatus draft sampai user konfirmasi.
Field confidence rendah terlihat jelas.
User bisa batal tanpa menyimpan.
Sistem menyimpan source transaksi: manual, voice, atau receipt.

Functional Requirements

| ID | Fitur | Deskripsi | Prioritas |
|---|---|---|---|
| FR-001 | Google Login | Masuk cepat dengan akun Google | P0 |
| FR-002 | Onboarding Ringan | Nama usaha dan kategori usaha | P0 |
| FR-003 | Dashboard | Ringkasan uang masuk dan keluar hari ini | P0 |
| FR-004 | Catat Manual | Form transaksi manual | P0 |
| FR-005 | Catat Suara | Rekam suara lalu AI ekstrak transaksi | P0 |
| FR-006 | Pindai Nota | Upload foto nota lalu AI ekstrak transaksi | P0 |
| FR-007 | Review AI | Edit draft sebelum simpan | P0 |
| FR-008 | Riwayat | Daftar transaksi | P0 |
| FR-009 | Edit/Hapus Transaksi | Koreksi data | P0 |
| FR-010 | Offline Manual | Simpan manual lokal saat offline | P1 |
| FR-011 | Laporan Sederhana | Ringkasan harian/mingguan/bulanan | P1 |
| FR-012 | Studio AI | Perbaikan foto produk dan caption | P1 |
| FR-013 | Klinik Modal HKI | Pra-valuasi awal dan PDF pendukung | P1 |
| FR-014 | Asisten Chat | Panduan NIB dan Halal | P2 |
| FR-015 | Gamifikasi | Streak dan badge | P1 |
| FR-016 | Export Data | PDF/CSV laporan sederhana | P2 |
| FR-017 | Pengaturan | Profil usaha, privasi, hapus data | P1 |

Detail Fitur Catat Manual

10.1 Route

/catat/manual

10.2 Komponen UI

Toggle tipe transaksi:
   - Uang Masuk
   - Uang Keluar
Input nominal besar
Chip kategori
Input catatan
Date picker
Tombol simpan
Tombol batal

10.3 Kategori Awal

Uang Masuk

Penjualan produk
Penjualan jasa
Piutang dibayar
Modal masuk
Lain-lain

Uang Keluar

Bahan baku
Kemasan
Listrik
Air
Internet
Sewa tempat
Gaji/komisi
Transport
Peralatan
Lain-lain

10.4 Aturan Validasi

| Field | Aturan |
|---|---|
| type | wajib, income atau expense |
| amount | wajib, angka, > 0 |
| category | wajib |
| note | opsional |
| transactionDate | wajib, default hari ini |
| source | otomatis manual |
| status | otomatis confirmed setelah user simpan |

10.5 UX Requirement

Tombol minimal nyaman untuk jari.
Input nominal langsung fokus saat halaman dibuka.
Tampilan angka menggunakan format Rupiah.
Simpan harus cepat dan jelas.
Ada undo singkat setelah simpan.

Detail Fitur Catat Suara

11.1 Route

/catat/suara

11.2 Komponen UI

Tombol rekam besar
Timer rekaman
Tombol hentikan
Tombol rekam ulang
Hasil transcript
Draft transaksi
Tombol edit
Tombol simpan
Tombol pindah ke manual

11.3 Aturan

Rekam maksimal 60 detik pada MVP.
Tampilkan izin mikrofon dengan jelas.
Jika browser tidak mendukung perekaman, tampilkan opsi manual.
Semua hasil AI harus review sebelum simpan.

11.4 Contoh Input yang Didukung

Laku dua porsi mie ayam tiga puluh ribu.
Beli tepung lima kilo seratus dua puluh lima ribu.
Bayar listrik dua ratus ribu.
Terima pesanan kue lima ratus ribu.

Detail Fitur Pindai Nota

12.1 Route

/catat/nota

12.2 Komponen UI

Tombol kamera
Tombol upload gambar
Preview foto
Tombol ambil ulang
Hasil ekstraksi
Review form
Tombol simpan
Tombol pindah ke manual

12.3 Aturan

Kompres gambar sebelum upload.
Jangan upload gambar lebih besar dari batas konfigurasi.
Jika confidence rendah, tampilkan warning.
Jangan memaksa user menerima hasil AI.

Studio AI

Deskripsi

Studio AI membantu pengguna mengunggah foto produk dan menghasilkan visual yang lebih layak jual serta teks promosi.

Fitur MVP

Upload foto produk.
Hapus atau ganti background.
Perbaiki pencahayaan ringan.
Generate caption promosi.
Copy caption.

Acceptance Criteria

User bisa upload foto.
Sistem menampilkan loading state.
User bisa melihat hasil sebelum download/copy.
Jika gagal, tampilkan pesan jelas.
Foto original tidak hilang.

Batasan

Jangan mengubah identitas produk secara menyesatkan.
Jangan menambahkan klaim berlebihan.
Jangan menghapus detail penting produk.

Klinik Modal HKI

Deskripsi

Fitur untuk membantu pelaku ekraf menyiapkan dokumen awal terkait kekayaan intelektual.

Fitur MVP

Form data karya:
   - judul karya,
   - jenis karya,
   - deskripsi,
   - tanggal pembuatan,
   - bukti pendukung.
Upload logo, foto karya, sertifikat, atau dokumen pendukung.
Ringkasan indikatif.
Checklist kelengkapan.
Generate PDF pra-valuasi awal.

Acceptance Criteria

User bisa mengisi data karya.
User bisa upload bukti.
Sistem menghasilkan ringkasan awal.
Sistem menampilkan disclaimer.
User bisa download PDF.

Disclaimer Wajib

Dokumen ini bukan valuasi hukum resmi, bukan appraisal final, dan bukan jaminan persetujuan pembiayaan bank.

Asisten Izin & Halal

Deskripsi

Chatbot yang membantu UMKM memahami langkah dasar NIB dan sertifikasi Halal.

Fitur MVP

Chat sederhana.
Jawaban berbasis prompt aman.
Checklist persiapan.
Saran langkah berikutnya.

Acceptance Criteria

Jawaban menggunakan bahasa sederhana.
Tidak memberi klaim hukum final.
Menyebutkan sumber resmi jika diperlukan.
User bisa menyimpan checklist.

Gamifikasi

Fitur

Streak harian.
Badge 7 hari.
Badge transaksi pertama.
Animasi ucapan selamat ringan.

Aturan Streak

Streak bertambah jika user menyimpan minimal 1 transaksi dalam satu hari.
Streak reset jika tidak ada aktivitas pencatatan pada hari berikutnya.

Acceptance Criteria

Streak tersimpan per business/user.
Badge muncul saat syarat terpenuhi.
Animasi tidak berat di ponsel low-end.

Laporan

MVP

Ringkasan hari ini.
Ringkasan 7 hari terakhir.
Ringkasan bulan ini.
Daftar transaksi berdasarkan periode.

Later

Export PDF.
Export CSV.
Kategori teratas.
Tren omzet.
Insight AI sederhana.

Non-Functional Requirements

18.1 Performance

| Metrik | Target |
|---|---|
| Initial load pada jaringan menengah |  90% |
| Transaksi pertama dalam 5 menit | > 50% |
| Aktivasi manual | minimal 1 transaksi tersimpan |

Retensi

| Metric | Target Awal |
|---|---|
| D1 retention | > 30% |
| D7 retention | > 15% |
| Pengguna streak 7 hari | > 5% |

Kualitas AI

| Metric | Target Awal |
|---|---|
| Voice amount accuracy | > 85% |
| Receipt total accuracy | > 80% |
| AI result accepted without major edit | > 60% |
| Fallback manual akibat error AI |  5 |
| Penggunaan Studio AI | > 20% user aktif |
| Penggunaan HKI | > 5% user aktif |

Scope MVP

Included

Google login.
Onboarding sederhana.
Dashboard.
Catat manual.
Catat suara.
Pindai nota.
Review dan edit hasil AI.
Riwayat transaksi.
Edit/hapus transaksi.
Laporan sederhana.
Streak dasar.
PWA dasar.

Excluded from MVP

Multi-staff kompleks.
Integrasi payment gateway.
Integrasi printer kasir.
Akuntansi penuh.
Laporan pajak kompleks.
Valuasi HKI resmi.
Marketplace.

Risks & Mitigation

| Risiko | Dampak | Mitigasi |
|---|---|---|
| AI salah membaca nominal | Data keuangan salah | Review screen dan confidence score |
| Suara tidak jelas | Gagal ekstraksi | Fallback manual |
| Nota buram | Gagal OCR | Minta foto ulang atau manual |
| Koneksi buruk | Fitur gagal | Offline manual dan retry |
| Biaya AI tinggi | Operasional mahal | Rate limit, kompresi, cache, Gemini Flash |
| Pengguna tidak percaya AI | Adopsi rendah | Manual tersedia dan hasil dapat diedit |
| Klaim HKI sensitif | Risiko hukum | Gunakan bahasa pra-valuasi indikatif |
| Data privacy | Risiko compliance | Consent, enkripsi, isolasi data |

Dependencies

Firebase project.
Google Cloud project.
Gemini API access.
Vertex AI access jika diperlukan.
Firebase Auth.
Firestore.
Firebase Storage.
Cloud Functions / Cloud Run.
Kebijakan privasi.
Syarat & ketentuan.

Definition of Done

Suatu fitur dianggap selesai jika:

UI sesuai requirement.
Flow utama berhasil.
Error state ditangani.
Loading state tersedia.
Validasi client dan server ada.
Data tersimpan dengan benar.
User bisa review/edit hasil AI.
Fallback manual tersedia.
Accessibility dasar terpenuhi.
Test happy path dan failure path dilakukan.