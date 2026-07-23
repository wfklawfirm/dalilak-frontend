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

// ═══════════════════════════════════════════════════════════════
//  Transaction Files API (Phase 3)
// ═══════════════════════════════════════════════════════════════

export async function createTransaction(data: {
  title: string
  procedure_slug?: string
  country?: string
  user_type?: string
  summary?: string
  notes?: string
  required_documents?: unknown[]
  steps?: unknown[]
  sources?: unknown[]
}) {
  const res = await fetch(`${API}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.detail || 'خطأ في إنشاء ملف المعاملة')
  return json
}

export async function listTransactions() {
  const res = await fetch(`${API}/transactions`, { headers: authHeaders() })
  const json = await res.json()
  if (!res.ok) throw new Error(json.detail || 'خطأ في جلب ملفات المعاملات')
  return json
}

export async function getTransaction(txId: string) {
  const res = await fetch(`${API}/transactions/${txId}`, { headers: authHeaders() })
  const json = await res.json()
  if (!res.ok) throw new Error(json.detail || 'خطأ')
  return json
}

export async function updateTransaction(txId: string, data: Record<string, unknown>) {
  const res = await fetch(`${API}/transactions/${txId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.detail || 'خطأ في تحديث ملف المعاملة')
  return json
}

export async function deleteTransaction(txId: string) {
  const res = await fetch(`${API}/transactions/${txId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.detail || 'خطأ في حذف ملف المعاملة')
  return json
}

export async function scoreTransactionRisk(txId: string) {
  const res = await fetch(`${API}/transactions/${txId}/risk-score`, {
    method: 'POST',
    headers: authHeaders(),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.detail || 'خطأ في تقييم المخاطر')
  return json
}

export async function createTransactionFromProcedure(slug: string) {
  const res = await fetch(`${API}/procedures/${slug}/transaction-file`, {
    method: 'POST',
    headers: authHeaders(),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.detail || 'خطأ في إنشاء الملف')
  return json
}

// ═══════════════════════════════════════════════════════════════
//  Document Intelligence API (Phases 4, 7, 9)
// ═══════════════════════════════════════════════════════════════

export async function uploadDocument(data: {
  file_base64: string
  file_name: string
  file_type: string
  transaction_id?: string
}) {
  const res = await fetch(`${API}/documents/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.detail || 'خطأ في رفع الوثيقة')
  return json
}

export async function listDocuments() {
  const res = await fetch(`${API}/documents`, { headers: authHeaders() })
  const json = await res.json()
  if (!res.ok) throw new Error(json.detail || 'خطأ في جلب الوثائق')
  return json
}

export async function analyzeDocument(docId: string) {
  const res = await fetch(`${API}/documents/${docId}/analyze`, {
    method: 'POST',
    headers: authHeaders(),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.detail || 'خطأ في تحليل الوثيقة')
  return json
}

export async function reviewDocumentRisk(docId: string) {
  const res = await fetch(`${API}/documents/${docId}/risk-review`, {
    method: 'POST',
    headers: authHeaders(),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.detail || 'خطأ في مراجعة العقد')
  return json
}

export async function deleteDocument(docId: string) {
  const res = await fetch(`${API}/documents/${docId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.detail || 'خطأ في حذف الوثيقة')
  return json
}

// ═══════════════════════════════════════════════════════════════
//  AI Flowchart Generation
// ═══════════════════════════════════════════════════════════════

export async function generateFlowchart(data: {
  slug: string
  titleAr: string
  titleEn?: string
  category?: string
  authority?: string
  fees?: string
  processingTime?: string
  requiredDocuments?: string[]
  descriptionAr?: string
  knownSteps?: string[]
}) {
  // المسار الأساسي: توليد بالذكاء الاصطناعي (POST /flowchart/generate).
  // إن لم يكن هذا المسار متاحاً على الباك-إند حالياً (404) أو فشل لأي سبب آخر،
  // نستخدم المسار الاحتياطي الموثوق GET /procedures/{slug}/flowchart الذي
  // يعيد دائماً خارطة صالحة (مُعدّة مسبقاً أو عامة) بدل ترك المستخدم بدون نتيجة.
  try {
    const res = await fetch(`${API}/flowchart/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(data),
    })
    if (res.ok) return await res.json()
  } catch {
    /* شبكة أو مسار غير متاح — ننتقل للاحتياطي أدناه */
  }

  const fallbackRes = await fetch(`${API}/procedures/${encodeURIComponent(data.slug)}/flowchart`, {
    headers: authHeaders(),
  })
  const fallbackJson = await fallbackRes.json()
  if (!fallbackRes.ok) throw new Error(fallbackJson.detail || 'تعذّر توليد خارطة الإجراء')
  return fallbackJson
}

// ═══════════════════════════════════════════════════════════════
//  My Files — Case Workspace (يتطلب تسجيل الدخول)
// ═══════════════════════════════════════════════════════════════

export async function startTrackingProcedure(data: {
  procedure_id: string
  title_ar: string
  checklist?: Array<{ step: number; title_ar: string; desc_ar?: string }>
  documents?: Array<{ name_ar: string; required?: boolean }>
}) {
  const res = await fetch(`${API}/my-procedures`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.detail || 'تعذّر حفظ المعاملة في ملفاتي')
  return json
}
