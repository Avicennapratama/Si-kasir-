import { apiFetch } from "./client"

export async function fetchReportSummary(businessId: string, period: string) {
  return await apiFetch<any>(`/reports/summary?businessId=${businessId}&period=${period}`)
}

export async function exportReportPdf(businessId: string, period: string) {
  return await apiFetch<Blob>(`/reports/export/pdf?businessId=${businessId}&period=${period}`)
}

export async function exportReportExcel(businessId: string, period: string) {
  return await apiFetch<Blob>(`/reports/export/excel?businessId=${businessId}&period=${period}`)
}