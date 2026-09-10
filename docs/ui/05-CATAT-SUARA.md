# 05 — Halaman Catat Lewat Suara (`/catat/suara`)

**Route**: `/catat/suara`

**Tujuan Halaman**: Pencatatan kas secara *hands-free* menggunakan suara bahasa Indonesia sehari-hari. Cocok saat tangan pedagang basah, kotor, atau sedang sibuk melayani pembeli.

---

## Layout & Dimensi
- **Lebar kontainer utama**: 343px (padding horizontal 16px kiri & kanan)
- **Tinggi optimal**: Terpusat vertikal di tengah layar (tanpa scroll)
- **Safe area atas**: 44px
- **Safe area bawah**: 34px

---

## Komponen UI (1 per 1 dari Atas ke Bawah)

### 1. Header Halaman
- **Posisi**: 16px kiri & kanan, 16px dari top safe area
- **Komponen Kiri**: Tombol Kembali (Ikon `←`, 40px × 40px)
  - Interaksi: Tap → Kembali ke `/dashboard` (jika sedang merekam, batalkan rekaman)
- **Tengah**: Judul Halaman "Catat Suara Pintar" (18px Bold)
- **Kanan**: Ruang kosong

### 2. Kartu Panduan Contoh Ucapan (Tips Card)
- **Posisi**: 16px kiri & kanan, 20px dari header
- **Bentuk**: Kotak kartu berlatar lembut dengan border halus, radius 14px, padding 14px
- **Isi**:
  - Header kecil: "💡 Contoh cara bicara:" (12px SemiBold)
  - Baris 1: *"Laku soto ayam dua porsi tiga puluh ribu"* (13px italic)
  - Baris 2: *"Beli minyak goreng dua liter tiga puluh lima ribu di pasar"* (13px italic)

### 3. Visualisator Audio Berdenyut (Pulse Ring Area) — Komponen Utama Tengah
- **Posisi**: Tengah layar vertikal (sekitar 40% – 50% dari atas layar)
- **Layout**: Rata tengah (center-aligned)
- **Tiga Kondisi Tampilan (State Machine)**:

#### Kondisi A: Siap Merekam (State: Idle)
- Ikon mikrofon besar di dalam lingkaran diameter 80px
- Border luar lingkaran abu-abu tipis
- Teks di bawah lingkaran: "Ketuk tombol mikrofon untuk mulai bicara" (14px Medium `warna-teks-sekunder`)

#### Kondisi B: Sedang Merekam (State: Recording)
- Lingkaran tengah berubah warna berdenyut (pulse ring animation membesar mengecil)
- Animasi gelombang audio (audio waveform bar) bergerak naik-turun mengikuti volume suara
- Timer berjalan: Font 24px Bold Monospace `00:08 / 01:00` (maksimal 60 detik)
- Teks status: "Mendengarkan suara Anda..." (14px SemiBold)
- Tombol aksi: Lingkaran tengah berubah menjadi kotak merah "Berhenti & Analisis"

#### Kondisi C: Sedang Dianalisis AI (State: Processing)
- Lingkaran tengah menampilkan spinner loading halus berputar
- Teks status: "AI sedang mendengarkan & menyusun transaksi..." (14px Medium)
- Subteks: "Biasanya butuh 2-3 detik" (12px `warna-teks-sekunder`)
- Tombol perekam di-disable

### 4. Tombol Utama Perekam (Besar di Bawah Visualisator)
- **Posisi**: 24px di bawah visualisator audio
- **Bentuk**: Tombol bulat besar diameter 72px × 72px di tengah
- **Warna**: Latar `warna-primer` dengan bayangan lembut
- **Ikon Dalam**:
  - Saat Idle: Ikon Mikrofon putih (32px)
  - Saat Recording: Ikon Kotak Persegi merah/putih (simbol Stop)
- **Interaksi Tap**:
  - Jika Idle: Minta izin microphone browser → Mulai rekaman audio → Timer jalan
  - Jika Recording: Hentikan rekaman → Kirim audio ke backend AI → Masuk State Processing

### 5. Tautan Fallback ke Manual (Selalu Terlihat di Bawah)
- **Posisi**: 24px dari bottom safe area, rata tengah
- **Teks**: "Suara bising atau koneksi lambat? **Beralih ke Catat Manual**"
- **Gaya**: Teks 14px, kata tebal bergaris bawah `warna-primer`
- **Interaksi Tap**: Langsung batalkan proses suara dan buka `/catat/manual`

---

## State Penanganan Kesalahan (Error Handling)

### 1. Izin Mikrofon Ditolak (Permission Denied)
- Modal dialog kecil muncul di tengah:
  - Judul: "Izin Mikrofon Diperlukan"
  - Deskripsi: "SiKasir AI membutuhkan akses mic agar bisa mendengar ucapan transaksi Anda. Silakan izinkan di pengaturan browser."
  - Tombol: "Beralih ke Manual" (primer) dan "Coba Lagi" (sekunder)

### 2. Audio Tidak Terdeteksi / Sunyi
- Toast peringatan: "Suara tidak terdengar jelas. Pastikan Anda berbicara dekat mikrofon."
- Halaman otomatis kembali ke State Idle

### 3. Ekstraksi AI Gagal / Format Tidak Dikenali
- Dialog opsi: "AI belum dapat mengenali nominal dari ucapan tadi. Mau coba bicara lagi atau ketik manual?"
- Dua tombol: "Ulangi Bicara" (ke State Idle) atau "Ketik Manual" (ke `/catat/manual`)

---

## Navigasi Keluar
- Berhasil ekstraksi AI → Pindah otomatis ke layar **Review Draft** (`/catat/review/[draftId]`) membawa data hasil ekstraksi
- Tap Tombol Kembali (←) → Kembali ke `/dashboard`
- Tap Tautan Fallback → Pindah ke `/catat/manual`
