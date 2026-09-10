# 07 — Halaman Review & Koreksi Draft Hasil AI (`/catat/review/[draftId]`)

**Route**: `/catat/review/[draftId]`

**Tujuan Halaman**: Gerbang verifikasi mutlak. Seluruh data hasil ekstraksi AI (suara atau nota) WAJIB melalui layar ini agar user bisa memeriksa, mengoreksi jika ada salah baca, dan mengonfirmasi sebelum disimpan ke database transaksi resmi.

---

## Layout & Dimensi
- **Lebar kontainer utama**: 343px (padding horizontal 16px kiri & kanan)
- **Tinggi optimal**: Scrollable vertikal, dengan dua tombol aksi fixed di bawah
- **Safe area atas**: 44px
- **Safe area bawah**: 34px

---

## Komponen UI (1 per 1 dari Atas ke Bawah)

### 1. Header Halaman
- **Posisi**: 16px kiri & kanan, 16px dari top safe area
- **Komponen Kiri**: Tombol Batal (Ikon `✕`, 40px × 40px)
  - Interaksi: Tap → Buka dialog konfirmasi batalkan draft
- **Tengah**: Judul Halaman "Periksa Hasil AI" (18px Bold)
- **Kanan**: Badge Asal Data:
  - Jika dari suara: Badge biru `[ 🎙️ Suara ]`
  - Jika dari nota: Badge oranye `[ 📷 Nota ]`

### 2. Banner Tingkat Keyakinan AI (Confidence Banner)
- **Posisi**: 16px kiri & kanan, 12px dari header
- **Bentuk**: Kotak info lebar penuh, radius 12px, padding 12px
- **Tampilan Berdasarkan Tingkat Keyakinan**:
  - **Kasus A: Akurasi Tinggi (> 90%)**:
    - Latar: Hijau lembut
    - Ikon: Centang hijau ✓
    - Teks: "Data berhasil dibaca dengan jelas. Silakan periksa cepat sebelum simpan." (13px)
  - **Kasus B: Akurasi Rendah (< 70%) / Ambigu**:
    - Latar: Kuning/amber lembut
    - Ikon: Tanda seru segitiga ⚠️
    - Teks: "Beberapa data perlu dicek ulang! Periksa field yang bertanda kuning di bawah." (13px SemiBold)

### 3. Formulir Koreksi Langsung di Tempat (Editable Form)
*Seluruh field di bawah ini otomatis terisi dari hasil AI, tetapi pengguna bisa langsung mengubah nilainya:*

#### A. Pemilih Jenis Transaksi (Editable)
- Tampilan: Switch tab `[ Uang Masuk ]` | `[ Uang Keluar ]`
- Terisi otomatis sesuai kesimpulan AI (misal kata "laku" → Masuk, kata "beli" → Keluar)

#### B. Total Nominal Uang (Editable)
- Tampilan: Kotak angka besar dengan prefix "Rp"
- Terisi otomatis nilai nominal hasil baca AI
- **Jika confidence rendah pada nominal**: Kotak diberi garis tepi kuning tebal sebagai penanda visual wajib dicek

#### C. Kategori Transaksi (Editable)
- Tampilan: Chip horizontal scrollable
- Chip hasil prediksi AI otomatis terpilih (misal "Bahan Baku & Stok")
- Pengguna bisa tap chip lain jika klasifikasi AI keliru

#### D. Catatan / Rincian Barang (Editable)
- Tampilan: Text field
- Terisi rincian hasil tangkapan AI (contoh: "3 porsi mie ayam, 2 es teh")

#### E. Tanggal & Jam (Editable)
- Tampilan: Kotak tanggal dengan ikon kalender
- Terisi tanggal/jam saat ini (atau tanggal yang terbaca di nota)

### 4. Kotak Bukti Asli (Referensi Silang)
- **Posisi**: 16px kiri & kanan, 16px di bawah formulir
- **Jika Sumber dari Nota**:
  - Tombol accordion: "👁️ Lihat Foto Nota Asli"
  - Saat diklik: Muncul gambar struk nota yang bisa di-zoom (pinch to zoom) untuk mencocokkan angka
- **Jika Sumber dari Suara**:
  - Kotak teks kutipan: "Terdengar: *'Jual nasi goreng tiga porsi empat puluh lima ribu'*" (13px italic)

### 5. Tombol Aksi Ganda (Sticky Footer di Bawah)
- **Posisi**: Fixed di dasar layar
- **Layout**: 2 tombol berdampingan, gap 12px
- **Dua Tombol**:
  1. **Tombol Kiri (Sekunder - Batal)**:
     - Lebar: ~100px, tinggi 52px
     - Latar: Transparan, border `warna-bahaya` (merah)
     - Teks: "Hapus Draft" (14px SemiBold merah)
     - Interaksi: Tap → Dialog konfirmasi: "Hapus draft ini tanpa menyimpan?" → Ya → Hapus draft & kembali ke `/dashboard`
  2. **Tombol Kanan (Primer - Konfirmasi Simpan)**:
     - Lebar: Sisa ruang penuh (~190px), tinggi 52px
     - Latar: `warna-primer` (hijau kas)
     - Teks: "✅ Benar & Simpan" (16px Bold putih)
     - Interaksi: Tap → Validasi form → Simpan ke koleksi `transactions` Firestore → Hapus draft sementara → Toast sukses → Arahkan ke `/riwayat`

---

## State Penanganan Kesalahan
- **Draft Tidak Ditemukan**: Tampilkan error: "Draft transaksi sudah kedaluwarsa atau telah disimpan sebelumnya" + tombol "Ke Beranda"
- **Simpan Gagal**: Tombol simpan kembali aktif + toast: "Gagal menyimpan ke buku kas. Periksa koneksi internet."

---

## Navigasi Keluar
- Konfirmasi Simpan Sukses → Pindah ke `/riwayat`
- Batal / Hapus Draft Disetujui → Pindah ke `/dashboard`
