# 04 — Halaman Catat Transaksi Manual (`/catat/manual`)

**Route**: `/catat/manual`

**Tujuan Halaman**: Form input langsung bagi pengguna yang ingin mengetik nominal, memilih kategori, dan menyimpan transaksi secara manual tanpa bantuan AI. Jalur paling cepat, pasti, dan tidak bergantung sinyal.

---

## Layout & Dimensi
- **Lebar kontainer utama**: 343px (padding horizontal 16px kiri & kanan)
- **Tinggi optimal**: Scroll vertikal jika keyboard muncul, sticky footer di dasar
- **Safe area atas**: 44px
- **Safe area bawah**: 34px

---

## Komponen UI (1 per 1 dari Atas ke Bawah)

### 1. Header Halaman
- **Posisi**: 16px kiri & kanan, 16px dari top safe area
- **Tinggi**: 44px
- **Komponen Kiri**: Tombol Kembali (Ikon panah kiri `←`, 40px × 40px)
  - Interaksi: Tap → Kembali ke halaman sebelumnya / `/dashboard`
- **Tengah**: Judul Halaman "Catat Transaksi Manual" (18px Bold `warna-teks-primer`)
- **Kanan**: Ruang kosong (penyeimbang layout)

### 2. Toggle Jenis Transaksi (Masuk vs Keluar)
- **Posisi**: 16px kiri & kanan, 16px dari header
- **Tinggi**: 48px
- **Bentuk**: Switch tab lebar penuh, 2 tombol berdampingan, border radius 12px
- **Dua Tombol**:
  1. **Tombol Kiri**: `[ + Uang Masuk ]`
     - Saat Aktif: Latar hijau lembut, border hijau, teks tebal `warna-kas-masuk`
  2. **Tombol Kanan**: `[ - Uang Keluar ]`
     - Saat Aktif: Latar merah lembut, border merah, teks tebal `warna-kas-keluar`
- **Interaksi**: Tap salah satu → berganti jenis seketika, kategori di bawah otomatis menyesuaikan

### 3. Kotak Input Nominal Uang (Paling Menonjol di Layar)
- **Posisi**: 16px kiri & kanan, 20px dari toggle jenis
- **Tinggi**: 76px
- **Bentuk**: Kotak kartu putih dengan border halus, radius 16px
- **Tampilan Dalam (Rata Tengah)**:
  - Teks Prefix Tetap: "Rp" (20px Bold `warna-teks-sekunder`)
  - Input Angka: Font ekstra besar 36px Bold Monospace (contoh: `50.000`)
  - Placeholder jika kosong: `0`
  - Auto-formatting: Setiap ketukan angka otomatis memformat titik pemisah ribuan (contoh: ketik 5-0-0-0-0 jadi `50.000`)
- **Validasi**: Tidak boleh 0 atau minus

### 4. Quick Add Chips (Tombol Cepat Tambah Nominal)
- **Posisi**: 16px kiri & kanan, 12px dari kotak nominal
- **Layout**: Baris horizontal 4 chip tombol
- **Chip yang Tersedia**:
  - `[ +10.000 ]`
  - `[ +20.000 ]`
  - `[ +50.000 ]`
  - `[ +100.000 ]`
- **Interaksi**: Tap chip → nominal input langsung bertambah sebesar nilai chip (misal isi 10.000 lalu tap +20.000 → jadi 30.000)

### 5. Pemilih Kategori Usaha (Horizontal Scroll Chips)
- **Posisi**: 16px kiri & kanan, 24px dari quick add chips
- **Label Section**: "Pilih Kategori" (14px SemiBold `warna-teks-primer`)
- **Tampilan**: Kumpulan chip bulat yang bisa digeser menyamping (horizontal scroll), gap 8px
- **Daftar Kategori jika Uang Masuk**:
  - `[ Penjualan Produk ]` *(Default terpilih)*
  - `[ Pendapatan Jasa ]`
  - `[ Modal Sendiri ]`
  - `[ Piutang Masuk ]`
  - `[ Pemasukan Lain ]`
- **Daftar Kategori jika Uang Keluar**:
  - `[ Bahan Baku & Stok ]` *(Default terpilih)*
  - `[ Sewa Tempat ]`
  - `[ Listrik & Air ]`
  - `[ Gaji Karyawan ]`
  - `[ Transportasi ]`
  - `[ Pengeluaran Lain ]`
- **Interaksi**: Tap chip → chip tersebut aktif (latar `warna-primer`, teks putih), chip lain non-aktif

### 6. Field Catatan / Rincian Transaksi (Opsional)
- **Posisi**: 16px kiri & kanan, 20px dari pemilih kategori
- **Label**: "Catatan Transaksi (Opsional)" (14px Medium)
- **Tipe Input**: Single-line text input (tinggi 48px, radius 12px)
- **Placeholder**: "Misal: 3 porsi ayam bakar, paket komplit"

### 7. Field Tanggal Transaksi
- **Posisi**: 16px kiri & kanan, 16px dari field catatan
- **Label**: "Tanggal Transaksi" (14px Medium)
- **Tampilan**: Kotak input dengan ikon kalender di kanan (tinggi 48px, radius 12px)
- **Nilai Default**: Hari ini & jam saat ini (contoh: "9 September 2026, 14:30")
- **Interaksi**: Tap → Buka native date picker HP untuk ganti tanggal lampau

### 8. Tombol Simpan Transaksi (Sticky Footer Bawah)
- **Posisi**: Fixed di dasar layar (menempel di atas home indicator)
- **Padding Kontainer**: 16px kiri, kanan, dan atas
- **Tombol**:
  - Lebar penuh (311px), tinggi 52px
  - Border radius 12px (`rounded-xl`)
  - Warna: `warna-primer` (hijau kas)
  - Teks: "Simpan Transaksi" (16px Bold, putih)
- **Interaksi Tap**:
  1. Periksa nominal > 0. Jika 0: getarkan HP (haptic) + highlight merah pada kotak nominal
  2. Tampilkan spinner kecil di tombol (Loading state)
  3. Simpan ke database (Firestore / antrian outbox lokal jika offline)
  4. Munculkan Toast sukses: "Transaksi Rp XX.XXX berhasil disimpan!"
  5. Navigasi otomatis ke `/riwayat` atau `/dashboard`

---

## State Halaman
- **Default**: Jenis Masuk aktif, nominal 0, kategori default terpilih, tanggal hari ini
- **Loading saat Simpan**: Tombol simpan disable, teks berganti "Menyimpan...", spinner berputar
- **Offline**: Tombol tetap bisa diklik, data masuk antrian outbox lokal, toast: "Tersimpan offline di HP"
- **Validasi Gagal**: Kotak nominal berkedip merah lembut + teks helper: "Nominal tidak boleh kosong"

---

## Navigasi Keluar
- Tap Tombol Kembali (←) → Kembali ke halaman sebelumnya
- Sukses Simpan → Pindah ke `/riwayat`
