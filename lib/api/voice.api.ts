import { apiFetch } from "./client"

export interface VoiceExtraction {
  type: "income" | "expense" | null
  amount: number | null
  note: string | null
  transactionDate: string | null
  items: Array<{ name: string; qty: number | null; price: number | null }>
  confidence: number
  lowConfidenceFields: string[]
}

/**
 * Ekstraksi transaksi dari transkrip suara — backend /ai/voice/extract.
 *
 * Kirim TEKS transkrip, bukan audio: transkrip sudah dibuat di browser
 * (Web Speech API), dan Gemini hanya perlu menafsirkan angkanya.
 */
export async function processVoiceInput(transcript: string) {
  return await apiFetch<VoiceExtraction>("/ai/voice/extract", {
    method: "POST",
    body: JSON.stringify({ transcript }),
  })
}
