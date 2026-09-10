import { apiFetch } from "./client"

export async function fetchStudioAssets(businessId: string) {
  return await apiFetch<any[]>(`/studio/assets?businessId=${businessId}`)
}

export async function generateStudioCaption(data: { productName: string; category: string; tone?: string; platform?: string; businessId: string }) {
  return await apiFetch<any>("/studio/generate-caption", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function enhanceStudioImage(data: { image: string; style?: string; businessId: string }) {
  return await apiFetch<any>("/studio/enhance-image", {
    method: "POST",
    body: JSON.stringify(data),
  })
}