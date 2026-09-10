/**
 * Zod schema placeholders — when Zod is installed, replace with:
 * import { z } from "zod"
 * export const authSchema = z.object({...})
 */

export const authSchema = {
  email: {
    required: "Email wajib diisi",
    pattern: "^[^\s@]+@[^\s@]+\.[^\s@]+$",
    message: "Format email tidak valid",
  },
  password: {
    required: "Kata sandi wajib diisi",
    minLength: 6,
    message: "Minimal 6 karakter",
  },
}

export const businessSchema = {
  name: {
    required: "Nama toko wajib diisi",
    minLength: 2,
    message: "Minimal 2 karakter",
  },
  category: {
    required: "Kategori wajib dipilih",
    message: "Pilih kategori toko",
  },
}

export const manualTransactionSchema = {
  amount: {
    required: "Jumlah wajib diisi",
    pattern: "^[0-9]+$",
    message: "Masukkan angka valid",
  },
  category: {
    required: "Kategori wajib dipilih",
    message: "Pilih kategori transaksi",
  },
  transactionDate: {
    required: "Tanggal wajib diisi",
    message: "Pilih tanggal transaksi",
  },
}

export const draftSchema = {
  title: {
    required: "Judul wajib diisi",
    minLength: 3,
    message: "Minimal 3 karakter",
  },
  type: {
    required: "Tipe dokumen wajib dipilih",
    message: "Pilih tipe dokumen",
  },
}

export const voiceSchema = {
  duration: {
    required: "Durasi wajib diisi",
    max: 60,
    message: "Maksimal 60 detik",
  },
}

export const receiptSchema = {
  image: {
    required: "Gambar wajib diupload",
    pattern: /^image\/(jpeg|png)$/,
    message: "Format gambar JPEG/PNG",
  },
}

export const studioSchema = {
  templateName: {
    required: "Nama template wajib diisi",
    minLength: 1,
    message: "Masukkan nama template",
  },
}

export const hkiSchema = {
  assetName: {
    required: "Nama aset wajib diisi",
    minLength: 1,
    message: "Masukkan nama aset",
  },
  hkiType: {
    required: "Tipe HKI wajib dipilih",
    message: "Pilih tipe HKI",
  },
}

export const assistantSchema = {
  topic: {
    required: "Topik wajib dipilih",
    message: "Pilih topik asisten",
  },
}

export const reportSchema = {
  period: {
    required: "Periode wajib dipilih",
    message: "Pilih periode laporan",
  },
  businessId: {
    required: "ID bisnis wajib diisi",
    message: "Identifikasi bisnis dibutuhkan",
  },
}