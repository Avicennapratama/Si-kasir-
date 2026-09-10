"use client"

import { useState } from "react"
import { processReceiptImage } from "@/lib/api/receipt.api"
import { useVoiceRecorder } from "@/lib/hooks/useVoiceRecorder"

export function useReceiptUpload() {
  const { recording, audioBlob } = useVoiceRecorder()
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const uploadReceipt = async () => {
    if (!imageFile) {
      setError("No image selected")
      return
    }

    setLoading(true)
    setError(null)
    try {
      await processReceiptImage(imageFile, "business-id-placeholder")
      setLoading(false)
    } catch (err: any) {
      setError(err.message || "Upload failed")
      setLoading(false)
    }
  }

  return { imageFile, setImageFile, uploadReceipt, recording, audioBlob, loading, error }
}