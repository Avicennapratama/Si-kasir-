# 10 — Halaman Menu Layanan Ekraf & Fitur Kreatif (Drawer dari Tab Menu Bottom Nav)

**Route**: Diakses dari Bottom Nav Bar tab terakhir **"Menu"** atau Drawer Layanan Ekraf.

**Tujuan Halaman**: Menampilkan grid 4 kartu fitur utama untuk pelaku usaha ekraf dan UMKM: Studio Foto AI, Pra-Valuasi HKI, Asisten Legalitas & Bisnis, serta Pengaturan. Setiap kartu mengarah ke halaman spesifik sesuai fungsinya.

---

## Layout & Dimensi
- **Lebar kontainer utama**: 343px
- **Tinggi optimal**: Scroll vertikal jika perlu
- **Safe area**: Tipis di atas & bawah (44px atas, 34px bawah)

---

## Komponen UI (Grid 4 Kartu Interaktif)

### Header Awal (Opsional, bisa muncul di bagian atas grid)
- Judul Layar: "Layanan Ekraf & Bisnis"
- Subjudul: "Alat bantu AI untuk memajukan usaha Anda."

### 1. Kartu 1: Studio Foto Produk AI (`/studio`)
- **Posisi**: Baris pertama, kol pertama
- **Ikon**: Tongkat ajaib & Kamera (48px × 48px)
- **Latar Kartu**: Transparan atau warna netral muda (`warna-netral-bg`)
- **Judul**: "Studio Foto Produk"
- **Deskripsi**: "Sulap foto meja jadi studio katalog mewah & buat caption jualan sosmed."
- **Interaksi Tap**: Langsung ke `/studio` (Halaman Studio Foto Produk AI)
- **Animasi**: Hover shadow mengecil, scale 1.02x saat ditekan

### 2. Kartu 2: Pra-Valuasi HKI (`/hki`)
- **Posisi**: Baris pertama, kol kedua
- **Ikon**: Sertifikat / Hak Cipta (48px × 48px)
- **Latar Kartu**: Transparan atau warna netral muda
- **Judul**: "Klinik & Valuasi HKI"
- **Deskripsi**: "Estimasi nilai ekonomi merek & dokumen pra-daftar HKI."
- **Interaksi Tap**: Langsung ke `/hki` (Halaman Pra-Valuasi HKI)
- **Animasi**: Hover shadow

### 3. Kartu 3: Asisten Legalitas & Bisnis (`/asisten`)
- **Posisi**: Baris kedua, kol pertama
- **Ikon**: Bot obrolan cerdas (48px × 48px)
- **Latar Kartu**: Transparan atau warna netral muda
- **Judul**: "Asisten Usaha & Regulasi"
- **Deskripsi**: "Konsultasi langkah buat NIB gratis, sertifikat Halal, dan tips omzet."
- **Interaksi Tap**: Langsung ke `/asisten` (Halaman Asisten Tanya Jawab)
- **Animasi**: Hover shadow

### 4. Kartu 4: Pengaturan Aplikasi (`/pengaturan`)
- **Posisi**: Baris kedua, kol kedua
- **Ikon**: Roda gigi / Setting (48px × 48px)
- **Latar Kartu**: Transparan atau warna netral muda
- **Judul**: "Pengaturan Aplikasi"
- **Deskripsi**: "Profil toko, keamanan data pribadi, dan status penyimpanan offline."
- **Interaksi Tap**: Langsung ke `/pengaturan` (Halaman Pengaturan & Privasi Data)
- **Animasi**: Hover shadow

### Footer Drawer (Opsional)
- Link singkat: "Bantuan | Syarat & Ketentuan"

---

## Navigasi Keluar
- Tap Setiap Kartu → Arahkan ke halaman spesifik masing-masing kartu
- Tap Tombol Batal/Close → Tutup drawer, kembali ke Dashboard