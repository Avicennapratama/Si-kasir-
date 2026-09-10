"use client"

import { useAuth } from "./useAuth"
import { useState, useEffect } from "react"
import { fetchDashboardSummary } from "@/lib/api/dashboard.api"

export function useBusiness() {
  const { user } = useAuth()
  const [business, setBusiness] = useState<any>(null)

  useEffect(() => {
    if (!user) return
    // business fetch logic
  }, [user])

  return { business, loading: !business }
}