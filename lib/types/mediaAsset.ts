export interface MediaAsset {
  id: string
  url: string
  type: "image" | "audio" | "document"
  filename: string
  businessId: string
  uploadedAt: string | number | Date
}