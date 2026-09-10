# 🛍️ SiKasir AI

SiKasir AI adalah asisten kasir pintar dan alat manajemen operasi bisnis berbasis Progressive Web App (PWA) untuk UMKM dan pelaku Ekonomi Kreatif (Ekraf) Indonesia.

Aplikasi ini memudahkan pencatatan keuangan UMKM melalui berbagai jalur yang intuitif:
- 📝 **Input Manual** (Formulir praktis konvensional)
- 🎙️ **Pencatatan Suara Pintar** (Pencatatan NLP lokal langsung dari perintah suara pengguna)
- 📸 **Pindai Nota Pintar** (AI otomatis membaca barang, jumlah, dan harga dari foto bon/nota belanja)

Selain pencatatan dasar, SiKasir AI dilengkapi dengan fitur canggih khusus bisnis:
- 🎨 **Studio Foto AI**: Menambahkan filter otomatis pada produk dan menghasilkan _caption_ untuk media sosial (Instagram, WhatsApp, TikTok).
- ⚖️ **Pra-Valuasi HKI**: Mengestimasi nilai kekayaan intelektual (merek, resep, desain) secara instan.
- 💬 **Asisten Chatbot AI**: Teman diskusi regulasi UMKM, PIRT, sertifikasi Halal, hingga tips arus kas.

---

## 🚀 Fitur dan Arsitektur Utama

- **Zero Credential Leak & Security First:** Semua pemanggilan _Large Language Model_ (Google Gemini) dilakukan dari _backend_ serverless, mengamankan API key sepenuhnya.
- **Robust API Key Rotation:** SiKasir AI secara otomatis merotasi penggunaan berbagai kunci API Gemini dalam _backend_ (Mendukung hingga 8+ kunci secara bersamaan) untuk menghindari _rate limiting_ saat lalu lintas aplikasi tinggi.
- **Prinsip Human-in-the-Loop:** Hasil OCR atau generasi konten dari AI bersifat sebagai _draft_. Pengguna selalu dapat meninjau (*review*) dan memvalidasi sebelum disimpan permanen ke database.

---

## 🛠️ Stack Utama

| Layer | Teknologi |
|---|---|
| **Frontend** | Next.js (App Router) + TypeScript |
| **UI** | Tailwind CSS + shadcn/ui + Lucide Icons |
| **State & Data** | Zustand |
| **Auth** | Firebase Authentication |
| **Database** | Firebase Firestore |
| **Storage** | Firebase Cloud Storage |
| **Backend** | Firebase Cloud Functions (Node.js + Express) |
| **AI** | Google Gemini (1.5 Flash Vision & Text) |
| **Deployment** | Firebase Hosting & Functions / Vercel |

---

## ⚙️ Quickstart (Pengembangan Lokal)

### 1. Kebutuhan Sistem
- **Node.js** v18+ 
- **npm** atau **yarn**

### 2. Konfigurasi Frontend
```bash
git clone https://github.com/Avicennapratama/Si-kasir-.git
cd Si-kasir-

# Install dependensi frontend
npm install

# Konfigurasi environment frontend
cp .env.example .env.local
```
*(Isi `.env.local` dengan Firebase SDK web client Anda. Variabel ini (berawalan `NEXT_PUBLIC_`) aman diekspos).*

### 3. Konfigurasi Backend (Firebase Functions)
```bash
cd functions

# Install dependensi backend
npm install

# Konfigurasi environment backend
cp .env.example .env
```
Isi file `functions/.env` dengan kredensial rahasia:
```env
GEMINI_API_KEY="KEY_1, KEY_2, KEY_3, KEY_4, KEY_5"
```
Anda dapat memasukkan beberapa API keys yang dipisahkan oleh koma untuk *load-balancing* dan menghindari limit. **Penting: Jangan pernah mengekspos API Key Rahasia Anda ke frontend (jangan pakai awalan NEXT_PUBLIC)!**

### 4. Menjalankan Development Server
Di root direktori, jalankan:
```bash
npm run dev
```
Aplikasi akan berjalan di `http://localhost:3000`.

---

> Dibuat untuk membantu pahlawan ekonomi kreatif lokal berkembang lebih pesat melalui inovasi teknologi AI. Bangga Buatan Indonesia! 🇮🇩