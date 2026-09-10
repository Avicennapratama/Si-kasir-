import { create } from "zustand"
import { BusinessProfile } from "@/lib/types/business"

interface BusinessStore {
  profile: BusinessProfile | null
  loading: boolean
  fetchProfile: () => Promise<void>
  updateProfile: (data: Partial<BusinessProfile>) => Promise<void>
}

export const useBusinessStore = create<BusinessStore>((set) => ({
  profile: null,
  loading: true,
  fetchProfile: async () => {
    const res = await fetch("/api/business/profile")
    if (res.ok) {
      const data = await res.json()
      set({ profile: data })
    }
  },
  updateProfile: async (data) => {
    const res = await fetch("/api/business/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    })
    if (res.ok) {
      const newData = await res.json()
      set({ profile: newData })
    }
  },
}))