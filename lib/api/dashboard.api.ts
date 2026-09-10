import { apiFetch } from "./client"

export async function fetchDashboardSummary(businessId: string) {
  return await apiFetch<any>(`/dashboard/summary?businessId=${businessId}`)
}

export async function fetchRecentTransactions(businessId: string, limit = 5) {
  return await apiFetch<any[]>(`/dashboard/recent?businessId=${businessId}&limit=${limit}`)
}