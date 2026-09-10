import { create } from "zustand"

interface OfflineStore {
  isOnline: boolean
  syncing: boolean
  setOnline: (status: boolean) => void
  setSyncing: (status: boolean) => void
}

export const useOfflineStore = create<OfflineStore>((set) => ({
  isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
  syncing: false,
  setOnline: (status) => set({ isOnline: status }),
  setSyncing: (status) => set({ syncing: status }),
}))

if (typeof window !== "undefined") {
  window.addEventListener("online", () => useOfflineStore.getState().setOnline(true))
  window.addEventListener("offline", () => useOfflineStore.getState().setOnline(false))
}