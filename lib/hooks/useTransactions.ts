"use client"

import { useState, useEffect } from "react"
import { fetchTransactions } from "@/lib/api/transaction.api"
import { TransactionItem } from "@/lib/types/transaction"

export function useTransactions(businessId: string, filters?: Record<string, string>) {
  const [transactions, setTransactions] = useState<TransactionItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!businessId) return
    fetchTransactions(businessId, filters)
      .then((res: any) => {
        if (Array.isArray(res)) setTransactions(res)
        else if (Array.isArray(res?.data)) setTransactions(res.data)
      })
      .finally(() => setLoading(false))
  }, [businessId, JSON.stringify(filters)])

  return { transactions, loading }
}