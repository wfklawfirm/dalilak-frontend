'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getToken, isAdmin } from '@/lib/auth'
import { useLanguage } from '@/lib/LanguageContext'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dalilak-backend-bvb9.onrender.com'

const STATUS_CONFIG: Record<string, { label: string; style: React.CSSProperties; next: string[] }> = {
  draft:     { label: 'مسودة',    style: { background: '#EAE4D9', color: '#5C4A3A' },          next: ['review'] },
  review:    { label: 'مراجعة',   style: { background: '#FFFBEB', color: '#B8860B' },           next: ['approved', 'draft'] },
  approved:  { label: 'معتمد',    style: { background: 'rgba(107,39,55,0.1)', color: '#6b2737' }, next: ['published', 'review'] },
  published: { label: 'منشور',    style: { background: '#FFFBEB', color: '#78350F' },           next: ['expired'] },
  expired:   { label: 'منتهي',    style: { background: '#FEF2F2', color: '#8B1A1A' },           next: [] },
}

const TRANSITION_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  review:    { label: 'إرسال للمراجعة', bg: '#B8860B', color: '#fff' },
  approved:  { label: 'اعتماد',         bg: '#6b2737', color: '#fff' },
  draft:     { label: 'إرجاع للمسودة',  bg: '#EAE4D9', color: '#5C4A3A' },
  published: { label: 'نشر',            bg: '#78350F', color: '#fff' },
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
  const { isAr } = useLanguage()
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
  const [loadError, setLoadError] = useState<string>('')

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
    } catch (err) { setLoadError(err instanceof Error ? err.message : (isAr ? 'تعذّر تحميل المحتوى' : 'Could not load content')) }
    finally { setLoading(false) }
  }

  const loadAudit = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/audit-log?limit=50`, { headers: authHeaders() })
      const data = await res.json()
      setAuditLog(data.entries || [])
    } catch { /* audit log non-critical */ }
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
    <div dir={isAr ? 'rtl' : 'ltr'} style={{ minHeight: '100vh', background: '#F2EDE6', fontFamily: "'Cairo','Inter',sans-serif" }}>
      <style>{`* { box-sizing: border-box; } ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: #EAE4D9; border-radius: 4px; } .cnt-item:hover { border-color: #C9A090 !important; } .cnt-btn:hover { opacity: 0.88; } .pipeline-tile:hover { border-color: #C9A090 !important; box-shadow: 0 2px 10px rgba(139,26,26,0.08) !important; } .pipeline-grid { display: grid; grid-template-columns: repeat(5,1fr); gap: 10px; } @media (max-width: 640px) { .pipeline-grid { grid-template-columns: repeat(3,1fr); } } .content-main { display: grid; gap: 16px; } @media (max-width: 900px) { .content-main { grid-template-columns: 1fr !important; } } @keyframes cgItem { from { opacity:0; transform:translateY(8px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } } @keyframes cgDetailIn { from { opacity:0; transform:translateX(14px); } to { opacity:1; transform:translateX(0); } } @keyframes cgModalFade { from { opacity:0; } to { opacity:1; } } @keyframes cgModalIn { from { opacity:0; transform:scale(0.94) translateY(14px); } to { opacity:1; transform:scale(1) translateY(0); } } @keyframes cgAuditItem { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } } @keyframes cntHeaderIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }`}</style>

      {/* Header */}
      <header style={{ background: 'linear-gradient(135deg, #6b2737 0%, #8B1A1A 60%, #7a1818 100%)', padding: '14px 24px', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 4px 24px rgba(80,10,10,0.28)', animation: 'cntHeaderIn 0.3s cubic-bezier(0.22,1,0.36,1) both' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, padding: '5px 10px', color: 'rgba(255,255,255,0.85)', fontSize: 12, textDecoration: 'none' }}>
              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
              {isAr ? 'لوحة التحكم' : 'Admin panel'}
            </Link>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
              <img src="/logo-icon.png" alt="دليلك" style={{ width: 24, height: 24, objectFit: 'contain', display: 'block' }} />
            </div>
            <h1 style={{ color: '#fff', fontSize: 17, fontWeight: 800, margin: 0 }}>{isAr ? 'إدارة المحتوى' : 'Content management'}</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              onClick={() => { setShowAudit(!showAudit); if (!showAudit) loadAudit() }}
              aria-expanded={showAudit}
              aria-label={isAr ? 'سجل التغييرات' : 'Change log'}
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 9, padding: '7px 14px', color: '#fff', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit' }}
            >
              <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
              {isAr ? 'سجل التغييرات' : 'Change log'}
            </button>
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              style={{ background: 'rgba(255,255,255,0.18)', border: '1.5px solid rgba(255,255,255,0.35)', borderRadius: 9, padding: '7px 16px', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              {isAr ? '+ إنشاء محتوى جديد' : '+ Create new content'}
            </button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 20px 60px' }}>

        {/* Pipeline overview */}
        <div className="pipeline-grid" style={{ marginBottom: 20 }}>
          {Object.entries(STATUS_CONFIG).map(([status, cfg], i) => (
            <button
              type="button"
              key={status}
              className="pipeline-tile"
              onClick={() => setFilterStatus(filterStatus === status ? 'all' : status)}
              aria-pressed={filterStatus === status}
              style={{
                padding: '14px 10px', borderRadius: 14, border: filterStatus === status ? '2px solid #8B1A1A' : '1.5px solid #EAE4D9',
                background: filterStatus === status ? '#FEF7F7' : '#fff',
                boxShadow: filterStatus === status ? '0 2px 12px rgba(139,26,26,0.12)' : '0 1px 3px rgba(0,0,0,0.04)',
                textAlign: 'center', cursor: 'pointer', fontFamily: 'inherit', transition: 'border-color 0.15s, background 0.15s, box-shadow 0.18s cubic-bezier(0.22,1,0.36,1)',
                animation: 'cgItem 0.22s cubic-bezier(0.22,1,0.36,1) both', animationDelay: `${i * 0.06}s`,
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
        <div id="main-content" className="content-main" style={{ gridTemplateColumns: selected ? '1fr 1fr' : '1fr' }}>

          {/* List */}
          <div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: '#9C8E80', fontSize: 13 }}>{isAr ? 'جارٍ التحميل...' : 'Loading...'}</div>
            ) : loadError ? (
              <div style={{ background: '#FEF2F2', border: '1px solid rgba(139,26,26,0.2)', borderRadius: 14, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B1A1A" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
                <span style={{ fontSize: 13, color: '#8B1A1A', fontWeight: 600, flex: 1 }}>{loadError}</span>
                <button type="button" onClick={loadItems} style={{ fontSize: 11, fontWeight: 700, color: '#8B1A1A', background: 'none', border: '1px solid rgba(139,26,26,0.3)', borderRadius: 8, padding: '3px 10px', cursor: 'pointer', fontFamily: 'inherit' }}>{isAr ? 'إعادة المحاولة' : 'Retry'}</button>
              </div>
            ) : filteredItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 20px', background: '#fff', borderRadius: 18, border: '1.5px solid #EAE4D9' }}>
                <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'center' }}>
                  <svg aria-hidden="true" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#D4C5B0" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                </div>
                <p style={{ color: '#9C8E80', fontSize: 13, margin: 0 }}>{isAr ? `لا يوجد محتوى ${filterStatus !== 'all' ? `في حالة "${STATUS_CONFIG[filterStatus]?.label}"` : 'بعد'}` : `No content ${filterStatus !== 'all' ? `in status "${STATUS_CONFIG[filterStatus]?.label}"` : 'yet'}`}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {filteredItems.map((item, i) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setSelected(selected?.id === item.id ? null : item)}
                    aria-pressed={selected?.id === item.id}
                    aria-label={item.title_ar}
                    className="cnt-item"
                    style={{
                      width: '100%', textAlign: 'right', padding: '14px 16px', borderRadius: 16,
                      border: selected?.id === item.id ? '2px solid #8B1A1A' : '1.5px solid #EAE4D9',
                      background: selected?.id === item.id ? '#FEF7F7' : '#fff',
                      boxShadow: selected?.id === item.id ? '0 2px 10px rgba(139,26,26,0.12)' : '0 1px 3px rgba(0,0,0,0.04)',
                      cursor: 'pointer', fontFamily: 'inherit', transition: 'border-color 0.15s, background 0.15s, box-shadow 0.15s cubic-bezier(0.22,1,0.36,1)',
                      animation: 'cgItem 0.2s cubic-bezier(0.22,1,0.36,1) both', animationDelay: `${Math.min(i, 15) * 0.04}s`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 11, padding: '2px 9px', borderRadius: 99, fontWeight: 700, ...STATUS_CONFIG[item.status]?.style }}>
                        {STATUS_CONFIG[item.status]?.label || item.status}
                      </span>
                      <span style={{ fontSize: 11, color: '#9C8E80' }}>{new Date(item.updated_at).toLocaleDateString('ar-LB')}</span>
                    </div>
                    <h3 style={{ fontSize: 13, fontWeight: 800, color: '#1A1208', margin: '0 0 4px', textAlign: 'right' }}>{item.title_ar}</h3>
                    <p style={{ fontSize: 12, color: '#5C4A3A', margin: '0 0 8px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>{item.body_ar}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#9C8E80' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <svg aria-hidden="true" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                        {item.created_by}
                      </span>
                      <svg aria-hidden="true" width="4" height="4" viewBox="0 0 10 10"><circle cx="5" cy="5" r="3.5" fill="#9C8E80"/></svg>
                      <span>{item.content_type}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Detail panel */}
          {selected && (
            <div key={selected.id} style={{ background: '#fff', borderRadius: 18, border: '1.5px solid #EAE4D9', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', height: 'fit-content', position: 'sticky', top: 76, animation: 'cgDetailIn 0.28s cubic-bezier(0.22,1,0.36,1) both' }}>
              {/* Detail header */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #EAE4D9' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 12, padding: '3px 12px', borderRadius: 99, fontWeight: 700, ...STATUS_CONFIG[selected.status]?.style }}>
                    {STATUS_CONFIG[selected.status]?.label}
                  </span>
                  <button type="button" onClick={() => setSelected(null)} aria-label="إغلاق" style={{ width: 26, height: 26, borderRadius: '50%', background: '#EAE4D9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5C4A3A' }}>
                    <svg aria-hidden="true" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                </div>
                <h2 style={{ fontSize: 16, fontWeight: 800, color: '#1A1208', margin: '0 0 10px' }}>{selected.title_ar}</h2>
                <p style={{ fontSize: 13, color: '#5C4A3A', lineHeight: 1.7, margin: '0 0 10px' }}>{selected.body_ar}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 11, color: '#9C8E80' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <svg aria-hidden="true" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    أُنشئ: {new Date(selected.created_at).toLocaleString('ar-LB')}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <svg aria-hidden="true" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                    آخر تعديل: {new Date(selected.updated_at).toLocaleString('ar-LB')}
                  </span>
                  {selected.published_at && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      <svg aria-hidden="true" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path strokeLinecap="round" strokeLinejoin="round" d="M3.6 9h16.8M3.6 15h16.8M12 3a15 15 0 010 18"/></svg>
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
                    aria-label="ملاحظة على تغيير الحالة"
                    placeholder="ملاحظة (اختياري)..."
                    value={transitionNote}
                    onChange={e => setTransitionNote(e.target.value)}
                    onFocus={e => { e.currentTarget.style.borderColor = '#8B1A1A'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,26,26,0.08)' }}
                    onBlur={e => { e.currentTarget.style.borderColor = '#EAE4D9'; e.currentTarget.style.boxShadow = 'none' }}
                    style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #EAE4D9', borderRadius: 10, fontSize: 12, resize: 'none', marginBottom: 10, outline: 'none', fontFamily: 'inherit', color: '#1A1208', background: '#FAFAF8', transition: 'border-color 0.18s, box-shadow 0.18s' }}
                  />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {STATUS_CONFIG[selected.status].next.map(target => {
                      const t = TRANSITION_CONFIG[target] || { label: target, bg: '#EAE4D9', color: '#5C4A3A' }
                      return (
                        <button
                          type="button"
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
                        ...(s === selected.status ? STATUS_CONFIG[s].style : { background: '#EAE4D9', color: '#9C8E80' }),
                      }}>
                        {STATUS_CONFIG[s]?.label || s}
                      </span>
                      {i < 4 && (
                        <svg aria-hidden="true" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#C4B5A5" strokeWidth="2" style={{ flexShrink: 0 }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
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
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#1A1208' }}>{isAr ? 'سجل التغييرات' : 'Change log'}</h3>
              <button type="button" onClick={() => setShowAudit(false)} aria-label={isAr ? 'إغلاق' : 'Close'} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9C8E80' }}>
                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              {auditLog.length === 0 ? (
                <p style={{ padding: '24px', textAlign: 'center', color: '#9C8E80', fontSize: 13 }}>{isAr ? 'لا توجد سجلات بعد' : 'No records yet'}</p>
              ) : (
                <div style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {auditLog.map((entry, i) => (
                    <div key={i} style={{ fontSize: 12, padding: '10px 14px', borderRadius: 12, border: '1px solid #EAE4D9', background: '#FAFAF8', animation: 'cgAuditItem 0.18s cubic-bezier(0.22,1,0.36,1) both', animationDelay: `${Math.min(i, 20) * 0.03}s` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, color: '#6b2737' }}>{entry.action}</span>
                        <span style={{ color: '#9C8E80', fontSize: 11 }}>{new Date(entry.ts).toLocaleString('ar-LB')}</span>
                      </div>
                      <div style={{ color: '#5C4A3A', fontSize: 11 }}>
                        بواسطة: {entry.actor}
                        {entry.note && <span> · {entry.note}</span>}
                      </div>
                      {(entry.before || entry.after) && (
                        <div style={{ marginTop: 4, color: '#9C8E80', fontSize: 11 }}>
                          {entry.before && <span>من: {entry.before} </span>}
                          {entry.after && <span>→ {entry.after}</span>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create modal */}
        {showCreate && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, animation: 'cgModalFade 0.2s cubic-bezier(0.22,1,0.36,1) both' }} onKeyDown={e => { if (e.key === 'Escape') setShowCreate(false) }}>
            <div role="dialog" aria-modal="true" aria-label={isAr ? 'إنشاء محتوى جديد' : 'Create new content'} onKeyDown={e => { if (e.key === 'Escape') setShowCreate(false) }} style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 500, padding: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.15)', animation: 'cgModalIn 0.3s cubic-bezier(0.22,1,0.36,1) both' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ fontSize: 16, fontWeight: 800, color: '#1A1208', margin: 0 }}>{isAr ? 'إنشاء محتوى جديد' : 'Create new content'}</h2>
                <button type="button" onClick={() => setShowCreate(false)} aria-label={isAr ? 'إغلاق' : 'Close'} style={{ background: '#EAE4D9', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5C4A3A', transition: 'background 0.12s' }}>
                  <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label htmlFor="content-title" style={{ fontSize: 12, fontWeight: 700, color: '#1A1208', display: 'block', marginBottom: 5 }}>العنوان</label>
                  <input
                    id="content-title"
                    value={newItem.title_ar}
                    onChange={e => setNewItem(p => ({ ...p, title_ar: e.target.value }))}
                    placeholder="عنوان المحتوى..."
                    onFocus={e => { e.currentTarget.style.borderColor = '#8B1A1A'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,26,26,0.08)' }}
                    onBlur={e => { e.currentTarget.style.borderColor = '#EAE4D9'; e.currentTarget.style.boxShadow = 'none' }}
                    style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #EAE4D9', borderRadius: 10, fontSize: 13, outline: 'none', fontFamily: 'inherit', color: '#1A1208', background: '#FAFAF8', boxSizing: 'border-box' as const, transition: 'border-color 0.18s, box-shadow 0.18s' }}
                  />
                </div>
                <div>
                  <label htmlFor="content-type" style={{ fontSize: 12, fontWeight: 700, color: '#1A1208', display: 'block', marginBottom: 5 }}>النوع</label>
                  <select
                    id="content-type"
                    aria-label="نوع المحتوى"
                    value={newItem.content_type}
                    onChange={e => setNewItem(p => ({ ...p, content_type: e.target.value }))}
                    onFocus={e => { e.currentTarget.style.borderColor = '#8B1A1A'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,26,26,0.08)' }}
                    onBlur={e => { e.currentTarget.style.borderColor = '#EAE4D9'; e.currentTarget.style.boxShadow = 'none' }}
                    style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #EAE4D9', borderRadius: 10, fontSize: 13, outline: 'none', fontFamily: 'inherit', color: '#1A1208', background: '#FAFAF8', transition: 'border-color 0.18s, box-shadow 0.18s' }}
                  >
                    <option value="procedure_update">تحديث إجراء</option>
                    <option value="faq_answer">إجابة شائعة</option>
                    <option value="authority_info">معلومات جهة</option>
                    <option value="form_guide">دليل نموذج</option>
                    <option value="announcement">إعلان</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="content-body" style={{ fontSize: 12, fontWeight: 700, color: '#1A1208', display: 'block', marginBottom: 5 }}>المحتوى</label>
                  <textarea
                    id="content-body"
                    value={newItem.body_ar}
                    onChange={e => setNewItem(p => ({ ...p, body_ar: e.target.value }))}
                    rows={5}
                    placeholder="اكتب المحتوى هنا..."
                    onFocus={e => { e.currentTarget.style.borderColor = '#8B1A1A'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,26,26,0.08)' }}
                    onBlur={e => { e.currentTarget.style.borderColor = '#EAE4D9'; e.currentTarget.style.boxShadow = 'none' }}
                    style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #EAE4D9', borderRadius: 10, fontSize: 13, resize: 'none', outline: 'none', fontFamily: 'inherit', color: '#1A1208', background: '#FAFAF8', boxSizing: 'border-box' as const, transition: 'border-color 0.18s, box-shadow 0.18s' }}
                  />
                </div>
                <button
                  type="button"
                  onClick={createItem}
                  disabled={creating || !newItem.title_ar.trim() || !newItem.body_ar.trim()}
                  style={{ padding: '11px', borderRadius: 12, background: 'linear-gradient(135deg, #6b2737, #8B1A1A)', border: 'none', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', opacity: creating ? 0.7 : 1 }}
                >
                  {creating ? (isAr ? 'جارٍ الإنشاء...' : 'Creating...') : (isAr ? 'إنشاء' : 'Create')}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
