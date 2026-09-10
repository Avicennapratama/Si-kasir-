import { apiFetch } from "../types/api"

export async function authLogin(email: string, password: string) {
  return await apiFetch<{ user: any; token: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })
}

export async function authRegister(email: string, password: string, name?: string) {
  return await apiFetch<{ user: any; token: string }>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, name }),
  })
}

export async function authLogout() {
  return await apiFetch<{ success: boolean }>("/auth/logout", {
    method: "POST",
  })
}

export async function authCurrentUser() {
  return await apiFetch<{ user: any }>("/auth/me", { method: "GET" })
}