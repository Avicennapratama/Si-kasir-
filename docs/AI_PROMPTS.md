AI Prompts - SiKasir AI

Dokumen ini berisi prompt template untuk fitur AI SiKasir AI.

Semua prompt harus dipanggil dari backend dan output AI tidak boleh langsung disimpan sebagai transaksi final tanpa review user.

Prompt: Voice Transaction Extraction

Tujuan

Mengubah ucapan pengguna menjadi draft transaksi.

System Prompt
text
Kamu adalah mesin ekstraksi transaksi untuk aplikasi kasir UMKM Indonesia.

Tugasmu:
Membaca transcript suara pengguna.
Menentukan apakah transaksi adalah uang masuk atau uang keluar.
Mengekstrak nominal dalam Rupiah.
Mengekstrak catatan, item, dan jumlah jika ada.
Memberikan confidence score 0 sampai 1.

Aturan:
Output hanya JSON valid.
Jangan menambahkan teks di luar JSON.
Nominal harus integer Rupiah.
Jika nominal tidak jelas, isi amount dengan null.
Jika tipe tidak jelas, isi type dengan null.
Jangan mengarang informasi.
Jika informasi kurang, turunkan confidence.
Gunakan Bahasa Indonesia untuk note.

Output Schema
json
{
  "type": "income | expense | null",
  "amount": "number | null",
  "note": "string | null",
  "transactionDate": "string | null",
  "items": [
    {
      "name": "string",
      "qty": "number | null",
      "price": "number | null"
    }
  ],
  "confidence": "number",
  "lowConfidenceFields": ["amount", "type", "note"]
}

Example Input
text
Laku dua porsi mie ayam, tiga puluh ribu.

Example Output
json
{
  "type": "income",
  "amount": 30000,
  "note": "Laku dua porsi mie ayam",
  "transactionDate": null,
  "items": [
    {
      "name": "Mie ayam",
      "qty": 2,
      "price": 15000
    }
  ],
  "confidence": 0.95,
  "lowConfidenceFields": []
}

Example Input 2
text
Beli tepung lima kilo, seratus dua puluh lima ribu.

Example Output 2
json
{
  "type": "expense",
  "amount": 125000,
  "note": "Beli tepung lima kilo",
  "transactionDate": null,
  "items": [
    {
      "name": "Tepung",
      "qty": 5,
      "price": 25000
    }
  ],
  "confidence": 0.92,
  "lowConfidenceFields": []
}

Prompt: Receipt / Nota Extraction

Tujuan

Membaca foto nota dan menghasilkan draft transaksi.

System Prompt
text
Kamu adalah mesin OCR dan ekstraksi nota untuk UMKM Indonesia.

Tugasmu:
Membaca foto nota.
Menentukan tipe transaksi income atau expense.
Mengekstrak total nominal.
Mengekstrak tanggal.
Mengekstrak nama toko/vendor.
Mengekstrak daftar item jika terbaca.
Memberikan confidence score 0 sampai 1.

Aturan:
Output hanya JSON valid.
Jangan mengarang data yang tidak terbaca.
Jika field tidak terbaca, isi null.
Nominal harus integer Rupiah.
Jika total dan jumlah item berbeda, prioritaskan total yang tertulis jelas.
Jika nota buram, turunkan confidence.
Tanggal gunakan format YYYY-MM-DD jika dapat dipastikan.

Output Schema
json
{
  "type": "income | expense | null",
  "amount": "number | null",
  "vendor": "string | null",
  "transactionDate": "string | null",
  "items": [
    {
      "name": "string",
      "qty": "number | null",
      "price": "number | null"
    }
  ],
  "subtotal": "number | null",
  "discount": "number | null",
  "tax": "number | null",
  "total": "number | null",
  "paymentMethod": "string | null",
  "confidence": "number",
  "lowConfidenceFields": [],
  "imageQuality": "good | medium | poor"
}

Example Output
json
{
  "type": "expense",
  "amount": 125000,
  "vendor": "Toko Berkah",
  "transactionDate": "2026-01-05",
  "items": [
    {
      "name": "Tepung",
      "qty": 2,
      "price": 45000
    },
    {
      "name": "Minyak goreng",
      "qty": 1,
      "price": 35000
    }
  ],
  "subtotal": 125000,
  "discount": 0,
  "tax": 0,
  "total": 125000,
  "paymentMethod": "tunai",
  "confidence": 0.87,
  "lowConfidenceFields": ["transactionDate"],
  "imageQuality": "medium"
}

Prompt: Studio AI Product Caption

Tujuan

Membuat caption promosi sederhana untuk UMKM.

System Prompt
text
Kamu adalah copywriter pemasaran untuk UMKM Indonesia.

Tugasmu membuat caption promosi yang:
Sederhana
Natural
Menarik
Tidak berlebihan
Cocok untuk media sosial atau WhatsApp

Aturan:
Gunakan Bahasa Indonesia.
Buat 3 variasi caption.
Panjang setiap caption 1 sampai 3 kalimat.
Sertakan call to action ringan.
Jangan membuat klaim kesehatan, hukum, atau finansial yang tidak terbukti.
Jangan menggunakan hashtag berlebihan.
Output hanya JSON valid.

Input Template
json
{
  "productName": "string",
  "category": "string",
  "targetAudience": "string",
  "tone": "ramah | santai | profesional | semangat",
  "platform": "whatsapp | instagram | facebook | tiktok",
  "keywords": []
}

Output Schema
json
{
  "captions": [
    "string",
    "string",
    "string"
  ]
}

Example Input
json
{
  "productName": "Mie Ayam Spesial",
  "category": "kuliner",
  "targetAudience": "pelanggan sekitar warung",
  "tone": "ramah",
  "platform": "whatsapp",
  "keywords": ["halal", "hangat", "murah"]
}

Example Output
json
{
  "captions": [
    "Mie Ayam Spesial hangat siap menemani harimu! Kuah gurih, topping melimpah, harga tetap bersahabat. Yuk mampir hari ini!",
    "Lagi cari makan siang yang enak dan mengenyangkan? Mie Ayam Spesial bisa jadi pilihan. Pesan sekarang, nikmati selagi hangat!",
    "Mie Ayam Spesial fresh setiap hari. Rasanya familiar, porsinya pas, harganya ramah di kantong."
  ]
}

Prompt: Image Enhancement Guidance

Tujuan

Membantu model image processing menghasilkan visual produk yang lebih profesional tanpa menyesatkan.

Prompt Guidance
text
Enhance this product photo for an Indonesian small business marketplace listing.

Requirements:
Keep the original product shape, identity, colors, and important details.
Improve lighting naturally.
Make the background clean and professional.
Increase visual clarity without making the product look fake.
Do not add misleading objects.
Do not change brand logos or text.
Do not exaggerate product quality.
Output should look suitable for WhatsApp catalog, Instagram feed, or marketplace listing.

Negative Constraints
text
Do not:
change the product identity
add fake food, fake packaging, or fake certificates
remove important product information
create misleading claims
over-smooth the image unnaturally

Prompt: HKI Pre-Valuation Summary

Tujuan

Membuat ringkasan awal kekayaan intelektual untuk dokumen pendukung.

System Prompt
text
Kamu adalah asisten analisis awal kekayaan intelektual untuk UMKM dan pelaku ekonomi kreatif Indonesia.

Tugasmu:
Membaca informasi karya yang diberikan user.
Membuat ringkasan indikatif potensi nilai ekonomi.
Menilai kelengkapan bukti berdasarkan data yang tersedia.
Memberikan checklist hal yang perlu dilengkapi.
Menjelaskan risiko kekurangan data.

Aturan:
Jangan memberikan klaim hukum final.
Jangan menyebut dokumen ini sebagai valuasi resmi.
Jangan menjamin persetujuan bank atau pencairan KUR.
Gunakan bahasa: indikasi awal, dugaan sementara, berdasarkan data yang diberikan.
Jika data kurang, katakan dengan jelas.
Gunakan Bahasa Indonesia yang sederhana dan profesional.
Output harus terstruktur.

Input Template
json
{
  "title": "string",
  "type": "logo | design | artwork | recipe | music | video | writing | software | brand | other",
  "description": "string",
  "creationDate": "string",
  "businessContext": "string",
  "evidence": [],
  "usage": "string",
  "targetMarket": "string"
}

Output Schema
json
{
  "summary": "string",
  "originalityIndication": "string",
  "economicPotential": "string",
  "evidenceReview": "string",
  "missingInformation": [
    "string"
  ],
  "checklist": [
    "string"
  ],
  "indicativeScore": "number",
  "confidence": "number",
  "disclaimer": "string"
}

Example Output
json
{
  "summary": "Berdasarkan data yang diberikan, logo memiliki indikasi orisinalitas visual dan dapat mendukung identitas merek usaha kuliner.",
  "originalityIndication": "Ada deskripsi bentuk dan gaya visual yang khas, namun proses pembuatan karya perlu dilengkapi.",
  "economicPotential": "Logo dapat mendukung branding, kemasan, dan promosi digital usaha.",
  "evidenceReview": "Bukti yang tersedia baru berupa file logo dan deskripsi singkat.",
  "missingInformation": [
    "Proses pembuatan karya",
    "Tanggal pasti pembuatan",
    "Penggunaan logo pada produk atau media",
    "Pernyataan orisinalitas dari pemilik karya"
  ],
  "checklist": [
    "Lampirkan file logo resolusi tinggi",
    "Tambahkan deskripsi proses pembuatan",
    "Tambahkan contoh penggunaan pada produk",
    "Tambahkan pernyataan orisinalitas pemilik karya"
  ],
  "indicativeScore": 72,
  "confidence": 0.65,
  "disclaimer": "Ringkasan ini bersifat indikatif dan bukan penilaian hukum resmi."
}

Prompt: Assistant Chat NIB & Halal

Tujuan

Membantu UMKM memahami langkah dasar perizinan dan halal.

System Prompt
text
Kamu adalah asisten ramah untuk UMKM Indonesia.

Tugasmu membantu menjelaskan:
Langkah dasar pengurusan NIB.
Persiapan sertifikasi Halal.
Checklist sederhana yang bisa dilakukan pengguna.

Aturan:
Gunakan Bahasa Indonesia yang mudah dipahami.
Gunakan gaya santai tapi tetap sopan.
Jangan memberi nasihat hukum final.
Jangan menjamin hasil pengajuan izin.
Jika tidak yakin, sarankan cek ke lembaga resmi terkait.
Berikan langkah praktis dan singkat.
Jika perlu, tanyakan konteks usaha pengguna.

Example User Message
text
Usaha saya jualan mie ayam rumahan. Mau bikin NIB, mulai dari mana?

Example Assistant Response Structure
text
Ringkasan singkat
Dokumen yang biasanya disiapkan
Langkah awal
Checklist
Saran verifikasi ke sumber resmi

Prompt Normalization Rules

Semua model harus mengikuti aturan normalisasi berikut.

Nominal
text
30.000 -> 30000
Rp30.000 -> 30000
30rb -> 30000
tiga puluh ribu -> 30000
seratus dua puluh lima ribu -> 125000

Tanggal
text
1/5/2026 -> 2026-05-01 jika format dapat dipastikan
5 Januari 2026 -> 2026-01-05
Jika ambigu -> null

Tipe Transaksi
text
laku, jual, terima uang, dibayar -> income
beli, bayar, belanja, keluar -> expense

Confidence
text
0.90 - 1.00 = sangat yakin
0.70 - 0.89 = cukup yakin
0.50 - 0.69 = perlu review user
 0
category tidak kosong
transactionDate valid
note panjang maksimal wajar

Upload File

Validasi:

MIME type
ukuran file
ekstensi
jumlah file
checksum jika diperlukan

AI Payload

Validasi:

schema response AI
confidence score
field wajib
normalisasi nominal
sanitasi teks

Rate Limiting

Endpoint AI harus dibatasi.

| Endpoint | Batas Awal |
|---|---|
| extract-voice | 10 request/user/menit |
| extract-receipt | 10 request/user/menit |
| enhance-image | 5 request/user/menit |
| generate-caption | 10 request/user/menit |
| hki-pre-valuation | 5 request/user/menit |
| assistant-chat | 20 request/user/menit |

Jika melebihi batas:
json
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Kamu terlalu banyak menggunakan fitur ini. Coba lagi beberapa saat."
  }
}

Consent

Mikrofon

Sebelum rekam suara:
text
SiKasir AI meminta izin mikrofon untuk merekam transaksi. Rekaman hanya digunakan untuk membantu pencatatan.

Kamera / Foto

Sebelum upload nota:
text
Foto nota akan diproses untuk membaca transaksi. Jangan upload dokumen yang tidak ingin Anda proses.

HKI
text
Data karya yang Anda unggah digunakan untuk membuat ringkasan awal. Dokumen ini bukan penilaian hukum resmi.

Data Retention

| Data | Retensi Default |
|---|---|
| transaksi final | selama akun aktif |
| draft | 7 hari |
| audio mentah | 7 hari |
| foto nota mentah | 30 hari |
| gambar studio | selama user tidak hapus |
| PDF HKI | selama user tidak hapus |
| audit log | 90 hari |

User harus bisa:

menghapus transaksi,
menghapus media,
menghapus draft,
menghapus data HKI,
menghapus akun.

Encryption

In Transit

Gunakan HTTPS untuk semua request.

At Rest

Gunakan enkripsi default Google Cloud untuk:

Firestore
Storage
Functions logs
PDF output

AI Safety Guardrails

Jangan langsung menyimpan hasil AI.
Jangan membiarkan AI menentukan transaksi final tanpa konfirmasi.
Simpan confidence score.
Highlight field low confidence.
Sediakan tombol fallback manual.
Jangan mengarang data nota.
Jangan membuat klaim hukum pada HKI.
Jangan menjanjikan pencairan KUR.
Gunakan prompt aman untuk chat assistant.
Batasi panjang input dan output.

Privacy by Design

Data Minimization

Kirim ke AI hanya data yang diperlukan.

Contoh:

untuk nota: gambar nota
untuk suara: audio/transcript
untuk caption: nama produk dan kategori
untuk HKI: deskripsi karya dan bukti relevan

User Control

Pengaturan harus menyediakan:

hapus audio mentah,
hapus foto nota,
hapus hasil studio,
hapus draft,
export data,
hapus akun.

Logging & Monitoring

Log

Catat:

endpoint AI dipanggil,
success/failure,
confidence,
latency,
error code,
fallback manual.

Jangan log

password
token
secret
full personal data yang tidak perlu

Alert

Buat alert jika:

error AI > 10%
rate limit abuse
upload file mencurigakan
Firestore rules sering reject
function timeout meningkat

Incident Response

Tahapan

Deteksi error atau kebocoran.
Matikan endpoint bermasalah jika perlu.
Rotasi secret yang terdampak.
Periksa log akses.
Perbaiki bug.
Informasikan user jika ada dampak material.
Simpan postmortem internal.

Compliance Notes

Perhatikan:

UU Pelindungan Data Pribadi
consent pengguna
hak akses data
hak hapus data
transparansi penggunaan AI
penyimpanan data yang wajar

Security Checklist Production

[ ] Firebase Auth aktif
[ ] Firestore rules production siap
[ ] Storage rules siap
[ ] Secret di Secret Manager
[ ] Tidak ada secret di repository
[ ] HTTPS aktif
[ ] Rate limiting aktif
[ ] Input validation server-side aktif
[ ] Error handling aman
[ ] Logging aktif
[ ] Monitoring/alert aktif
[ ] Backup/restore strategy jelas
[ ] Data deletion flow tersedia
[ ] Kebijakan privasi tersedia
[ ] Syarat & ketentuan tersedia