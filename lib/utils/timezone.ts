export const DEFAULT_TIMEZONE = "Asia/Jakarta"

export function getLocalTime(timezone = DEFAULT_TIMEZONE): string {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date())
}

export function formatWithTimezone(date: Date, timezone = DEFAULT_TIMEZONE): string {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: timezone,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}