import { apiFetch } from "./client"

export async function fetchGamificationStats(businessId: string) {
  // Backend mengekspor endpoint ini sebagai /gamification/status.
  return await apiFetch<any>(`/gamification/status?businessId=${businessId}`)
}

export async function claimBadge(businessId: string, badgeId: string) {
  return await apiFetch<any>("/gamification/badges/claim", {
    method: "POST",
    body: JSON.stringify({ businessId, badgeId }),
  })
}