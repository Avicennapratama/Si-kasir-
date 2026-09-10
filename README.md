# 🛍️ SiKasir AI

SiKasir AI adalah Progressive Web App (PWA) asisten kasir pintar untuk UMKM dan pelaku ekonomi kreatif Indonesia.

Aplikasi ini memungkinkan pencatatan keuangan UMKM dengan cara yang paling mudah:
- 📝 **Input manual** (formulir biasa)
- 🎙️ **Perintah suara** (langsung bicara seperti "Ada pemasukan 30 ribu dari nasi goreng")
- 📸 **Foto nota** (AI yang otomatis membaca barang dan harga dari foto bon/nota belanja)

**Prinsip Utama:** AI-assisted, manual-first fallback. Semua hasil ekstraksi AI bersifat *draft* dan harus melewati layar ulasan (*review*) sebelum tersimpan ke database.

---

## 📚 Dokumen Teknis Proyek

Untuk membedah arsitektur dan kapabilitas aplikasi ini, silakan telusuri dokumentasi spesifik kami di folder `docs/`:

- [Product Requirements Document (PRD)](./docs/PRD.md)
- [Technical Specification](./docs/TECH_SPEC.md)
- [Database Design](./docs/DATABASE.md)
- [API Specification](./docs/API.md)
- [AI Prompts](./docs/AI_PROMPTS.md)
- [Security & Privacy](./docs/SECURITY.md)

---

## 🛠️ Stack Utama

| Layer | Teknologi |
|---|---|
| **Frontend** | Next.js + TypeScript |
| **UI** | Tailwind CSS + shadcn/ui |
| **State & Data** | Zustand |
| **Auth** | Firebase Auth (Google SSO) |
| **Database** | Firebase Firestore |
| **Storage** | Firebase Cloud Storage |
| **Backend** | Firebase Cloud Functions (Node.js + Express) |
| **AI** | Google Gemini (Gemini 1.5 Flash Vision & Text) |
| **Deployment** | Firebase Hosting & Functions |

---

## ⚙️ Quickstart (Pengembangan Lokal)

### 1. Kebutuhan Sistem
- **Node.js** v18+ 
- **npm** atau **yarn**

### 2. Kloning & Instalasi Frontend
```bash
git clone https://github.com/Avicennapratama/Si-kasir-.git
cd Si-kasir-

# Install dependensi frontend
npm install

# Salin konfigurasi environment
cp .env.example .env.local
```
*(Isi `.env.local` dengan kredensial Firebase web client public Anda. Variabel ini aman untuk di-push, namun usahakan untuk membatasinya dari Firebase Console).*

### 3. Konfigurasi Backend (Firebase Functions)
```bash
cd functions

# Install dependensi backend
npm install

# Setup environment backend
cp .env.example .env
```
Isi file `.env` di dalam folder `functions` dengan kredensial rahasia (seperti `GEMINI_API_KEY`). **Penting: Jangan pernah mengekspos API Key Rahasia Anda ke frontend atau commit Git!**

### 4. Menjalankan Development Server
Di root direktori, jalankan:
```bash
npm run dev
```
Aplikasi akan berjalan di `http://localhost:3000`.

---

## 🛡️ Prinsip Keamanan & Produk

1. **Manual Selalu Tersedia:** AI tidak boleh menjadi satu-satunya jalur pencatatan. Jika API AI gagal, user fallback ke manual.
2. **Review Sebelum Simpan:** Hasil OCR dari AI harus bisa diedit oleh manusia sebelum resmi dikonfirmasi.
3. **Privasi:** Data keuangan user diisolasi berdasarkan _User ID_ (Rule Firestore ketat).
4. **Backend-heavy AI:** Seluruh proses AI (prompting, panggilan model) berjalan di backend, menyembunyikan API key Google Gemini.

---

## 🚀 Deployment

Deployment disarankan melalui Firebase CLI secara terpusat:

```bash
# Login Firebase
firebase login

# Setel alias project
firebase use <YOUR-PROJECT-ID>

# Build backend
cd functions && npm run build && cd ..

# Deploy seluruh fungsi dan hosting
firebase deploy
```

> Aplikasi ini dibuat untuk membantu pahlawan ekonomi kreatif lokal berkembang lebih pesat melalui keajaiban teknologi AI. Bangga Buatan Indonesia! 🇮🇩