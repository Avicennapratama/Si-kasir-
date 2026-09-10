export interface HkiValuation {
  id: string
  businessId: string
  assetName: string
  hkiType: "merek" | "hak_cipta" | "paten" | "desain_industri"
  estimatedValue: number
  valuationDate: string
  status: "draft" | "submitted" | "verified"
  notes?: string
}