'use client'
import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getToken } from '@/lib/auth'
import BottomNav from '@/components/BottomNav'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dalilak-backend-bvb9.onrender.com'

interface ChecklistItem {
  step: number
  title_ar: string
  desc_ar: string
  done: boolean
  done_at: string | null
}

interface MyProc {
  id: string
  procedure_id: string
  title_ar: string
  status: string
  created_at: string
  updated_at: string
  notes: string
  checklist: ChecklistItem[]
  documents: Array<{ name_ar: string; required: boolean; uploaded: boolean }>
  completion_pct: number
  next_step: string
}

export default function MyFilesPage() {
  const router = useRouter()
  const [procs, setProcs] = useState<MyProc[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<MyProc | null>(null)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const detailRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to detail panel on mobile when item selected
  useEffect(() => {
    if (selected && detailRef.current && window.innerWidth <= 767) {
      setTimeout(() => {
        detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 80)
    }
  }, [selected])

  useEffect(() => {
    const token = getToken()
    if (!token) { router.push('/login'); return }

    fetch(`${API_URL}/my-procedures`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        setProcs(data.procedures || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [router])

  const toggleStep = async (proc: MyProc, stepNum: number) => {
    const token = getToken()
    if (!token) return

    const doneSteps = proc.checklist
      .filter(s => s.done)
      .map(s => s.step)

    const newDone = doneSteps.includes(stepNum)
      ? doneSteps.filter(s => s !== stepNum)
      : [...doneSteps, stepNum]

    setSaving(true)
    try {
      const res = await fetch(`${API_URL}/my-procedures/${proc.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ completed_steps: newDone }),
      })
      const updated: MyProc = await res.json()
      setProcs(ps => ps.map(p => p.id === proc.id ? updated : p))
      setSelected(updated)
    } finally {
      setSaving(false)
    }
  }

  const deleteProc = async (procId: string) => {
    const token = getToken()
    if (!token) return
    await fetch(`${API_URL}/my-procedures/${procId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    setProcs(ps => ps.filter(p => p.id !== procId))
    if (selected?.id === procId) setSelected(null)
    setConfirmDelete(null)
  }

  const statusStyle = (s: string): React.CSSProperties => {
    const map: Record<string, React.CSSProperties> = {
      active:    { background: '#FEF2F2', color: '#8B1A1A', border: '1px solid rgba(139,26,26,0.2)' },
      completed: { background: '#FFFBEB', color: '#78350F', border: '1px solid #FDE68A' },
      cancelled: { background: '#EAE4D9', color: '#5C4A3A', border: '1px solid #D5CEC4' },
    }
    return map[s] || { background: '#EAE4D9', color: '#5C4A3A', border: '1px solid #D5CEC4' }
  }

  const statusLabel = (s: string) => ({ active: 'جارية', completed: 'مكتملة', cancelled: 'ملغاة' }[s] || s)

  const pctColor = (pct: number) => pct === 100 ? '#78350F' : '#8B1A1A'
  const barColor  = (pct: number) => pct === 100
    ? 'linear-gradient(90deg, #78350F, #B45309)'
    : 'linear-gradient(90deg, #6b2737, #8B1A1A)'

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: "'Cairo','Inter',sans-serif" }} dir="rtl">
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: #EAE4D9; border-radius: 4px; }
        .proc-btn:hover { border-color: #8B1A1A !important; }
        .step-btn:hover { background: #FEF9F9 !important; }
        @keyframes mf-spin { to { transform: rotate(360deg) } }
        @keyframes mfHeaderIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes mfEnter { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 767px) {
          .mf-main-grid { grid-template-columns: 1fr !important; }
          .mf-back-btn { display: flex !important; }
        }
      `}</style>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header style={{
        background: 'linear-gradient(135deg, #6b2737 0%, #8B1A1A 60%, #7a1818 100%)',
        boxShadow: '0 1px 0 rgba(255,255,255,0.06), 0 4px 24px rgba(80,10,10,0.3)',
        padding: '14px 16px', position: 'sticky', top: 0, zIndex: 50,
        animation: 'mfHeaderIn 0.3s cubic-bezier(0.22,1,0.36,1) both',
      }}>
        <div style={{ maxWidth: 1060, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            aria-label="الرئيسية"
            onClick={() => router.push('/')}
            onTouchStart={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.22)' }}
            onTouchEnd={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 9, color: '#fff', cursor: 'pointer', padding: '6px 8px', display: 'flex', flexShrink: 0 }}
          >
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: 'scaleX(-1)', display: 'block' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, flex: 1 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
              <img src="/logo.PNG" alt="دليلك" style={{ width: 24, height: 24, objectFit: 'contain', display: 'block' }} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>ملفاتي</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.60)', marginTop: 2 }}>متابعة معاملاتك الحكومية</div>
            </div>
          </div>
          <Link
            href="/services"
            style={{
              background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.25)',
              borderRadius: 9, padding: '7px 16px', color: '#fff', fontSize: 12,
              fontWeight: 700, textDecoration: 'none', fontFamily: "'Cairo','Inter',sans-serif",
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14"/>
            </svg>
            معاملة جديدة
          </Link>
        </div>
      </header>

      <div id="main-content" aria-live="polite" aria-label="قائمة المعاملات" style={{ maxWidth: 1060, margin: '0 auto', padding: '20px 14px 80px' }}>

        {/* ── Loading ─────────────────────────────────────────────────────── */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ width: 36, height: 36, border: '3px solid #EAE4D9', borderTopColor: '#8B1A1A', borderRadius: '50%', margin: '0 auto 14px', animation: 'mf-spin 0.8s linear infinite' }} />
            <p style={{ fontSize: 13, color: '#9C8E80', margin: 0 }}>جارٍ التحميل...</p>
          </div>

        ) : procs.length === 0 ? (
          /* ── Empty state ─────────────────────────────────────────────── */
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}><svg aria-hidden="true" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#D4C5B0" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h7a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/></svg></div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1A1208', margin: '0 0 8px' }}>لا توجد معاملات بعد</h2>
            <p style={{ color: '#9C8E80', fontSize: 13, margin: '0 0 24px' }}>ابحث عن معاملتك وابدأ متابعتها</p>
            <Link
              href="/services"
              style={{
                display: 'inline-block', background: 'linear-gradient(135deg, #8B1A1A, #6b2737)',
                color: '#fff', padding: '12px 32px', borderRadius: 14,
                fontWeight: 700, textDecoration: 'none', fontSize: 14,
                boxShadow: '0 4px 16px rgba(139,26,26,0.3)',
              }}
            >
              استعرض المعاملات
            </Link>
          </div>

        ) : (
          /* ── Main grid ───────────────────────────────────────────────── */
          <div className="mf-main-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,2fr)', gap: 16 }}>

            {/* List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {procs.map((proc, idx) => {
                const isActive = selected?.id === proc.id
                return (
                  <button
                    type="button"
                    key={proc.id}
                    onClick={() => setSelected(proc)}
                    aria-pressed={isActive}
                    aria-label={proc.title_ar}
                    className="proc-btn"
                    onTouchStart={e => { if (!isActive) { e.currentTarget.style.borderColor = 'rgba(139,26,26,0.4)'; e.currentTarget.style.background = '#FEF9F9' } }}
                    onTouchEnd={e => { if (!isActive) { e.currentTarget.style.borderColor = '#EAE4D9'; e.currentTarget.style.background = '#fff' } }}
                    style={{
                      width: '100%', textAlign: 'right', padding: '14px 16px', borderRadius: 18,
                      border: isActive ? '2px solid #8B1A1A' : '1.5px solid #EAE4D9',
                      background: isActive ? '#FEF7F7' : '#fff',
                      boxShadow: isActive ? '0 2px 10px rgba(139,26,26,0.13)' : '0 1px 3px rgba(0,0,0,0.04)',
                      cursor: 'pointer', fontFamily: "'Cairo','Inter',sans-serif", transition: 'border-color 0.15s, background 0.15s, box-shadow 0.15s cubic-bezier(0.22,1,0.36,1)',
                      animation: 'mfEnter 0.24s cubic-bezier(0.22,1,0.36,1) both',
                      animationDelay: `${Math.min(idx, 8) * 0.06}s`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 10.5, padding: '2px 9px', borderRadius: 20, fontWeight: 700, ...statusStyle(proc.status) }}>
                        {statusLabel(proc.status)}
                      </span>
                      <span style={{ fontSize: 10, color: '#9C8E80' }}>
                        {new Date(proc.updated_at).toLocaleDateString('ar-LB')}
                      </span>
                    </div>
                    <h3 style={{ fontSize: 13, fontWeight: 800, color: '#1A1208', margin: '0 0 10px', lineHeight: 1.4, textAlign: 'right' }}>
                      {proc.title_ar}
                    </h3>
                    {/* Progress bar */}
                    <div style={{ width: '100%', background: '#EAE4D9', borderRadius: 99, height: 5, marginBottom: 5 }}>
                      <div style={{ width: `${proc.completion_pct}%`, background: barColor(proc.completion_pct), height: 5, borderRadius: 99, transition: 'width 0.4s ease' }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 10.5, color: '#9C8E80' }}>{proc.completion_pct}% مكتمل</span>
                      {proc.next_step && proc.next_step !== 'مكتمل' && (
                        <span style={{ fontSize: 10, color: '#8B1A1A', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '55%' }}>
                          <svg aria-hidden="true" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{display:'inline',verticalAlign:'middle',marginLeft:2}}><path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6"/></svg> {proc.next_step}
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Detail panel */}
            <div ref={detailRef}>
              {/* Mobile back button */}
              {selected && (
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="mf-back-btn"
                  style={{ display: 'none', alignItems: 'center', gap: 6, marginBottom: 12, padding: '6px 12px', background: '#FAFAF8', border: '1px solid #EAE4D9', borderRadius: 9, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, color: '#5C4A3A' }}
                >
                  <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6"/></svg>
                  العودة إلى القائمة
                </button>
              )}
              {!selected ? (
                <div style={{
                  background: '#fff', borderRadius: 20, border: '1.5px solid #EAE4D9',
                  padding: '60px 20px', textAlign: 'center', color: '#9C8E80',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 320,
                }}>
                  <div style={{ marginBottom: 12, opacity: 0.5, display: 'flex', justifyContent: 'center' }}><svg aria-hidden="true" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9C8E80" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg></div>
                  <p style={{ fontSize: 13, margin: 0 }}>اختر معاملة من القائمة لعرض تفاصيلها</p>
                </div>
              ) : (
                <div key={selected.id} style={{ background: '#fff', borderRadius: 20, border: '1.5px solid #EAE4D9', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', overflow: 'hidden', animation: 'mfEnter 0.25s cubic-bezier(0.22,1,0.36,1) both' }}>

                  {/* Panel header */}
                  <div style={{ padding: '20px 22px 18px', borderBottom: '1px solid #EAE4D9', background: '#FAFAF8' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                      <div style={{ flex: 1 }}>
                        <h2 style={{ fontSize: 17, fontWeight: 800, color: '#1A1208', margin: '0 0 7px', lineHeight: 1.3 }}>
                          {selected.title_ar}
                        </h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 20, fontWeight: 700, ...statusStyle(selected.status) }}>
                            {statusLabel(selected.status)}
                          </span>
                          <span style={{ fontSize: 11, color: '#9C8E80' }}>
                            بدأت: {new Date(selected.created_at).toLocaleDateString('ar-LB')}
                          </span>
                        </div>
                      </div>
                      {confirmDelete === selected.id ? (
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <span style={{ fontSize: 11, color: '#9C8E80' }}>تأكيد الحذف؟</span>
                          <button
                            type="button"
                            onClick={() => deleteProc(selected.id)}
                            style={{ background: '#FEF2F2', border: '1px solid #FECACA', cursor: 'pointer', color: '#8B1A1A', fontSize: 11, padding: '4px 10px', borderRadius: 8, fontFamily: 'inherit', fontWeight: 700 }}
                          >
                            نعم
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDelete(null)}
                            style={{ background: '#FAFAF8', border: '1px solid #EAE4D9', cursor: 'pointer', color: '#5C4A3A', fontSize: 11, padding: '4px 10px', borderRadius: 8, fontFamily: 'inherit' }}
                          >
                            لا
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(selected.id)}
                          style={{ background: 'none', border: '1px solid #EAE4D9', cursor: 'pointer', color: '#9C8E80', fontSize: 12, padding: '5px 10px', borderRadius: 9, fontFamily: 'inherit', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                          حذف
                        </button>
                      )}
                    </div>

                    {/* Big progress */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: 13, color: '#5C4A3A' }}>التقدم الكلي</span>
                        <span style={{ fontSize: 24, fontWeight: 900, color: pctColor(selected.completion_pct) }}>
                          {selected.completion_pct}%
                        </span>
                      </div>
                      <div style={{ width: '100%', background: '#EAE4D9', borderRadius: 99, height: 10 }}>
                        <div style={{ width: `${selected.completion_pct}%`, background: barColor(selected.completion_pct), height: 10, borderRadius: 99, transition: 'width 0.4s ease' }} />
                      </div>
                      {selected.next_step && selected.next_step !== 'مكتمل' && (
                        <p style={{ fontSize: 12.5, color: '#8B1A1A', margin: '8px 0 0', fontWeight: 600 }}>
                          <svg aria-hidden="true" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{display:'inline',verticalAlign:'middle',marginLeft:3}}><path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6"/></svg> الخطوة التالية: <span style={{ fontWeight: 800 }}>{selected.next_step}</span>
                        </p>
                      )}
                      {selected.completion_pct === 100 && (
                        <p style={{ fontSize: 12.5, color: '#78350F', margin: '8px 0 0', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#78350F" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                          تمت المعاملة بنجاح!
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Checklist + docs */}
                  <div style={{ padding: '18px 22px' }}>
                    <h3 style={{ fontSize: 13.5, fontWeight: 800, color: '#1A1208', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg> قائمة الخطوات
                      {saving && <span style={{ fontSize: 11, color: '#9C8E80', fontWeight: 400 }}>جارٍ الحفظ...</span>}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {selected.checklist.map((step, si) => (
                        <button
                          type="button"
                          key={step.step}
                          aria-pressed={step.done}
                          onClick={() => toggleStep(selected, step.step)}
                          className="step-btn"
                          onTouchStart={e => { e.currentTarget.style.transform = 'scale(0.99)'; e.currentTarget.style.background = step.done ? '#FFF3C4' : '#FEF2F2' }}
                          onTouchEnd={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = step.done ? '#FFFBEB' : '#FAFAF8' }}
                          style={{
                            width: '100%', textAlign: 'right', display: 'flex', alignItems: 'flex-start', gap: 12,
                            padding: '11px 13px', borderRadius: 12,
                            border: step.done ? '1.5px solid #FDE68A' : '1.5px solid #EAE4D9',
                            background: step.done ? '#FFFBEB' : '#FAFAF8',
                            cursor: 'pointer', fontFamily: "'Cairo','Inter',sans-serif", transition: 'border-color 0.15s, background 0.15s, box-shadow 0.15s cubic-bezier(0.22,1,0.36,1)',
                      animation: 'mfEnter 0.24s cubic-bezier(0.22,1,0.36,1) both',
                      animationDelay: `${Math.min(si, 8) * 0.06}s`,
                          }}
                        >
                          <span style={{
                            flexShrink: 0, width: 24, height: 24, borderRadius: '50%',
                            border: step.done ? '2px solid #B45309' : '2px solid #D4C5B0',
                            background: step.done ? '#B45309' : 'transparent',
                            color: step.done ? '#fff' : '#9C8E80',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 10, fontWeight: 800, marginTop: 2, flexShrink: 0,
                          }}>
                            {step.done ? <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg> : step.step}
                          </span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{
                              fontSize: 13, fontWeight: 700, margin: '0 0 2px',
                              color: step.done ? '#78350F' : '#1A1208',
                              textDecoration: step.done ? 'line-through' : 'none',
                            }}>
                              {step.title_ar}
                            </p>
                            <p style={{ fontSize: 11.5, color: '#5C4A3A', margin: 0, lineHeight: 1.5 }}>{step.desc_ar}</p>
                            {step.done && step.done_at && (
                              <p style={{ fontSize: 10.5, color: '#78350F', margin: '3px 0 0', display: 'flex', alignItems: 'center', gap: 3 }}>
                                <svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#78350F" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                                {new Date(step.done_at).toLocaleDateString('ar-LB')}
                              </p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Documents */}
                    {selected.documents && selected.documents.length > 0 && (
                      <div style={{ marginTop: 22 }}>
                        <h3 style={{ fontSize: 13.5, fontWeight: 800, color: '#1A1208', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                          المستندات المطلوبة
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {selected.documents.map((doc, i) => (
                            <div key={i} style={{
                              display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
                              borderRadius: 10, border: '1.5px solid',
                              borderColor: doc.uploaded ? '#FDE68A' : doc.required ? 'rgba(139,26,26,0.2)' : '#EAE4D9',
                              background: doc.uploaded ? '#FFFBEB' : doc.required ? '#FEF7F7' : '#FAFAF8',
                            }}>
                              <div style={{
                                width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                                background: doc.uploaded ? '#B45309' : doc.required ? '#FEF2F2' : '#EAE4D9',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: doc.uploaded ? '#fff' : doc.required ? '#8B1A1A' : '#9C8E80',
                              }}>
                                {doc.uploaded
                                  ? <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                                  : <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                                }
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontSize: 12.5, fontWeight: 700, color: doc.uploaded ? '#78350F' : '#1A1208', margin: 0, textDecoration: doc.uploaded ? 'line-through' : 'none' }}>
                                  {doc.name_ar}
                                </p>
                                {doc.required && !doc.uploaded && (
                                  <p style={{ fontSize: 10.5, color: '#8B1A1A', margin: '2px 0 0', fontWeight: 600 }}>مطلوب</p>
                                )}
                              </div>
                              {doc.uploaded && (
                                <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#B45309" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {selected.notes && (
                      <div style={{ marginTop: 16, padding: '12px 14px', background: '#FFFBEB', borderRadius: 12, border: '1px solid #FEF08A' }}>
                        <h4 style={{ fontSize: 12, fontWeight: 700, color: '#854D0E', margin: '0 0 5px', display: 'flex', alignItems: 'center', gap: 5 }}>
                          <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                          ملاحظات
                        </h4>
                        <p style={{ fontSize: 12, color: '#854D0E', margin: 0, lineHeight: 1.6 }}>{selected.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="bottom-nav-wrapper">
        <BottomNav isAr={true} activeTab="account" />
      </div>
    </div>
  )
}
               