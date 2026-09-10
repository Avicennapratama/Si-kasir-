export interface DraftItem {
  id: string
  businessId: string
  title: string
  type: "invoice" | "receipt" | "laporan"
  content: Record<string, any>
  status: "draft" | "pending" | "rejected" | "confirmed"
  voiceNoteUrl?: string
  mediaAssets?: string[]
  createdAt: string | number | Date
  updatedAt?: string | number | Date
}