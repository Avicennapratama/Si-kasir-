import { apiFetch } from "./client"
import { TransactionItem } from "../types/transaction"

export async function fetchTransactions(businessId: string, params?: Record<string, string>) {
  const query = new URLSearchParams({ businessId, ...(params || {}) }).toString()
  return await apiFetch<TransactionItem[]>(`/transactions?${query}`)
}

export async function createTransaction(data: Omit<TransactionItem, "id" | "createdAt" | "updatedAt">) {
  return await apiFetch<TransactionItem>("/transactions", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function deleteTransaction(id: string) {
  return await apiFetch<{ success: boolean }>(`/transactions/${id}`, {
    method: "DELETE",
  })
}