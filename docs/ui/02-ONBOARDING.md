# 02 — Halaman Onboarding Data Usaha (`/onboarding`)

**Route**: `/onboarding`

**Tujuan Halaman**: Muncul sekali untuk pengguna baru yang belum ada data profil usaha di Firestore. Form mengumpulkan identitas usaha untuk mengustomalkan fitur pencatatan & laporan.

---

## Layout & Dimensi
- **Lebar kontainer utama**: 343px (padding horizontal 16px kiri & kanan)
- **Tinggi optimal**: 680px – 850px
- **Safe area atas**: 44px
- **Safe area bawah**: 34px

---

## Komponen UI (1 per 1)

### 1. Indikator Langkah & Judul (Area Atas)
- **Posisi**: 16px kiri & kanan, 24px dari top safe area
- **Isi**: 
  - Bar indikator: "Langkah 1 dari 1"
  - Judul besar: "Profil Usaha Anda"
- **Warna**: Judul `warna-teks-primer`, indikator `warna-teks-sekunder`
- **Interaksi**: Tidak ada

### 2. Form Input Nama Usaha (Body)
- **Posisi**: 16px kiri & kanan, 24px dari atasnya, 16px antar komponen
- **Label**: "Nama Usaha / Toko"
- **Tipe Input**: Text field
- **Placeholder**: "Contoh: Warung Berkah Bu Siti / Kopi Senja"
- **Validasi**: Wajib diisi (minimal 3 karakter)
- **Error Message** (jika kosong): "Nama usaha minimal 3 karakter"
- **Interaksi**:
  - Tap/ fokus: Keyboard muncul
  - Saat diisi: Border berubah warna `warna-kas-masuk` (hijau muda)
- **State**:
  - Default: Kosong, border abu-abu
  - Focus: Border abu-abu lebih gelap
  - Error: Border warna `warna-bahaya` (merah muda), tampilkan error message di bawah

### 3. Form Input Kategori Bidang Usaha (Body)
- **Posisi**: 16px kiri & kanan, 24px dari atasnya (samping input nama usaha)
- **Label**: "Kategori Bidang Usaha"
- **Tipe Input**: Dropdown Chip horizontal (6 pilihan fixed)
- **Opsi**:
  - `[ Kuliner & Minuman ]`
  - `[ Toko Kelontong / Retail ]`
  - `[ Fashion & Pakaian ]`
  - `[ Jasa & Reparasi ]`
  - `[ Kerajinan Tangan / Kriya ]`
  - `[ Lainnya ]`
- **Interaksi**: Tap chip → chip aktif tampilkan aksen `warna-primer`, chip lain non-aktif
- **State**: Default (chip pertama aktif secara default)

### 4. Form Input Kota / Wilayah (Body)
- **Posisi**: 16px kiri & kanan, 24px dari atasnya (samping kategori)
- **Label**: "Kota / Wilayah Operasional"
- **Placeholder**: "Contoh: Bandung, Jawa Barat"
- **Interaksi**: Tap → muncul keyboard, pengguna bisa ketik atau pilih dari daftar kota presets

### 5. Tombol Aksi Utama (Footer)
- **Posisi**: 16px kiri & kanan, 24px dari bottom safe area
- **Ukuran**: Lebar penuh (311px), tinggi 52px
- **Border Radius**: 12px (`rounded-xl`)
- **Warna Latar**: `warna-primer` (hijau kas)
- **Warna Teks**: Putih
- **Isi Teks**: "Mulai Catat Transaksi 🚀"
- **Interaksi**:
  - Tap → Validasi seluruh form (nama ≥ 3 char, kategori dipilih)
  - Jika valid → Simpan ke Firestore `businesses` collection
  - Jika invalid → Tampilkan toast error: "Lengkapi form terlebih dahulu."
  - Setelah sukses → Arahkan otomatis ke `/dashboard`

---

## Navigasi Keluar
- **Form sukses disimpan** → Arahkan ke `/dashboard`
- **Form tidak valid** → Tampilkan toast error, tetap di halaman onboarding
- **Tombol Batal (opsional)** → Kembali ke `/login`

---

## Catatan Teknis
- Layout dirancang 1 halaman tunggal (single step), namun siap dikembangkan menjadi multi-step (3 langkah: nama usaha → kategori → lokasi).
- Setiap input field memiliki `min-height 48px` untuk tap target accessibility.
- Warna latar form default: transparan atau `warna-netral-bg` (sangat muda).