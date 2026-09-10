export interface ReportSummary {
  id: string
  businessId: string
  period: string
  totalIncome: number
  totalExpense: number
  netProfit: number
  transactionCount: number
  generatedAt: string | number | Date
}