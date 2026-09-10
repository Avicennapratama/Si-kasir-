export interface TransactionItem {
  id: string
  businessId: string
  type: "income" | "expense"
  amount: number
  category: string
  note?: string
  transactionDate: string
  source: "manual" | "suara" | "nota"
  status: "posted" | "pending" | "voided"
  createdAt: string | number | Date
  updatedAt?: string | number | Date
}