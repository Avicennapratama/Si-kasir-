export async function asyncStorageGetItem(key: string): Promise<string | null> {
  if (typeof window === "undefined") return null
  try {
    const data = localStorage.getItem(key)
    return data || null
  } catch {
    return null
  }
}

export async function asyncStorageSetItem(key: string, value: string): Promise<void> {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(key, value)
  } catch {}
}