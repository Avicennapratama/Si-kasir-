import { apiFetch } from "./client"

export interface ReceiptExtraction {
  type: "income" | "expense" | null
  amount: number | null
  vendor: string | null
  transactionDate: string | null
  items: Array<{ name: string; qty: number | null; price: number | null }>
  subtotal: number | null
  discount: number | null
  tax: number | null
  total: number | null
  paymentMethod: string | null
  confidence: number
  lowConfidenceFields: string[]
  imageQuality: "good" | "medium" | "poor"
}

/**
 * Ekstraksi nota lewat Gemini Vision — backend /ai/receipt/extract.
 *
 * imageBase64 boleh menyertakan prefix data URL; backend membersihkannya.
 * Tidak butuh businessId (backend tidak memverifikasi kepemilikan untuk ini).
 */
export async function processReceiptImage(imageBase64: string, mimeType = "image/jpeg") {
  return await apiFetch<ReceiptExtraction>("/ai/receipt/extract", {
    method: "POST",
    body: JSON.stringify({ imageBase64, mimeType }),
  })
}
