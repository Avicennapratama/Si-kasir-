export const validators = {
  amount: (val: any): { valid: boolean; message?: string } => {
    if (val === undefined || val === null) return { valid: false, message: "Jumlah wajib diisi" }
    if (typeof val !== "number") return { valid: false, message: "Masukkan angka valid" }
    if (isNaN(val)) return { valid: false, message: "Masukkan angka valid" }
    if (val < 0) return { valid: false, message: "Jumlah tidak boleh negatif" }
    return { valid: true }
  },

  email: (val: any): { valid: boolean; message?: string } => {
    if (!val || typeof val !== "string") return { valid: false, message: "Masukkan email valid" }
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return pattern.test(val) ? { valid: true } : { valid: false, message: "Format email tidak valid" }
  },

  required: (val: any): { valid: boolean; message?: string } => {
    if (val === undefined || val === null || val === "") return { valid: false, message: "Wajib diisi" }
    return { valid: true }
  },
}

export const formatters = {
  rupiah: (amount: number): string => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount),

  date: (date: Date | string | number, format = "dd MMM yyyy"): string => {
    const d = new Date(date)
    const day = String(d.getDate()).padStart(2, "0")
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const year = d.getFullYear()
    return format.replace("dd", day).replace("MM", month).replace("yyyy", String(year))
  },

  currencyCompact: (amount: number): string => {
    if (amount >= 1e9) return `${(amount / 1e9).toFixed(1)}M`
    if (amount >= 1e6) return `${(amount / 1e6).toFixed(1)}Jt`
    if (amount >= 1e3) return `${(amount / 1e3).toFixed(1)}Rb`
    return amount.toLocaleString("id-ID")
  },
}