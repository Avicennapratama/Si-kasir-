# ============================================================
# Panduan Deploy — Frontend (App Hosting) + Backend (Functions)
# ============================================================

Arsitektur deploy:
  FRONTEND  Next.js      → Firebase App Hosting (dari GitHub, via AI Studio)
  BACKEND   Express API  → Firebase Functions   (function `api`, us-central1)

Urutan penting: deploy BACKEND dulu supaya dapat URL-nya, lalu frontend.

------------------------------------------------------------
1. PUSH KE GITHUB (blocker untuk AI Studio)
------------------------------------------------------------
gh auth login
gh repo create sikasir-ai --private --source=. --push

------------------------------------------------------------
2. DEPLOY BACKEND — Firebase Functions
------------------------------------------------------------
  firebase login
  npm run functions:deploy

  Catat URL hasil deploy, bentuknya:
    https://us-central1-<PROJECT_ID>.cloudfunctions.net/api

  Simpan GEMINI_API_KEY aman (Secret Manager via Functions):
    firebase functions:secrets:set GEMINI_API_KEY

------------------------------------------------------------
3. DEPLOY FRONTEND — via Google AI Studio / App Hosting
------------------------------------------------------------
  a. Buka https://aistudio.google.com → mode Build
  b. Prompt box → ikon (+) Add files → Import from GitHub → pilih sikasir-ai
  c. Saat Publish, App Hosting membuat backend & meng-clone repo.
  d. Isi env (Console → App Hosting → Settings → Environment):
       NEXT_PUBLIC_API_BASE_URL = https://us-central1-<PROJECT_ID>.cloudfunctions.net/api
       (sisa konfig Firebase kebaca dari apphosting.yaml / Console)

  ATAU tanpa AI Studio, langsung dari Console:
    Firebase Console → App Hosting → Create backend → hubungkan repo GitHub.

  BUTUH: Cloud Billing aktif (Blaze) — App Hosting & Functions tidak gratis
  tanpa itu. Masih ada kuota gratis, tapi kartu harus terdaftar.

------------------------------------------------------------
4. RINGKASAN FILE YANG SUDAH DISIAPKAN
------------------------------------------------------------
  apphosting.yaml        konfig frontend App Hosting + env
  firebase.json          Functions + Firestore rules/indexes
  .firebaserc            default project id
  functions/             backend Express (build ke lib/, function `api`)
  .github/workflows/     CI: build+lint ; deploy-production (perlu setup Firebase token)

------------------------------------------------------------
5. JANGAN LUPA SEBELUM DEMO
------------------------------------------------------------
  [ ] npm run check:env  → semua ✓ (Firebase config + GEMINI_API_KEY)
  [ ] Enable Google sign-in di Authentication → Sign-in method
  [ ] Deploy firestore.rules (masih ada bug isBusinessOwner — belum aman!)
  [ ] Tes /assistant/chat dengan token nyata (bukan mock)
