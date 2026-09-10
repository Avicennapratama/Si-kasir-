export const draftSchema = {
  title: { required: "Judul wajib diisi", minLength: 3, message: "Minimal 3 karakter" },
  type: { required: "Tipe draft wajib dipilih", message: "Pilih tipe draft" },
  businessId: { required: "ID Bisnis wajib ada", message: "Bisnis tidak terdefinisi" },
}