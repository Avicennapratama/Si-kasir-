import { apiFetch } from "./client"

export async function fetchSettings(businessId: string) {
  return await apiFetch<any>(`/settings?businessId=${businessId}`)
}

export async function updateSettings(businessId: string, data: any) {
  return await apiFetch<any>("/settings", {
    method: "PUT",
    body: JSON.stringify({ businessId, ...data }),
  })
}