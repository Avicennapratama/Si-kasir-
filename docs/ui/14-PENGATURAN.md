# 14 — Halaman Pengaturan & Privasi Data (`/pengaturan`)

**Route**: `/pengaturan`

**Tujuan Halaman**: Mengelola profil usaha pengguna, memantau antrian penyimpanan lokal (offline outbox), mengatur ekspor data keuangan, hak privasi (penghapusan akun permanen), serta opsi keluar akun.

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
- **Isi**: Judul Halaman "Pengaturan Aplikasi" (20px Bold `warna-teks-primer`)

### 2. Section 1: Profil Usaha
- **Posisi**: 16px kiri & kanan, 16px dari header
- **Label Section**: "PROFIL USAHA" (12px SemiBold `warna-teks-sekunder`)
- **Kartu Profil (Tinggi 72px, radius 14px)**:
  - Kiri: Avatar toko / inisial nama toko bulat 44px
  - Tengah (Tumpuk):
    - Nama Toko: "Warung Berkah Bu Siti" (16px SemiBold `warna-teks-primer`)
    - Kategori: "Kuliner & Minuman • Bandung" (12px `warna-teks-sekunder`)
  - Kanan: Ikon panah kanan `>` (menunjukkan bisa diklik)
  - Interaksi Tap: Pindah ke `/pengaturan/usaha` (form edit nama & kategori toko)

### 3. Section 2: Penyimpanan & Sinkronisasi Offline
- **Posisi**: 16px kiri & kanan, 24px dari section profil
- **Label Section**: "STATUS PENYIMPANAN OFFLINE" (12px SemiBold)
- **Kartu Status Outbox (Radius 14px, padding 16px)**:
  - **Kondisi A (Semua Tersinkron)**:
    - Ikon centang awan hijau (☁️✓)
    - Teks: "Semua data kas tersinkronisasi ke cloud" (14px Medium)
    - Timestamp: "Terakhir disinkron: 2 menit lalu" (12px abu-abu)
  - **Kondisi B (Ada Antrian Tertunda)**:
    - Ikon awan kuning tanda seru (☁️⚠️)
    - Teks: "3 transaksi tersimpan lokal di HP" (14px SemiBold)
    - Tombol kecil di kanan: "Sinkronkan Sekarang"
    - Interaksi Tap Tombol: Paksa sync outbox ke server saat sinyal tersedia

### 4. Section 3: Privasi & Hak Data (Prinsip OPSEC / GDPR)
- **Posisi**: 16px kiri & kanan, 24px dari section sinkronisasi
- **Label Section**: "KENDALI PRIVASI & DATA" (12px SemiBold)
- **Menu Baris (Tumpuk Vertikal, dipisah border tipis)**:

  #### Item A: Ekspor Seluruh Data
  - Ikon: Unduh / File spreadsheet
  - Judul: "Unduh Seluruh Data Saya"
  - Deskripsi: "Ekspor seluruh transaksi, profil, dan aset ke format JSON & Excel"
  - Aksi Tap: Backend generate zip arsip data → download otomatis ke HP

  #### Item B: Bersihkan Riwayat AI
  - Ikon: Sapu / Hapus
  - Judul: "Hapus Riwayat Pencatatan AI"
  - Deskripsi: "Hapus log suara & foto nota sementara tanpa menghapus transaksi resmi"
  - Aksi Tap: Dialog konfirmasi → Bersihkan bucket media storage sementara

  #### Item C: Hapus Akun Permanen (Right to be Forgotten)
  - Ikon: Tempat sampah merah
  - Judul: "Hapus Akun & Semua Data Permanen" (Teks merah)
  - Deskripsi: "Tindakan ini tidak dapat dibatalkan. Seluruh data kas Anda akan dihapus total dari server."
  - Aksi Tap: Membuka **Modal Konfirmasi Berbahaya**:
    - Dialog meminta user mengetik kata "HAPUS" untuk konfirmasi
    - Tombol merah: "Ya, Hapus Akun Selamanya" → Hapus seluruh dokumen Firestore milik user → Hapus akun Firebase Auth → Redirect ke `/login`

### 5. Section 4: Tentang Aplikasi
- **Posisi**: 16px kiri & kanan, 24px dari section privasi
- **Label Section**: "TENTANG" (12px SemiBold)
- **Informasi Teks**:
  - Versi Aplikasi: "SiKasir AI v1.0.0 (Progressive Web App)"
  - Tautan Teks: "Syarat & Ketentuan Layanan" → buka `/legal/syarat`
  - Tautan Teks: "Kebijakan Privasi" → buka `/legal/privasi`

### 6. Tombol Keluar Akun (Logout)
- **Posisi**: 16px kiri & kanan, 24px dari section tentang
- **Ukuran**: Lebar penuh, tinggi 48px, radius 12px
- **Latar**: Transparan, border merah tipis
- **Warna Teks**: Merah `warna-bahaya` (16px SemiBold)
- **Ikon**: Keluar / Log Out
- **Teks**: "Keluar dari Akun"
- **Interaksi Tap**:
  - Muncul dialog konfirmasi: "Keluar dari SiKasir AI?"
  - Tombol Batal vs Tombol Ya Keluar
  - Jika Ya: Panggil `signOut(auth)` Firebase → Hapus token sesi → Navigasi ke `/login`

### 7. Bottom Navigation Bar (Fixed Bawah)
- Tab aktif: **Menu** (ikon & label menyala)
- FAB (+) tetap di tengah

---

## Navigasi Keluar
- Tap Profil Usaha → `/pengaturan/usaha`
- Tap Ekspor Data → Download file zip/excel (tetap di halaman)
- Tap Logout → Pindah ke `/login`
- Hapus Akun Permanen → Pindah ke `/login`
- Tap Tab Nav Bawah → Pindah ke Beranda / Riwayat / Laporan
