# 08 — Halaman Riwayat & Log Transaksi (`/riwayat`)

**Route**: `/riwayat`

**Tujuan Halaman**: Pusat penelusuran, pencarian, dan audit semua transaksi yang pernah dicatat. Memungkinkan pengguna melihat rincian ulang, mengubah kesalahan, dan menghapus catatan.

---

## Layout & Dimensi
- **Lebar kontainer utama**: 343px (padding horizontal 16px kiri & kanan)
- **Tinggi optimal**: Bebas scroll vertikal
- **Safe area atas**: 44px
- **Safe area bawah**: 98px (bottom nav + safe area)

---

## Komponen UI (1 per 1 dari Atas ke Bawah)

### 1. Header & Pencarian
- **Posisi**: 16px kiri & kanan, 16px dari top safe area
- **Baris 1**: Judul Halaman "Riwayat Transaksi" (20px Bold)
- **Baris 2 (Kotak Pencarian)**:
  - Tinggi: 48px, radius 12px
  - Ikon: Kaca pembesar (Search) di kiri
  - Placeholder: "Cari transaksi, barang, catatan..."
  - Interaksi: Ketik nama/catatan → filter list di bawah secara langsung (client-side filter)

### 2. Bar Filter & Periode (Tab & Dropdown)
- **Posisi**: 16px kiri & kanan, 16px dari pencarian
- **Filter Jenis (Tab Toggle)**:
  - Tiga tombol menempel: `[ Semua ]` | `[ Masuk ]` | `[ Keluar ]`
  - Tab aktif diberi latar aksen warna (hijau/merah tergantung jenis)
- **Filter Tanggal (Chip / Dropdown)**:
  - Di bawah filter jenis, satu tombol outline
  - Teks: "Bulan Ini ▼" (default)
  - Interaksi: Tap → Buka pop-up pilihan: "Hari Ini", "7 Hari Terakhir", "Bulan Ini", "Bulan Lalu", "Pilih Kustom"

### 3. Daftar Kartu Transaksi (Terkelompok per Tanggal)
- **Posisi**: 16px kiri & kanan, membentang ke bawah sampai dasar
- **Section Header (Pemisah Tanggal)**:
  - Kotak sticky header tipis berlatar abu-abu muda
  - Teks: "Hari Ini - 9 September 2026" atau "Kemarin - 8 September 2026" (13px SemiBold)
- **Baris Item Transaksi (Setiap Kartu)**:
  - Tinggi kartu: 64px, background putih, klik seluruh area
  - **Kiri**: Lingkaran abu-abu 40px × 40px berisi ikon Kategori (contoh: ikon piring untuk makanan)
  - **Tengah (Tumpuk Atas Bawah)**:
    - Atas: Nama/Catatan ("Jual Nasi Goreng") (14px Medium)
    - Bawah: Badge sumber `[🎙️ Suara]` + Jam "14:20" (12px abu-abu)
  - **Kanan**:
    - Nominal transaksi: `+Rp 45.000` (hijau tebal) atau `-Rp 20.000` (merah tebal)
  - **Interaksi**: Tap baris mana saja → Membuka Modal Bottom Sheet Rincian Transaksi

### 4. Empty State & Loading
- **Loading Skeleton**:
  - Muncul saat mengambil data transaksi dari Firestore.
  - Bentuk: 5-7 baris persegi panjang abu-abu berdenyut menyerupai daftar transaksi.
- **Empty State (Kosong)**:
  - Muncul jika hasil filter tidak menemukan transaksi.
  - Ikon: Kaca pembesar dengan silang / Kertas kosong.
  - Teks: "Tidak ada transaksi ditemukan pada periode ini."

### 5. Bottom Navigation Bar (Fixed Bawah)
- Tab aktif: **Riwayat** (ikon & label menyala `warna-primer`)
- FAB (+) tetap di tengah.

---

## 📄 Modal Lembar Rincian (Bottom Sheet Detail)
*Muncul dari bawah ketika pengguna mengetuk salah satu baris transaksi.*

- **Header Lembar**: Teks "Detail Transaksi" + tombol tutup ✕ di kanan atas
- **Rincian Data yang Ditampilkan**:
  - Jenis: Pemasukan / Pengeluaran (dengan dot warna)
  - Kategori: (Misal: Bahan Baku)
  - Nominal: Angka ekstra besar, misal `Rp 45.000`
  - Tanggal & Jam
  - Catatan Rincian
  - Sumber Pencatatan: "Dicatat otomatis dengan AI Suara"
  - Jika sumber dari foto nota: Ada tautan "Lihat Foto Nota" untuk memperbesar
- **Dua Tombol Aksi di Bawah Lembar**:
  1. **Tombol Edit / Ubah (Primer)**:
     - Teks: "Ubah Transaksi" (tinggi 48px, lebar penuh)
     - Interaksi: Membawa data ke form edit (tampilan mirip Catat Manual namun terisi data).
  2. **Tombol Hapus (Sekunder)**:
     - Teks: "Hapus Transaksi" (warna tulisan merah)
     - Interaksi: Buka dialog konfirmasi bahaya ("Apakah Anda yakin ingin menghapus transaksi Rp 45.000 ini?") → Jika setuju, hapus dari database dan hilangkan dari daftar.

---

## Navigasi Keluar
- Tap tab navigasi bawah (Beranda/Laporan/Menu) → pindah ke modul lain
- Tap FAB Catat → Membuka menu catat cepat
- Menyimpan hasil Edit → Kembali ke list riwayat dengan data baru
- Sukses menghapus → Kembali ke list riwayat dengan baris tersebut menghilang (animasi fade/slide out)
