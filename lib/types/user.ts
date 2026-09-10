export interface UserProfile {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  businessId?: string | null
  role?: "owner" | "staff"
  createdAt: string | number | Date
  updatedAt?: string | number | Date
}