export interface GamificationStats {
  id: string
  businessId: string
  totalTransactions: number
  totalRevenue: number
  currentStreak: number
  longestStreak: number
  badges: string[]
  lastActivity: string | number | Date
}