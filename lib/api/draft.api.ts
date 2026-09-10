import { apiFetch } from "./client"
import { DraftItem } from "../types/draft"

export async function fetchDrafts(businessId: string) {
  return await apiFetch<DraftItem[]>(`/drafts?businessId=${businessId}`)
}

export async function saveDraft(data: Omit<DraftItem, "id" | "createdAt" | "updatedAt">) {
  return await apiFetch<DraftItem>("/drafts", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function updateDraft(id: string, data: Partial<DraftItem>) {
  return await apiFetch<DraftItem>(`/drafts/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export async function deleteDraft(id: string) {
  return await apiFetch<{ success: boolean }>(`/drafts/${id}`, {
    method: "DELETE",
  })
}