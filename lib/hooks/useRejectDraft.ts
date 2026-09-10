"use client"

import { useState } from "react"
import { updateDraft } from "@/lib/api/draft.api"

export function useRejectDraft() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reject = async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await updateDraft(id, { status: "rejected" })
      return res
    } catch (err: any) {
      setError(err.message || "Failed to reject draft")
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { reject, loading, error }
}