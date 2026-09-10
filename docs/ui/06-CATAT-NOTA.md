# 06 — Halaman Pindai Nota / Struk (`/catat/nota`)

**Route**: `/catat/nota`

**Tujuan Halaman**: Mengekstrak nominal uang, nama toko/supplier, tanggal, dan daftar rincian item dari foto struk belanja fisik atau kuitansi menggunakan AI Vision.

---

## Layout & Dimensi
- **Lebar kontainer utama**: 343px (padding horizontal 16px kiri & kanan)
- **Tinggi optimal**: Terpusat vertikal tanpa scroll
- **Safe area atas**: 44px
- **Safe area bawah**: 34px

---

## Komponen UI (1 per 1 dari Atas ke Bawah)

### 1. Header Halaman
- **Posisi**: 16px kiri & kanan, 16px dari top safe area
- **Komponen Kiri**: Tombol Kembali (Ikon `←`, 40px × 40px)
  - Interaksi: Tap → Kembali ke `/dashboard`
- **Tengah**: Judul Halaman "Pindai Nota Belanja" (18px Bold)
- **Kanan**: Ruang kosong

### 2. Tips Panduan Pengambilan Foto
- **Posisi**: 16px kiri & kanan, 12px dari header
- **Bentuk**: Kotak tips ringan, radius 12px, padding 12px
- **Isi**:
  - Ikon lampu 💡
  - Teks: "Pastikan nota rata, pencahayaan cukup, dan angka total terlihat jelas. Hindari foto blur atau terlipat." (13px `warna-teks-sekunder`)

### 3. Area Viewfinder Nota (Area Utama Tengah)
- **Posisi**: 16px kiri & kanan, 16px dari tips
- **Ukuran**: Lebar penuh, tinggi 280px
- **Bentuk**: Kotak persegi panjang tegak (portrait) bergaris putus-putus menyerupai bentuk nota fisik, radius 16px
- **Isi Dalam (Jika belum ada foto)**:
  - Ikon nota besar (48px) di tengah
  - Teks: "Area pratinjau foto nota" (14px `warna-teks-sekunder`)
- **Isi Dalam (Setelah foto terpilih)**:
  - Thumbnail foto nota memenuhi area viewfinder
  - Garis scanner laser berjalan dari atas ke bawah (animasi berulang)
  - Teks overlay: "Membaca teks nota..." (14px putih semi-transparan di atas foto)

### 4. Tombol Ambil Foto (Primer)
- **Posisi**: 16px kiri, 12px dari viewfinder
- **Ukuran**: Setengah lebar layar (~155px), tinggi 48px
- **Warna**: `warna-primer` (hijau)
- **Ikon**: Kamera
- **Teks**: "Ambil Foto"
- **Interaksi**: Tap → Buka kamera HP langsung (via `<input type="file" accept="image/*" capture="environment">`)

### 5. Tombol Pilih dari Galeri (Sekunder)
- **Posisi**: Sejajar di kanan Tombol Ambil Foto (~155px), tinggi 48px
- **Warna**: Latar transparan, border `warna-border`
- **Ikon**: Folder gambar
- **Teks**: "Pilih Galeri"
- **Interaksi**: Tap → Buka file picker image HP (gallery browser)

### 6. Indikator Status Analisis (Muncul setelah foto dipilih)
- **Posisi**: 16px kiri & kanan, 16px dari tombol
- **Isi (berurutan berdasarkan state)**:
  - **State Upload**: Teks "Mengunggah foto nota..." + progress bar horizontal
  - **State Analisis**: Teks "AI sedang membaca nota & mengekstrak data..." + spinner
  - **State Selesai**: Teks "Berhasil! Mengarahkan ke review..." + ikon centang hijau

### 7. Tautan Fallback ke Manual (Selalu Terlihat di Bawah)
- **Posisi**: 24px dari bottom safe area, rata tengah
- **Teks**: "Nota sobek atau tidak terbaca? **Ketik Manual Saja**"
- **Gaya**: 14px, kata tebal bergaris bawah `warna-primer`
- **Interaksi Tap**: Langsung buka `/catat/manual`

---

## State Penanganan Kesalahan

### 1. Izin Kamera Ditolak
- Modal dialog:
  - Judul: "Izin Kamera Diperlukan"
  - Deskripsi: "Untuk memotret nota langsung, izinkan akses kamera di pengaturan browser."
  - Tombol: "Pilih dari Galeri" (primer) dan "Coba Lagi" (sekunder)

### 2. File Terlalu Besar (> 5MB)
- Toast error: "Ukuran foto terlalu besar (maks 5MB). Coba ambil ulang dengan kualitas lebih rendah."

### 3. AI Tidak Bisa Membaca Nota
- Dialog opsi:
  - Judul: "Nota Tidak Terbaca"
  - Deskripsi: "AI tidak dapat mengenali angka atau teks di foto ini. Mau coba foto ulang atau catat manual?"
  - Tombol 1: "Foto Ulang" (kembali ke viewfinder kosong)
  - Tombol 2: "Ketik Manual" (ke `/catat/manual`)

### 4. Koneksi Internet Putus Saat Upload
- Toast error: "Tidak ada koneksi internet. Foto disimpan, akan dianalisis saat sinyal kembali."
- Foto masuk outbox lokal

---

## Navigasi Keluar
- Berhasil ekstraksi AI → Pindah otomatis ke layar **Review Draft** (`/catat/review/[draftId]`)
- Tap Tombol Kembali (←) → Kembali ke `/dashboard`
- Tap Tautan Fallback → Pindah ke `/catat/manual`
