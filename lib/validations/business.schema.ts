export const businessSchema = {
  name: { required: "Nama toko wajib diisi", minLength: 2, message: "Minimal 2 karakter" },
  category: { required: "Kategori wajib dipilih", message: "Pilih kategori toko" },
  address: { required: "Alamat wajib diisi", message: "Masukkan alamat lengkap" },
  phone: { pattern: "^\\d+$", message: "Masukkan nomor telepon valid" },
}

export const categories = {
  makanan: "Makanan",
  minuman: "Minuman", 
  jasa: "Jasa",
  kebutuhan_pokok: "Kebutuhan Pokok",
  lain_lain: "Lain-lain",
}