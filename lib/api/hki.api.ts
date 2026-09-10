import { apiFetch } from "./client"

export async function fetchHkiValuations(businessId: string) {
  return await apiFetch<any[]>(`/hki/valuations?businessId=${businessId}`)
}

export async function calculateHkiValuation(data: any) {
  return await apiFetch<any>("/hki/calculate", {
    method: "POST",
    body: JSON.stringify(data),
  })
}