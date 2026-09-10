import { apiFetch } from "./client"

export async function fetchStudioAssets(businessId: string) {
  return await apiFetch<any[]>(`/studio/assets?businessId=${businessId}`)
}

export async function generateStudioAsset(data: { prompt: string; businessId: string }) {
  return await apiFetch<any>("/studio/generate", {
    method: "POST",
    body: JSON.stringify(data),
  })
}