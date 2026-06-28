const API = process.env.NEXT_PUBLIC_API_URL || 'https://dalilak-backend-bvb9.onrender.com'

export interface User {
  username: string
  email: string
  full_name: string
  plan: 'trial' | 'paid' | 'admin' | 'suspended'
  role: 'user' | 'admin'
  trial_expires_at?: string
  paid_until?: string
  days_left?: number
  subscription_status?: string
  created_at?: string
}

// ── Token storage ─────────────────────────────────────────────
export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('dalilak_token')
}

export function setToken(token: string): void {
  localStorage.setItem('dalilak_token', token)
}

export function clearToken(): void {
  localStorage.removeItem('dalilak_token')
  localStorage.removeItem('dalilak_user')
}

export function getUser(): User | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem('dalilak_user')
  try { return raw ? JSON.parse(raw) : null } catch { return null }
}

export function setUser(user: User): void {
  localStorage.setItem('dalilak_user', JSON.stringify(user))
}

export function isLoggedIn(): boolean {
  return !!getToken()
}

export function isAdmin(): boolean {
  const u = getUser()
  return u?.role === 'admin' || u?.plan === 'admin'
}

// ── Auth headers ──────────────────────────────────────────────
export function authHeaders(): Record<string, string> {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// ── API calls ─────────────────────────────────────────────────
export async function apiRegister(data: {
  username: string; email: string; password: string; full_name: string; phone: string
}) {
  const res = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.detail || 'خطأ في التسجيل')
  return json
}

export async function apiLogin(username: string, password: string) {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.detail || 'بيانات الدخول غير صحيحة')
  return json
}

export async function apiMe(): Promise<User> {
  const res = await fetch(`${API}/auth/me`, { headers: authHeaders() })
  const json = await res.json()
  if (!res.ok) throw new Error(json.detail || 'خطأ')
  return json
}

export async function apiForgotPassword(email: string) {
  const res = await fetch(`${API}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.detail || 'خطأ')
  return json
}

export async function apiResetPassword(token: string, new_password: string) {
  const res = await fetch(`${API}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, new_password }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.detail || 'خطأ')
  return json
}

// ── Admin API ─────────────────────────────────────────────────
export async function adminListUsers() {
  const res = await fetch(`${API}/admin/users`, { headers: authHeaders() })
  const json = await res.json()
  if (!res.ok) throw new Error(json.detail || 'خطأ')
  return json
}

export async function adminCreateUser(data: {
  username: string; email: string; password: string; full_name: string; phone: string; plan: string
}) {
  const res = await fetch(`${API}/admin/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.detail || 'خطأ')
  return json
}

export async function adminUpdateUser(username: string, data: Partial<{
  plan: string; active: boolean; full_name: string; phone: string; paid_until: string
}>) {
  const res = await fetch(`${API}/admin/users/${username}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.detail || 'خطأ')
  return json
}

export async function adminDeactivateUser(username: string) {
  const res = await fetch(`${API}/admin/users/${username}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.detail || 'خطأ')
  return json
}

export async function adminGetStats() {
  const res = await fetch(`${API}/admin/stats`, { headers: authHeaders() })
  const json = await res.json()
  if (!res.ok) throw new Error(json.detail || 'خطأ')
  return json
}

export async function adminGetResets() {
  const res = await fetch(`${API}/admin/resets`, { headers: authHeaders() })
  const json = await res.json()
  if (!res.ok) throw new Error(json.detail || 'خطأ')
  return json
}

// ── Content Gaps ──────────────────────────────────────────────
export async function adminGetContentGaps(status?: string, limit = 100) {
  const url = new URL(`${API}/admin/content-gaps`)
  if (status) url.searchParams.set('status', status)
  url.searchParams.set('limit', String(limit))
  const res = await fetch(url.toString(), { headers: authHeaders() })
  const json = await res.json()
  if (!res.ok) throw new Error(json.detail || 'خطأ')
  return json
}

export async function adminUpdateContentGap(gapId: string, status: string, adminNotes?: string) {
  const res = await fetch(`${API}/admin/content-gaps/${gapId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ status, admin_notes: adminNotes }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.detail || 'خطأ')
  return json
}

export async function adminGetContentGapStats() {
  const res = await fetch(`${API}/admin/content-gaps/stats`, { headers: authHeaders() })
  const json = await res.json()
  if (!res.ok) throw new Error(json.detail || 'خطأ')
  return json
}

// ── PDF Export ────────────────────────────────────────────────
export async function exportChecklist(data: Record<string, unknown>): Promise<string> {
  const res = await fetch(`${API}/export/checklist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const json = await res.json().catch(() => ({}))
    throw new Error((json as any).detail || 'خطأ في التصدير')
  }
  return res.text()
}
