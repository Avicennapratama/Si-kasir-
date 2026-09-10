# SiKasir AI - Canvas UI/UX Blueprint & Page-by-Page Specifications

Panduan visual dan fungsional komprehensif untuk mendesain antarmuka **SiKasir AI** pada canvas design tool (Google Canvas, Figma, dll).  
Setiap halaman dijabarkan secara rinci dari posisi atas ke bawah, komponen di dalamnya, interaksi tombol, dan ke mana alur berpindah.

---

## 🧭 Panduan Struktur Global & Layout Shell

### 1. Viewport & Dimensi Standar
- **Target Device**: Mobile-First Smartphone (Lebar 375px - 430px, Tinggi 812px - 932px).
- **Desktop/Tablet Mode**: Kontainer utama diposisikan di tengah (`max-w-md mx-auto`) dengan latar luar netral, mensimulasikan layar ponsel fisik.
- **Top Safe Area**: 44px (Area Status Bar baterai & jam OS).
- **Bottom Safe Area**: 34px (Area Home Indicator iOS/Android).

### 2. Bilah Navigasi Bawah (Bottom Navigation Bar)
Tampil tetap di semua layar utama pengguna (`/dashboard`, `/riwayat`, `/laporan`, `/pengaturan`).
- **Tinggi**: 64px + Bottom Safe Area.
- **Urutan Elemen (Kiri ke Kanan)**:
  1. **Tab 1: Beranda** (Ikon: Rumah / Dashboard) -> Menuju `/dashboard`
  2. **Tab 2: Riwayat** (Ikon: Nota / Jam Catatan) -> Menuju `/riwayat`
  3. **Tab Tengah: Tombol Catat Cepat (+)** (Tombol bulat besar menonjol ke atas 16px) -> Membuka **Bottom Sheet Menu Catat**
  4. **Tab 4: Laporan** (Ikon: Grafik Batang / Chart) -> Menuju `/laporan`
  5. **Tab 5: Ekraf & Menu** (Ikon: Grid 4 Kotak) -> Membuka Drawer/Menu Layanan Kreatif (`/studio`, `/hki`, `/asisten`, `/pengaturan`)

### 3. Modal Lembar Bawah: Menu Catat Cepat (Trigger dari Tombol +)
- **Animasi**: Meluncur naik dari bawah layar (Slide up) menutupi 45% layar, latar belakang redup (dimmed overlay).
- **Judul Sheet**: "Pilih Cara Mencatat Transaksi"
- **Isi 3 Kartu Pilihan**:
  1. **Kartu 1: Catat Manual**
     - Ikon: Papan Ketik (Keyboard)
     - Judul: "Ketik Manual"
     - Subjudul: "Input nominal & kategori langsung"
     - Aksi: Pindah ke `/catat/manual`
  2. **Kartu 2: Catat Suara**
     - Ikon: Mikrofon (Mic)
     - Judul: "Bicara / Suara"
     - Subjudul: "Sebutkan penjualan atau belanjaanmu"
     - Aksi: Pindah ke `/catat/suara`
  3. **Kartu 3: Pindai Nota**
     - Ikon: Kamera / Scan Struk
     - Judul: "Foto Nota / Struk"
     - Subjudul: "Ekstrak otomatis dari kertas belanja"
     - Aksi: Pindah ke `/catat/nota`
- **Tombol Bawah**: "Tutup / Batal"

---

## 📱 Blueprint Spesifikasi Per Halaman

---

### Halaman 1: Login & Masuk (`/login`)

#### 1. Header (Area Atas)
- Logo aplikasi **SiKasir AI** (Ikon kasir modern dengan aksen kilatan AI).
- Teks Judul Besar: "SiKasir AI"
- Teks Subjudul: "Asisten Kasir Pintar UMKM & Pelaku Kreatif Indonesia"

#### 2. Body (Area Tengah)
- **Ilustrasi Visual**: Pedagang warung tersenyum melayani pembeli sambil memegang smartphone yang menampilkan grafik uang masuk.
- **Poin Keunggulan Ringkas (3 Baris Ikon Check)**:
  - "✓ Catat cepat lewat ketik, suara, atau foto nota"
  - "✓ 100% Gratis, tanpa batas transaksi harian"
  - "✓ Data aman, tersimpan privat di cloud & bisa offline"

#### 3. Footer (Area Bawah)
- **Tombol Masuk Google**:
  - Tampilan: Tombol lebar penuh, tinggi 52px, berlogo resmi Google G-Color.
  - Teks: "Masuk dengan Google"
  - Interaksi: Menjalankan Firebase Google OAuth Popup.
  - Hasil Berhasil:
    - Jika user baru -> Arahkan ke `/onboarding`
    - Jika user lama -> Arahkan ke `/dashboard`
- **Teks Kebijakan & Privasi**:
  - "Dengan masuk, Anda menyetujui Ketentuan Layanan dan Kebijakan Privasi SiKasir AI."

---

### Halaman 2: Onboarding Data Usaha (`/onboarding`)

*Muncul sekali untuk pengguna baru yang belum mendaftarkan profil usaha.*

#### 1. Header
- Indikator Langkah: "Langkah 1 dari 1: Kenalkan Usahamu"
- Judul Layar: "Profil Usaha Anda"
- Deskripsi: "Data ini digunakan untuk menyesuaikan kategori pencatatan dan laporan tokomu."

#### 2. Form Input (Body)
1. **Nama Usaha / Toko**:
   - Tipe: Input Teks
   - Placeholder: "Contoh: Warung Berkah Bu Siti / Kopi Senja"
   - Validasi: Wajib diisi (minimal 3 karakter).
2. **Kategori Bidang Usaha**:
   - Tipe: Dropdown Pilihan / Tombol Chip
   - Opsi:
     - Kuliner & Minuman (F&B)
     - Toko Kelontong / Retail
     - Fashion & Pakaian
     - Jasa & Reparasi
     - Kerajinan Tangan / Kriya
     - Lainnya
3. **Kota / Wilayah Operasional**:
   - Tipe: Input Teks
   - Placeholder: "Contoh: Bandung, Jawa Barat"

#### 3. Footer
- **Tombol Aksi Utama**:
  - Tombol penuh: "Mulai Catat Transaksi 🚀"
  - Interaksi: Menyimpan data ke Firestore `businesses`, lalu redirect ke `/dashboard`.

---

### Halaman 3: Dashboard / Pusat Kasir (`/dashboard`)

#### 1. Header (Area Atas)
- **Bar Atas**:
  - Kiri: Nama Usaha pengguna (tebal) + Status badge "Online" (hijau).
  - Kanan: Avatar Foto Profil Akun Google (bisa diklik untuk ke `/pengaturan/profil`).
- **Kartu Gamifikasi Kepatuhan (Streak Banner)**:
  - Ikon Api (🔥).
  - Teks: "3 Hari Berturut-turut! Catat transaksi hari ini agar streak tidak putus."

#### 2. Kartu Ringkasan Saldo Kas Hari Ini
- **Komponen Utama**:
  - Label: "Sisa Saldo Hari Ini"
  - Angka Utama: Font super besar (contoh: `Rp 450.000`)
- **Pembagian 2 Kolom di Bawah Angka**:
  - Kolom Kiri: Ikon Panah Masuk (Hijau) | Label "Uang Masuk" | Nilai `+Rp 600.000`
  - Kolom Kanan: Ikon Panah Keluar (Merah) | Label "Uang Keluar" | Nilai `-Rp 150.000`

#### 3. Bar Tombol Aksi Cepat (Quick Action Bar)
Tiga tombol berdampingan dengan ukuran tap besar:
1. **Tombol 1**: Ikon Keyboard | Teks "Manual" -> Langsung ke `/catat/manual`
2. **Tombol 2**: Ikon Mic | Teks "Suara AI" -> Langsung ke `/catat/suara`
3. **Tombol 3**: Ikon Kamera | Teks "Pindai Nota" -> Langsung ke `/catat/nota`

#### 4. Bagian Transaksi Terakhir Hari Ini
- Bar Judul: "Transaksi Hari Ini" + Tautan teks "Lihat Semua" (menuju `/riwayat`).
- **Daftar Kartu Transaksi (Max 4 item)**:
  - Setiap baris item:
    - Kiri: Ikon Kategori (contoh: Makanan, Belanja Bahan).
    - Tengah: Nama/Catatan Transaksi ("Jual Nasi Goreng 2x") + Badge Sumber kecil (`Manual` / `Suara` / `Nota`) + Jam (`14:20`).
    - Kanan: Nominal uang (`+Rp 30.000` warna hijau atau `-Rp 15.000` warna merah).
- **Kondisi Kosong (Empty State)**:
  - Tampil jika belum ada transaksi: Ikon buku catatan terbuka, teks "Belum ada transaksi hari ini. Ketuk salah satu tombol di atas untuk mulai mencatat!"

#### 5. Bottom Navigation Bar
- Tetap aktif di posisi paling bawah.

---

### Halaman 4: Catat Transaksi Manual (`/catat/manual`)

#### 1. Header
- Tombol Kembali: Ikon Panah Kiri (←) -> Kembali ke halaman sebelumnya.
- Judul Layar: "Catat Manual"

#### 2. Form Input (Body)
1. **Pemilih Jenis Transaksi (Switch Tab Besar)**:
   - Dua tombol bersebelahan:
     - `[ + Uang Masuk (Penjualan) ]` (Aktif: aksen warna hijau kas)
     - `[ - Uang Keluar (Belanja/Biaya) ]` (Aktif: aksen warna merah kas)
2. **Kotak Input Nominal Uang (Paling Menonjol)**:
   - Teks prefix permanen: "Rp"
   - Input angka ekstra besar di tengah layar (contoh: `25.000`).
   - Otomatis memformat titik ribuan saat angka diketik.
3. **Tombol Cepat Tambah Nominal (Quick Add Chips)**:
   - Baris tombol pintas horizontal: `[+10.000]`, `[+20.000]`, `[+50.000]`, `[+100.000]`.
   - Mengetuk tombol otomatis menambahkan nominal tersebut ke input angka.
4. **Pilihan Kategori (Scroll Horizontal Chips)**:
   - Menyesuaikan dengan jenis transaksi terpilih:
     - *Jika Uang Masuk*: Penjualan Produk, Pendapatan Jasa, Modal Sendiri, Piutang Masuk, Lainnya.
     - *Jika Uang Keluar*: Bahan Baku/Stok, Sewa Toko, Listrik & Air, Gaji Karyawan, Transportasi, Operasional, Lainnya.
5. **Catatan / Rincian Transaksi**:
   - Field teks input: "Catatan transaksi (opsional, misal: Mie Ayam 2 mangkok)"
6. **Tanggal & Waktu Transaksi**:
   - Default: Tanggal dan jam saat ini.
   - Pilihan ubah kalender jika mencatat transaksi kemarin.

#### 3. Footer (Sticky di Bawah)
- **Tombol Simpan Penuh Lebar**:
  - Teks: "Simpan Transaksi" (Tinggi 52px).
  - Aksi: Validasi nominal > 0 -> Simpan ke database -> Tampilkan toast sukses -> Arahkan ke `/riwayat`.

---

### Halaman 5: Catat Lewat Suara (`/catat/suara`)

#### 1. Header
- Tombol Kembali: Ikon Panah Kiri (←) -> Kembali ke `/dashboard`.
- Judul Layar: "Catat Suara Pintar"

#### 2. Area Visual Perekam (Body)
1. **Kartu Panduan Contoh Bicara**:
   - Kotak tips: "💡 Contoh ucapan:"
   - *"Laku es kopi susu 3 gelas empat puluh lima ribu rupiah"*
   - *"Beli telur sekilo dua puluh delapan ribu di pasar"*
2. **Visualisator Audio Berdenyut**:
   - Lingkaran animasi mikrofon besar di tengah layar.
   - Status 1: **Siap Merekam (Idle)** -> Lingkaran diam, teks "Ketuk tombol untuk mulai bicara".
   - Status 2: **Sedang Merekam (Recording)** -> Gelombang suara berdenyut aktif, teks penghitung waktu "00:07 / 01:00", tombol bulat berubah jadi tombol Kotak Merah "Berhenti".
   - Status 3: **Sedang Dianalisis AI (Processing)** -> Animasi putaran loading, teks: "AI sedang mendengarkan & menyusun transaksi..."

#### 3. Tombol Cadangan & Alternatif (Bawah)
- Tautan selalu terlihat: "Suara bising atau koneksi lambat? **Beralih ke Catat Manual**" -> Mengarah ke `/catat/manual`.
- **Hasil Selesai**:
  - Setelah audio selesai dikirim ke Cloud Functions, sistem otomatis berpindah ke layar **Review Draft** (`/catat/review/[draftId]`).

---

### Halaman 6: Pindai Nota / Struk (`/catat/nota`)

#### 1. Header
- Tombol Kembali: Ikon Panah Kiri (←) -> Kembali ke `/dashboard`.
- Judul Layar: "Pindai Nota Belanja"

#### 2. Area Kamera & Upload (Body)
1. **Kotak Bidik Panduan (Viewfinder Area)**:
   - Kotak persegi panjang bergaris putus-putus menyerupai bentuk nota fisik.
   - Tips panduan: "Posisikan nota rata, pencahayaan cukup, dan angka total terlihat jelas."
2. **Dua Tombol Pengambilan File**:
   - **Tombol 1 (Primer)**: Ikon Kamera | "Ambil Foto Nota Langsung" (Membuka kamera HP).
   - **Tombol 2 (Sekunder)**: Ikon Galeri | "Pilih dari Galeri HP" (Membuka file picker image).
3. **Pratinjau Foto & Status Analisis**:
   - Jika foto terpilih: Tampilkan pratinjau nota dengan garis laser scanner berjalan naik-turun.
   - Teks proses: "Membaca teks nota & menghitung total rincian belanja..."

#### 3. Aksi Alternatif (Bawah)
- Tautan: "Nota sobek atau tidak terbaca? **Ketik Manual Saja**" -> Mengarah ke `/catat/manual`.
- **Hasil Selesai**:
  - Gambar dikirim ke backend OCR Gemini -> Hasil diarahkan ke layar **Review Draft** (`/catat/review/[draftId]`).

---

### Halaman 7: Review & Edit Draft Hasil AI (`/catat/review/[draftId]`)

*Prinsip Mutlak: Layar gerbang verifikasi. Pengguna wajib menyetujui hasil ekstraksi AI sebelum tersimpan sebagai transaksi resmi.*

#### 1. Header
- Label Status: "Periksa Hasil AI"
- Badge Asal: "Sumber: 🎙️ Suara" atau "Sumber: 📷 Nota Belanja"

#### 2. Kartu Indikator Tingkat Keyakinan (Confidence Banner)
- **Jika Akurasi Tinggi**:
  - Banner hijau: "✓ Data berhasil dibaca dengan jelas. Silakan periksa sebelum menyimpan."
- **Jika Akurasi Rendah / Ambigu**:
  - Banner kuning perhatian: "⚠️ Beberapa angka atau nama barang kurang jelas. Mohon periksa kembali kolom yang bertanda kuning."

#### 3. Formulir Edit Langsung di Tempat (Editable Form)
Semua field hasil tangkapan AI ditampilkan dalam input yang **langsung bisa diedit** oleh user tanpa pindah halaman:
1. **Jenis Transaksi**: Switch toggle `[ Uang Masuk ]` atau `[ Uang Keluar ]`.
2. **Total Nominal**: Input angka (terisi otomatis hasil deteksi, misal `Rp 45.000`, user bisa koreksi jika salah baca).
3. **Kategori**: Chip kategori terpilih (user bisa tap kategori lain jika salah klasifikasi).
4. **Catatan / Nama Barang**: Field teks rincian belanja/penjualan.
5. **Tanggal & Jam**: Terisi otomatis waktu saat ini / waktu nota.
6. **Tombol Lihat Bukti Asli**:
   - Untuk nota: Tombol "Lihat Foto Nota Asli" (membuka popup foto struk untuk mencocokkan angka).
   - Untuk suara: Menampilkan teks ucapan mentah: *"Tadi terdengar: 'Jual soto ayam dua porsi tiga puluh ribu'"*.

#### 4. Dua Tombol Aksi Bawah (Sticky Footer)
- Tombol Kiri (Sekunder): "Batal / Hapus Draft" -> Konfirmasi dialog -> Kembali ke `/dashboard` tanpa menyimpan apa pun.
- Tombol Kanan (Primer Lebar): "✅ Data Benar, Simpan Transaksi" -> Transaksi berstatus final tersimpan di database -> Pindah ke `/riwayat`.

---

### Halaman 8: Riwayat & Log Transaksi (`/riwayat`)

#### 1. Header
- Judul Layar: "Riwayat Transaksi"
- Kotak Pencarian: Input teks dengan ikon kaca pembesar "Cari transaksi, barang, catatan..."

#### 2. Bar Filter & Periode (Body Atas)
- **Baris Filter Tipe**: Tiga tombol tab `[ Semua ]` | `[ Masuk ]` | `[ Keluar ]`.
- **Baris Filter Tanggal**: Dropdown / Chip horizontal:
  - `[ Hari Ini ]` | `[ 7 Hari Terakhir ]` | `[ Bulan Ini ]` | `[ Pilih Rentang Tanggal ]`

#### 3. Daftar Kartu Transaksi
Dikelompokkan per tanggal (misal: "Hari ini - 9 September 2026", "Kemarin - 8 September 2026").
- **Tiap Baris Transaksi Berisi**:
  - Kiri: Ikon Kategori bulat.
  - Tengah: Nama transaksi / catatan + Badge kecil asal input (`Manual`, `Suara`, `Nota`).
  - Kanan: Nominal uang (`+Rp 50.000` hijau atau `-Rp 25.000` merah) + Jam transaksi (`10:45`).
- **Interaksi Tap Baris**:
  - Mengetuk salah satu baris memunculkan **Bottom Sheet Rincian Transaksi**.

#### 4. Lembar Rincian Transaksi (Bottom Sheet Detail)
- Menampilkan rincian penuh: Tanggal, jam, kategori, jenis, catatan, bukti gambar nota (jika ada).
- Dua tombol aksi di dasar sheet:
  - Tombol 1: "Ubah / Edit Transaksi" -> Membuka form edit nilai.
  - Tombol 2: "Hapus Transaksi" -> Dialog konfirmasi ("Yakin ingin menghapus transaksi ini?") -> Hapus dari database.

#### 5. Bottom Navigation Bar
- Tetap aktif di bagian bawah.

---

### Halaman 9: Laporan & Rekap Keuangan (`/laporan`)

#### 1. Header
- Judul Layar: "Laporan Keuangan"
- Pemilih Periode: Tab seleksi `[ Mingguan ]` | `[ Bulanan ]` | `[ Tahunan ]`.

#### 2. Kartu Untung / Rugi Bersih
- Teks Besar Saldo Untung/Rugi periode terpilih (contoh: `Laba Bersih: +Rp 3.450.000`).
- Dua kolom pembanding di bawah:
  - Total Pemasukan: `Rp 8.200.000`
  - Total Pengeluaran: `Rp 4.750.000`

#### 3. Grafik Tren Arus Kas
- Visualisasi grafik batang / garis sederhana:
  - Batang hijau (Uang Masuk) vs Batang merah (Uang Keluar) per hari atau per minggu.
  - Sumbu horizontal: Hari (Senin - Minggu) atau Tanggal.

#### 4. Daftar Kategori Pengeluaran Terbesar
- Menampilkan 4 kategori pengeluaran teratas beserta persentase porsinya (contoh: 1. Bahan Baku 65%, 2. Operasional Listrik 20%, 3. Gaji 15%).
- Dilengkapi indikator progress bar horizontal.

#### 5. Tombol Ekspor Dokumen Resmi (Bawah)
Dua tombol berdampingan:
1. **Tombol Unduh PDF**: Menghasilkan dokumen laporan rapi berformat PDF siap cetak untuk pengajuan pinjaman/laporan mitra.
2. **Tombol Ekspor Excel / CSV**: Mengunduh seluruh baris transaksi dalam format spreadsheet.

#### 6. Bottom Navigation Bar
- Tetap aktif di bagian bawah.

---

### Halaman 10: Menu Layanan Ekraf & Fitur Kreatif

*Dapat diakses dari Tab Menu pada Bottom Nav.*

#### 1. Header
- Judul: "Layanan Pelaku Usaha & Ekraf"
- Deskripsi: "Alat bantu AI untuk memajukan pemasaran, legalitas, dan perlindungan karyamu."

#### 2. Grid Kartu Layanan (Body)
Empat kartu menu interaktif:
1. **Kartu 1: Studio Foto Produk AI (`/studio`)**
   - Ikon: Tongkat Ajaib & Kamera.
   - Judul: "Foto Produk & Caption"
   - Deskripsi: "Sulap foto meja jadi studio katalog mewah & buat caption jualan sosmed."
2. **Kartu 2: Pra-Valuasi HKI (`/hki`)**
   - Ikon: Sertifikat / Hak Cipta.
   - Judul: "Klinik & Valuasi HKI"
   - Deskripsi: "Estimasi nilai ekonomis merek tokomu & periksa kesiapan daftar HKI."
3. **Kartu 3: Asisten Legalitas & Bisnis (`/asisten`)**
   - Ikon: Bot Obrolan Cerdas.
   - Judul: "Tanya Regulasi & Izin"
   - Deskripsi: "Konsultasi langkah buat NIB gratis, sertifikat Halal, dan tips omzet."
4. **Kartu 4: Pengaturan Aplikasi (`/pengaturan`)**
   - Ikon: Roda Gigi.
   - Judul: "Pengaturan & Akun"
   - Deskripsi: "Profil toko, keamanan data pribadi, dan status penyimpanan offline."

---

### Halaman 11: Studio Foto Produk AI (`/studio`)

#### 1. Header
- Tombol Kembali: Ikon Panah Kiri (←) -> Kembali ke Menu Ekraf.
- Judul Layar: "Studio Foto Produk"

#### 2. Tahap 1: Upload Foto Mentah
- Area upload foto produk (contoh: botol sambal, baju, kue).
- Tombol "Ambil Foto Produk" atau "Pilih dari Galeri".

#### 3. Tahap 2: Pilih Gaya Latar Belakang (Studio Presets)
- Pilihan kartu gaya studio:
  - *Meja Kayu Estetik*
  - *Marmer Mewah Minimalis*
  - *Taman Tropis Outdoor*
  - *Studio Warna Pastel Cerah*

#### 4. Tahap 3: Pilih Gaya Bahasa Caption Sosmed
- Chip pilihan nada bicara:
  - `[ Santai & Ramah ]` | `[ Promo Diskon ]` | `[ Elegan & Mewah ]` | `[ Informatif ]`

#### 5. Layar Hasil (Sesudah AI Generate)
- Tampilan slider Sebelum vs Sesudah (Before/After perbandingan foto).
- Kotak teks caption jualan lengkap dengan hashtag relevan (`#kulinerlokal #umkmbisa`).
- Dua Tombol Aksi:
  - Tombol "Unduh Foto Studio HD" (menyimpan foto ke galeri HP).
  - Tombol "Salin Caption" (tersalin ke clipboard untuk ditempel di WhatsApp/Instagram).

---

### Halaman 12: Pra-Valuasi HKI (`/hki`)

#### 1. Header
- Tombol Kembali: Ikon Panah Kiri (←) -> Kembali ke Menu Ekraf.
- Judul Layar: "Pra-Valuasi Hak Kekayaan Intelektual"

#### 2. Form Penilaian Indikatif (Body)
1. **Nama Merek / Karya**: Input teks (contoh: "Keripik Singkong Nenek").
2. **Lama Usaha Berjalan**: Pilihan (Kurang dari 1 tahun / 1-3 tahun / Lebih dari 3 tahun).
3. **Rata-rata Penjualan Bulanan**: Input angka nominal.
4. **Wilayah Jangkauan Pembeli**: Chip pilihan (Satu Kota / Antar Provinsi / Ekspor).
5. **Keunikan / Rahasia Dagang**: Checklist singkat (Resep rahasia sendiri, logo desain orisinal, metode produksi khas).

#### 3. Hasil Analisis Indikatif AI
- **Kartu Estimasi Valuasi Merek**:
  - Rentang nilai ekonomis indikatif aset tak berwujud (contoh: *Estimasi Nilai Merek: Rp 45.000.000 - Rp 75.000.000*).
- **Skor Kesiapan Daftar HKI**:
  - Lingkaran nilai: "85/100 - Sangat Siap Didaftarkan ke DJKI".
- **Disclaimer Legalitas**:
  - Kotak peringatan: "Laporan ini bersifat edukasi dan indikasi awal, bukan dokumen penaksir resmi penjaminan bank."
- **Tombol Aksi**:
  - "Unduh Laporan Evaluasi HKI (PDF)"

---

### Halaman 13: Asisten Tanya Jawab Legalitas (`/asisten`)

#### 1. Header
- Tombol Kembali: Ikon Panah Kiri (←) -> Kembali ke Menu Ekraf.
- Judul Layar: "Asisten Usaha & Regulasi"
- Avatar: Ikon Asisten Pintar.

#### 2. Chip Topik Pertanyaan Populer (Pintasan Cepat)
Baris tombol tap pertanyaan yang sering diajukan pedagang:
- `[ Cara Bikin NIB Gratis di OSS ]`
- `[ Syarat Sertifikat Halal UMKM ]`
- `[ Tips Mengatur Arus Kas Warung ]`
- `[ Cara Pisahkan Uang Pribadi & Toko ]`

#### 3. Area Obrolan Interaktif (Chat Stream)
- Balon chat pengguna (rata kanan).
- Balon balasan asisten AI (rata kiri) dengan bahasa Indonesia sederhana, ramah, dan bebas istilah hukum rumit.

#### 4. Bar Input Pertanyaan (Bawah)
- Input teks: "Ketik pertanyaan usahamu di sini..."
- Tombol Kirim: Ikon Pesawat Kertas.

---

### Halaman 14: Pengaturan & Privasi Data (`/pengaturan`)

#### 1. Header
- Judul Layar: "Pengaturan"

#### 2. Menu Pilihan (List Vertikal)
1. **Profil Usaha**:
   - Menampilkan nama toko, nomor telepon, dan email terdaftar.
   - Klik untuk mengubah identitas toko.
2. **Status Penyimpanan Offline (Outbox Data)**:
   - Menampilkan status transaksi lokal di HP.
   - Indikator: "Semua data telah tersinkronisasi" atau "Ada 2 transaksi menunggu sinyal internet".
   - Tombol manual: "Sinkronkan Sekarang".
3. **Privasi & Keamanan Data (Prinsip OPSEC/GDPR)**:
   - Pilihan "Unduh Seluruh Data Keuangan Saya (Format JSON/Excel)".
   - Pilihan "Hapus Riwayat Pencatatan AI".
   - Pilihan "Hapus Akun & Semua Data Permanen" (dengan perlindungan dialog ketik konfirmasi).
4. **Tentang Aplikasi**:
   - Versi Aplikasi: v1.0.0 (PWA)
   - Tautan Ketentuan Penggunaan & Kebijakan Privasi.
5. **Tombol Keluar Akun (Logout)**:
   - Tombol merah di dasar daftar: "Keluar dari Akun" -> Menghapus sesi login Firebase -> Arahkan ke `/login`.

---

## 🎨 Ringkasan Kunci untuk Generator Canvas

| Elemen UI | Pedoman Standar |
|---|---|
| **Posisikan Tombol Aksi** | Selalu letakkan tombol simpan/rekam di **area 40% paling bawah layar** (ramah jempol). |
| **Input Nominal Uang** | Wajib paling mencolok, font tebal ekstra besar, titik ribuan otomatis. |
| **Hasil AI** | Tidak boleh langsung masuk riwayat tanpa melewati layar `/catat/review/[draftId]`. |
| **Akurasi Rendah** | Wajib menampilkan banner kuning yang menyuruh user memeriksa field yang diragukan. |
| **Jalur Alternatif** | Di layar suara dan foto nota, tombol "Beralih ke Manual" harus selalu terlihat tanpa perlu di-scroll. |
| **Offline Banner** | Jika internet mati, bar peringatan kuning/oranye muncul di atas memberitahu data aman tersimpan di HP. |
