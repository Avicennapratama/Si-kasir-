import { apiFetch } from "./client"

export async function fetchHkiValuations(businessId: string) {
  return await apiFetch<any[]>(`/hki/valuations?businessId=${businessId}`)
}

export async function calculateHkiValuation(data: any) {
  // Backend mengekspor endpoint ini sebagai /hki/pre-valuation.
  return await apiFetch<any>("/hki/pre-valuation", {
    method: "POST",
    body: JSON.stringify(data),
  })
}