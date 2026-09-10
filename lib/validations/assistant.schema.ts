export const assistantSchema = {
  topic: { required: "Topik wajib dipilih", message: "Pilih topik pertanyaan" },
  message: { required: "Pesan tidak boleh kosong", minLength: 1, message: "Ketik pesan Anda" },
}