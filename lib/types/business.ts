export interface BusinessProfile {
  id: string
  ownerId: string
  name: string
  category: string
  address?: string
  phone?: string
  logoUrl?: string
  timezone?: string
  createdAt: string | number | Date
  updatedAt?: string | number | Date
}