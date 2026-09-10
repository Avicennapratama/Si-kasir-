export interface StudioAsset {
  id: string
  url: string
  type: "image" | "template" | "design"
  filename: string
  businessId: string
  usedIn?: string[]
  uploadedAt: string | number | Date
}