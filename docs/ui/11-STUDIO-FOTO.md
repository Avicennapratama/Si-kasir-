# 11 — Halaman Studio Foto Produk AI (`/studio`)

**Route**: `/studio`

**Tujuan Halaman**: Membantu pelaku usaha ekraf menghasilkan foto produk profesional dan caption jualan otomatis untuk media sosial (Instagram, WhatsApp, TikTok).

---

## Layout & Dimensi
- **Lebar kontainer utama**: 343px (padding horizontal 16px kiri & kanan)
- **Tinggi optimal**: Scroll vertikal jika perlu, tetap fokus pada 3 tahap utama di layar
- **Safe area atas**: 44px
- **Safe area bawah**: 34px

---

## Komponen UI (3 Tahap Utama)

### 1. Tahap 1: Upload Foto Mentah
- **Posisi**: 16px kiri & kanan, 24px dari top safe area
- **Judul Section**: "1. Unggah Foto Produk" (14px Bold `warna-teks-primer`)
- **Area Input Foto**:
  - Kotak bergaris putus-putus tinggi 200px, radius 12px
  - Ikon kamera besar di tengah jika belum ada foto
  - Teks placeholder: "Klik di sini atau seret file foto"
- **Tombol Aksi**:
  - "Ambil Foto Langsung" (kanan)
  - "Pilih dari Galeri" (kiri)
- **Interaksi**: 
  - Drag & drop file image ke area
  - Tap → Buka kamera / file picker

### 2. Tahap 2: Pilih Gaya Studio
- **Posisi**: 16px kiri & kanan, 24px dari tahap upload
- **Judul Section**: "2. Pilih Gaya Studio" (14px Bold)
- **Grid Gaya Studio (4 Kartu Vertikal)**:
  1. **Meja Kayu Estetik**
  2. **Marmer Mewah Minimalis**
  3. **Taman Tropis Outdoor**
  4. **Studio Warna Pastel Cerah**
- **Setiap Kartu**:
  - Ikon stylenya di atas
  - Judul stylenya di bawah ikon (12px)
  - Saat dipilih: border `warna-primer` tebal, menunjukkan aktif

### 3. Tahap 3: Pilih Tone Caption & Generate
- **Posisi**: 16px kiri & kanan, 24px dari tahap 2
- **Judul Section**: "3. Tone Caption" (14px Bold)
- **Chip Tone Caption Horizontal**:
  - `[ Santai & Ramah ]`
  - `[ Promo Diskon ]`
  - `[ Elegan & Mewah ]`
  - `[ Informatif ]`
- **Catatan**:
  - "Pilih nada bicara sesuai visi jualanmu."
- **Tombol Generate**:
  - Posisi: 16px kiri & kanan, 24px dari chip tone
  - Lebar penuh, tinggi 52px
  - Warna: `warna-primer`
  - Teks: "Generate Caption & Foto"
- **Interaksi**:
  - Saat di-klik: Muncul loading spinner 1.5 detik
  - Hasil generate: Foto diatas + Caption di bawah (preview)

### 4. Layar Hasil (Preview Setelah Generate)
- **Posisi**: 16px kiri & kanan, 24px dari tombol Generate
- **Layout Sebelum vs Sesudah**:
  - Kiri: Foto asli mentah (kiri), Foto hasil AI (kanan) — dibanding dengan slider drag
  - Kanan: Caption jualan yang di-generate
- **Caption Preview**:
  - Teks Caption besar di tengah
  - Hashtag otomatis di bawah (`#kulinerlokal #umkmbisa #blablabla`)
- **Dua Tombol Aksi di Bawah**:
  1. **Tombol Kiri**: "Unduh Foto Studio HD"
     - Teks 14px, warna `warna-teks-sekunder`
     - Interaksi: Simpan foto ke galeri HP
  2. **Tombol Kanan**: "Salin Caption"
     - Teks 14px, latar `warna-netral-bg`
     - Interaksi: Copy ke clipboard (whatsApp/Instagram caption)

---

## State & Error Handling
- **Tidak Ada Foto**: Tombol Generate disable, tost: "Pilih foto terlebih dahulu."
- **Gagal Generate AI**: Tost error: "AI gagal generate caption, coba lagi nanti."
- **Sukses**: Toast sukses + opsi simpan unduh

---

## Navigasi Keluar
- Tap Tombol Kembali (←) → Kembali ke Drawer Menu Ekraf
- Tap Tombol Unduh/Salin → Tersimpan/Disalin, tetap di halaman studio