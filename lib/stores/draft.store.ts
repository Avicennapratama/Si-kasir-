import { create } from "zustand"
import { DraftItem } from "@/lib/types/draft"

interface DraftStore {
  drafts: DraftItem[]
  activeDraft: DraftItem | null
  setActiveDraft: (draft: DraftItem | null) => void
  setDrafts: (drafts: DraftItem[]) => void
  addDraft: (draft: DraftItem) => void
  removeDraft: (id: string) => void
}

export const useDraftStore = create<DraftStore>((set) => ({
  drafts: [],
  activeDraft: null,
  setActiveDraft: (draft) => set({ activeDraft: draft }),
  setDrafts: (drafts) => set({ drafts }),
  addDraft: (draft) => set((state) => ({ drafts: [draft, ...state.drafts] })),
  removeDraft: (id) => set((state) => ({ drafts: state.drafts.filter((d) => d.id !== id) })),
}))