export const studioSchema = {
  templateName: { required: "Nama template wajib diisi", minLength: 1, message: "Masukkan nama template" },
  prompt: { required: "Prompt wajib diisi", minLength: 5, message: "Prompt minimal 5 karakter" },
}