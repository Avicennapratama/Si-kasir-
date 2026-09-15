# 🤝 Panduan Kontribusi — SiKasir AI

Terima kasih tertarik berkontribusi! Dokumen ini menjelaskan cara berkontribusi dengan benar agar proses review cepat dan kualitas kode terjaga.

## 📋 Prasyarat

- **Node.js** v18+
- **Git** terinstal dan dikonfigurasi (`user.name`, `user.email`)
- Pemahaman dasar TypeScript, Next.js, dan Firebase

## 🚀 Memulai

1. **Fork** repositori ini
2. **Clone** fork Anda:

   ```bash
   git clone https://github.com/<username>/Si-kasir-.git
   cd Si-kasir-
   npm install
   cd functions && npm install
   ```

3. **Setup environment** (lihat `README.md` bagian Quickstart)
4. **Buat branch** dari `main`:

   ```bash
   git checkout -b feat/nama-fitur
   ```

## 🌿 Konvensi Branch

| Prefix | Kegunaan | Contoh |
|---|---|---|
| `feat/` | Fitur baru | `feat/voice-parser-batch` |
| `fix/` | Perbaikan bug | `fix/auth-token-expiry` |
| `hotfix/` | Fix kritis di production | `hotfix/gemini-quota` |
| `docs/` | Perubahan dokumentasi | `docs/architecture-update` |
| `refactor/` | Refactor tanpa perubahan perilaku | `refactor/draft-store` |
| `chore/` | Tooling, deps, config | `chore/upgrade-next` |

## 💬 Konvensi Commit Message

Gunakan format [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body opsional>
<footer opsional>
```

**Contoh:**

```
feat(voice): tambah dukungan perintah multi-item
fix(auth): perbaiki token expiry check dari < ke <=
docs(architecture): perbarui flow diagram AI
chore(deps): upgrade next ke 14.2.15
```

**Tipe yang valid:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

## 🧪 Sebelum Push

Pastikan semua lolos:

```bash
npm run lint        # ESLint
npm run test:unit   # Jest unit tests
npm run build       # Next.js build
```

PR yang gagal salah satu langkah di atas tidak akan di-merge.

## 📝 Pull Request

1. Push branch Anda ke fork:

   ```bash
   git push origin feat/nama-fitur
   ```

2. Buat PR ke `main` di repositori upstream
3. Isi deskripsi PR:
   - **Apa** yang diubah
   - **Kenapa** perubahan ini diperlukan
   - **Cara test** — langkah repro atau test yang ditambahkan
   - **Screenshot** jika ada perubahan UI

### Aturan PR

- Satu PR = satu tujuan logis (jangan campur fitur + refactor + deps)
- Kelompok perubahan kecil lebih disukai daripada PR raksasa
- Update dokumentasi (`README.md`, `ARCHITECTURE.md`) jika perilaku/arsitektur berubah
- **Jangan commit** file `.env`, `.env.local`, atau kredensial apa pun

## 🎨 Gaya Kode

- TypeScript strict mode — jangan matikan `strict` di `tsconfig.json`
- Gunakan Prettier config yang ada (`.prettierrc`)
- Komponen React: PascalCase; hooks: prefix `use`; utils: camelCase
- Preferasi: fungsi kecil, satu tanggung jawab, tanpa abstraksi prematur

## 🐛 Melaporkan Bug

Buka issue baru dengan template:

- **Judul singkat** yang deskriptif
- **Langkah reproduksi** (step-by-step)
- **Perilaku yang diharapkan** vs **perilaku aktual**
- **Environment**: OS, versi Node, browser (jika frontend)
- **Screenshot/log** jika relevan

## 💡 Mengusulkan Fitur

Buka issue dengan label `enhancement` sebelum mulai koding. Diskusikan dulu agar tidak ada kerja yang sia-sia jika arah fitur tidak sesuai roadmap.

## 🔒 Keamanan

Jika menemukan celah keamanan, **jangan buka issue publik**. Hubungi pemilik repositori secara private melalui profil GitHub. Lihat `SECURITY.md` (jika ada) untuk detail.

---

Terima kasih sudah berkontribusi! 🇮🇩