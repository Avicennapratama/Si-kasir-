# 12 — Halaman Pra-Valuasi HKI (`/hki`)

**Route**: `/hki`

**Tujuan Halaman**: Menjelaskan dan memberikan estimasi nilai ekonomi untuk aset kekayaan intelektual UMKM (merek, resep, desain), serta menilai kesiapan mendaftar HKI ke Depan Hukum Kekayaan Intelektual (DJKI).

---

## Layout & Dimensi
- **Lebar kontainer utama**: 343px (padding horizontal 16px kiri & kanan)
- **Tinggi optimal**: Scroll vertikal jika perlu, total fokus di form + hasil analisis
- **Safe area atas**: 44px
- **Safe area bawah**: 34px

---

## Komponen UI (Dari Atas ke Bawah)

### 1. Header Halaman
- **Posisi**: 16px kiri & kanan, 16px dari top safe area
- **Isi**: Judul Layar "Pra-Valuasi HKI" (20px Bold)

### 2. Formulir Penilaian Sederhana
- **Posisi**: 16px kiri & kanan, 24px dari header
- **Judul Section**: "Nilai Aset Merek/Karya" (14px SemiBold)

#### A. Input Nama Merek / Karya
- **Tipe**: Text field
- **Placeholder**: "Contoh: Keripik Singkong Nenek"
- **Label**: "Nama Merek / Nama Karya" (13px)
- **Interaksi**: Pengguna ketik nama produk atau merek mereka

#### B. Lama Beroperasi Usaha
- **Tipe**: Chip Toggle Vertikal (3 opsi)
  - `[ Kurang Dari 1 Tahun ]`
  - `[ 1 – 3 Tahun ]` (Default)
  - `[ Lebih Dari 3 Tahun ]`
- **Interaksi**: Tap memilih lama beroperasi mempengaruhi estimasi nilai

#### C. Rata-rata Penjualan Bulanan
- **Tipe**: Input Angka (Prefix Rp)
- **Placeholder**: "Masukkan rata-rata penjualan bulan ini"
- **Validasi**: Hanya menerima angka > 0, otomatis format pemisah ribuan

#### D. Wilayah Jangkauan Pembeli
- **Tipe**: Chip Horizontal (3 Opsi)
  - `[ Satu Kota ]`
  - `[ Antar Provinsi ]`
  - `[ Ekspor ]`
- **Interaksi**: Tap memilih wilayah mempengaruhi harga jual pasar

#### E. Keunikan / Rahasia Dagang (Checklist)
- **Tipe**: 5 Checklist item
  1. ✔️ Resep rahasia sendiri
  2. ✔️ Logo desain orisinal
  3. ✔️ Metode produksi khas
  4. ✔️ Paket promosi spesial
  5. [ ] Lainnya (input opsional tertera)

### 3. Hasil Analisis Indikatif AI
- **Posisi**: 16px kiri & kanan, 24px di atas tombol aksi
- **Tinggi**: 140px
- **Layout 2 Kolom Vertikal**:
  - **Kolom Kiri (Estimasi Nilai)**:
    - Judul: "Estimasi Nilai Merek" (12px SemiBold `warna-teks-primer`)
    - Angka Besar: `Rp 45.000.000 – Rp 75.000.000` (18px Bold, hijau/ungu)
    - Teks penjelasan kecil: "Berdasarkan omzet pasar rata-rata & keunikan produk" (12px abu-abu)
  - **Kolom Kanan (Kesiapan HKI)**:
    - Judul: "Skor Kesiapan Daftar HKI" (12px SemiBold)
    - Lingkaran Nilai: `85/100` (16px Bold)
    - Teks: "Sangat Siap Didaftarkan ke DJKI" (12px)
    - Indikator visual: Garis progress hijau 85%

### 4. Disclaimer Legalitas
- **Posisi**: 16px kiri & kanan, 12px di atas tombol aksi
- **Tipe**: Kotak teks gray tipis, radius 12px, padding 12px
- **Isi**: "Laporan ini bersifat edukasi dan indikasi awal, bukan dokumen penaksir resmi penjaminan bank atau otoritas hukum. Untuk nilai hakim, konsultasikan dengan AHU atau perwakilan hukum."

### 5. Tombol Aksi (Sticky Footer)
- **Posisi**: Fixed di dasar layar
- **Layout**: 2 tombol berdampingan, gap 12px
- **Dua Tombol**:
  1. **Tombol Kiri (Sekunder)**:
     - Teks: "Hapus Formulir"
     - Warna: Abu-abu
     - Interaksi: Hapus semua input di form, kembalikan state kosong
  2. **Tombol Kanan (Primer - Unduh PDF)**:
     - Teks: "Unduh Laporan Evaluasi HKI (PDF)"
     - Warna: `warna-primer` (hijau kas)
     - Interaksi: Kirim data formulir ke backend → Generate PDF → Download ke HP

---

## State & Validasi
- **Form Belum Lengkap**: Jika ada field wajib kosong → tombol Unduh PDF disable + toast: "Lengkapi formulir terlebih dahulu."
- **Validasi Angka**: Input penjualan hanya menerima angka positif > 0

---

## Navigasi Keluar
- Tap Tombol Kembali (←) → Kembali ke Drawer Menu Ekraf
- Tap Unduh PDF → File terunduh ke galeri HP
- Tap Hapus Form → Form dikosongkan, bisa mulai input ulang