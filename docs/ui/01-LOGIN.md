# 01 — Halaman Login (`/login`)

**Route**: `/login`

**Tujuan Halaman**: Menampilkan layar masuk awal bagi pengguna baru maupun lama. Menyediakan opsi login dengan akun Google dan navigasi ke onboarding jika user baru.

---

## Layout & Dimensi
- **Lebar kontainer utama**: 343px (dengan padding horizontal 16px kiri & kanan)
- **Tinggi layar optimal**: 568px – 812px (tergantung device)
- **Safe area atas**: 44px (status bar)
- **Safe area bawah**: 34px (home indicator)

---

## Komponen UI (1 per 1)

### 1. Logo Aplikasi (Area Atas Kiri)
- **Posisi**: 16px dari kiri, 16px dari top safe area
- **Ukuran**: 80px lebar × 80px tinggi
- **Isi**: Ikon logo SiKasir AI (kasir modern dengan aksen kilatan AI putih/ungu)
- **Interaksi**: Tidak ada (hanya dekoratif)
- **State**: Default

### 2. Judul Halaman (Area Atas Tengah)
- **Posisi**: Ditempat kanan logo, atau di bawah logo jika layar kecil
- **Ukuran Font**: 24px — Weight **Bold 700**
- **Warna**: `warna-teks-primer`
- **Isi Teks**: "SiKasir AI"
- **Subtitle (di bawah nama)**: 14px — Weight **Regular 400**, `warna-teks-sekunder`
- **Isi Teks**: "Asisten Kasir Pintar UMKM & Pelaku Kreatif Indonesia"
- **Interaksi**: Tidak ada
- **State**: Default

### 3. Tombol Masuk Google (Area Tengah)
- **Posisi**: 16px kiri & kanan, 96px dari top safe area (sekitar 40% layar)
- **Ukuran**: Lebar penuh (311px), tinggi 52px
- **Border Radius**: 12px (`rounded-xl`)
- **Warna Latar**: Putih (`warna-netral-bg`)
- **Border**: 1px solid `warna-border`
- **Isi Teks**: "Masuk dengan Google" (Ikon Google G-warna di kiri teks)
- **Interaksi**:
  - Tap → Menjalankan Firebase Google OAuth Popup
  - Saat di-hover: latar sedikit gelap (`warna-kas-masuk` alpha 10%)
- **State**:
  - **Default**: Tombol putih dengan border
  - **Loading**: Spinner berputar di kanan teks, tombol non-aktif
  - **Sukses/Redirect**: Otomatis menghilang setelah redirect ke `/onboarding` atau `/dashboard`

### 4. Teks Kebijakan & Privasi (Area Bawah)
- **Posisi**: 16px kiri & kanan, 20px dari bottom safe area
- **Ukuran Font**: 12px — Weight **Regular 400**
- **Warna**: `warna-teks-sekunder`
- **Isi Teks**: "Dengan masuk, Anda menyetujui Ketentuan Layanan dan Kebijakan Privasi SiKasir AI."
- **Interaksi**: Tidak ada (hanya informasional)

### 5. Indikator Status (Area Bawah Kanan, opsional)
- **Posisi**: 16px dari kanan, 20px dari bottom safe area (samping teks kebijakan)
- **Ukuran**: 24px × 24px
- **Isi**: Badge kecil hitam "2.0" atau versi app
- **Interaksi**: Tidak ada

---

## Navigasi Keluar
- **Login Google sukses**:
  - Jika **user baru** → Arahkan otomatis ke `/onboarding` (data profil usaha).
  - Jika **user lama** → Arahkan otomatis ke `/dashboard`.
- **Login Google dibatalkan/user tutup popup**:
  - Kembali ke layar login tanpa state berubah.
- **Error OAuth (tidak ada koneksi/jaringan)**:
  - Tampilkan toast error: "Gagal masuk. Coba lagi nanti."
  - Tombol "Coba Lagi" muncul di bawah tombol Google.

---

## Catatan Teknis
- Layout dirancang responsif: di layar sangat kecil (320px), subtitle akan beralih ke bawah judul.
- Semua elemen interaktif (tombol Google) memiliki `min-height 48px` untuk tap target.
- Warna latar belakang overlay saat Google OAuth popup tampil: transparan hitam alpha 0.3.