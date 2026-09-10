"use client"

import { useState, useEffect } from "react"
import { getOutbox, removeFromOutbox } from "@/lib/offline/outbox"

export function useOfflineQueue() {
  const [queue, setQueue] = useState<any[]>([])

  const refreshQueue = () => {
    setQueue(getOutbox())
  }

  useEffect(() => {
    refreshQueue()
    const interval = setInterval(refreshQueue, 5000)
    return () => clearInterval(interval)
  }, [])

  const removeItem = (id: string) => {
    removeFromOutbox(id)
    refreshQueue()
  }

  return { queue, removeItem, refreshQueue }
}