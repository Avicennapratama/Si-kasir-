import { create } from "zustand"
import { UserProfile } from "@/lib/types/user"

interface AuthState {
  user: UserProfile | null
  business: any | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  refreshBusiness: () => Promise<void>
  setUser: (user: UserProfile | null) => void
  setBusiness: (business: any | null) => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  business: null,
  loading: true,
  setUser: (user) => set({ user }),
  setBusiness: (business) => set({ business }),
  setLoading: (loading) => set({ loading }),
  signInWithGoogle: async () => {},
  logout: async () => {},
  refreshBusiness: async () => {},
}))