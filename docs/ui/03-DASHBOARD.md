# 03 — Halaman Dashboard / Pusat Kasir (`/dashboard`)

**Route**: `/dashboard`

**Tujuan Halaman**: Halaman utama setelah login. Memberikan gambaran kas hari ini dalam 3 detik, tombol cepat mencatat, dan daftar transaksi terbaru.

---

## Layout & Dimensi
- **Lebar kontainer utama**: 343px (padding horizontal 16px kiri & kanan)
- **Tinggi optimal**: 760px – 900px
- **Safe area atas**: 44px (status bar OS)
- **Safe area bawah**: 98px (bottom nav + safe area)

---

## Komponen UI (1 per 1)

### 1. Top Bar Profil (Area Atas)
- **Posisi**: 16px kiri & kanan, 16px dari top safe area
- **Komponen Kiri**:
  - Nama Toko Pengguna (Font: 18px Bold `warna-teks-primer`)
  - Badge Status Jaringan: Bulat hijau kecil (8px) + Teks "Online" (12px `warna-teks-sekunder`)
- **Komponen Kanan**:
  - Avatar Akun Google: Bulat 36px × 36px, foto profil user dari Firebase Auth
  - Interaksi Tap: Pindah ke `/pengaturan/profil`

### 2. Banner Streak Gamifikasi (Di Bawah Top Bar)
- **Posisi**: 16px kiri & kanan, 12px dari Top Bar
- **Tinggi**: 40px
- **Bentuk**: Kotak memanjang dengan border halus (`rounded-xl`)
- **Isi**:
  - Ikon: Api menyala (🔥)
  - Teks: "3 Hari Berturut-turut! Catat transaksi hari ini agar streak tidak putus."
- **Warna**: Latar aksen lembut, teks `warna-teks-primer`

### 3. Kartu Saldo Kas Hari Ini (Area Utama)
- **Posisi**: 16px kiri & kanan, 16px dari banner streak
- **Padding Dalam**: 20px
- **Border Radius**: 16px (`rounded-2xl`)
- **Isi Bagian Atas**:
  - Label: "Sisa Saldo Hari Ini" (12px `warna-teks-sekunder`)
  - Angka Saldo Bersih: Font 32px Bold `warna-teks-primer` (contoh: `Rp 450.000`)
- **Pemisah Garis Tipis** (Divider): 1px border netral
- **Isi Bagian Bawah (2 Kolom Sejajar)**:
  - **Kolom Kiri (Uang Masuk)**:
    - Ikon: Panah serong ke atas hijau
    - Label: "Uang Masuk" (12px)
    - Nominal: `+Rp 600.000` (16px SemiBold `warna-kas-masuk`)
  - **Kolom Kanan (Uang Keluar)**:
    - Ikon: Panah serong ke bawah merah
    - Label: "Uang Keluar" (12px)
    - Nominal: `-Rp 150.000` (16px SemiBold `warna-kas-keluar`)

### 4. Quick Action Bar — 3 Tombol Aksi Cepat
- **Posisi**: 16px kiri & kanan, 20px dari kartu saldo
- **Layout**: 3 tombol berdampingan, lebar masing-masing ~100px, tinggi 72px
- **Border Radius**: 12px (`rounded-xl`)
- **Tiap Tombol**:
  1. **Tombol 1: Manual**
     - Ikon: Papan Ketik (Keyboard)
     - Label: "Manual"
     - Interaksi: Tap → Langsung buka `/catat/manual`
  2. **Tombol 2: Suara AI**
     - Ikon: Mikrofon (Mic)
     - Label: "Suara AI"
     - Interaksi: Tap → Langsung buka `/catat/suara`
  3. **Tombol 3: Pindai Nota**
     - Ikon: Kamera / Scan Struk
     - Label: "Pindai Nota"
     - Interaksi: Tap → Langsung buka `/catat/nota`

### 5. Section Transaksi Terakhir Hari Ini
- **Posisi**: 16px kiri & kanan, 24px dari Quick Action Bar
- **Header Section**:
  - Kiri: Teks "Transaksi Hari Ini" (16px SemiBold `warna-teks-primer`)
  - Kanan: Tautan teks "Lihat Semua" (14px `warna-primer`) → Pindah ke `/riwayat`
- **Daftar Transaksi (Maksimal 4 baris)**:
  - Tiap baris transaksi (tinggi 60px, batas bawah separator tipis):
    - Ikon Kategori bulat (36px × 36px) di kiri
    - Tengah:
      - Nama/Catatan: "Jual Nasi Goreng 2x" (14px Medium)
      - Badge Sumber kecil: `[Manual]` atau `[Suara]` atau `[Nota]` (10px)
      - Jam: `14:20` (12px `warna-teks-sekunder`)
    - Kanan: Nominal uang (`+Rp 30.000` hijau atau `-Rp 15.000` merah)
  - Interaksi Tap Baris: Buka Bottom Sheet rincian transaksi (bisa edit/hapus)
- **Empty State (Jika belum ada transaksi hari ini)**:
  - Ikon buku catatan terbuka (48px)
  - Teks utama: "Belum ada transaksi hari ini" (14px Medium)
  - Teks ajakan: "Ketuk salah satu tombol di atas untuk mulai mencatat!" (12px `warna-teks-sekunder`)

### 6. Bottom Navigation Bar (Fixed Bawah)
- Tab aktif: **Beranda** (ikon & label menyala `warna-primer`)
- FAB (+) di tengah siap ditekan kapan saja

---

## State Halaman Dashboard
- **Loading**: Kartu saldo & transaksi menampilkan shimmer skeleton berdenyut
- **Offline**: Banner offline muncul tepat di bawah top bar, data diambil dari cache lokal
- **Error Fetch**: Muncul pesan "Gagal memuat data kas hari ini" + tombol "Muat Ulang"

---

## Navigasi Keluar dari Layar Ini
- Tap Tombol Manual → `/catat/manual`
- Tap Tombol Suara → `/catat/suara`
- Tap Tombol Pindai Nota → `/catat/nota`
- Tap "Lihat Semua" / Tab Riwayat → `/riwayat`
- Tap Tab Laporan → `/laporan`
- Tap Tab Menu → Drawer Layanan Ekraf
- Tap Avatar Akun → `/pengaturan/profil`
- Tap Baris Transaksi → Modal Bottom Sheet rincian transaksi
