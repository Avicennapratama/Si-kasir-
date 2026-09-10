"use client"

import { useState } from "react"
import { createTransaction } from "@/lib/api/transaction.api"
import { TransactionItem } from "@/lib/types/transaction"

export function useManualTransaction() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submitTransaction = async (data: Omit<TransactionItem, "id" | "createdAt" | "updatedAt">) => {
    setLoading(true)
    setError(null)
    try {
      const res = await createTransaction(data)
      return res
    } catch (err: any) {
      setError(err.message || "Failed to create transaction")
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { submitTransaction, loading, error }
}