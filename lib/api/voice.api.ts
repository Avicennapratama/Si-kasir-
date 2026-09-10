import { apiFetch } from "./client"

export async function processVoiceInput(audioBlob: Blob, businessId: string) {
  const formData = new FormData()
  formData.append("audio", audioBlob)
  formData.append("businessId", businessId)

  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/voice/process`
  const res = await fetch(url, {
    method: "POST",
    body: formData,
  })
  return await res.json()
}