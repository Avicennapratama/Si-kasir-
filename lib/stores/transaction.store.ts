import { create } from "zustand"
import { TransactionItem } from "@/lib/types/transaction"

interface TransactionStore {
  items: TransactionItem[]
  filter: Record<string, any>
  setFilter: (filter: Record<string, any>) => void
  addTransaction: (item: TransactionItem) => void
  removeTransaction: (id: string) => void
}

export const useTransactionStore = create<TransactionStore>((set) => ({
  items: [],
  filter: {},
  setFilter: (filter) => set({ filter }),
  addTransaction: (item) => set((state) => ({ items: [item, ...state.items] })),
  removeTransaction: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
}))