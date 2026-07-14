'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getToken, isAdmin } from '@/lib/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dalilak-backend-bvb9.onrender.com'

const STATUS_CONFIG: Record<string, { label: string; style: React.CSSProperties; next: string[] }> = {
  draft:     { label: 'مسودة',    style: { background: '#F3F4F6', color: '#4B5563' },          next: ['review'] },
  review:    { label: 'مراجعة',   style: { background: '#FFFBEB', color: '#B8860B' },           next: ['approved', 'draft'] },
  approved:  { label: 'معتمد',    style: { background: 'rgba(107,39,55,0.1)', color: '#6b2737' }, next: ['published', 'review'] },
  published: { label: 'منشور',    style: { background: '#F0FDF4', color: '#16A34A' },           next: ['expired'] },
  expired:   { label: 'منتهي',    style: { background: '#FEF2F2', color: '#8B1A1A' },           next: [] },
}

const TRANSITION_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  review:    { label: 'إرسال للمراجعة', bg: '#B8860B', color: '#fff' },
  approved:  { label: 'اعتماد',         bg: '#6b2737', color: '#fff' },
  draft:     { label: 'إرجاع للمسودة',  bg: '#EAE4D9', color: '#4B5563' },
  published: { label: 'نشر',            bg: '#16A34A', color: '#fff' },
  expired:   { label: 'تحديد كمنتهي',  bg: '#8B1A1A', color: '#fff' },
}

interface ContentItem {
  id: string
  title_ar: string
  body_ar: string
  content_type: string
  status: string
  created_by: string
  created_at: string
  updated_at: string
  published_at?: string
}

interface AuditEntry {
  ts: string
  action: string
  item_id: string
  actor: string
  before: string | null
  after: string | null
  note: string
}

export default function ContentGovernancePage() {
  const router = useRouter()
  const [items, setItems] = useState<ContentItem[]>([])
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selected, setSelected] = useState<ContentItem | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [showAudit, setShowAudit] = useState(false)
  const [creating, setCreating] = useState(false)
  const [transitioning, setTransitioning] = useState(false)
  const [newItem, setNewItem] = useState({ title_ar: '', body_ar: '', content_type: 'procedure_update' })
  const [transitionNote, setTransitionNote] = useState('')

  const authHeaders = useCallback(() => {
    const token = getToken()
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
  }, [])

  useEffect(() => {
    if (!isAdmin()) { router.push('/admin'); return }
    loadItems()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus])

  const loadItems = async () => {
    setLoading(true)
    try {
      const url = filterStatus === 'all'
        ? `${API_URL}/admin/content`
        : `${API_URL}/admin/content?status=${filterStatus}`
      const res = await fetch(url, { headers: authHeaders() })
      const data = await res.json()
      setItems(data.items || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const loadAudit = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/audit-log?limit=50`, { headers: authHeaders() })
      const data = await res.json()
      setAuditLog(data.entries || [])
    } catch (e) { console.error(e) }
  }

  const createItem = async () => {
    if (!newItem.title_ar.trim() || !newItem.body_ar.trim()) return
    setCreating(true)
    try {
      const res = await fetch(`${API_URL}/admin/content`, {
        method: 'POST', headers: authHeaders(), body: JSON.stringify(newItem),
      })
      if (res.ok) { setShowCreate(false); setNewItem({ title_ar: '', body_ar: '', content_type: 'procedure_update' }); loadItems() }
    } finally { setCreating(false) }
  }

  const transition = async (item: ContentItem, target: string) => {
    setTransitioning(true)
    try {
      const res = await fetch(`${API_URL}/admin/content/${item.id}/transition`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ target_status: target, note: transitionNote }),
      })
      if (res.ok) {
        const updated = { ...item, status: target }
        setItems(ps => ps.map(i => i.id === item.id ? updated : i))
        setSelected(updated as ContentItem)
        setTransitionNote('')
        loadItems()
      }
    } finally { setTransitioning(false) }
  }

  const filteredItems = filterStatus === 'all' ? items : items.filter(i => i.status === filterStatus)
  const statusCounts = items.reduce((acc, i) => { acc[i.status] = (acc[i.status] || 0) + 1; return acc }, {} as Record<string, number>)

  return (
    <div dir="rtl" style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: "'Cairo','Inter',sans-serif" }}>
      <style>{`* { box-sizing: border-box; } ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: #EAE4D9; border-radius: 4px; } .cnt-item:hover { border-color: #C9A090 !important; } .cnt-btn:hover { opacity: 0.88; }`}</style>

      {/* Header */}
      <header style={{ background: 'linear-gradient(135deg, #6b2737 0%, #8B1A1A 60%, #7a1818 100%)', padding: '14px 24px', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 4px 24px rgba(80,10,10,0.28)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, padding: '5px 10px', color: 'rgba(255,255,255,0.85)', fontSize: 12, textDecoration: 'none' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
              لوحة التحكم
            </Link>
            <h1 style={{ color: '#fff', fontSize: 17, fontWeight: 800, margin: 0 }}>إدارة المحتوى</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => { setShowAudit(!showAudit); if (!showAudit) loadAudit() }}
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 9, padding: '7px 14px', color: '#fff', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
              سجل التغييرات
            </button>
            <button
              onClick={() => setShowCreate(true)}
              style={{ background: 'rgba(255,255,255,0.18)', border: '1.5px solid rgba(255,255,255,0.35)', borderRadius: 9, padding: '7px 16px', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              + إنشاء محتوى جديد
            </button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 20px 60px' }}>

        {/* Pipeline overview */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 20 }}>
          {Object.entries(STATUS_CONFIG).map(([status, cfg]) => (
            <button
              key={status}
              onClick={() => setFilterStatus(filterStatus === status ? 'all' : status)}
              style={{
                padding: '14px 10px', borderRadius: 14, border: filterStatus === status ? '2px solid #8B1A1A' : '1.5px solid #EAE4D9',
                background: filterStatus === status ? '#FFFBF9' : '#fff',
                boxShadow: filterStatus === status ? '0 2px 12px rgba(139,26,26,0.12)' : '0 1px 3px rgba(0,0,0,0.04)',
                textAlign: 'center', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
              }}
            >
              <div style={{ display: 'inline-block', fontSize: 11, padding: '2px 10px', borderRadius: 99, fontWeight: 700, marginBottom: 6, ...cfg.style }}>
                {cfg.label}
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#1A1208' }}>{statusCounts[status] || 0}</div>
            </button>
          ))}
        </div>

        {/* Main layout */}
        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1fr' : '1fr', gap: 16 }}>

          {/* List */}
          <div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: '#9C8E80', fontSize: 13 }}>جارٍ التحميل...</div>
            ) : filteredItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 20px', background: '#fff', borderRadius: 18, border: '1.5px solid #EAE4D9' }}>
                <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'center' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#D4C5B0" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                </div>
                <p style={{ color: '#9C8E80', fontSize: 13, margin: 0 }}>لا يوجد محتوى {filterStatus !== 'all' ? `في حالة "${STATUS_CONFIG[filterStatus]?.label}"` : 'بعد'}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {filteredItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setSelected(selected?.id === item.id ? null : item)}
                    className="cnt-item"
                    style={{
                      width: '100%', textAlign: 'right', padding: '14px 16px', borderRadius: 16,
                      border: selected?.id === item.id ? '2px solid #8B1A1A' : '1.5px solid #EAE4D9',
                      background: selected?.id === item.id ? '#FFFBF9' : '#fff',
                      boxShadow: selected?.id === item.id ? '0 2px 10px rgba(139,26,26,0.12)' : '0 1px 3px rgba(0,0,0,0.04)',
                      cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 11, padding: '2px 9px', borderRadius: 99, fontWeight: 700, ...STATUS_CONFIG[item.status]?.style }}>
                        {STATUS_CONFIG[item.status]?.label || item.status}
                      </span>
                      <span style={{ fontSize: 11, color: '#9C8E80' }}>{new Date(item.updated_at).toLocaleDateString('ar-LB')}</span>
                    </div>
                    <h3 style={{ fontSize: 13, fontWeight: 800, color: '#1A1208', margin: '0 0 4px', textAlign: 'right' }}>{item.title_ar}</h3>
                    <p style={{ fontSize: 12, color: '#6B7280', margin: '0 0 8px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>{item.body_ar}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#9C8E80' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                        {item.created_by}
                      </span>
                      <svg width="4" height="4" viewBox="0 0 10 10"><circle cx="5" cy="5" r="3.5" fill="#9C8E80"/></svg>
                      <span>{item.content_type}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Detail panel */}
          {selected && (
            <div style={{ background: '#fff', borderRadius: 18, border: '1.5px solid #EAE4D9', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', height: 'fit-content', position: 'sticky', top: 76 }}>
              {/* Detail header */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #EAE4D9' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 12, padding: '3px 12px', borderRadius: 99, fontWeight: 700, ...STATUS_CONFIG[selected.status]?.style }}>
                    {STATUS_CONFIG[selected.status]?.label}
                  </span>
                  <button onClick={() => setSelected(null)} style={{ width: 26, height: 26, borderRadius: '50%', background: '#F3F4F6', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                </div>
                <h2 style={{ fontSize: 16, fontWeight: 800, color: '#1A1208', margin: '0 0 10px' }}>{selected.title_ar}</h2>
                <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.7, margin: '0 0 10px' }}>{selected.body_ar}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 11, color: '#9C8E80' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    أُنشئ: {new Date(selected.created_at).toLocaleString('ar-LB')}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                    آخر تعديل: {new Date(selected.updated_at).toLocaleString('ar-LB')}
                  </span>
                  {selected.published_at && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path strokeLinecap="round" strokeLinejoin="round" d="M3.6 9h16.8M3.6 15h16.8M12 3a15 15 0 010 18"/></svg>
                      نُشر: {new Date(selected.published_at).toLocaleString('ar-LB')}
                    </span>
                  )}
                </div>
              </div>

              {/* Transitions */}
              {STATUS_CONFIG[selected.status]?.next.length > 0 && (
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #EAE4D9' }}>
                  <h3 style={{ fontSize: 12, fontWeight: 700, color: '#1A1208', margin: '0 0 10px' }}>تغيير الحالة</h3>
                  <textarea
                    rows={2}
                    placeholder="ملاحظة (اختياري)..."
                    value={transitionNote}
                    onChange={e => setTransitionNote(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #EAE4D9', borderRadius: 10, fontSize: 12, resize: 'none', marginBottom: 10, outline: 'none', fontFamily: 'inherit', color: '#1A1208', background: '#FAFAF8' }}
                  />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {STATUS_CONFIG[selected.status].next.map(target => {
                      const t = TRANSITION_CONFIG[target] || { label: target, bg: '#EAE4D9', color: '#4B5563' }
                      return (
                        <button
                          key={target}
                          onClick={() => transition(selected, target)}
                          disabled={transitioning}
                          className="cnt-btn"
                          style={{ padding: '7px 14px', borderRadius: 9, fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer', background: t.bg, color: t.color, fontFamily: 'inherit', opacity: transitioning ? 0.6 : 1 }}
                        >
                          {transitioning ? '...' : t.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Workflow visualization */}
              <div style={{ padding: '12px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                  {(['draft', 'review', 'approved', 'published', 'expired'] as const).map((s, i) => (
                    <React.Fragment key={s}>
                      <span style={{
                        fontSize: 10, padding: '2px 8px', borderRadius: 99, fontWeight: s === selected.status ? 800 : 500,
                        outline: s === selected.status ? '2px solid #8B1A1A' : 'none',
                        outlineOffset: 1,
                        ...(s === selected.status ? STATUS_CONFIG[s].style : { background: '#F3F4F6', color: '#9CA3AF' }),
                      }}>
                        {STATUS_CONFIG[s].label}
                      </span>
                      {i < 4 && (
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#D4C5B0" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6"/>
                        </svg>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Audit log */}
        {showAudit && (
          <div style={{ marginTop: 20, background: '#fff', borderRadius: 18, border: '1.5px solid #EAE4D9', overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #EAE4D9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: '#1A1208', margin: 0 }}>سجل التغييرات</h2>
              <button onClick={() => setShowAudit(false)} style={{ width: 26, height: 26, borderRadius: '50%', background: '#F3F4F6', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div>
              {auditLog.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', color: '#9C8E80', fontSize: 13 }}>لا توجد سجلات بعد</div>
              ) : auditLog.map((entry, i) => (
                <div key={i} style={{ padding: '12px 20px', display: 'flex', alignItems: 'flex-start', gap: 14, borderBottom: i < auditLog.length - 1 ? '1px solid #EAE4D9' : 'none' }}>
                  <div style={{
                    fontSize: 10, padding: '3px 8px', borderRadius: 6, fontWeight: 800, whiteSpace: 'nowrap', fontFamily: 'monospace',
                    ...(entry.action === 'CREATE' ? { background: '#F0FDF4', color: '#16A34A' }
                      : entry.action === 'TRANSITION' ? { background: 'rgba(107,39,55,0.1)', color: '#6b2737' }
                      : { background: '#F3F4F6', color: '#6B7280' }),
                  }}>
                    {entry.action}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, color: '#1A1208' }}>{entry.actor}</span>
                      {entry.before && entry.after && (
                        <span style={{ color: '#6B7280', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          {STATUS_CONFIG[entry.before]?.label || entry.before}
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6"/></svg>
                          {STATUS_CONFIG[entry.after]?.label || entry.after}
                        </span>
                      )}
                      <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#9C8E80' }}>{entry.item_id.slice(0, 8)}</span>
                    </div>
                    {entry.note && <p style={{ fontSize: 11, color: '#9C8E80', margin: '3px 0 0' }}>{entry.note}</p>}
                  </div>
                  <span style={{ fontSize: 11, color: '#9C8E80', whiteSpace: 'nowrap' }}>{new Date(entry.ts).toLocaleString('ar-LB')}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create modal */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }} dir="rtl">
          <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', width: '100%', maxWidth: 500 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #EAE4D9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: '#1A1208', margin: 0 }}>إنشاء محتوى جديد</h2>
              <button onClick={() => setShowCreate(false)} style={{ width: 28, height: 28, borderRadius: '50%', background: '#F3F4F6', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#1A1208', display: 'block', marginBottom: 5 }}>نوع المحتوى</label>
                <select
                  value={newItem.content_type}
                  onChange={e => setNewItem(p => ({ ...p, content_type: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #EAE4D9', borderRadius: 10, fontSize: 13, fontFamily: 'inherit', background: '#FAFAF8', color: '#1A1208', outline: 'none' }}
                >
                  <option value="procedure_update">تحديث إجراء</option>
                  <option value="legal_note">ملاحظة قانونية</option>
                  <option value="authority_info">معلومات جهة</option>
                  <option value="fee_update">تحديث رسوم</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#1A1208', display: 'block', marginBottom: 5 }}>العنوان</label>
                <input
                  type="text"
                  placeholder="عنوان المحتوى..."
                  value={newItem.title_ar}
                  onChange={e => setNewItem(p => ({ ...p, title_ar: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #EAE4D9', borderRadius: 10, fontSize: 13, fontFamily: 'inherit', background: '#FAFAF8', color: '#1A1208', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#1A1208', display: 'block', marginBottom: 5 }}>المحتوى</label>
                <textarea
                  rows={5}
                  placeholder="اكتب المحتوى هنا..."
                  value={newItem.body_ar}
                  onChange={e => setNewItem(p => ({ ...p, body_ar: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #EAE4D9', borderRadius: 10, fontSize: 13, fontFamily: 'inherit', background: '#FAFAF8', color: '#1A1208', outline: 'none', resize: 'vertical' }}
                />
              </div>
            </div>
            <div style={{ padding: '14px 20px', borderTop: '1px solid #EAE4D9', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => setShowCreate(false)} style={{ padding: '8px 18px', borderRadius: 9, border: '1.5px solid #EAE4D9', background: '#FAFAF8', color: '#4B5563', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                إلغاء
              </button>
              <button
                onClick={createItem}
                disabled={creating || !newItem.title_ar.trim() || !newItem.body_ar.trim()}
                style={{ padding: '8px 20px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg, #8B1A1A, #6b2737)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', opacity: (creating || !newItem.title_ar.trim() || !newItem.body_ar.trim()) ? 0.6 : 1 }}
              >
                {creating ? 'جارٍ الإنشاء...' : 'إنشاء'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
