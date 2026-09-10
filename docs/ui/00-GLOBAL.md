# 00 — Sistem Global & Design Tokens (FusionAI Dark Glassmorphism Edition)

Spesifikasi tema visual SiKasir AI yang diadopsi dari arsitektur desain **FusionAI / Fluence** (`fusionai.framer.website`).  
Berlaku di **semua halaman** tanpa pengecualian.

---

## 🌌 1. Arah Visual & Filosofi Desain

- **Gaya Desain**: *Dark Mode Cyber-Glassmorphism* dengan *Bento Grid Layout*.
- **Kesan Produk**: Super canggih, presisi tinggi layaknya dashboard AI generasi baru, namun tetap ramah dan kontras tinggi untuk pedagang UMKM.
- **Kombinasi Warna Utama**:
  - **Dark Base Canvas**: `#000000` dan `#090A0F` (hitam pekat OLED, hemat baterai HP, bebas silau).
  - **Glass Surface**: Permukaan kartu semi-transparan `rgba(255, 255, 255, 0.03)` dengan border tipis `rgba(255, 255, 255, 0.08)` dan `backdrop-blur-md`.
  - **Hero Solar Glow**: Aksen gradien api cerdas (Solar Orange `#FF8918` ke Flame `#DA4E24`) untuk fitur AI, tombol rekam, dan streak kepatuhan.
  - **Emerald Prosperity**: Hijau zamrud neon (`#10B981` / `#059669`) untuk uang masuk dan transaksi sukses.
  - **Neon Crimson**: Merah menyala halus (`#F43F5E`) untuk uang keluar dan pengeluaran.
  - **Cyber Cyan**: Biru cerah (`#0098F3`) untuk panduan, tips, dan asisten AI.

---

## 📐 2. Viewport & Tata Letak (Layout Shell)

### Target Device
- **Device Utama**: Smartphone Android & iOS (Mobile-First PWA).
- **Lebar Viewport**: 375px – 430px (lebar layar HP standar hingga flagship).
- **Desktop/Tablet Simulator**: Kontainer utama otomatis berada di tengah layar (`max-w-md mx-auto`) berlatar hitam pekat di luarnya, dibatasi border vertikal abu-abu sangat tipis.
- **Safe Area OS**:
  - Top Safe Area: 44px (jam, sinyal, kamera punch-hole).
  - Bottom Safe Area: 34px (gesture bar iOS / tombol navigasi Android).

---

## 🔤 3. Tipografi & Skala Font

### Font Family
- **Teks Umum / UI**: `Inter`, `-apple-system`, `system-ui`, `sans-serif`
- **Angka Uang & Metrik**: `Fragment Mono` atau `JetBrains Mono` (Monospace modern agar angka sejajar rapi saat menghitung kas).

### Skala Ukuran Font

| Level | Ukuran | Weight | Font Family | Digunakan Pada |
|---|---|---|---|---|
| **Hero Metric** | 32px – 36px | Bold (700) | Monospace | Saldo Kas Utama, Nominal Uang di Form |
| **Judul Halaman** | 20px | SemiBold (600) | Sans-serif | Header Top Bar tiap halaman |
| **Card Header** | 16px | SemiBold (600) | Sans-serif | Judul Bento Card, Section Title |
| **Body / Input** | 14px – 16px | Regular / Medium | Sans-serif | Form Input, Deskripsi, Nama Menu |
| **Microcopy / Tag** | 11px – 12px | Medium (500) | Sans-serif / Mono | Timestamp, Badge Sumber, Kategori Chip |

> **Aturan Aksesibilitas**: Ukuran font input form minimal 16px agar browser iOS tidak melakukan auto-zoom otomatis saat pengguna mengetik.

---

## 🎴 4. Sistem Bento Card & Glassmorphism

Setiap modul di dalam aplikasi menggunakan konsep kartu Bento modular:
- **Latar Kartu**: `rgba(255, 255, 255, 0.03)` (hitam transparan berkabut).
- **Garis Tepi (Border)**: `1px solid rgba(255, 255, 255, 0.08)`.
- **Sudut Lengkung (Border Radius)**:
  - Kartu Bento Besar: `20px` (`rounded-2xl`).
  - Tombol & Field Input: `14px` (`rounded-xl`).
  - Chips & Pill Tag: `9999px` (`rounded-full`).
- **Efek Hover / Tap**: Border kartu bersinar lembut (`rgba(255, 255, 255, 0.2)`), scale naik 1.01x dengan transisi 150ms.

---

## 🕹️ 5. Navigasi Bawah (Bottom Navigation Bar)

- **Posisi**: Menempel tetap di dasar layar (`fixed bottom-0 left-0 right-0`).
- **Tinggi**: 64px + Safe Area Bawah.
- **Latar**: Hitam pekat dengan efek blur kaca (`backdrop-blur-xl bg-black/80 border-t border-white/10`).
- **5 Menu Navigasi**:
  1. **Beranda (`/dashboard`)**: Ikon Grid Home.
  2. **Riwayat (`/riwayat`)**: Ikon Jam Catatan.
  3. **Tombol Catat Cepat (+ FAB Tengah)**:
     - Bentuk: Lingkaran menonjol 56px × 56px naik 18px dari nav bar.
     - Latar: Gradien Solar Fusion (`linear-gradient(135deg, #FF8918, #DA4E24)`).
     - Ikon: Tanda Plus putih tebal dengan efek glow oranye.
     - Interaksi: Tap → Membuka Bottom Sheet 3 Mode Catat.
  4. **Laporan (`/laporan`)**: Ikon Grafik Batang Neon.
  5. **Menu Ekraf (`/ekraf`)**: Ikon Kompas / 4 Kotak Kreatif.

---

## 📑 6. Bottom Sheet (Lembar Bawah Modal)

- **Latar Belakang Layar (Backdrop)**: Redup pekat `rgba(0, 0, 0, 0.75)` dengan blur `backdrop-blur-sm`.
- **Bodi Sheet**:
  - Warna: `#0D0E15` (hitam navy pekat) dengan border atas `rgba(255, 255, 255, 0.1)`.
  - Radius atas: `24px` kiri atas & kanan atas.
  - Handle geser: Garis horizontal abu-abu kecil di tengah atas (lebar 40px, tinggi 4px).
- **Animasi**: Meluncur naik dari dasar layar dalam waktu 250ms dengan kurva percepatan mulus (`cubic-bezier(0.16, 1, 0.3, 1)`).

---

## ⚡ 7. Sistem Status & Umpan Balik (Feedback Patterns)

1. **Toast Notification**:
   - Posisi: Melayang di tengah atas layar (top-center, 16px di bawah status bar).
   - Tampilan: Kapsul hitam kaca kecil dengan border menyala sesuai jenis status.
   - Durasi: Tampil selama 2.5 detik lalu memudar menghilang.
2. **Offline Warning Banner**:
   - Muncul otomatis tepat di bawah top bar ketika koneksi internet terputus.
   - Latar: Kuning ambar redup dengan ikon sinyal terputus.
   - Teks: "Mode Offline Aktif — Transaksi tersimpan aman di HP, akan disinkron saat ada sinyal."
3. **Loading Shimmer Skeleton**:
   - Bukan sekadar lingkaran berputar, melainkan placeholder berbentuk kartu asli dengan kilatan cahaya abu-abu ke perak yang bergerak menyamping (`shimmer wave animation`).
4. **Tombol Utama (Action Buttons)**:
   - Tinggi standar: **52px** (sangat nyaman untuk jempol pedagang di kasir).
   - Efek sentuh: Menyusut lembut (scale 0.98x) saat ditekan dan memberikan haptic tap.
