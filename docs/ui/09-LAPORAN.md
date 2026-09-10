# 09 — Halaman Laporan Keuangan (`/laporan`)

**Route**: `/laporan`

**Tujuan Halaman**: Menampilkan rekap untung-rugi dan arus kas usaha secara visual, sederhana, tanpa istilah akuntansi rumit. Membantu pedagang UMKM mengerti kondisi kas mereka dan mengekspor laporan resmi.

---

## Layout & Dimensi
- **Lebar kontainer utama**: 343px (padding horizontal 16px kiri & kanan)
- **Tinggi optimal**: Bebas scroll vertikal
- **Safe area atas**: 44px
- **Safe area bawah**: 98px (bottom nav + safe area)

---

## Komponen UI (1 per 1 dari Atas ke Bawah)

### 1. Header Halaman
- **Posisi**: 16px kiri & kanan, 16px dari top safe area
- **Isi**: Judul Halaman "Laporan Keuangan" (20px Bold)

### 2. Pemilih Periode Laporan
- **Posisi**: 16px kiri & kanan, 12px dari header
- **Tampilan**: 3 Tombol Tab horizontal: `[ Mingguan ]` | `[ Bulanan ]` | `[ Tahunan ]`
- **Tab Aktif**: Diberi latar aksen `warna-primer` tipis, teks tebal
- **Default**: Tab "Bulanan" aktif

### 3. Kartu Laba / Rugi Bersih
- **Posisi**: 16px kiri & kanan, 16px dari pemilih periode
- **Tinggi**: 100px, radius 16px
- **Isi Atas (Rata Tengah)**:
  - Label: "Laba Bersih Bulan Ini" (12px `warna-teks-sekunder`)
  - Angka Utama: 28px Bold (contoh: `+Rp 3.450.000` hijau / `-Rp 500.000` merah jika rugi)
- **Pembagi Garis**: 1px border netral
- **Isi Bawah (2 Kolom)**:
  - Kiri: Label "Total Pemasukan" + Nilai `Rp 8.200.000` (16px SemiBold hijau)
  - Kanan: Label "Total Pengeluaran" + Nilai `Rp 4.750.000` (16px SemiBold merah)

### 4. Grafik Tren Arus Kas (Chart)
- **Posisi**: 16px kiri & kanan, 20px dari kartu laba rugi
- **Tinggi**: 180px
- **Tipe Grafik**:
  - Jika periode Mingguan: Grafik batang per hari (Senin–Minggu)
  - Jika periode Bulanan: Grafik batang per minggu (Minggu 1–4)
  - Jika periode Tahunan: Grafik batang per bulan (Jan–Des)
- **Warna Batang**: Batang hijau (Pemasukan) berdampingan dengan batang merah (Pengeluaran) per satuan waktu
- **Legenda**: Titik hijau "Masuk" + Titik merah "Keluar" di atas kanan grafik
- **Interaksi**: Tap salah satu batang → Muncul tooltip kecil: nilai masuk & keluar hari/minggu/bulan itu

### 5. Daftar Pengeluaran Terbesar per Kategori
- **Posisi**: 16px kiri & kanan, 20px dari grafik
- **Header**: "Pos Pengeluaran Terbesar" (16px SemiBold)
- **Setiap Baris Kategori (Max 4 item)**:
  - Nama Kategori (misal: "Bahan Baku & Stok")
  - Persentase dari total pengeluaran (misal: "65%") di kanan
  - Progress bar horizontal di bawah nama & persen (panjang menyesuaikan persentase)
  - Total nominal kategori itu (misal: `Rp 3.087.500`) di bawah progress bar, teks abu-abu

### 6. Tombol Unduh Laporan PDF
- **Posisi**: 16px kiri & kanan, 24px dari daftar pengeluaran
- **Lebar**: Penuh (311px), tinggi 48px
- **Warna Latar**: `warna-primer` (hijau)
- **Ikon**: PDF / Unduh
- **Teks**: "Unduh Laporan PDF (Siap Cetak)"
- **Interaksi**: Tap → Kirim permintaan ke backend → Generate PDF → Download otomatis ke HP
- **State Loading**: Teks berubah "Menyiapkan PDF..." + spinner, tombol disable

### 7. Tombol Ekspor Excel / CSV
- **Posisi**: 16px kiri & kanan, 12px di bawah tombol PDF
- **Lebar**: Penuh (311px), tinggi 48px
- **Warna Latar**: Transparan, border `warna-border`
- **Ikon**: Spreadsheet / Tabel
- **Teks**: "Ekspor Data Lengkap (Excel / CSV)"
- **Interaksi**: Tap → Download file .csv seluruh transaksi periode tersebut

### 8. Bottom Navigation Bar (Fixed Bawah)
- Tab aktif: **Laporan** (ikon & label menyala `warna-primer`)
- FAB (+) tetap di tengah.

---

## State Halaman
- **Loading**: Kartu laba rugi dan grafik menampilkan skeleton berdenyut
- **Kosong (Tidak Ada Data)**: Tampilkan pesan "Belum ada transaksi di periode ini." + ilustrasi kalender kosong
- **Error**: Tombol muat ulang

---

## Navigasi Keluar
- Tap tab nav bawah → pindah ke halaman lain
- Download PDF/CSV → tetap di halaman laporan (tidak berpindah)
