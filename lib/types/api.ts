export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  meta?: {
    pagination?: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
}

export interface ApiError {
  message: string
  code: string
  status: number
}

/**
 * Base URL API.
 *
 * Backend adalah Firebase Functions (Express app diekspor sebagai `api`),
 * BUKAN Next.js API routes — folder app/api sengaja kosong.
 *
 * - Emulator lokal: http://localhost:5001/<project>/us-central1/api
 * - Produksi:       https://us-central1-<project>.cloudfunctions.net/api
 *
 * Set lewat NEXT_PUBLIC_API_BASE_URL. Kalau kosong, fallback ke
 * NEXT_PUBLIC_BASE_URL + /api agar konfigurasi lama tetap jalan.
 */
function resolveBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_API_BASE_URL
  if (explicit) return explicit.replace(/\/$/, "")

  const legacy = process.env.NEXT_PUBLIC_BASE_URL
  if (legacy) return `${legacy.replace(/\/$/, "")}/api`

  // Jangan diam-diam membentuk "undefined/api/..." — itu bikin
  // error-nya menyesatkan dan susah dilacak.
  throw new Error(
    "NEXT_PUBLIC_API_BASE_URL (atau NEXT_PUBLIC_BASE_URL) belum diset. Cek file .env lalu restart dev server."
  )
}

/**
 * Ambil Firebase ID token milik user yang sedang login.
 *
 * Semua route backend memakai verifyAuthHeader, jadi tanpa header
 * Authorization setiap request pasti 401. Sebelumnya token ini
 * memang tidak pernah dikirim.
 */
async function getAuthToken(): Promise<string | null> {
  if (typeof window === "undefined") return null
  try {
    const { auth } = await import("../firebase/config")
    const user = auth.currentUser
    if (!user) return null
    return await user.getIdToken()
  } catch {
    return null
  }
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  let url: string
  try {
    url = `${resolveBaseUrl()}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }

  const token = await getAuthToken()

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) ?? {}),
  }
  if (token) headers.Authorization = `Bearer ${token}`

  try {
    const res = await fetch(url, { ...options, headers })

    // Backend bisa membalas HTML (404 emulator, error proxy) —
    // res.json() akan melempar dan pesannya membingungkan.
    const raw = await res.text()
    let data: any = {}
    if (raw) {
      try {
        data = JSON.parse(raw)
      } catch {
        return {
          success: false,
          error: `Respons bukan JSON (HTTP ${res.status}): ${raw.slice(0, 120)}`,
        }
      }
    }

    if (!res.ok) {
      return {
        success: false,
        error: data.error || data.message || res.statusText,
        meta: data.meta,
      }
    }

    return {
      success: true,
      data: data.data ?? data,
      meta: data.meta,
    }
  } catch (err) {
    return {
      success: false,
      error: `Gagal menghubungi server: ${(err as Error).message}`,
    }
  }
}
