# 🛍️ SiKasir AI

[![Next.js](https://img.shields.io/badge/Next.js-14.2.15-black?logo=next.js)](https://nextjs.org/) [![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-blue?logo=typescript)](https://typescript.org/) [![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.14-38B2AC?logo=tailwind-css)](https://tailwindcss.com/) [![Firebase](https://img.shields.io/badge/Firebase-12+-FFCA28?logo=firebase)](https://firebase.google.com/) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

SiKasir AI adalah asisten kasir pintar dan alat manajemen operasi bisnis berbasis Progressive Web App (PWA) untuk UMKM dan pelaku Ekonomi Kreatif (Ekraf) Indonesia.

Aplikasi ini memudahkan pencatatan keuangan UMKM melalui berbagai jalur yang intuitif:

- 📝 **Input Manual** (Formulir praktis konvensional)
- 🎙️ **Pencatatan Suara Pintar** (Pencatatan NLP lokal langsung dari perintah suara pengguna)
- 📸 **Pindai Nota Pintar** (AI otomatis membaca barang, jumlah, dan harga dari foto bon/nota belanja)

Selain pencatatan dasar, SiKasir AI dilengkapi dengan fitur canggih khusus bisnis:

- 🎨 **Studio Foto AI**: Menambahkan filter otomatis pada produk dan menghasilkan caption untuk media sosial (Instagram, WhatsApp, TikTok)
- ⚖️ **Pra-Valuasi HKI**: Mengestimasi nilai kekayaan intelektual (merek, resep, desain) secara instan
- 💬 **Asisten Chatbot AI**: Teman diskusi regulasi UMKM, PIRT, sertifikasi Halal, hingga tips arus kas

---

## 🚀 Quickstart (Pengembangan Lokal)

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

*(Isi `.env.local` dengan Firebase SDK web client Anda. Variabel ini (berawalan `NEXT_PUBLIC_`) aman diekspos.*)

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

Anda dapat memasukkan beberapa API keys yang dipisahkan oleh koma untuk load-balancing dan menghindari limit. **Penting: Jangan pernah mengekspos API Key Rahasia Anda ke frontend (jangan pakai awalan NEXT_PUBLIC)!**

### 4. Menjalankan Development Server

Di root direktori, jalankan:

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`.

---

## 📦 Stack Utama

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
| **Deployment** | Firebase Hosting & Functions |

---

## 🛠️ Scripts Tersedia

| Script | Deskripsi |
|---|---|
| `dev` | Jalankan Next.js dev server (--turbo) |
| `build` | Build production (`next build`) |
| `start` | Jalankan production build (`next start`) |
| `lint` | Lint code (`next lint`) |
| `test` | Run unit tests (`jest --passWithNoTests`) |
| `test:unit` | Run unit tests dengan konfigurasi khusus |
| `check:env` | Validasi environment variables |
| `functions:dev` | Jalankan Firebase emulators (functions, firestore, auth, storage) |
| `functions:build` | Build Firebase Functions |
| `functions:deploy` | Deploy Firebase Functions |
| `functions:emulator` | Start Firebase emulators untuk development |

---

## 🏗️ Arsitektur Sistem

Lihat `ARCHITECTURE.md` untuk dokumentasi lengkap arsitektur lapisan: Presentation, Business, Data, AI, Keamanan, serta flow data end-to-end.

---

## 👁️ Kontribusi

Lihat `CODE_OF_CONDUCT.md` dan `CONTRIBUTING.md` untuk aturan berkolaborasi.

---

## 📄 Lisensi

**MIT License** — Copyright (c) 2026 Avicennapratama. Lihat `LICENSE` untuk detail.