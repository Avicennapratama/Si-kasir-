export class FirebaseErrorWrapper extends Error {
  code: string

  constructor(code: string, message: string) {
    super(message)
    this.name = "FirebaseErrorWrapper"
    this.code = code
  }
}

export function parseFirebaseError(error: any): string {
  if (!error?.code) return error?.message || "Terjadi kesalahan pada server"
  
  switch (error.code) {
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Email atau kata sandi salah"
    case "auth/email-already-in-use":
      return "Email sudah terdaftar"
    case "auth/weak-password":
      return "Kata sandi terlalu lemah (minimal 6 karakter)"
    case "auth/invalid-email":
      return "Format email tidak valid"
    case "permission-denied":
      return "Anda tidak memiliki akses ke dokumen ini"
    case "not-found":
      return "Dokumen tidak ditemukan"
    default:
      return error.message || "Terjadi kesalahan"
  }
}