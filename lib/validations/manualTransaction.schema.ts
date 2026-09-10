export const manualTransactionSchema = {
  amount: { required: "Jumlah wajib diisi", pattern: "^[0-9]+$", message: "Masukkan angka valid" },
  category: { required: "Kategori wajib dipilih", message: "Pilih kategori transaksi" },
  transactionDate: { required: "Tanggal wajib diisi", message: "Pilih tanggal transaksi" },
  source: { required: "Sumber wajib dipilih", message: "Pilih sumber transaksi" },
}

export const confidenceThreshold = 0.75