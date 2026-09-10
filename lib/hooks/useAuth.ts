"use client"

import { useAuth as useAuthContext } from "@/lib/firebase/auth-context"

export function useAuth() {
  return useAuthContext()
}