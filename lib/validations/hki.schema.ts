export const hkiSchema = {
  assetName: { required: "Nama aset wajib diisi", minLength: 2, message: "Masukkan nama aset" },
  hkiType: { required: "Tipe HKI wajib dipilih", message: "Pilih tipe HKI" },
  estimatedValue: { min: 0, message: "Nilai harus positif" },
}