'use client'
import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import {
  isAdmin, getUser, clearToken,
  adminListUsers, adminCreateUser, adminUpdateUser, adminDeactivateUser,
  adminGetStats, adminGetResets,
  adminGetContentGaps, adminUpdateContentGap, adminGetContentGapStats,
} from '@/lib/auth'

interface UserRow {
  username: string; email: string; full_name: string; phone: string
  plan: string; status: string; days_left?: number; active: boolean
  created_at: string; last_login: string; paid_until?: string
}

interface Stats {
  total: number; paid: number; trial_active: number
  trial_expired: number; suspended: number; conversion_rate: string
}

interface ResetCode { username: string; token: string; expires_at: string }

type Tab = 'stats' | 'users' | 'create' | 'resets' | 'feedback' | 'escalations' | 'gaps'

interface FeedbackEntry { question: string; answer: string; rating: string; confidence?: string; username: string; timestamp: number }
interface EscalationEntry { request_type: string; question: string; contact_preference?: string; user_email?: string; user_phone?: string; username: string; timestamp: number; status: string }
interface ContentGapEntry {
  id: string; user_question: string; gap_type: string; detected_country?: string
  detected_procedure?: string; confidence_score?: number; status: string
  priority: string; admin_notes?: string; username?: string; created_at?: string
}

const PLAN_LABELS: Record<string, string> = {
  paid: 'مدفوع', trial: 'تجريبي', admin: 'مشرف', suspended: 'موقوف', expired: 'منتهي'
}
const PLAN_COLORS: Record<string, string> = {
  paid: 'bg-green-100 text-green-800',
  trial: 'bg-blue-100 text-blue-800',
  admin: 'bg-purple-100 text-purple-800',
  suspended: 'bg-red-100 text-red-800',
  expired: 'bg-gray-100 text-gray-600',
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dalilak-backend-bvb9.onrender.com'

export default function AdminPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('stats')
  const [stats, setStats] = useState<Stats | null>(null)
  const [users, setUsers] = useState<UserRow[]>([])
  const [resets, setResets] = useState<ResetCode[]>([])
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([])
  const [escalations, setEscalations] = useState<EscalationEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  // Content Gaps
  const [contentGaps, setContentGaps] = useState<ContentGapEntry[]>([])
  const [gapStats, setGapStats] = useState<{total:number;open:number;in_review:number;high_priority:number}|null>(null)
  const [gapFilter, setGapFilter] = useState<string>('open')

  // Create user form
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '', full_name: '', phone: '', plan: 'trial' })

  // Edit user modal
  const [editUser, setEditUser] = useState<UserRow | null>(null)
  const [editPlan, setEditPlan] = useState('')
  const [editPaidUntil, setEditPaidUntil] = useState('')

  useEffect(() => {
    if (!isAdmin()) { router.push('/login'); return }
    loadStats()
    loadUsers()
  }, [])

  async function loadStats() {
    try { setStats(await adminGetStats()) } catch (e: any) { flash(e.message || 'خطأ في تحميل الإحصائيات', true) }
  }

  async function loadUsers() {
    try { setUsers((await adminListUsers()).users) } catch (e: any) { flash(e.message || 'خطأ في تحميل المستخدمين', true) }
  }

  async function loadResets() {
    try { setResets((await adminGetResets()).reset_codes) } catch (e: any) { flash(e.message || 'خطأ في تحميل الرموز', true) }
  }

  async function loadFeedback() {
    try {
      const { getToken } = await import('@/lib/auth')
      const res = await fetch(`${API_URL}/admin/feedback?limit=100`, { headers: { Authorization: `Bearer ${getToken()}` } })
      const data = await res.json()
      setFeedback(data.feedback || [])
    } catch (e: any) { flash(e.message || 'خطأ في تحميل التقييمات', true) }
  }

  async function loadEscalations() {
    try {
      const { getToken } = await import('@/lib/auth')
      const res = await fetch(`${API_URL}/admin/escalations?limit=100`, { headers: { Authorization: `Bearer ${getToken()}` } })
      const data = await res.json()
      setEscalations(data.escalations || [])
    } catch (e: any) { flash(e.message || 'خطأ في تحميل طلبات التصعيد', true) }
  }

  async function loadContentGaps(status?: string) {
    try {
      setLoading(true)
      const data = await adminGetContentGaps(status ?? gapFilter)
      setContentGaps(data.gaps || [])
      setGapStats(data.stats || null)
    } catch (e: any) { flash(e.message || 'خطأ في تحميل ثغرات المحتوى', true) }
    finally { setLoading(false) }
  }

  async function handleGapUpdate(gapId: string, status: string, notes?: string) {
    try {
      await adminUpdateContentGap(gapId, status, notes)
      flash(`✅ تم تحديث الثغرة`)
      loadContentGaps(gapFilter)
    } catch (e: any) { flash(e.message || 'خطأ في تحديث الثغرة', true) }
  }

  function fmtTs(ts?: number) {
    if (!ts) return '—'
    return new Date(ts * 1000).toLocaleString('ar-LB')
  }

  async function refreshAll() {
    setLoading(true)
    await Promise.all([loadStats(), loadUsers()])
    setLoading(false)
  }

  function flash(m: string, isErr = false) {
    if (isErr) setError(m); else setMsg(m)
    setTimeout(() => { setMsg(''); setError('') }, 4000)
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await adminCreateUser(newUser)
      flash('✅ تم إنشاء المستخدم بنجاح')
      setNewUser({ username: '', email: '', password: '', full_name: '', phone: '', plan: 'trial' })
      loadUsers(); loadStats()
    } catch (err: any) {
      flash(err.message, true)
    } finally { setLoading(false) }
  }

  async function handleUpdate() {
    if (!editUser) return
    setLoading(true)
    try {
      const payload: any = { plan: editPlan }
      if (editPaidUntil) payload.paid_until = editPaidUntil
      await adminUpdateUser(editUser.username, payload)
      flash('✅ تم التحديث بنجاح')
      setEditUser(null)
      loadUsers(); loadStats()
    } catch (err: any) {
      flash(err.message, true)
    } finally { setLoading(false) }
  }

  async function handleDeactivate(username: string) {
    if (!confirm(`تعطيل حساب ${username}؟`)) return
    try {
      await adminDeactivateUser(username)
      flash('✅ تم تعطيل الحساب')
      loadUsers(); loadStats()
    } catch (err: any) { flash(err.message, true) }
  }

  const filtered = users.filter(u =>
    u.username.includes(search) || u.email.includes(search) || u.full_name.includes(search)
  )

  function fmtDate(s?: string) {
    if (!s) return '—'
    try { return new Date(s).toLocaleDateString('ar-LB') } catch { return s }
  }

  const me = getUser()

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Header */}
      <header className="bg-[#6b2737] text-white px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🛡️</span>
          <div>
            <h1 className="font-bold text-lg">لوحة التحكم — دليلك AI</h1>
            <p className="text-xs text-white/70">مرحباً، {me?.full_name || me?.username}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={refreshAll} disabled={loading}
            className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
            {loading ? '...' : '🔄 تحديث'}
          </button>
          <button onClick={() => router.push('/')} className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors">
            التطبيق
          </button>
          <button onClick={() => { clearToken(); router.push('/login') }}
            className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors">
            خروج
          </button>
        </div>
      </header>

      {/* Flash messages */}
      {msg && <div className="mx-6 mt-4 p-3 bg-green-100 border border-green-300 rounded-xl text-green-800 text-sm text-center">{msg}</div>}
      {error && <div className="mx-6 mt-4 p-3 bg-red-100 border border-red-300 rounded-xl text-red-800 text-sm text-center">{error}</div>}

      {/* Tabs */}
      <div className="px-6 pt-6">
        <div className="flex gap-2 flex-wrap">
          {([
            { id: 'stats',       label: '📊 الإحصائيات' },
            { id: 'users',       label: '👥 المستخدمون' },
            { id: 'create',      label: '➕ مستخدم جديد' },
            { id: 'resets',      label: '🔑 رموز الاستعادة' },
            { id: 'feedback',    label: '💬 التقييمات' },
            { id: 'escalations', label: '🤝 طلبات التصعيد' },
            { id: 'gaps',        label: '🔍 ثغرات المحتوى' },
          ] as { id: Tab; label: string }[]).map(t => (
            <button key={t.id}
              onClick={() => {
                setTab(t.id)
                if (t.id === 'resets') loadResets()
                if (t.id === 'feedback') loadFeedback()
                if (t.id === 'escalations') loadEscalations()
                if (t.id === 'gaps') loadContentGaps('open')
              }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                tab === t.id ? 'bg-[#6b2737] text-white shadow' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">

        {/* ── STATS ── */}
        {tab === 'stats' && stats && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: 'إجمالي المستخدمين', value: stats.total, color: 'bg-white', icon: '👥' },
                { label: 'مشتركون مدفوعون', value: stats.paid, color: 'bg-green-50', icon: '💳' },
                { label: 'تجريبي نشط', value: stats.trial_active, color: 'bg-blue-50', icon: '⏱️' },
                { label: 'تجريبي منتهي', value: stats.trial_expired, color: 'bg-orange-50', icon: '⚠️' },
                { label: 'معطّلون', value: stats.suspended, color: 'bg-red-50', icon: '🚫' },
                { label: 'معدل التحويل', value: stats.conversion_rate, color: 'bg-purple-50', icon: '📈' },
              ].map(s => (
                <div key={s.label} className={`${s.color} rounded-2xl p-5 shadow-sm border border-gray-100`}>
                  <div className="text-2xl mb-2">{s.icon}</div>
                  <div className="text-3xl font-bold text-gray-800">{s.value}</div>
                  <div className="text-sm text-gray-500 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
            <button onClick={() => { loadStats(); loadUsers() }}
              className="mt-4 text-sm text-[#6b2737] hover:underline">
              🔄 تحديث
            </button>
          </div>
        )}

        {/* ── USERS ── */}
        {tab === 'users' && (
          <div>
            <div className="mb-4">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="ابحث باسم المستخدم أو البريد..."
                className="w-full max-w-sm px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6b2737]/30"
              />
            </div>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {['المستخدم', 'البريد', 'الخطة', 'الأيام المتبقية', 'آخر دخول', 'الإجراءات'].map(h => (
                        <th key={h} className="px-4 py-3 text-right text-gray-600 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map(u => (
                      <tr key={u.username} className={`hover:bg-gray-50 ${!u.active ? 'opacity-50' : ''}`}>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-800">{u.username}</div>
                          <div className="text-xs text-gray-400">{u.full_name}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-xs">{u.email}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${PLAN_COLORS[u.status] || PLAN_COLORS[u.plan] || 'bg-gray-100'}`}>
                            {PLAN_LABELS[u.status] || PLAN_LABELS[u.plan] || u.plan}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {u.plan === 'paid' ? '♾️' : u.days_left !== undefined ? `${u.days_left} يوم` : '—'}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{fmtDate(u.last_login)}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => { setEditUser(u); setEditPlan(u.plan); setEditPaidUntil(u.paid_until || '') }}
                              className="text-xs bg-[#6b2737]/10 text-[#6b2737] px-2 py-1 rounded-lg hover:bg-[#6b2737]/20">
                              تعديل
                            </button>
                            {u.active && (
                              <button onClick={() => handleDeactivate(u.username)}
                                className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-lg hover:bg-red-100">
                                تعطيل
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filtered.length === 0 && (
                  <div className="text-center py-12 text-gray-400">لا يوجد مستخدمون</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── CREATE USER ── */}
        {tab === 'create' && (
          <div className="max-w-md">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-bold text-gray-800 mb-5">إنشاء مستخدم جديد</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                {[
                  { k: 'full_name', label: 'الاسم الكامل', type: 'text', placeholder: 'أحمد علي' },
                  { k: 'username', label: 'اسم المستخدم', type: 'text', placeholder: 'username', dir: 'ltr' },
                  { k: 'email', label: 'البريد الإلكتروني', type: 'email', placeholder: 'you@example.com', dir: 'ltr' },
                  { k: 'phone', label: 'الهاتف', type: 'tel', placeholder: '+961 xx xxx xxx', dir: 'ltr' },
                  { k: 'password', label: 'كلمة المرور', type: 'password', placeholder: '6 أحرف على الأقل' },
                ].map(f => (
                  <div key={f.k}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                    <input
                      type={f.type}
                      value={(newUser as any)[f.k]}
                      onChange={e => setNewUser(u => ({ ...u, [f.k]: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6b2737]/30"
                      placeholder={f.placeholder}
                      dir={f.dir || 'rtl'}
                      required={f.k !== 'phone' && f.k !== 'full_name'}
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الخطة</label>
                  <select
                    value={newUser.plan}
                    onChange={e => setNewUser(u => ({ ...u, plan: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6b2737]/30"
                  >
                    <option value="trial">تجريبي (3 أيام)</option>
                    <option value="paid">مدفوع</option>
                    <option value="admin">مشرف</option>
                  </select>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3 bg-[#6b2737] text-white rounded-xl font-semibold hover:bg-[#5a2030] disabled:opacity-60">
                  {loading ? 'جاري الإنشاء...' : 'إنشاء المستخدم'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ── RESET CODES ── */}
        {tab === 'resets' && (
          <div className="max-w-lg">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800">رموز استعادة كلمة المرور</h3>
                <button onClick={loadResets} className="text-sm text-[#6b2737] hover:underline">🔄 تحديث</button>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                عندما يطلب مستخدم استعادة كلمته، يظهر الرمز هنا. أرسله له يدوياً.
              </p>
              {resets.length === 0 ? (
                <div className="text-center py-8 text-gray-400">لا توجد طلبات استعادة نشطة</div>
              ) : (
                <div className="space-y-3">
                  {resets.map((r, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-xl">
                      <div>
                        <div className="font-medium text-gray-800">{r.username}</div>
                        <div className="text-xs text-gray-500">ينتهي: {new Date(r.expires_at).toLocaleTimeString('ar-LB')}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold tracking-widest text-[#6b2737]">{r.token}</div>
                        <button
                          onClick={() => navigator.clipboard.writeText(r.token)}
                          className="text-xs text-gray-500 hover:text-[#6b2737] mt-1">
                          نسخ
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── FEEDBACK ── */}
        {tab === 'feedback' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800">💬 تقييمات المستخدمين ({feedback.length})</h2>
              <button onClick={loadFeedback} className="text-xs text-[#6b2737] hover:underline">تحديث</button>
            </div>
            {feedback.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">لا توجد تقييمات بعد</p>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {feedback.map((f, i) => (
                  <div key={i} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-lg ${f.rating === 'up' ? '👍' : '👎'}`}>{f.rating === 'up' ? '👍' : '👎'}</span>
                      <span className="text-xs text-gray-500">{f.username} · {fmtTs(f.timestamp)}</span>
                      {f.confidence && <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{f.confidence}</span>}
                    </div>
                    <p className="text-sm text-gray-700 font-medium mb-1 line-clamp-2">❓ {f.question}</p>
                    <p className="text-xs text-gray-500 line-clamp-3">{f.answer}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ESCALATIONS ── */}
        {tab === 'escalations' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800">🤝 طلبات التصعيد ({escalations.length})</h2>
              <button onClick={loadEscalations} className="text-xs text-[#6b2737] hover:underline">تحديث</button>
            </div>
            {escalations.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">لا توجد طلبات بعد</p>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {escalations.map((e, i) => (
                  <div key={i} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-[#6b2737]">{e.request_type?.replace('_', ' ')}</span>
                      <span className="text-xs text-gray-500">{fmtTs(e.timestamp)}</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-1 line-clamp-2">{e.question}</p>
                    <div className="flex gap-3 mt-1">
                      {e.user_email && <span className="text-xs text-blue-600">✉️ {e.user_email}</span>}
                      {e.user_phone && <span className="text-xs text-green-600">📱 {e.user_phone}</span>}
                      <span className="text-xs text-gray-500">@{e.username}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── CONTENT GAPS ── */}
        {tab === 'gaps' && (
          <div className="space-y-4">
            {/* Stats cards */}
            {gapStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'الإجمالي',      val: gapStats.total,        bg: 'bg-white' },
                  { label: 'مفتوحة',        val: gapStats.open,         bg: 'bg-red-50' },
                  { label: 'قيد المراجعة', val: gapStats.in_review,    bg: 'bg-yellow-50' },
                  { label: 'أولوية عالية', val: gapStats.high_priority, bg: 'bg-orange-50' },
                ].map(s => (
                  <div key={s.label} className={`${s.bg} rounded-2xl p-4 border border-gray-100 shadow-sm`}>
                    <div className="text-2xl font-bold text-gray-800">{s.val}</div>
                    <div className="text-xs text-gray-500 mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Filter bar */}
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { k: 'open',      label: '🔴 مفتوح' },
                { k: 'in_review', label: '🟡 قيد المراجعة' },
                { k: 'resolved',  label: '✅ محلول' },
                { k: 'ignored',   label: '⏭️ متجاهَل' },
              ].map(f => (
                <button key={f.k}
                  onClick={() => { setGapFilter(f.k); loadContentGaps(f.k) }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    gapFilter === f.k
                      ? 'bg-[#6b2737] text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}>
                  {f.label}
                </button>
              ))}
              <button onClick={() => loadContentGaps(gapFilter)}
                className="text-xs text-[#6b2737] hover:underline mr-auto">
                {loading ? '...' : '🔄 تحديث'}
              </button>
            </div>

            {/* Gaps list */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {loading && contentGaps.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-sm">جاري التحميل...</div>
              ) : contentGaps.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-sm">لا توجد ثغرات بهذا الفلتر</div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {contentGaps.map(gap => {
                    const priorityColor =
                      gap.priority === 'critical' ? 'bg-red-100 text-red-800' :
                      gap.priority === 'high'     ? 'bg-red-50 text-red-700' :
                      gap.priority === 'medium'   ? 'bg-yellow-50 text-yellow-700' :
                                                    'bg-gray-50 text-gray-600'
                    const gapTypeLabel: Record<string, string> = {
                      low_confidence:      'ثقة منخفضة',
                      user_reported_error: 'خطأ مُبلَّغ',
                      missing_procedure:   'إجراء مفقود',
                      missing_form:        'نموذج مفقود',
                      missing_fee:         'رسوم مفقودة',
                      unclear_authority:   'جهة غير واضحة',
                    }
                    return (
                      <div key={gap.id} className="p-4 hover:bg-gray-50/60 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 line-clamp-2">{gap.user_question}</p>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColor}`}>
                                {gap.priority}
                              </span>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                                {gapTypeLabel[gap.gap_type] || gap.gap_type}
                              </span>
                              {gap.detected_country && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                  🌍 {gap.detected_country}
                                </span>
                              )}
                              {gap.detected_procedure && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">
                                  📋 {gap.detected_procedure}
                                </span>
                              )}
                              {gap.confidence_score != null && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                                  ثقة {(gap.confidence_score * 100).toFixed(0)}%
                                </span>
                              )}
                            </div>
                            {gap.admin_notes && (
                              <p className="text-xs text-gray-500 mt-1.5 italic">📝 {gap.admin_notes}</p>
                            )}
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-xs text-gray-400">{gap.username ? `@${gap.username}` : 'نظام'}</span>
                              {gap.created_at && (
                                <span className="text-xs text-gray-400">
                                  · {new Date(gap.created_at).toLocaleDateString('ar-LB')}
                                </span>
                              )}
                            </div>
                          </div>
                          {/* Action buttons */}
                          <div className="flex flex-col gap-1.5 shrink-0">
                            {(gap.status === 'open') && (
                              <button onClick={() => handleGapUpdate(gap.id, 'in_review')}
                                className="text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded-lg hover:bg-yellow-100 whitespace-nowrap">
                                مراجعة
                              </button>
                            )}
                            {(gap.status === 'open' || gap.status === 'in_review') && (
                              <>
                                <button onClick={() => handleGapUpdate(gap.id, 'resolved')}
                                  className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-lg hover:bg-green-100 whitespace-nowrap">
                                  حُلّ ✓
                                </button>
                                <button onClick={() => handleGapUpdate(gap.id, 'ignored')}
                                  className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-lg hover:bg-gray-200 whitespace-nowrap">
                                  تجاهل
                                </button>
                              </>
                            )}
                            {(gap.status === 'resolved' || gap.status === 'ignored') && (
                              <button onClick={() => handleGapUpdate(gap.id, 'open')}
                                className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-lg hover:bg-gray-200 whitespace-nowrap">
                                إعادة فتح
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-700">
              💡 الثغرات تُسجَّل تلقائياً عند انخفاض ثقة الاسترجاع أو تقييم المستخدم بـ 👎. لإضافة بيانات رسمية: حدّث <code className="bg-blue-100 px-1 rounded">procedures.ts</code> أو أضف chunks جديدة إلى Qdrant.
            </div>
          </div>
        )}
      </div>

      {/* ── EDIT MODAL ── */}
      {editUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-gray-800 mb-4">تعديل: {editUser.username}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الخطة</label>
                <select value={editPlan} onChange={e => setEditPlan(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6b2737]/30">
                  <option value="trial">تجريبي</option>
                  <option value="paid">مدفوع</option>
                  <option value="admin">مشرف</option>
                  <option value="suspended">موقوف</option>
                </select>
              </div>
              {editPlan === 'paid' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">مدفوع حتى تاريخ</label>
                  <input type="date" value={editPaidUntil} onChange={e => setEditPaidUntil(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6b2737]/30"
                    dir="ltr" />
                </div>
              )}
              <div className="flex gap-3 mt-2">
                <button onClick={handleUpdate} disabled={loading}
                  className="flex-1 py-2.5 bg-[#6b2737] text-white rounded-xl font-semibold hover:bg-[#5a2030] disabled:opacity-60">
                  {loading ? 'جاري الحفظ...' : 'حفظ'}
                </button>
                <button onClick={() => setEditUser(null)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200">
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
