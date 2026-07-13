'use client'
import React, { useState, useEffect } from 'react'
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
    if (!confirm('هل أنت متأكد من حذف هذا الملف؟')) return
    const token = getToken()
    if (!token) return
    await fetch(`${API_URL}/my-procedures/${procId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    setProcs(ps => ps.filter(p => p.id !== procId))
    if (selected?.id === procId) setSelected(null)
  }

  const statusStyle = (s: string): React.CSSProperties => {
    const map: Record<string, React.CSSProperties> = {
      active:    { background: '#FEF2F2', color: '#8B1A1A', border: '1px solid rgba(139,26,26,0.2)' },
      completed: { background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0' },
      cancelled: { background: '#F3F4F6', color: '#6B7280', border: '1px solid #E5E7EB' },
    }
    return map[s] || { background: '#F3F4F6', color: '#6B7280', border: '1px solid #E5E7EB' }
  }

  const statusLabel = (s: string) => ({ active: 'جارية', completed: 'مكتملة', cancelled: 'ملغاة' }[s] || s)

  const pctColor = (pct: number) => pct === 100 ? '#16A34A' : '#8B1A1A'
  const barColor  = (pct: number) => pct === 100
    ? 'linear-gradient(90deg, #16A34A, #22C55E)'
    : 'linear-gradient(90deg, #8B1A1A, #C53030)'

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: "'Cairo','Inter',sans-serif" }} dir="rtl">
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: #EAE4D9; border-radius: 4px; }
        .proc-btn:hover { border-color: #8B1A1A !important; }
        .step-btn:hover { background: #FEF9F9 !important; }
        @keyframes mf-spin { to { transform: rotate(360deg) } }
      `}</style>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header style={{
        background: 'linear-gradient(135deg, #6b2737 0%, #8B1A1A 60%, #7a1818 100%)',
        boxShadow: '0 1px 0 rgba(255,255,255,0.06), 0 4px 24px rgba(80,10,10,0.3)',
        padding: '14px 16px', position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ maxWidth: 1060, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => router.push('/')}
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 9, color: '#fff', cursor: 'pointer', padding: '6px 8px', display: 'flex', flexShrink: 0 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
              display: 'flex', alignItems: 'center', gap: 5,
            }}
          >
            <span>+</span> معاملة جديدة
          </Link>
        </div>
      </header>

      <div style={{ maxWidth: 1060, margin: '0 auto', padding: '20px 14px 80px' }}>

        {/* ── Loading ─────────────────────────────────────────────────────── */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ width: 36, height: 36, border: '3px solid #EAE4D9', borderTopColor: '#8B1A1A', borderRadius: '50%', margin: '0 auto 14px', animation: 'mf-spin 0.8s linear infinite' }} />
            <p style={{ fontSize: 13, color: '#9C8E80', margin: 0 }}>جارٍ التحميل...</p>
          </div>

        ) : procs.length === 0 ? (
          /* ── Empty state ─────────────────────────────────────────────── */
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>📂</div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1A1208', margin: '0 0 8px' }}>لا توجد معاملات بعد</h2>
            <p style={{ color: '#9C8E80', fontSize: 13, margin: '0 0 24px' }}>ابحث عن معاملتك وابدأ متابعتها</p>
            <Link
              href="/services"
              style={{
                display: 'inline-block', background: 'linear-gradient(135deg, #7a1a1a, #8B1A1A)',
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
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,2fr)', gap: 16 }}>

            {/* List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {procs.map(proc => {
                const isActive = selected?.id === proc.id
                return (
                  <button
                    key={proc.id}
                    onClick={() => setSelected(proc)}
                    className="proc-btn"
                    style={{
                      width: '100%', textAlign: 'right', padding: '14px 16px', borderRadius: 18,
                      border: isActive ? '2px solid #8B1A1A' : '1.5px solid #EAE4D9',
                      background: isActive ? '#FFFBF9' : '#fff',
                      boxShadow: isActive ? '0 2px 10px rgba(139,26,26,0.13)' : '0 1px 3px rgba(0,0,0,0.04)',
                      cursor: 'pointer', fontFamily: "'Cairo','Inter',sans-serif", transition: 'all 0.15s',
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
                    <div style={{ width: '100%', background: '#F0EBE0', borderRadius: 99, height: 5, marginBottom: 5 }}>
                      <div style={{ width: `${proc.completion_pct}%`, background: barColor(proc.completion_pct), height: 5, borderRadius: 99, transition: 'width 0.4s ease' }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 10.5, color: '#9C8E80' }}>{proc.completion_pct}% مكتمل</span>
                      {proc.next_step && proc.next_step !== 'مكتمل' && (
                        <span style={{ fontSize: 10, color: '#8B1A1A', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '55%' }}>
                          ▸ {proc.next_step}
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Detail panel */}
            <div>
              {!selected ? (
                <div style={{
                  background: '#fff', borderRadius: 20, border: '1.5px solid #EAE4D9',
                  padding: '60px 20px', textAlign: 'center', color: '#9C8E80',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 320,
                }}>
                  <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.5 }}>👆</div>
                  <p style={{ fontSize: 13, margin: 0 }}>اختر معاملة من القائمة لعرض تفاصيلها</p>
                </div>
              ) : (
                <div style={{ background: '#fff', borderRadius: 20, border: '1.5px solid #EAE4D9', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>

                  {/* Panel header */}
                  <div style={{ padding: '20px 22px 18px', borderBottom: '1px solid #F0EBE0', background: 'linear-gradient(135deg, #FFFBF9 0%, #FFF7F5 100%)' }}>
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
                      <button
                        onClick={() => deleteProc(selected.id)}
                        style={{ background: 'none', border: '1px solid #EAE4D9', cursor: 'pointer', color: '#9C8E80', fontSize: 12, padding: '5px 10px', borderRadius: 9, fontFamily: 'inherit', flexShrink: 0 }}
                      >
                        🗑️ حذف
                      </button>
                    </div>

                    {/* Big progress */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: 13, color: '#6B7280' }}>التقدم الكلي</span>
                        <span style={{ fontSize: 24, fontWeight: 900, color: pctColor(selected.completion_pct) }}>
                          {selected.completion_pct}%
                        </span>
                      </div>
                      <div style={{ width: '100%', background: '#F0EBE0', borderRadius: 99, height: 10 }}>
                        <div style={{ width: `${selected.completion_pct}%`, background: barColor(selected.completion_pct), height: 10, borderRadius: 99, transition: 'width 0.4s ease' }} />
                      </div>
                      {selected.next_step && selected.next_step !== 'مكتمل' && (
                        <p style={{ fontSize: 12.5, color: '#8B1A1A', margin: '8px 0 0', fontWeight: 600 }}>
                          ▸ الخطوة التالية: <span style={{ fontWeight: 800 }}>{selected.next_step}</span>
                        </p>
                      )}
                      {selected.completion_pct === 100 && (
                        <p style={{ fontSize: 12.5, color: '#16A34A', margin: '8px 0 0', fontWeight: 700 }}>
                          ✓ تمت المعاملة بنجاح!
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Checklist + docs */}
                  <div style={{ padding: '18px 22px' }}>
                    <h3 style={{ fontSize: 13.5, fontWeight: 800, color: '#1A1208', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>📋</span> قائمة الخطوات
                      {saving && <span style={{ fontSize: 11, color: '#9C8E80', fontWeight: 400 }}>جارٍ الحفظ...</span>}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {selected.checklist.map(step => (
                        <button
                          key={step.step}
                          onClick={() => toggleStep(selected, step.step)}
                          className="step-btn"
                          style={{
                            width: '100%', textAlign: 'right', display: 'flex', alignItems: 'flex-start', gap: 12,
                            padding: '11px 13px', borderRadius: 12,
                            border: step.done ? '1.5px solid #BBF7D0' : '1.5px solid #EAE4D9',
                            background: step.done ? '#F0FDF4' : '#FAFAF8',
                            cursor: 'pointer', fontFamily: "'Cairo','Inter',sans-serif", transition: 'all 0.15s',
                          }}
                        >
                          <span style={{
                            flexShrink: 0, width: 24, height: 24, borderRadius: '50%',
                            border: step.done ? '2px solid #16A34A' : '2px solid #D4C5B0',
                            background: step.done ? '#16A34A' : 'transparent',
                            color: step.done ? '#fff' : '#9C8E80',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 10, fontWeight: 800, marginTop: 2, flexShrink: 0,
                          }}>
                            {step.done ? '✓' : step.step}
                          </span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{
                              fontSize: 13, fontWeight: 700, margin: '0 0 2px',
                              color: step.done ? '#15803D' : '#1A1208',
                              textDecoration: step.done ? 'line-through' : 'none',
                            }}>
                              {step.title_ar}
                            </p>
                            <p style={{ fontSize: 11.5, color: '#6B7280', margin: 0, lineHeight: 1.5 }}>{step.desc_ar}</p>
                            {step.done && step.done_at && (
                              <p style={{ fontSize: 10.5, color: '#16A34A', margin: '3px 0 0' }}>
                                ✓ {new Date(step.done_at).toLocaleDateString('ar-LB')}
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
                          <span>📄</span> المستندات المطلوبة
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                          {selected.documents.map((doc, i) => (
                            <div
                              key={i}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 13px', borderRadius: 10,
                                border: doc.uploaded ? '1.5px solid #BBF7D0' : '1.5px solid #EAE4D9',
                                background: doc.uploaded ? '#F0FDF4' : '#FAFAF8',
                              }}
                            >
                              <span style={{ fontSize: 16 }}>{doc.uploaded ? '✅' : (doc.required ? '📋' : '📝')}</span>
                              <span style={{ flex: 1, fontSize: 12.5, color: doc.uploaded ? '#15803D' : '#374151' }}>{doc.name_ar}</span>
                              {!doc.required && <span style={{ fontSize: 10, color: '#9C8E80', background: '#F0EBE0', borderRadius: 20, padding: '1px 7px' }}>اختياري</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    <div style={{ marginTop: 22 }}>
                      <h3 style={{ fontSize: 13.5, fontWeight: 800, color: '#1A1208', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>📝</span> ملاحظات
                      </h3>
                      <textarea
                        style={{
                          width: '100%', padding: '11px 13px', borderRadius: 12,
                          border: '1.5px solid #EAE4D9', fontSize: 13, resize: 'none',
                          outline: 'none', background: '#FAFAF8',
                          fontFamily: "'Cairo','Inter',sans-serif", lineHeight: 1.6,
                          color: '#1A1208',
                        }}
                        rows={3}
                        placeholder="أضف ملاحظات خاصة بك..."
                        defaultValue={selected.notes}
                        onBlur={async (e) => {
                          const token = getToken()
                          if (!token) return
                          await fetch(`${API_URL}/my-procedures/${selected.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                            body: JSON.stringify({ notes: e.target.value }),
                          })
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Nav — mobile */}
      <div className="bottom-nav-wrapper">
        <BottomNav isAr={true} activeTab="account" onHomeClick={() => router.push('/')} />
      </div>
    </div>
  )
}
