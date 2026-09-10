export function formatDate(date: Date | string | number, format = "dd MMM yyyy"): string {
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, "0")
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const year = d.getFullYear()
  return format.replace("dd", day).replace("MM", month).replace("yyyy", String(year))
}

export function ago(date: Date | string | number): string {
  const d = new Date(date)
  const diffSec = Math.floor((new Date().getTime() - d.getTime()) / 1000)
  if (diffSec < 60) return "baru saja"
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} menit yang lalu`
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} jam yang lalu`
  return `${Math.floor(diffSec / 86400)} hari yang lalu`
}