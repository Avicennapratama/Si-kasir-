/**
 * Generic Report Template for transactions/financial summaries
 */

export interface ReportTemplate {
  title: string;
  subtitle: string;
  generatedAt: string;
  currency: string;
  totals: {
    income: number;
    expense: number;
    net: number;
  };
  transactions: Array<{
    id: string;
    date: string;
    type: string;
    amount: number;
    vendor: string | null;
    description: string | null;
  }>;
}

export const getDefaultReportTemplate = (): ReportTemplate => ({
  title: 'Laporan Keuangan',
  subtitle: 'SiKasir AI',
  generatedAt: new Date().toISOString(),
  currency: 'IDR',
  totals: {
    income: 0,
    expense: 0,
    net: 0,
  },
  transactions: [],
});