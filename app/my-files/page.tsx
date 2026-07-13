'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getToken } from '@/lib/auth'

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
      headers: { Authorization: `Bearer ${token}` }
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
      headers: { Authorization: `Bearer ${token}` }
    })
    setProcs(ps => ps.filter(p => p.id !== procId))
    if (selected?.id === procId) setSelected(null)
  }

  const statusColor = (s: string): React.CSSProperties => {
    const map: Record<string, React.CSSProperties> = {
      active:    { background: '#EFF6FF', color: '#1D4ED8' },
      completed: { background: '#F0FDF4', color: '#16A34A' },
      cancelled: { background: '#F3F4F6', color: '#6B7280' },
    }
    return map[s] || { background: '#F3F4F6', color: '#6B7280' }
  }

  const statusLabel = (s: string) => ({
    active: 'جارية', completed: 'مكتملة', cancelled: 'ملغاة',
  }[s] || s)

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', fontFamily: "'Cairo','Inter',sans-serif" }} dir="rtl">
      <style>{`* { box-sizing: border-box; } ::-webkit-scrollbar { width: 3px; } ::-webkit-scrollbar-thumb { background: #E5E7EB; }`}</style>

      {/* Header */}
      <header style={{ background: 'linear-gradient(135deg, #6b2737 0%, #8B1A1A 100%)', padding: '12px 16px', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => router.push('/')}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', padding: 4, display: 'flex', flexShrink: 0 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>🗂️ ملفاتي</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)' }}>متابعة معاملاتك الحكومية</div>
          </div>
          <Link
            href="/services"
            style={{
              background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: 10, padding: '6px 14px', color: '#fff', fontSize: 12,
              fontWeight: 700, textDecoration: 'none', fontFamily: "'Cairo','Inter',sans-serif",
            }}
          >
            + معاملة جديدة
          </Link>
        </div>
      </header>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '20px 14px 80px' }}>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '64px 0', color: '#9CA3AF', fontSize: 14 }}>جارٍ التحميل...</div>
        ) : procs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 20px' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>📂</div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#374151', margin: '0 0 8px' }}>لا توجد معاملات بعد</h2>
            <p style={{ color: '#9CA3AF', fontSize: 13, margin: '0 0 24px' }}>ابحث عن معاملتك وابدأ متابعتها</p>
            <Link
              href="/services"
              style={{ display: 'inline-block', background: '#1D4ED8', color: '#fff', padding: '12px 32px', borderRadius: 14, fontWeight: 700, textDecoration: 'none', fontSize: 14 }}
            >
              استعرض المعاملات
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,2fr)', gap: 16 }}>

            {/* List column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {procs.map(proc => (
                <button
                  key={proc.id}
                  onClick={() => setSelected(proc)}
                  style={{
                    width: '100%', textAlign: 'right', padding: '14px', borderRadius: 18,
                    border: selected?.id === proc.id ? '2px solid #3B82F6' : '1.5px solid #F0F0F0',
                    background: selected?.id === proc.id ? '#fff' : '#fff',
                    boxShadow: selected?.id === proc.id ? '0 2px 8px rgba(59,130,246,0.15)' : '0 1px 3px rgba(0,0,0,0.04)',
                    cursor: 'pointer', fontFamily: "'Cairo','Inter',sans-serif", transition: 'all 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 10.5, padding: '2px 8px', borderRadius: 20, fontWeight: 700, ...statusColor(proc.status) }}>
                      {statusLabel(proc.status)}
                    </span>
                    <span style={{ fontSize: 10, color: '#9CA3AF' }}>
                      {new Date(proc.updated_at).toLocaleDateString('ar-LB')}
                    </span>
                  </div>
                  <h3 style={{ fontSize: 13, fontWeight: 800, color: '#111827', margin: '0 0 10px', lineHeight: 1.4 }}>{proc.title_ar}</h3>

                  {/* Progress bar */}
                  <div style={{ width: '100%', background: '#F3F4F6', borderRadius: 99, height: 6, marginBottom: 4 }}>
                    <div style={{ width: `${proc.completion_pct}%`, background: '#3B82F6', height: 6, borderRadius: 99, transition: 'width 0.3s' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 10.5, color: '#6B7280' }}>{proc.completion_pct}% مكتمل</span>
                    {proc.next_step && (
                      <span style={{ fontSize: 10, color: '#2563EB', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '50%' }}>
                        التالي: {proc.next_step}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Detail column */}
            <div>
              {!selected ? (
                <div style={{
                  background: '#fff', borderRadius: 20, border: '1.5px solid #F0F0F0',
                  padding: '60px 20px', textAlign: 'center', color: '#9CA3AF',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300,
                }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>👆</div>
                  <p style={{ fontSize: 13 }}>اختر معاملة لعرض تفاصيلها</p>
                </div>
              ) : (
                <div style={{ background: '#fff', borderRadius: 20, border: '1.5px solid #F0F0F0', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>

                  {/* Header */}
                  <div style={{ padding: '18px 20px', borderBottom: '1px solid #F3F4F6' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div>
                        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111827', margin: '0 0 6px' }}>{selected.title_ar}</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 700, ...statusColor(selected.status) }}>
                            {statusLabel(selected.status)}
                          </span>
                          <span style={{ fontSize: 11, color: '#9CA3AF' }}>
                            بدأت: {new Date(selected.created_at).toLocaleDateString('ar-LB')}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteProc(selected.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: 12, padding: '4px 8px', borderRadius: 8 }}
                      >
                        🗑️ حذف
                      </button>
                    </div>

                    {/* Big progress */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: 13, color: '#6B7280' }}>التقدم الكلي</span>
                        <span style={{ fontSize: 22, fontWeight: 800, color: '#1D4ED8' }}>{selected.completion_pct}%</span>
                      </div>
                      <div style={{ width: '100%', background: '#F3F4F6', borderRadius: 99, height: 10 }}>
                        <div style={{ width: `${selected.completion_pct}%`, background: '#3B82F6', height: 10, borderRadius: 99, transition: 'width 0.3s' }} />
                      </div>
                      {selected.next_step && selected.next_step !== 'مكتمل' && (
                        <p style={{ fontSize: 12.5, color: '#2563EB', margin: '8px 0 0' }}>
                          ▶ الخطوة التالية: <strong>{selected.next_step}</strong>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Checklist */}
                  <div style={{ padding: '16px 20px' }}>
                    <h3 style={{ fontSize: 14, fontWeight: 800, color: '#1F2937', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>📋</span> قائمة الخطوات
                      {saving && <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 400 }}>جارٍ الحفظ...</span>}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {selected.checklist.map(step => (
                        <button
                          key={step.step}
                          onClick={() => toggleStep(selected, step.step)}
                          style={{
                            width: '100%', textAlign: 'right', display: 'flex', alignItems: 'flex-start', gap: 12,
                            padding: '10px 12px', borderRadius: 12,
                            border: step.done ? '1.5px solid #BBF7D0' : '1.5px solid #E5E7EB',
                            background: step.done ? '#F0FDF4' : '#F9FAFB',
                            cursor: 'pointer', fontFamily: "'Cairo','Inter',sans-serif", transition: 'all 0.15s',
                          }}
                        >
                          <span style={{
                            flexShrink: 0, width: 24, height: 24, borderRadius: '50%',
                            border: step.done ? '2px solid #16A34A' : '2px solid #D1D5DB',
                            background: step.done ? '#16A34A' : 'transparent',
                            color: step.done ? '#fff' : '#6B7280',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 11, fontWeight: 700, marginTop: 2,
                          }}>
                            {step.done ? '✓' : step.step}
                          </span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 13, fontWeight: 700, margin: '0 0 2px', color: step.done ? '#15803D' : '#111827', textDecoration: step.done ? 'line-through' : 'none' }}>
                              {step.title_ar}
                            </p>
                            <p style={{ fontSize: 11.5, color: '#6B7280', margin: 0 }}>{step.desc_ar}</p>
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
                      <div style={{ marginTop: 20 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 800, color: '#1F2937', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span>📄</span> المستندات
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                          {selected.documents.map((doc, i) => (
                            <div
                              key={i}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10,
                                border: doc.uploaded ? '1.5px solid #BBF7D0' : '1.5px solid #E5E7EB',
                                background: doc.uploaded ? '#F0FDF4' : '#F9FAFB',
                              }}
                            >
                              <span style={{ fontSize: 16 }}>{doc.uploaded ? '✅' : (doc.required ? '📋' : '📝')}</span>
                              <span style={{ flex: 1, fontSize: 12.5, color: doc.uploaded ? '#15803D' : '#374151' }}>{doc.name_ar}</span>
                              {!doc.required && <span style={{ fontSize: 10, color: '#9CA3AF' }}>اختياري</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    <div style={{ marginTop: 20 }}>
                      <h3 style={{ fontSize: 14, fontWeight: 800, color: '#1F2937', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>📝</span> ملاحظات
                      </h3>
                      <textarea
                        style={{
                          width: '100%', padding: '10px 12px', borderRadius: 12, border: '1.5px solid #E5E7EB',
                          fontSize: 13, resize: 'none', outline: 'none', background: '#F9FAFB',
                          fontFamily: "'Cairo','Inter',sans-serif", lineHeight: 1.6,
                        }}
                        rows={3}
                        placeholder="أضف ملاحظات..."
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
    </div>
  )
}
