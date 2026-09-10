# 13 — Halaman Asisten Tanya Jawab Legalitas & Bisnis (`/asisten`)

**Route**: `/asisten`

**Tujuan Halaman**: Aplikasi chatbot percakapan untuk membantu pedagang UMKM bertanya soal izin legalitas (NIB, P-IRT, Sertifikat Halal), tips bisnis, dan regulasi sederhana. Menggunakan bahasa Indonesia yang ramah, bebas istilah hukum rumit.

---

## Layout & Dimensi
- **Lebar kontainer utama**: 343px (padding horizontal 16px kiri & kanan)
- **Tinggi optimal**: Scroll vertikal tanpa batas (chat bisa terus bertambah)
- **Safe area atas**: 44px
- **Safe area bawah**: 34px (bottom nav + input area)

---

## Komponen UI (Struktur Chat Interface)

### 1. Header Halaman
- **Posisi**: 16px kiri & kanan, 16px dari top safe area
- **Komponen Kiri**: Tombol Kembali (Ikon `←`, 40px × 40px)
  - Interaksi: Tutup halaman asisten, kembali ke Drawer Menu Ekraf
- **Tengah**: Judul Layar "Asisten Usaha & Regulasi" (18px Bold)
- **Kanan**: Avatar/Icon Asisten (Ikon bot cerdas kecil di kanan atas header)

### 2. Area Kontak & Disclaimer (Baris Atas Kiri Chat)
- **Posisi**: 16px kiri & kanan, 12px dari header, 32px dari top
- **Tinggi**: 24px
- **Komponen**:
  - **Chip Topik Cepat (4 Kotak)** di sebelah kiri:
    1. `[ Cara Bikin NIB Gratis di OSS ]`
    2. `[ Syarat Sertifikat Halal UMKM ]`
    3. `[ Tips Mengatur Arus Kas Warung ]`
    4. `[ Cara Pisahkan Uang Pribadi & Toko ]`
  - Setiap chip: Ikon kecil di kiri, teks 12px SemiBold
  - Interaksi Tap: Setiap chip mengirimkan pertanyaan otomatis ke AI (seperti user mengetik pertanyaan tersebut)

### 3. Area Aliran Percakapan (Chat Stream) — Komponen Utama
- **Posisi**: 16px kiri & kanan, 40px dari header/kepala chip, sampai 32px dari bawah safe area (atas input)
- **Tinggi**: Auto height (maksimal layar terisi 50%-60% depend tinggi device)
- **Layout**: Flow vertical (pesan bertumpuk dari atas ke bawah)
- **Bagian Pesan User (Kanan)**:
  - Balon chat rata kiri kanan (bagian kanan layar)
  - Warna balon: `warna-kas-masuk` (hijau)
  - Teks: "User: ..." (font 14px)
- **Bagian Pesan AI (Kiri)**:
  - Balon chat rata kiri layar
  - Warna balon: Latar `warna-netral-bg` (putih muda)
  - Teks AI: "Asisten: ..." (font 14px, warna-teks-primer)
- **Animasi**: Ketika AI mengetik, muncul indikator "..." bertahap (sangat lambat seperti manusia)
- **Disclaimer Ringkas** (bawah balon AI terakhir): "⚠️ Asisten memberikan saran informatif, bukan penasihat hukum resmi."

### 4. Bar Input Pertanyaan (Area Bawah)
- **Posisi**: 16px kiri & kanan, 16px di atas bottom safe area
- **Tinggi**: 48px
- **Layout**: Row Horizontal
  - Input Teks: Kotak lebar 60% layar, placeholder "Ketik pertanyaan usahamu di sini..."
  - Tombol Kirim: Ikon pesawat kertas di kanan (48px × 48px)
- **Interaksi**:
  - Ketik teks → tombol kirim aktif
  - Tap tombol kirim → AI "menggetik" balasan (animasi titik-titik bertahap 2-3 detik) → Muncul balon AI di atas input area

---

## State & Error Handling

### 1. AI Sedang Mengetik
- Indikator: 3 titik bertahap muncul di balon AI berikutnya, titik-titik menghilir-nyari berulang

### 2. AI Error / Gagal Respons
- Jika AI tidak bisa merespons (konfigurasi/Tokens): Muncul balon AI merah mini: "Maaf, asisten sedang tidak bisa merespons. Coba lagi nanti."
- Tombol "Coba Lagi" muncul di bawah balan

### 3. User Menutup Halaman
- Chat state reset, kembali ke Drawer Menu Ekraf

---

## Navigasi Keluar
- Tap Tombol Kembali (←) → Tutup asisten, kembali ke Drawer Menu Ekraf
- Tap Chip Topik Cepat → Mengirim pertanyaan cepat tersebut ke AI
- User mengetik pertanyaan bebas → AI balas dalam balon chat baru