export { formatRupiah } from "../utils"

export function parseRupiah(str: string): number {
  return parseInt(str.replace(/[^0-9]/g, ""), 10) || 0
}

export function formatCompactRupiah(amount: number): string {
  if (amount >= 1e9) return `${(amount / 1e9).toFixed(1)}M`
  if (amount >= 1e6) return `${(amount / 1e6).toFixed(1)}Jt`
  if (amount >= 1e3) return `${(amount / 1e3).toFixed(1)}Rb`
  return amount.toString()
}