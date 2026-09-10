"use client"

import { useState, useEffect } from "react"
import { saveDraft, updateDraft as updateDraftApi, deleteDraft as deleteDraftApi } from "@/lib/api/draft.api"
import { DraftItem } from "@/lib/types/draft"
import { apiFetch } from "@/lib/types/api"

export function useDraft() {
  const [drafts, setDrafts] = useState<DraftItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createDraft = async (data: Omit<DraftItem, "id" | "createdAt" | "updatedAt">) => {
    setLoading(true)
    setError(null)
    try {
      const res = await saveDraft(data)
      const newDraft = (res as any)?.data || (res as any)
      if (newDraft && newDraft.id) {
        setDrafts(prev => [newDraft as DraftItem, ...prev])
      }
      return newDraft
    } catch (err: any) {
      setError(err.message || "Failed to save draft")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateDraft = async (id: string, data: Partial<DraftItem>) => {
    setLoading(true)
    setError(null)
    try {
      const res = await updateDraftApi(id, data)
      const updatedDraft = (res as any)?.data || (res as any)
      if (updatedDraft && updatedDraft.id) {
        setDrafts(prev => prev.map(d => d.id === id ? updatedDraft as DraftItem : d))
      }
      return updatedDraft
    } catch (err: any) {
      setError(err.message || "Failed to update draft")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteDraft = async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      await deleteDraftApi(id)
      setDrafts(prev => prev.filter(d => d.id !== id))
    } catch (err: any) {
      setError(err.message || "Failed to delete draft")
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { drafts, loading, error, createDraft, updateDraft, deleteDraft }
}