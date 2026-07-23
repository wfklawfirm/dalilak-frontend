'use client'
import React, { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  isAdmin, getUser, clearToken,
  adminListUsers, adminCreateUser, adminUpdateUser, adminDeactivateUser,
  adminGetStats, adminGetResets,
  adminGetContentGaps, adminUpdateContentGap,
} from '@/lib/auth'
import { useLanguage } from '@/lib/LanguageContext'

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

const PLAN_STYLE: Record<string, React.CSSProperties> = {
  paid:      { background: '#FFFBEB', color: '#78350F' },
  trial:     { background: 'rgba(107,39,55,0.1)', color: '#6b2737' },
  admin:     { background: 'rgba(107,39,55,0.15)', color: '#4a1020' },
  suspended: { background: '#FEF2F2', color: '#8B1A1A' },
  expired:   { background: '#EAE4D9', color: '#5C4A3A' },
}

const PLAN_LABELS: Record<string, string> = {
  paid: 'مدفوع', trial: 'تجريبي', admin: 'مشرف', suspended: 'موقوف', expired: 'منتهي'
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dalilak-backend-bvb9.onrender.com'

const INP: React.CSSProperties = {
  width: '100%', padding: '9px 12px', border: '1.5px solid #EAE4D9', borderRadius: 10,
  fontSize: 13, fontFamily: "'Cairo','Inter',sans-serif", background: '#FAFAF8',
  color: '#1A1208', outline: 'none',
}
const LBL: React.CSSProperties = { fontSize: 12, fontWeight: 700, color: '#1A1208', display: 'block', marginBottom: 5 }

export default function AdminPage() {
  const { isAr } = useLanguage()
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

  const [contentGaps, setContentGaps] = useState<ContentGapEntry[]>([])
  const [gapStats, setGapStats] = useState<{total:number;open:number;in_review:number;high_priority:number}|null>(null)
  const [gapFilter, setGapFilter] = useState<string>('open')

  const [newUser, setNewUser] = useState({ username: '', email: '', password: '', full_name: '', phone: '', plan: 'trial' })
  const [editUser, setEditUser] = useState<UserRow | null>(null)
  const [editPlan, setEditPlan] = useState('')
  const [editPaidUntil, setEditPaidUntil] = useState('')

  useEffect(() => {
    if (!isAdmin()) { router.push('/login'); return }
    loadStats(); loadUsers()
  }, [])

  async function loadStats() {
    try { setStats(await adminGetStats()) } catch (e) { flash(e instanceof Error ? e.message : 'خطأ في تحميل الإحصائيات', true) }
  }

  async function loadUsers() {
    try { setUsers((await adminListUsers()).users) } catch (e) { flash(e instanceof Error ? e.message : 'خطأ في تحميل المستخدمين', true) }
  }

  async function loadResets() {
    try { setResets((await adminGetResets()).reset_codes) } catch (e) { flash(e instanceof Error ? e.message : 'خطأ', true) }
  }

  async function loadFeedback() {
    try {
      const { getToken } = await import('@/lib/auth')
      const res = await fetch(`${API_URL}/admin/feedback?limit=100`, { headers: { Authorization: `Bearer ${getToken()}` } })
      setFeedback((await res.json()).feedback || [])
    } catch (e) { flash(e instanceof Error ? e.message : 'خطأ', true) }
  }

  async function loadEscalations() {
    try {
      const { getToken } = await import('@/lib/auth')
      const res = await fetch(`${API_URL}/admin/escalations?limit=100`, { headers: { Authorization: `Bearer ${getToken()}` } })
      setEscalations((await res.json()).escalations || [])
    } catch (e) { flash(e instanceof Error ? e.message : 'خطأ', true) }
  }

  async function loadContentGaps(status?: string) {
    try {
      setLoading(true)
      const data = await adminGetContentGaps(status ?? gapFilter)
      setContentGaps(data.gaps || [])
      setGapStats(data.stats || null)
    } catch (e) { flash(e instanceof Error ? e.message : 'خطأ', true) }
    finally { setLoading(false) }
  }

  async function handleGapUpdate(gapId: string, status: string, notes?: string) {
    try {
      await adminUpdateContentGap(gapId, status, notes)
      flash('تم التحديث'); loadContentGaps(gapFilter)
    } catch (e) { flash(e instanceof Error ? e.message : 'خطأ', true) }
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
    e.preventDefault(); setLoading(true)
    try {
      await adminCreateUser(newUser)
      flash('تم إنشاء المستخدم بنجاح')
      setNewUser({ username: '', email: '', password: '', full_name: '', phone: '', plan: 'trial' })
      loadUsers(); loadStats()
    } catch (err) { flash(err instanceof Error ? err.message : 'خطأ', true) }
    finally { setLoading(false) }
  }

  async function handleUpdate() {
    if (!editUser) return; setLoading(true)
    try {
      const payload: Record<string, string> = { plan: editPlan }
      if (editPaidUntil) payload.paid_until = editPaidUntil
      await adminUpdateUser(editUser.username, payload)
      flash('تم التحديث بنجاح'); setEditUser(null)
      loadUsers(); loadStats()
    } catch (err) { flash(err instanceof Error ? err.message : 'خطأ', true) }
    finally { setLoading(false) }
  }

  async function handleDeactivate(username: string) {
    if (!confirm(`تعطيل حساب ${username}؟`)) return
    try {
      await adminDeactivateUser(username)
      flash('تم تعطيل الحساب'); loadUsers(); loadStats()
    } catch (err) { flash(err instanceof Error ? err.message : 'خطأ', true) }
  }

  const filtered = users.filter(u =>
    u.username.includes(search) || u.email.includes(search) || u.full_name.includes(search)
  )

  function fmtDate(s?: string) {
    if (!s) return '—'
    try { return new Date(s).toLocaleDateString('ar-LB') } catch { return s }
  }

  const me = getUser()
  const TABS: { id: Tab; label: string }[] = [
    { id: 'stats',       label: isAr ? 'الإحصائيات' : 'Stats' },
    { id: 'users',       label: isAr ? 'المستخدمون' : 'Users' },
    { id: 'create',      label: isAr ? '+ جديد' : '+ New' },
    { id: 'resets',      label: isAr ? 'الاستعادة' : 'Resets' },
    { id: 'feedback',    label: isAr ? 'التقييمات' : 'Feedback' },
    { id: 'escalations', label: isAr ? 'التصعيد' : 'Escalations' },
    { id: 'gaps',        label: isAr ? 'الثغرات' : 'Gaps' },
  ]

  const SECTION: React.CSSProperties = {
    background: '#fff', borderRadius: 18, border: '1.5px solid #EAE4D9',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: 20,
  }

  return (
    <div dir={isAr ? 'rtl' : 'ltr'} style={{ minHeight: '100vh', background: '#F2EDE6', fontFamily: "'Cairo','Inter',sans-serif" }}>
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: #EAE4D9; border-radius: 4px; }
        .adm-tr:hover { background: #FAFAF8 !important; }
        .adm-btn:hover { opacity: 0.82; }
        .adm-gap-row:hover { background: #FAFAF8 !important; }
        .adm-tab:hover { opacity: 0.85; }
        .adm-filter-chip:hover { border-color: #8B1A1A !important; }
        @keyframes admIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes admItem { from { opacity:0; transform:translateY(10px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes admHeaderIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {/* Header */}
      <header style={{ background: 'linear-gradient(135deg, #6b2737 0%, #8B1A1A 60%, #7a1818 100%)', padding: '14px 24px', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 4px 24px rgba(80,10,10,0.28)', animation: 'admHeaderIn 0.3s cubic-bezier(0.22,1,0.36,1) both' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <img src="/logo-icon.png" alt="دليلك" style={{ width: 24, height: 24, objectFit: 'contain' }} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#fff' }}>{isAr ? 'لوحة التحكم — دليلك' : 'Admin Panel — Dalilak'}</h1>
              <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>{isAr ? 'مرحباً،' : 'Welcome,'} {me?.full_name || me?.username}</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button type="button" aria-label={isAr ? 'تحديث البيانات' : 'Refresh data'} onClick={refreshAll} disabled={loading} style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, padding: '6px 12px', color: '#fff', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5, opacity: loading ? 0.6 : 1 }}>
              <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
              {loading ? '...' : (isAr ? 'تحديث' : 'Refresh')}
            </button>
            <button type="button" onClick={() => router.push('/')} style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, padding: '6px 12px', color: '#fff', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
              {isAr ? 'التطبيق' : 'App'}
            </button>
            <button type="button" onClick={() => { clearToken(); router.push('/login') }} style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, padding: '6px 12px', color: '#fff', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
              {isAr ? 'خروج' : 'Logout'}
            </button>
          </div>
        </div>
      </header>

      {/* Flash */}
      {msg   && <div style={{ margin: '12px 24px 0', padding: '10px 16px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 12, color: '#78350F', fontSize: 13, textAlign: 'center' }}>{msg}</div>}
      {error && <div role="alert" style={{ margin: '12px 24px 0', padding: '10px 16px', background: '#FEF2F2', border: '1px solid rgba(139,26,26,0.25)', borderRadius: 12, color: '#8B1A1A', fontSize: 13, textAlign: 'center' }}>{error}</div>}

      {/* Tabs */}
      <div id="main-content" style={{ padding: '16px 24px 0', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {TABS.map(t => (
            <button type="button" key={t.id}
              aria-pressed={tab === t.id}
              className="adm-tab"
              onClick={() => {
                setTab(t.id)
                if (t.id === 'resets') loadResets()
                if (t.id === 'feedback') loadFeedback()
                if (t.id === 'escalations') loadEscalations()
                if (t.id === 'gaps') loadContentGaps('open')
              }}
              style={{
                padding: '7px 16px', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'inherit', transition: 'background 0.15s, color 0.15s, box-shadow 0.15s',
                background: tab === t.id ? 'linear-gradient(135deg, #6b2737, #8B1A1A)' : '#fff',
                color: tab === t.id ? '#fff' : '#5C4A3A',
                boxShadow: tab === t.id ? '0 2px 8px rgba(139,26,26,0.25)' : '0 1px 3px rgba(0,0,0,0.06)',
                border: tab === t.id ? 'none' : '1px solid #EAE4D9',
              } as React.CSSProperties}>
              {t.label}
            </button>
          ))}
          <Link href="/admin/content" style={{
            padding: '7px 16px', borderRadius: 10, fontSize: 12, fontWeight: 600,
            background: '#fff', color: '#6b2737', border: '1.5px dashed rgba(107,39,55,0.3)',
            textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5,
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
            {isAr ? 'إدارة المحتوى' : 'Content management'}
          </Link>
        </div>
      </div>

      <div key={tab} style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 24px 60px', animation: 'admIn 0.2s cubic-bezier(0.22,1,0.36,1) both' }}>

        {/* ── STATS ── */}
        {tab === 'stats' && stats && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))', gap: 12 }}>
              {[
                { label: 'إجمالي المستخدمين', value: stats.total,           bg: '#fff',                 ic: <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5C4A3A" strokeWidth="1.6"><path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 00-3-3.87m-4-12a4 4 0 010 7.75"/></svg> },
                { label: 'مدفوعون',            value: stats.paid,            bg: '#FFFBEB',              ic: <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#78350F" strokeWidth="1.6"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg> },
                { label: 'تجريبي نشط',         value: stats.trial_active,    bg: 'rgba(107,39,55,0.06)', ic: <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b2737" strokeWidth="1.6"><circle cx="12" cy="12" r="9"/><path strokeLinecap="round" d="M12 7v5l3 3"/></svg> },
                { label: 'تجريبي منتهي',       value: stats.trial_expired,   bg: '#FFFBEB',              ic: <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B45309" strokeWidth="1.6"><path strokeLinecap="round" strokeLinejoin="round" d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
                { label: 'معطّلون',            value: stats.suspended,       bg: '#FEF2F2',              ic: <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B1A1A" strokeWidth="1.6"><circle cx="12" cy="12" r="9"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg> },
                { label: 'معدل التحويل',       value: stats.conversion_rate, bg: 'rgba(107,39,55,0.06)', ic: <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b2737" strokeWidth="1.6"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg> },
              ].map((s, i) => (
                <div key={s.label} style={{ background: s.bg, borderRadius: 16, padding: '16px 18px', border: '1.5px solid #EAE4D9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', animation: 'admItem 0.22s cubic-bezier(0.22,1,0.36,1) both', animationDelay: `${i * 0.06}s` }}>
                  <div style={{ marginBottom: 8, display: 'flex' }}>{s.ic}</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: '#1A1208' }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: '#9C8E80', marginTop: 3 }}>{s.label}</div>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => { loadStats(); loadUsers() }}
              style={{ marginTop: 14, fontSize: 12, color: '#6b2737', background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'inherit' }}>
              <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>تحديث
            </button>
          </div>
        )}

        {/* ── USERS ── */}
        {tab === 'users' && (
          <div>
            <div style={{ marginBottom: 14 }}>
              <input
                type="text" value={search}
                onChange={e => setSearch(e.target.value)}
                aria-label={isAr ? 'ابحث باسم المستخدم أو البريد' : 'Search by username or email'}
                placeholder={isAr ? 'ابحث باسم المستخدم أو البريد...' : 'Search by username or email...'}
                style={{ ...INP, maxWidth: 340 }}
              />
            </div>
            <div style={{ ...SECTION, padding: 0, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#FAFAF8', borderBottom: '1px solid #EAE4D9' }}>
                      {(isAr ? ['المستخدم', 'البريد', 'الخطة', 'الأيام', 'آخر دخول', 'إجراءات'] : ['User', 'Email', 'Plan', 'Days', 'Last login', 'Actions']).map(h => (
                        <th key={h} style={{ padding: '10px 14px', textAlign: 'right', color: '#9C8E80', fontWeight: 700, fontSize: 11, whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((u, i) => (
                      <tr key={u.username} className="adm-tr" style={{ borderBottom: i < filtered.length - 1 ? '1px solid #EAE4D9' : 'none', opacity: u.active ? 1 : 0.5, background: '#fff' }}>
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ fontWeight: 700, color: '#1A1208', fontSize: 13 }}>{u.username}</div>
                          <div style={{ fontSize: 11, color: '#9C8E80' }}>{u.full_name}</div>
                        </td>
                        <td style={{ padding: '10px 14px', color: '#5C4A3A', fontSize: 11 }}>{u.email}</td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{ fontSize: 11, padding: '2px 9px', borderRadius: 99, fontWeight: 700, ...(PLAN_STYLE[u.status] || PLAN_STYLE[u.plan] || { background: '#EAE4D9', color: '#5C4A3A' }) }}>
                            {PLAN_LABELS[u.status] || PLAN_LABELS[u.plan] || u.plan}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px', color: '#5C4A3A', fontSize: 13 }}>
                          {u.plan === 'paid' ? '∞' : u.days_left !== undefined ? (isAr ? `${u.days_left} يوم` : `${u.days_left} days`) : '—'}
                        </td>
                        <td style={{ padding: '10px 14px', color: '#9C8E80', fontSize: 11 }}>{fmtDate(u.last_login)}</td>
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              type="button"
                              onClick={() => { setEditUser(u); setEditPlan(u.plan); setEditPaidUntil(u.paid_until || '') }}
                              className="adm-btn"
                              style={{ fontSize: 11, background: 'rgba(107,39,55,0.08)', color: '#6b2737', padding: '4px 10px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }}>
                              {isAr ? 'تعديل' : 'Edit'}
                            </button>
                            {u.active && (
                              <button type="button" onClick={() => handleDeactivate(u.username)}
                                className="adm-btn"
                                style={{ fontSize: 11, background: '#FEF2F2', color: '#8B1A1A', padding: '4px 10px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }}>
                                {isAr ? 'تعطيل' : 'Deactivate'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filtered.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '36px 0', color: '#9C8E80', fontSize: 13 }}>{isAr ? 'لا يوجد مستخدمون' : 'No users found'}</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── CREATE USER ── */}
        {tab === 'create' && (
          <div style={{ maxWidth: 440 }}>
            <div style={SECTION}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: '#1A1208', margin: '0 0 18px' }}>{isAr ? 'إنشاء مستخدم جديد' : 'Create new user'}</h3>
              <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { k: 'full_name', label: 'الاسم الكامل',      type: 'text',     placeholder: 'أحمد علي' },
                  { k: 'username',  label: 'اسم المستخدم',      type: 'text',     placeholder: 'username',          dir: 'ltr' },
                  { k: 'email',     label: 'البريد الإلكتروني', type: 'email',    placeholder: 'you@example.com',   dir: 'ltr' },
                  { k: 'phone',     label: 'الهاتف',             type: 'tel',      placeholder: '+961 xx xxx xxx',  dir: 'ltr' },
                  { k: 'password',  label: 'كلمة المرور',        type: 'password', placeholder: '6 أحرف على الأقل' },
                ].map(f => (
                  <div key={f.k}>
                    <label htmlFor={f.k} style={LBL}>{f.label}</label>
                    <input
                      id={f.k}
                      type={f.type}
                      value={(newUser as any)[f.k]}
                      onChange={e => setNewUser(u => ({ ...u, [f.k]: e.target.value }))}
                      style={INP}
                      placeholder={f.placeholder}
                      dir={f.dir || 'rtl'}
                      required={f.k !== 'phone' && f.k !== 'full_name'}
                    />
                  </div>
                ))}
                <div>
                  <label htmlFor="new-user-plan" style={LBL}>الخطة</label>
                  <select id="new-user-plan" value={newUser.plan} onChange={e => setNewUser(u => ({ ...u, plan: e.target.value }))} aria-label="خطة المستخدم" style={INP}>
                    <option value="trial">تجريبي (3 أيام)</option>
                    <option value="paid">مدفوع</option>
                    <option value="admin">مشرف</option>
                  </select>
                </div>
                <button type="submit" disabled={loading} style={{ padding: '11px 0', background: 'linear-gradient(135deg, #8B1A1A, #6b2737)', color: '#fff', borderRadius: 12, border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', opacity: loading ? 0.6 : 1 }}>
                  {loading ? (isAr ? 'جارٍ الإنشاء...' : 'Creating...') : (isAr ? 'إنشاء المستخدم' : 'Create user')}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ── RESET CODES ── */}
        {tab === 'resets' && (
          <div style={{ maxWidth: 520 }}>
            <div style={SECTION}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#1A1208', margin: 0 }}>رموز استعادة كلمة المرور</h3>
                <button type="button" onClick={loadResets} style={{ fontSize: 11, color: '#6b2737', background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'inherit' }}>
                  <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>تحديث
                </button>
              </div>
              <p style={{ fontSize: 12, color: '#9C8E80', marginBottom: 14 }}>عندما يطلب مستخدم استعادة كلمته، يظهر الرمز هنا. أرسله له يدوياً.</p>
              {resets.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '28px 0', color: '#9C8E80', fontSize: 13 }}>لا توجد طلبات نشطة</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {resets.map((r, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 14 }}>
                      <div>
                        <div style={{ fontWeight: 700, color: '#1A1208', fontSize: 14 }}>{r.username}</div>
                        <div style={{ fontSize: 11, color: '#9C8E80' }}>ينتهي: {new Date(r.expires_at).toLocaleTimeString('ar-LB')}</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: 4, color: '#6b2737' }}>{r.token}</div>
                        <button type="button" onClick={() => navigator.clipboard.writeText(r.token)} style={{ fontSize: 11, color: '#9C8E80', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>نسخ</button>
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
          <div style={SECTION}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: '#1A1208', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                تقييمات المستخدمين ({feedback.length})
              </h2>
              <button type="button" onClick={loadFeedback} style={{ fontSize: 11, color: '#6b2737', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>تحديث</button>
            </div>
            {feedback.length === 0 ? (
              <p style={{ fontSize: 13, color: '#9C8E80', textAlign: 'center', padding: '28px 0' }}>لا توجد تقييمات بعد</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 520, overflowY: 'auto' }}>
                {feedback.map((f, i) => (
                  <div key={i} style={{ border: '1px solid #EAE4D9', borderRadius: 14, padding: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <span style={{ display: 'inline-flex' }}>
                        {f.rating === 'up'
                          ? <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#78350F" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z"/><path strokeLinecap="round" strokeLinejoin="round" d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/></svg>
                          : <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B1A1A" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10z"/><path strokeLinecap="round" strokeLinejoin="round" d="M17 2h2.67A2.31 2.31 0 0122 4v7a2.31 2.31 0 01-2.33 2H17"/></svg>
                        }
                      </span>
                      <span style={{ fontSize: 11, color: '#9C8E80' }}>{f.username} · {fmtTs(f.timestamp)}</span>
                      {f.confidence && <span style={{ fontSize: 11, background: '#EAE4D9', color: '#5C4A3A', padding: '1px 8px', borderRadius: 99 }}>{f.confidence}</span>}
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#1A1208', margin: '0 0 4px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>{f.question}</p>
                    <p style={{ fontSize: 12, color: '#5C4A3A', margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as const }}>{f.answer}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ESCALATIONS ── */}
        {tab === 'escalations' && (
          <div style={SECTION}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: '#1A1208', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 00-3-3.87m-4-12a4 4 0 010 7.75"/></svg>
                طلبات التصعيد ({escalations.length})
              </h2>
              <button type="button" onClick={loadEscalations} style={{ fontSize: 11, color: '#6b2737', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>تحديث</button>
            </div>
            {escalations.length === 0 ? (
              <p style={{ fontSize: 13, color: '#9C8E80', textAlign: 'center', padding: '28px 0' }}>لا توجد طلبات بعد</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 520, overflowY: 'auto' }}>
                {escalations.map((e, i) => (
                  <div key={i} style={{ border: '1px solid #EAE4D9', borderRadius: 14, padding: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#6b2737' }}>{e.request_type?.replace('_', ' ')}</span>
                      <span style={{ fontSize: 11, color: '#9C8E80' }}>{fmtTs(e.timestamp)}</span>
                    </div>
                    <p style={{ fontSize: 13, color: '#2D1B0E', margin: '0 0 8px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>{e.question}</p>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      {e.user_email && <span style={{ fontSize: 11, color: '#8B1A1A', display: 'inline-flex', alignItems: 'center', gap: 3 }}><svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>{e.user_email}</span>}
                      {e.user_phone && <span style={{ fontSize: 11, color: '#78350F', display: 'inline-flex', alignItems: 'center', gap: 3 }}><svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z"/></svg>{e.user_phone}</span>}
                      <span style={{ fontSize: 11, color: '#9C8E80' }}>@{e.username}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── CONTENT GAPS ── */}
        {tab === 'gaps' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Stats */}
            {gapStats && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px,1fr))', gap: 10 }}>
                {[
                  { label: 'الإجمالي',      val: gapStats.total,        bg: '#fff' },
                  { label: 'مفتوحة',        val: gapStats.open,         bg: '#FEF2F2' },
                  { label: 'قيد المراجعة', val: gapStats.in_review,    bg: '#FFFBEB' },
                  { label: 'أولوية عالية', val: gapStats.high_priority, bg: '#FFFBEB' },
                ].map(s => (
                  <div key={s.label} style={{ background: s.bg, borderRadius: 14, padding: '14px 16px', border: '1.5px solid #EAE4D9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <div style={{ fontSize: 26, fontWeight: 900, color: '#1A1208' }}>{s.val}</div>
                    <div style={{ fontSize: 11, color: '#9C8E80', marginTop: 3 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Filter bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              {[
                { k: 'open',      dot: '#8B1A1A', label: 'مفتوح' },
                { k: 'in_review', dot: '#CA8A04', label: 'قيد المراجعة' },
                { k: 'resolved',  dot: '#B45309', label: 'محلول' },
                { k: 'ignored',   dot: '#9C8E80', label: 'متجاهَل' },
              ].map(f => (
                <button type="button" key={f.k}
                  aria-pressed={gapFilter === f.k}
                  className="adm-filter-chip"
                  onClick={() => { setGapFilter(f.k); loadContentGaps(f.k) }}
                  style={{
                    padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    fontFamily: 'inherit', border: 'none', display: 'inline-flex', alignItems: 'center', gap: 5,
                    background: gapFilter === f.k ? 'linear-gradient(135deg, #6b2737, #8B1A1A)' : '#fff',
                    color: gapFilter === f.k ? '#fff' : '#5C4A3A',
                    boxShadow: gapFilter === f.k ? '0 2px 8px rgba(139,26,26,0.2)' : '0 1px 3px rgba(0,0,0,0.04)',
                    outline: gapFilter === f.k ? 'none' : '1px solid #EAE4D9',
                  }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: gapFilter === f.k ? '#fff' : f.dot, display: 'inline-block', flexShrink: 0 }} />
                  {f.label}
                </button>
              ))}
            </div>

            {/* Gap list */}
            {loading ? (
              <p style={{ textAlign: 'center', color: '#9C8E80', padding: '24px 0', fontSize: 13 }}>جارٍ التحميل...</p>
            ) : contentGaps.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', background: '#fff', borderRadius: 16, border: '1.5px solid #EAE4D9', color: '#9C8E80', fontSize: 13 }}>
                لا توجد ثغرات في هذه الحالة
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {contentGaps.map(gap => (
                  <div key={gap.id} className="adm-gap-row" style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #EAE4D9', padding: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8, gap: 10 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#1A1208', margin: '0 0 6px', lineHeight: 1.4 }}>{gap.user_question}</p>
                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 10, color: '#8B1A1A', background: '#FEF2F2', padding: '1px 7px', borderRadius: 8, fontWeight: 600 }}>{gap.gap_type}</span>
                          {gap.priority === 'high' && (
                            <span style={{ fontSize: 10, color: '#B45309', background: '#FFFBEB', padding: '1px 7px', borderRadius: 8, fontWeight: 600 }}>أولوية عالية</span>
                          )}
                          {gap.detected_procedure && (
                            <span style={{ fontSize: 10, color: '#5C4A3A', background: '#EAE4D9', padding: '1px 7px', borderRadius: 8 }}>{gap.detected_procedure}</span>
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                        {(['in_review', 'resolved', 'ignored'] as const).map(s => (
                          <button
                            type="button"
                            key={s}
                            onClick={() => handleGapUpdate(gap.id, s)}
                            style={{
                              fontSize: 10, padding: '3px 8px', borderRadius: 7, border: 'none', cursor: 'pointer',
                              fontFamily: 'inherit', fontWeight: 700,
                              background: s === 'resolved' ? '#FFFBEB' : s === 'ignored' ? '#EAE4D9' : '#FFFBEB',
                              color: s === 'resolved' ? '#78350F' : s === 'ignored' ? '#5C4A3A' : '#CA8A04',
                            }}
                          >
                            {s === 'in_review' ? 'مراجعة' : s === 'resolved' ? 'محلول' : 'تجاهل'}
                          </button>
                        ))}
                      </div>
                    </div>
                    {gap.admin_notes && (
                      <p style={{ fontSize: 11, color: '#9C8E80', margin: 0, fontStyle: 'italic' }}>{gap.admin_notes}</p>
                    )}
                    {gap.username && (
                      <p style={{ fontSize: 10.5, color: '#9C8E80', margin: '4px 0 0' }}>@{gap.username}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* ── EDIT USER MODAL ── */}
      {editUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setEditUser(null) }}
          onKeyDown={e => { if (e.key === 'Escape') setEditUser(null) }}>
          <div role="dialog" aria-modal="true" aria-label={`تعديل: ${editUser.username}`} onKeyDown={e => { if (e.key === 'Escape') setEditUser(null) }} style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 420, padding: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.18)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: '#1A1208', margin: 0 }}>{isAr ? 'تعديل' : 'Edit'}: {editUser.username}</h2>
              <button type="button" onClick={() => setEditUser(null)} aria-label={isAr ? 'إغلاق' : 'Close'} style={{ background: '#EAE4D9', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5C4A3A', transition: 'background 0.12s' }}>
                <svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ padding: '10px 14px', background: '#FAFAF8', borderRadius: 10, border: '1px solid #EAE4D9', fontSize: 12, color: '#5C4A3A' }}>
                <span style={{ color: '#9C8E80' }}>البريد: </span>{editUser.email}
              </div>
              <div>
                <label htmlFor="edit-user-plan" style={LBL}>الخطة</label>
                <select id="edit-user-plan" value={editPlan} onChange={e => setEditPlan(e.target.value)} aria-label="خطة المستخدم" style={INP}>
                  <option value="trial">تجريبي</option>
                  <option value="paid">مدفوع</option>
                  <option value="admin">مشرف</option>
                  <option value="suspended">موقوف</option>
                </select>
              </div>
              {editPlan === 'paid' && (
                <div>
                  <label htmlFor="edit-paid-until" style={LBL}>مدفوع حتى (اختياري)</label>
                  <input
                    id="edit-paid-until"
                    type="date"
                    aria-label="مدفوع حتى"
                    value={editPaidUntil}
                    onChange={e => setEditPaidUntil(e.target.value)}
                    style={INP}
                  />
                </div>
              )}
              <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                <button
                  type="button"
                  onClick={handleUpdate}
                  disabled={loading}
                  style={{ flex: 1, padding: '10px 0', background: 'linear-gradient(135deg, #8B1A1A, #6b2737)', color: '#fff', borderRadius: 12, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', opacity: loading ? 0.6 : 1 }}
                >
                  {loading ? (isAr ? 'جارٍ الحفظ...' : 'Saving...') : (isAr ? 'حفظ التغييرات' : 'Save changes')}
                </button>
                <button
                  type="button"
                  onClick={() => setEditUser(null)}
                  style={{ padding: '10px 18px', background: '#EAE4D9', color: '#5C4A3A', borderRadius: 12, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
