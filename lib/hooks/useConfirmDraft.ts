"use client"

import { useState } from "react"
import { updateDraft } from "@/lib/api/draft.api"

export function useConfirmDraft() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const confirm = async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await updateDraft(id, { status: "confirmed" })
      return res
    } catch (err: any) {
      setError(err.message || "Failed to confirm draft")
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { confirm, loading, error }
}