"use client"

import { useState, useEffect } from "react"

export function useMediaPermission(type: "audio" | "video") {
  const [permission, setPermission] = useState<PermissionState>("prompt")

  useEffect(() => {
    navigator.permissions.query({ name: type as PermissionName })
      .then(result => {
        setPermission(result.state)
        result.onchange = () => setPermission(result.state)
      })
      .catch(() => setPermission("prompt"))
  }, [type])

  const requestPermission = async () => {
    try {
      if (type === "audio") {
        await navigator.mediaDevices.getUserMedia({ audio: true })
      } else {
        await navigator.mediaDevices.getUserMedia({ video: true })
      }
      return true
    } catch {
      return false
    }
  }

  return { permission, requestPermission }
}