"use client"

import { useState, useEffect } from "react"
import { fetchDashboardSummary } from "@/lib/api/dashboard.api"

export function useDashboardSummary(businessId: string) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!businessId) return
    fetchDashboardSummary(businessId)
      .then(setData)
      .finally(() => setLoading(false))
  }, [businessId])

  return { data, loading }
}