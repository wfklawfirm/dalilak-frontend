'use client'
import React, { useState, useEffect, useCallback, useRef } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL || 'https://dalilak-backend-bvb9.onrender.com'

// ── Types ──────────────────────────────────────────────────────
interface User {
  username: string; email: string; full_name: string; phone: string
  plan: string; status: string; days_left: number | null
  active: boolean; created_at: string; last_login: string | null; paid_until: string | null
}
interface Stats {
  total: number; paid: number; trial_active: number; trial_expired: number
  suspended: number; conversion_rate: string
}
interface UserLogs {
  username: string; total_queries: number; chat_count: number
  analyze_count: number; avg_response_ms: number
  logs: Array<{ type: string; timestamp: string; elapsed_ms: number }>
}
interface AllLogs {
  total_queries: number; chat_count: number; analyze_count: number
  avg_response_ms: number; daily_activity: Record<string, number>
  top_users: Array<{ username: string; count: number }>
}

// ── Helpers ────────────────────────────────────────────────────
const planColor: Record<string, { bg: string; text: string; label: string }> = {
  paid:    { bg: '#F0FDF4', text: '#15803D', label: 'مدفوع' },
  trial:   { bg: '#FFFBEB', text: '#92400E', label: 'تجريبي' },
  admin:   { bg: '#F5F3FF', text: '#6D28D9', label: 'مشرف' },
  expired: { bg: '#FEF2F2', text: '#991B1B', label: 'منتهي' },
  guest:   { bg: '#F9FAFB', text: '#6B7280', label: 'ضيف' },
}
const fmtDate = (s: string | null) => {
  if (!s) return '—'
  try { return new Date(s).toLocaleDateString('ar-LB', { day: '2-digit', month: 'short', year: 'numeric' }) }
  catch { return s }
}
const fmtTime = (s: string) => {
  try { return new Date(s).toLocaleString('ar-LB', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }) }
  catch { return s }
}

// ── Stat Card ──────────────────────────────────────────────────
function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 14, padding: '20px 22px',
      border: '1px solid #F0EAEA', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      borderTop: `3px solid ${color}`,
    }}>
      <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 800, color: '#111827', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11.5, color: '#6B7280', marginTop: 5 }}>{sub}</div>}
    </div>
  )
}

// ── Plan Badge ─────────────────────────────────────────────────
function PlanBadge({ plan, status }: { plan: string; status: string }) {
  const key = status === 'expired' ? 'expired' : plan
  const c = planColor[key] || planColor.guest
  return (
    <span style={{ padding: '3px 10px', borderRadius: 999, background: c.bg, fontSize: 11, fontWeight: 700, color: c.text }}>
      {c.label}
    </span>
  )
}

// ══════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════════════════════
export default function AdminPage() {
  const [token, setToken] = useState('')
  const [authed, setAuthed] = useState(false)
  const [authErr, setAuthErr] = useState('')
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })

  const [tab, setTab] = useState<'overview' | 'users' | 'logs' | 'knowledge'>('overview')
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<Stats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [allLogs, setAllLogs] = useState<AllLogs | null>(null)
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState('all')

  // User detail modal
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [userLogs, setUserLogs] = useState<UserLogs | null>(null)
  const [editPlan, setEditPlan] = useState('')
  const [extendDays, setExtendDays] = useState(7)
  const [actionMsg, setActionMsg] = useState('')

  // Knowledge base
  const [kbForm, setKbForm] = useState({ title: '', text: '', domain: '', ministry: '', website: '', phone: '', fees: '' })
  const [kbSearch, setKbSearch] = useState('')
  const [kbResults, setKbResults] = useState<any[]>([])
  const [kbCount, setKbCount] = useState<number | null>(null)
  const [kbMsg, setKbMsg] = useState('')
  const [kbFile, setKbFile] = useState<{ name: string; type: string; base64: string } | null>(null)
  const [kbExtractLoading, setKbExtractLoading] = useState(false)
  const [kbExtractedEntries, setKbExtractedEntries] = useState<any[]>([])
  const [kbSavingIdx, setKbSavingIdx] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Auth ────────────────────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem('dalilak_token')
    if (saved) { setToken(saved); setAuthed(true) }
  }, [])

  const doLogin = async () => {
    setAuthErr('')
    try {
      const r = await fetch(`${API}/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      })
      const d = await r.json()
      if (!r.ok) { setAuthErr(d.detail || 'خطأ في الدخول'); return }
      if (d.user?.plan !== 'admin') { setAuthErr('هذا الحساب لا يملك صلاحية المشرف'); return }
      localStorage.setItem('dalilak_token', d.token)
      setToken(d.token); setAuthed(true)
    } catch { setAuthErr('خطأ في الاتصال') }
  }

  const authHeader = useCallback(() => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }), [token])

  // ── Data loading ────────────────────────────────────────────
  const loadStats = useCallback(async () => {
    const r = await fetch(`${API}/admin/stats`, { headers: authHeader() })
    if (r.ok) setStats(await r.json())
  }, [authHeader])

  const loadUsers = useCallback(async () => {
    const r = await fetch(`${API}/admin/users`, { headers: authHeader() })
    if (r.ok) { const d = await r.json(); setUsers(d.users || []) }
  }, [authHeader])

  const loadAllLogs = useCallback(async () => {
    const r = await fetch(`${API}/admin/logs`, { headers: authHeader() })
    if (r.ok) setAllLogs(await r.json())
  }, [authHeader])

  const loadKbCount = useCallback(async () => {
    const r = await fetch(`${API}/admin/knowledge/count`, { headers: authHeader() })
    if (r.ok) { const d = await r.json(); setKbCount(d.points_count) }
  }, [authHeader])

  useEffect(() => {
    if (!authed) return
    setLoading(true)
    Promise.all([loadStats(), loadUsers()]).finally(() => setLoading(false))
  }, [authed, loadStats, loadUsers])

  useEffect(() => {
    if (authed && tab === 'logs') loadAllLogs()
    if (authed && tab === 'knowledge') loadKbCount()
  }, [authed, tab, loadAllLogs, loadKbCount])

  // ── User actions ────────────────────────────────────────────
  const openUser = async (u: User) => {
    setSelectedUser(u); setEditPlan(u.plan); setActionMsg(''); setUserLogs(null)
    const r = await fetch(`${API}/admin/users/${u.username}/logs`, { headers: authHeader() })
    if (r.ok) setUserLogs(await r.json())
  }

  const updateUser = async (update: object) => {
    if (!selectedUser) return
    setActionMsg('')
    const r = await fetch(`${API}/admin/users/${selectedUser.username}`, {
      method: 'PUT', headers: authHeader(),
      body: JSON.stringify(update),
    })
    const d = await r.json()
    if (r.ok) {
      setActionMsg('✓ ' + d.message)
      await loadUsers(); await loadStats()
      const updated = (await fetch(`${API}/admin/users`, { headers: authHeader() }).then(x => x.json())).users
      const u = updated?.find((x: User) => x.username === selectedUser.username)
      if (u) { setSelectedUser(u); setEditPlan(u.plan) }
    } else {
      setActionMsg('✗ ' + (d.detail || 'خطأ'))
    }
  }

  const extendTrial = async () => {
    if (!selectedUser) return
    const r = await fetch(`${API}/admin/users/${selectedUser.username}/extend-trial`, {
      method: 'POST', headers: authHeader(),
      body: JSON.stringify({ days: extendDays }),
    })
    const d = await r.json()
    if (r.ok) { setActionMsg('✓ ' + d.message); await loadUsers() }
    else setActionMsg('✗ ' + (d.detail || 'خطأ'))
  }

  // ── Knowledge base ──────────────────────────────────────────
  const handleKbFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const result = ev.target?.result as string
      setKbFile({ name: file.name, type: file.type || 'application/octet-stream', base64: result.split(',')[1] })
      setKbExtractedEntries([])
      setKbMsg('')
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const extractFromFile = async () => {
    if (!kbFile) return
    setKbExtractLoading(true); setKbMsg(''); setKbExtractedEntries([])
    try {
      const r = await fetch(`${API}/admin/knowledge/extract`, {
        method: 'POST', headers: authHeader(),
        body: JSON.stringify({ file_base64: kbFile.base64, file_type: kbFile.type, file_name: kbFile.name }),
      })
      const d = await r.json()
      if (r.ok) {
        setKbExtractedEntries(d.entries || [])
        if ((d.entries || []).length === 0) setKbMsg('لم يُستخرج أي محتوى من الملف')
      } else setKbMsg('✗ ' + (d.detail || 'خطأ في الاستخراج'))
    } catch { setKbMsg('✗ خطأ في الاتصال') }
    finally { setKbExtractLoading(false) }
  }

  const saveExtractedEntry = async (entry: any, idx: number) => {
    setKbSavingIdx(idx)
    const r = await fetch(`${API}/admin/knowledge/add`, {
      method: 'POST', headers: authHeader(), body: JSON.stringify(entry),
    })
    const d = await r.json()
    if (r.ok) {
      setKbExtractedEntries(prev => prev.map((e, i) => i === idx ? { ...e, _saved: true } : e))
      loadKbCount()
    } else setKbMsg('✗ ' + (d.detail || 'خطأ'))
    setKbSavingIdx(null)
  }

  const submitKb = async () => {
    setKbMsg('')
    if (!kbForm.title.trim() || !kbForm.text.trim()) { setKbMsg('العنوان والنص مطلوبان'); return }
    const r = await fetch(`${API}/admin/knowledge/add`, {
      method: 'POST', headers: authHeader(), body: JSON.stringify(kbForm),
    })
    const d = await r.json()
    if (r.ok) {
      setKbMsg('✓ ' + d.message)
      setKbForm({ title: '', text: '', domain: '', ministry: '', website: '', phone: '', fees: '' })
      loadKbCount()
    } else setKbMsg('✗ ' + (d.detail || 'خطأ'))
  }

  const searchKb = async () => {
    if (!kbSearch.trim()) return
    const r = await fetch(`${API}/admin/knowledge/search?q=${encodeURIComponent(kbSearch)}`, { headers: authHeader() })
    if (r.ok) { const d = await r.json(); setKbResults(d.results || []) }
  }

  // ── Filtered users ──────────────────────────────────────────
  const filteredUsers = users.filter(u => {
    const q = search.toLowerCase()
    const matchSearch = !q || u.username.includes(q) || u.email.includes(q) || (u.full_name || '').toLowerCase().includes(q)
    const matchPlan = planFilter === 'all' || u.plan === planFilter || (planFilter === 'expired' && u.status === 'expired')
    return matchSearch && matchPlan
  })

  // ── Login Screen ────────────────────────────────────────────
  if (!authed) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9FAFB', fontFamily: "'Tajawal', sans-serif", direction: 'rtl' }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: '44px 40px', width: 380, boxShadow: '0 8px 40px rgba(0,0,0,0.1)', border: '1px solid #F0EAEA' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg,#8B1A1A,#C41E1E)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', boxShadow: '0 4px 14px rgba(139,26,26,0.3)' }}>
            <span style={{ fontSize: 22, color: '#fff', fontWeight: 900 }}>د</span>
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#111827' }}>لوحة الإدارة</div>
          <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>دليلك AI · للمشرفين فقط</div>
        </div>
        {authErr && <div style={{ background: '#FEF2F2', color: '#991B1B', fontSize: 13, padding: '10px 14px', borderRadius: 9, marginBottom: 16, border: '1px solid #FCA5A5' }}>{authErr}</div>}
        {(['username', 'password'] as const).map(k => (
          <div key={k} style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: '#6B7280', fontWeight: 600, display: 'block', marginBottom: 5 }}>{k === 'username' ? 'اسم المستخدم' : 'كلمة المرور'}</label>
            <input
              type={k === 'password' ? 'password' : 'text'}
              value={loginForm[k]}
              onChange={e => setLoginForm(p => ({ ...p, [k]: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && doLogin()}
              style={{ width: '100%', padding: '11px 13px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none' }}
            />
          </div>
        ))}
        <button onClick={doLogin} style={{ width: '100%', padding: '13px 0', background: 'linear-gradient(135deg,#8B1A1A,#C41E1E)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 3px 12px rgba(139,26,26,0.3)', marginTop: 4 }}>
          دخول
        </button>
      </div>
    </div>
  )

  const TABS = [
    { id: 'overview', label: '📊 نظرة عامة' },
    { id: 'users',    label: '👥 المستخدمون' },
    { id: 'logs',     label: '📈 التقارير' },
    { id: 'knowledge', label: '🧠 قاعدة المعرفة' },
  ] as const

  return (
    <div style={{ minHeight: '100vh', background: '#F7F5F5', fontFamily: "'Tajawal', sans-serif", direction: 'rtl' }}>
      {/* Header */}
      <header style={{ background: '#fff', borderBottom: '1px solid #F0EAEA', boxShadow: '0 1px 0 #F0EAEA' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#8B1A1A,#C41E1E)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 14, color: '#fff', fontWeight: 900 }}>د</span>
            </div>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#111827' }}>دليلك AI</span>
            <span style={{ fontSize: 11, color: '#9CA3AF', background: '#F3F4F6', padding: '2px 8px', borderRadius: 6, fontWeight: 600 }}>ADMIN</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <a href="/" style={{ fontSize: 12, color: '#6B7280', textDecoration: 'none' }}>← العودة للموقع</a>
            <button onClick={() => { localStorage.removeItem('dalilak_token'); setAuthed(false); setToken('') }}
              style={{ fontSize: 12, color: '#991B1B', background: '#FEF2F2', border: '1px solid #FCA5A5', padding: '5px 12px', borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit' }}>
              خروج
            </button>
          </div>
        </div>
        {/* Tab bar */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', gap: 4 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ padding: '10px 18px', fontSize: 13, fontWeight: tab === t.id ? 700 : 500, color: tab === t.id ? '#8B1A1A' : '#6B7280', background: 'none', border: 'none', borderBottom: tab === t.id ? '2.5px solid #8B1A1A' : '2.5px solid transparent', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px' }}>

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#111827', marginBottom: 20 }}>نظرة عامة</div>
            {loading ? <div style={{ textAlign: 'center', color: '#9CA3AF', padding: 60 }}>جارٍ التحميل...</div> : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
                  <StatCard label="إجمالي المستخدمين" value={stats?.total ?? 0} color="#8B1A1A" />
                  <StatCard label="مشتركون مدفوعون" value={stats?.paid ?? 0} sub={`معدل التحويل ${stats?.conversion_rate}`} color="#15803D" />
                  <StatCard label="تجريبي نشط" value={stats?.trial_active ?? 0} color="#D97706" />
                  <StatCard label="تجريبي منتهي" value={stats?.trial_expired ?? 0} color="#DC2626" />
                  <StatCard label="موقوف" value={stats?.suspended ?? 0} color="#6B7280" />
                </div>
                {/* Recent users */}
                <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #F0EAEA', overflow: 'hidden' }}>
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid #F9F5F5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>آخر المستخدمين</span>
                    <button onClick={() => setTab('users')} style={{ fontSize: 12, color: '#8B1A1A', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>عرض الكل ←</button>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#FAFAFA' }}>
                        {['الاسم', 'البريد', 'الخطة', 'تاريخ التسجيل'].map(h => (
                          <th key={h} style={{ padding: '10px 16px', fontSize: 11, color: '#9CA3AF', fontWeight: 600, textAlign: 'right', textTransform: 'uppercase' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {users.slice(0, 8).map((u, i) => (
                        <tr key={u.username} style={{ borderTop: '1px solid #F9F5F5', background: i % 2 === 0 ? '#fff' : '#FDFCFC' }}>
                          <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#111827' }}>{u.full_name || u.username}</td>
                          <td style={{ padding: '12px 16px', fontSize: 12, color: '#6B7280', direction: 'ltr', textAlign: 'right' }}>{u.email}</td>
                          <td style={{ padding: '12px 16px' }}><PlanBadge plan={u.plan} status={u.status} /></td>
                          <td style={{ padding: '12px 16px', fontSize: 12, color: '#9CA3AF' }}>{fmtDate(u.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── USERS ── */}
        {tab === 'users' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#111827' }}>إدارة المستخدمين <span style={{ fontSize: 14, color: '#9CA3AF', fontWeight: 400 }}>({filteredUsers.length})</span></div>
              <button onClick={() => { loadUsers(); loadStats() }} style={{ fontSize: 12, color: '#6B7280', background: '#F9FAFB', border: '1px solid #E5E7EB', padding: '7px 14px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit' }}>🔄 تحديث</button>
            </div>
            {/* Filters */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="🔍 بحث بالاسم أو البريد..."
                style={{ flex: 1, minWidth: 220, padding: '9px 14px', border: '1.5px solid #E5E7EB', borderRadius: 9, fontSize: 13, fontFamily: 'inherit', outline: 'none' }}
              />
              {['all', 'paid', 'trial', 'admin', 'expired'].map(p => (
                <button key={p} onClick={() => setPlanFilter(p)}
                  style={{ padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: planFilter === p ? 700 : 500, cursor: 'pointer', fontFamily: 'inherit', border: planFilter === p ? '1.5px solid #8B1A1A' : '1.5px solid #E5E7EB', background: planFilter === p ? '#FDF4F4' : '#fff', color: planFilter === p ? '#8B1A1A' : '#6B7280' }}>
                  {p === 'all' ? 'الكل' : p === 'paid' ? 'مدفوع' : p === 'trial' ? 'تجريبي' : p === 'admin' ? 'مشرف' : 'منتهي'}
                </button>
              ))}
            </div>
            {/* Table */}
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #F0EAEA', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#FAFAFA' }}>
                    {['المستخدم', 'البريد', 'الهاتف', 'الخطة', 'آخر دخول', 'الإجراءات'].map(h => (
                      <th key={h} style={{ padding: '11px 14px', fontSize: 11, color: '#9CA3AF', fontWeight: 700, textAlign: 'right', letterSpacing: '0.04em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u, i) => (
                    <tr key={u.username} style={{ borderTop: '1px solid #F9F5F5', background: !u.active ? '#FFFAFA' : i % 2 === 0 ? '#fff' : '#FDFCFC' }}>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: !u.active ? '#9CA3AF' : '#111827' }}>{u.full_name || u.username}</div>
                        <div style={{ fontSize: 11, color: '#9CA3AF' }}>@{u.username}</div>
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: 12, color: '#6B7280', direction: 'ltr', textAlign: 'right' }}>{u.email}</td>
                      <td style={{ padding: '12px 14px', fontSize: 12, color: '#6B7280', direction: 'ltr' }}>{u.phone || '—'}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <PlanBadge plan={u.plan} status={u.status} />
                        {u.plan === 'trial' && u.days_left !== null && (
                          <div style={{ fontSize: 10, color: u.days_left < 1 ? '#DC2626' : '#D97706', marginTop: 3 }}>
                            {u.days_left > 0 ? `${u.days_left} يوم متبقٍّ` : 'منتهي'}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: 12, color: '#9CA3AF' }}>{fmtDate(u.last_login)}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <button onClick={() => openUser(u)}
                          style={{ fontSize: 11.5, color: '#8B1A1A', background: '#FDF4F4', border: '1px solid #EDD0D0', padding: '5px 11px', borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
                          إدارة
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div style={{ padding: '40px 0', textAlign: 'center', color: '#9CA3AF' }}>لا توجد نتائج</div>
              )}
            </div>
          </div>
        )}

        {/* ── LOGS / ANALYTICS ── */}
        {tab === 'logs' && (
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#111827', marginBottom: 20 }}>التقارير والإحصائيات</div>
            {!allLogs ? (
              <div style={{ textAlign: 'center', color: '#9CA3AF', padding: 60 }}>جارٍ التحميل...</div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
                  <StatCard label="إجمالي الاستعلامات" value={allLogs.total_queries} color="#8B1A1A" />
                  <StatCard label="محادثات" value={allLogs.chat_count} color="#3B82F6" />
                  <StatCard label="تحليل وثائق" value={allLogs.analyze_count} color="#8B5CF6" />
                  <StatCard label="متوسط وقت الاستجابة" value={`${allLogs.avg_response_ms} ms`} color="#10B981" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  {/* Daily activity */}
                  <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #F0EAEA', padding: '20px 22px' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 16 }}>النشاط اليومي (14 يوم)</div>
                    {Object.entries(allLogs.daily_activity).sort().map(([day, count]) => {
                      const max = Math.max(...Object.values(allLogs.daily_activity))
                      return (
                        <div key={day} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                          <div style={{ fontSize: 11, color: '#9CA3AF', width: 80, flexShrink: 0, direction: 'ltr' }}>{day.slice(5)}</div>
                          <div style={{ flex: 1, height: 8, background: '#F3F4F6', borderRadius: 4, overflow: 'hidden' }}>
                            <div style={{ height: '100%', background: 'linear-gradient(90deg,#8B1A1A,#C41E1E)', borderRadius: 4, width: `${max > 0 ? Math.round(count / max * 100) : 0}%`, transition: 'width 0.4s ease' }} />
                          </div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', width: 28, textAlign: 'center' }}>{count}</div>
                        </div>
                      )
                    })}
                    {Object.keys(allLogs.daily_activity).length === 0 && <div style={{ color: '#9CA3AF', fontSize: 13 }}>لا توجد بيانات</div>}
                  </div>
                  {/* Top users */}
                  <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #F0EAEA', padding: '20px 22px' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 16 }}>الأكثر استخداماً</div>
                    {allLogs.top_users.map((u, i) => (
                      <div key={u.username} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < allLogs.top_users.length - 1 ? '1px solid #F9F5F5' : 'none' }}>
                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: i < 3 ? 'linear-gradient(135deg,#8B1A1A,#C41E1E)' : '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: i < 3 ? '#fff' : '#6B7280', fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                        <div style={{ flex: 1, fontSize: 13, color: '#374151', fontWeight: 500 }}>{u.username}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#8B1A1A' }}>{u.count}</div>
                      </div>
                    ))}
                    {allLogs.top_users.length === 0 && <div style={{ color: '#9CA3AF', fontSize: 13 }}>لا توجد بيانات</div>}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── KNOWLEDGE BASE ── */}
        {tab === 'knowledge' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#111827' }}>قاعدة المعرفة</div>
              {kbCount !== null && (
                <div style={{ background: '#FDF4F4', border: '1px solid #EDD0D0', borderRadius: 8, padding: '4px 12px', fontSize: 12, fontWeight: 700, color: '#8B1A1A' }}>
                  {kbCount.toLocaleString()} نقطة معلومات
                </div>
              )}
            </div>

            {/* ── File Upload Section ── */}
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #F0EAEA', padding: '22px 24px', marginBottom: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 6 }}>📂 استخراج من ملف</div>
              <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 16 }}>PDF · Word · Excel · CSV · صور · نصوص — يُحلَّل بالذكاء الاصطناعي ويُقترح تلقائياً</div>
              <input ref={fileInputRef} type="file" onChange={handleKbFile} style={{ display: 'none' }}
                accept=".pdf,.doc,.docx,.xlsx,.xls,.csv,.txt,.png,.jpg,.jpeg,.webp,.gif,.bmp" />
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => fileInputRef.current?.click()}
                  style={{ padding: '9px 18px', background: '#F9FAFB', border: '1.5px dashed #D1D5DB', borderRadius: 10, fontSize: 13, color: '#374151', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}>
                  📎 {kbFile ? kbFile.name : 'اختر ملفاً...'}
                </button>
                {kbFile && (
                  <>
                    <button onClick={extractFromFile} disabled={kbExtractLoading}
                      style={{ padding: '9px 20px', background: kbExtractLoading ? '#E5E7EB' : 'linear-gradient(135deg,#8B1A1A,#C41E1E)', color: kbExtractLoading ? '#9CA3AF' : '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: kbExtractLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                      {kbExtractLoading ? '⏳ جارٍ التحليل...' : '🧠 تحليل واستخراج'}
                    </button>
                    <button onClick={() => { setKbFile(null); setKbExtractedEntries([]) }}
                      style={{ padding: '9px 14px', background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', borderRadius: 10, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                      ✕ إلغاء
                    </button>
                  </>
                )}
              </div>

              {/* Extracted entries */}
              {kbExtractedEntries.length > 0 && (
                <div style={{ marginTop: 18 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 12 }}>
                    ✨ اقتراحات مستخرجة ({kbExtractedEntries.length}) — راجعها وأضف ما يناسب:
                  </div>
                  {kbExtractedEntries.map((entry, idx) => (
                    <div key={idx} style={{ background: entry._saved ? '#F0FDF4' : '#FAFAFA', border: `1px solid ${entry._saved ? '#BBF7D0' : '#E5E7EB'}`, borderRadius: 12, padding: '16px 18px', marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                        <div style={{ flex: 1 }}>
                          <input value={entry.title} onChange={e => setKbExtractedEntries(prev => prev.map((x, i) => i === idx ? { ...x, title: e.target.value } : x))}
                            style={{ width: '100%', padding: '7px 11px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', fontWeight: 700, boxSizing: 'border-box', marginBottom: 8 }} />
                          <textarea value={entry.text} rows={4} onChange={e => setKbExtractedEntries(prev => prev.map((x, i) => i === idx ? { ...x, text: e.target.value } : x))}
                            style={{ width: '100%', padding: '7px 11px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 12, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} />
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 10 }}>
                        {(['domain', 'ministry', 'fees'] as const).map(k => (
                          <input key={k} value={(entry as any)[k]} placeholder={k === 'domain' ? 'القطاع' : k === 'ministry' ? 'الجهة' : 'الرسوم'}
                            onChange={e => setKbExtractedEntries(prev => prev.map((x, i) => i === idx ? { ...x, [k]: e.target.value } : x))}
                            style={{ padding: '6px 10px', border: '1.5px solid #E5E7EB', borderRadius: 7, fontSize: 12, fontFamily: 'inherit' }} />
                        ))}
                        {(['website', 'phone'] as const).map(k => (
                          <input key={k} value={(entry as any)[k]} placeholder={k === 'website' ? 'الموقع' : 'الهاتف'} dir="ltr"
                            onChange={e => setKbExtractedEntries(prev => prev.map((x, i) => i === idx ? { ...x, [k]: e.target.value } : x))}
                            style={{ padding: '6px 10px', border: '1.5px solid #E5E7EB', borderRadius: 7, fontSize: 12, fontFamily: 'inherit' }} />
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {entry._saved ? (
                          <span style={{ fontSize: 13, color: '#15803D', fontWeight: 700 }}>✓ تمت الإضافة للقاعدة</span>
                        ) : (
                          <>
                            <button onClick={() => saveExtractedEntry(entry, idx)} disabled={kbSavingIdx === idx}
                              style={{ padding: '7px 18px', background: '#8B1A1A', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                              {kbSavingIdx === idx ? '...' : '💾 حفظ في القاعدة'}
                            </button>
                            <button onClick={() => setKbForm({ title: entry.title, text: entry.text, domain: entry.domain, ministry: entry.ministry, website: entry.website, phone: entry.phone, fees: entry.fees })}
                              style={{ padding: '7px 14px', background: '#F3F4F6', border: '1px solid #E5E7EB', color: '#374151', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                              تعديل يدوي
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {kbMsg && <div style={{ marginTop: 10, padding: '8px 13px', borderRadius: 8, background: kbMsg.startsWith('✗') ? '#FEF2F2' : '#F0FDF4', color: kbMsg.startsWith('✗') ? '#991B1B' : '#15803D', fontSize: 13, border: `1px solid ${kbMsg.startsWith('✗') ? '#FCA5A5' : '#BBF7D0'}` }}>{kbMsg}</div>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 20 }}>
              {/* Add form */}
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #F0EAEA', padding: '22px 24px' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 18 }}>✏️ إضافة يدوية</div>
                {[
                  { key: 'title', label: 'العنوان *', placeholder: 'مثال: استخراج جواز سفر لبناني', rows: 1 },
                  { key: 'text',  label: 'النص الكامل *', placeholder: 'الخطوات، الوثائق، الشروط...', rows: 5 },
                  { key: 'domain', label: 'القطاع', placeholder: 'مثال: سفر، عقارات، شركات...', rows: 1 },
                  { key: 'ministry', label: 'الجهة المختصة', placeholder: 'مثال: وزارة الداخلية', rows: 1 },
                  { key: 'website', label: 'الموقع الإلكتروني', placeholder: 'https://...', rows: 1 },
                  { key: 'phone', label: 'الهاتف', placeholder: '+961 ...', rows: 1 },
                  { key: 'fees',  label: 'الرسوم', placeholder: 'مثال: 50,000 ل.ل', rows: 1 },
                ].map(({ key, label, placeholder, rows }) => (
                  <div key={key} style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 12, color: '#6B7280', fontWeight: 600, display: 'block', marginBottom: 4 }}>{label}</label>
                    {rows > 1 ? (
                      <textarea
                        value={(kbForm as any)[key]}
                        onChange={e => setKbForm(p => ({ ...p, [key]: e.target.value }))}
                        placeholder={placeholder} rows={rows}
                        style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 9, fontSize: 13, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box', outline: 'none' }}
                      />
                    ) : (
                      <input
                        value={(kbForm as any)[key]}
                        onChange={e => setKbForm(p => ({ ...p, [key]: e.target.value }))}
                        placeholder={placeholder}
                        dir={key === 'website' || key === 'phone' ? 'ltr' : 'rtl'}
                        style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 9, fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none' }}
                      />
                    )}
                  </div>
                ))}
                {kbMsg && <div style={{ padding: '9px 13px', borderRadius: 9, background: kbMsg.startsWith('✓') ? '#F0FDF4' : '#FEF2F2', color: kbMsg.startsWith('✓') ? '#15803D' : '#991B1B', fontSize: 13, marginBottom: 12, border: `1px solid ${kbMsg.startsWith('✓') ? '#BBF7D0' : '#FCA5A5'}` }}>{kbMsg}</div>}
                <button onClick={submitKb} style={{ width: '100%', padding: '12px 0', background: 'linear-gradient(135deg,#8B1A1A,#C41E1E)', color: '#fff', border: 'none', borderRadius: 11, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 2px 10px rgba(139,26,26,0.25)' }}>
                  حفظ في قاعدة المعلومات
                </button>
              </div>

              {/* Search */}
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #F0EAEA', padding: '22px 24px' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 16 }}>🔍 البحث في القاعدة</div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  <input
                    value={kbSearch}
                    onChange={e => setKbSearch(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && searchKb()}
                    placeholder="ابحث بالموضوع..."
                    style={{ flex: 1, padding: '10px 13px', border: '1.5px solid #E5E7EB', borderRadius: 9, fontSize: 13, fontFamily: 'inherit', outline: 'none' }}
                  />
                  <button onClick={searchKb} style={{ padding: '10px 18px', background: '#8B1A1A', color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>بحث</button>
                </div>
                <div style={{ maxHeight: 480, overflowY: 'auto' }}>
                  {kbResults.map((r: any, i: number) => (
                    <div key={i} style={{ padding: '13px 14px', borderRadius: 10, background: '#FAFAFA', border: '1px solid #F0EAEA', marginBottom: 9 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 5 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', flex: 1 }}>{r.title}</div>
                        <div style={{ fontSize: 10, background: '#FDF4F4', color: '#8B1A1A', padding: '2px 7px', borderRadius: 5, fontWeight: 700, flexShrink: 0 }}>{r.score}</div>
                      </div>
                      {r.ministry && <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 3 }}>📍 {r.ministry}</div>}
                      {r.domain && <div style={{ fontSize: 11, color: '#9CA3AF' }}>🏷️ {r.domain}</div>}
                      <div style={{ fontSize: 12, color: '#4B5563', marginTop: 6, lineHeight: 1.6 }}>{r.text?.slice(0, 150)}{r.text?.length > 150 ? '...' : ''}</div>
                    </div>
                  ))}
                  {kbResults.length === 0 && kbSearch && <div style={{ color: '#9CA3AF', fontSize: 13, textAlign: 'center', padding: 30 }}>لا توجد نتائج</div>}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── USER MODAL ── */}
      {selectedUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setSelectedUser(null) }}>
          <div style={{ background: '#fff', borderRadius: 18, width: '100%', maxWidth: 680, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            {/* Modal header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #F0EAEA', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#fff', borderRadius: '18px 18px 0 0' }}>
              <div>
                <div style={{ fontSize: 17, fontWeight: 800, color: '#111827' }}>{selectedUser.full_name || selectedUser.username}</div>
                <div style={{ fontSize: 12, color: '#9CA3AF' }}>@{selectedUser.username} · {selectedUser.email}</div>
              </div>
              <button onClick={() => setSelectedUser(null)} style={{ width: 32, height: 32, borderRadius: '50%', background: '#F3F4F6', border: 'none', cursor: 'pointer', fontSize: 16, color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>
            <div style={{ padding: '22px 24px' }}>
              {/* User info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 22 }}>
                {[
                  { label: 'الحالة', value: selectedUser.active ? '🟢 نشط' : '🔴 موقوف' },
                  { label: 'الخطة', value: <PlanBadge plan={selectedUser.plan} status={selectedUser.status} /> },
                  { label: 'تاريخ التسجيل', value: fmtDate(selectedUser.created_at) },
                  { label: 'آخر دخول', value: fmtDate(selectedUser.last_login) },
                  { label: 'الهاتف', value: selectedUser.phone || '—' },
                  { label: 'الاشتراك حتى', value: selectedUser.plan === 'trial' ? fmtDate(selectedUser.paid_until || null) : fmtDate(selectedUser.paid_until) },
                ].map(({ label, value }) => (
                  <div key={label} style={{ background: '#FAFAFA', borderRadius: 10, padding: '11px 14px', border: '1px solid #F0EAEA' }}>
                    <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600, marginBottom: 4, letterSpacing: '0.04em' }}>{label}</div>
                    <div style={{ fontSize: 13, color: '#111827', fontWeight: 600 }}>{value}</div>
                  </div>
                ))}
              </div>

              {/* Usage stats */}
              {userLogs && (
                <div style={{ background: '#FDF4F4', borderRadius: 11, padding: '14px 16px', border: '1px solid #EDD0D0', marginBottom: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#8B1A1A', marginBottom: 10 }}>📊 إحصائيات الاستخدام</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                    {[
                      { label: 'إجمالي', value: userLogs.total_queries },
                      { label: 'محادثات', value: userLogs.chat_count },
                      { label: 'تحليل', value: userLogs.analyze_count },
                      { label: 'متوسط (ms)', value: userLogs.avg_response_ms },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: '#8B1A1A' }}>{value}</div>
                        <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600 }}>{label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                {/* Change plan */}
                <div style={{ background: '#FAFAFA', borderRadius: 11, padding: '14px 16px', border: '1px solid #F0EAEA' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 10 }}>تغيير الخطة</div>
                  <select value={editPlan} onChange={e => setEditPlan(e.target.value)}
                    style={{ width: '100%', padding: '8px 11px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', marginBottom: 8, outline: 'none', background: '#fff' }}>
                    {['trial', 'paid', 'admin'].map(p => <option key={p} value={p}>{p === 'trial' ? 'تجريبي' : p === 'paid' ? 'مدفوع' : 'مشرف'}</option>)}
                  </select>
                  <button onClick={() => updateUser({ plan: editPlan })}
                    style={{ width: '100%', padding: '8px 0', background: '#8B1A1A', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                    تطبيق
                  </button>
                </div>
                {/* Extend trial */}
                <div style={{ background: '#FAFAFA', borderRadius: 11, padding: '14px 16px', border: '1px solid #F0EAEA' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 10 }}>تمديد المهلة</div>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                    {[3, 7, 14, 30].map(d => (
                      <button key={d} onClick={() => setExtendDays(d)}
                        style={{ flex: 1, padding: '6px 0', borderRadius: 7, border: extendDays === d ? '1.5px solid #8B1A1A' : '1.5px solid #E5E7EB', background: extendDays === d ? '#FDF4F4' : '#fff', color: extendDays === d ? '#8B1A1A' : '#6B7280', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                        {d}ي
                      </button>
                    ))}
                  </div>
                  <button onClick={extendTrial}
                    style={{ width: '100%', padding: '8px 0', background: '#D97706', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                    تمديد {extendDays} أيام
                  </button>
                </div>
              </div>

              {/* Activate / Deactivate */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => updateUser({ active: !selectedUser.active })}
                  style={{ flex: 1, padding: '10px 0', background: selectedUser.active ? '#FEF2F2' : '#F0FDF4', color: selectedUser.active ? '#991B1B' : '#15803D', border: `1px solid ${selectedUser.active ? '#FCA5A5' : '#BBF7D0'}`, borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                  {selectedUser.active ? '⛔ إيقاف الحساب' : '✅ تفعيل الحساب'}
                </button>
              </div>

              {/* Action message */}
              {actionMsg && (
                <div style={{ marginTop: 12, padding: '9px 14px', borderRadius: 9, background: actionMsg.startsWith('✓') ? '#F0FDF4' : '#FEF2F2', color: actionMsg.startsWith('✓') ? '#15803D' : '#991B1B', fontSize: 13, border: `1px solid ${actionMsg.startsWith('✓') ? '#BBF7D0' : '#FCA5A5'}` }}>
                  {actionMsg}
                </div>
              )}

              {/* Recent logs */}
              {userLogs && userLogs.logs.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 10 }}>آخر الاستعلامات</div>
                  <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                    {userLogs.logs.slice(0, 15).map((log, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', borderRadius: 8, background: i % 2 === 0 ? '#FAFAFA' : '#fff', marginBottom: 2 }}>
                        <span style={{ fontSize: 11, background: '#F3F4F6', color: '#6B7280', padding: '2px 7px', borderRadius: 4, fontWeight: 600 }}>{log.type}</span>
                        <span style={{ fontSize: 11, color: '#9CA3AF', flex: 1, direction: 'ltr', textAlign: 'right' }}>{fmtTime(log.timestamp)}</span>
                        <span style={{ fontSize: 11, color: '#6B7280' }}>{log.elapsed_ms}ms</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
