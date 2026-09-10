"use client"

import { useState, useEffect } from "react"
import { fetchGamificationStats } from "@/lib/api/gamification.api"

export function useStreak(businessId: string) {
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!businessId) return
    fetchGamificationStats(businessId)
      .then((res: any) => setStreak(res?.data?.currentStreak || res?.currentStreak || 0))
      .catch(() => setStreak(0))
      .finally(() => setLoading(false))
  }, [businessId])

  return { streak, loading }
}