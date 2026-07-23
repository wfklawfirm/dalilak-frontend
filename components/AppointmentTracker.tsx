'use client'

/**
 * AppointmentTracker — track upcoming government office appointments.
 * Persisted in localStorage under `dalilak_appointments`.
 * Shown on the homepage empty state.
 */

import React, { useState, useEffect, useCallback, useId } from 'react'
import { useLanguage } from '@/lib/LanguageContext'

interface Appointment {
  id: string
  titleAr: string
  titleEn: string
  location: string
  date: string        // ISO date "YYYY-MM-DD"
  time?: string       // "HH:MM"
  noteAr?: string
  noteEn?: string
  createdAt: number
}

const LS_KEY = 'dalilak_appointments'

function loadAppts(): Appointment[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? (JSON.parse(raw) as Appointment[]) : []
  } catch { return [] }
}

function saveAppts(items: Appointment[]) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(items)) } catch { /* ignore */ }
}

/** Days until date (negative = past) */
function daysUntil(dateStr: string): number {
  const now = new Date(); now.setHours(0, 0, 0, 0)
  const d = new Date(dateStr + 'T00:00:00')
  return Math.round((d.getTime() - now.getTime()) / 86_400_000)
}

function urgency(days: number) {
  if (days < 0)  return { bg: '#FEF2F2', border: '#FECACA', text: '#DC2626', badge: '#EF4444', label: ['انتهى', 'Past'] }
  if (days === 0) return { bg: '#FFFBEB', border: '#FDE68A', text: '#B45309', badge: '#F59E0B', label: ['اليوم!', 'Today!'] }
  if (days <= 3)  return { bg: '#FFF7ED', border: '#FED7AA', text: '#C2410C', badge: '#F97316', label: [`${days}د`, `${days}d`] }
  if (days <= 7)  return { bg: '#F0FDF4', border: '#BBF7D0', text: '#15803D', badge: '#22C55E', label: [`${days}د`, `${days}d`] }
  return { bg: 'var(--surface-muted)', border: 'var(--border)', text: 'var(--text-2)', badge: 'var(--text-3)', label: [`${days}د`, `${days}d`] }
}

// Common Lebanese gov offices for quick-fill
const QUICK_PLACES = [
  { ar: 'نفوس الأحوال المدنية', en: 'Civil Registry' },
  { ar: 'مديرية السير', en: 'Traffic Directorate' },
  { ar: 'الأمن العام', en: 'General Security' },
  { ar: 'وزارة العمل', en: 'Ministry of Labor' },
  { ar: 'وزارة المالية', en: 'Ministry of Finance' },
  { ar: 'مكتب ضمان اجتماعي', en: 'NSSF Office' },
  { ar: 'بلدية', en: 'Municipality' },
]

interface Props {
  onAsk?: (q: string) => void
}

export default function AppointmentTracker({ onAsk }: Props) {
  const { isAr } = useLanguage()
  const uid = useId()

  const [appts, setAppts] = useState<Appointment[]>([])
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)          // panel expanded
  const [adding, setAdding] = useState(false)      // add-form visible
  const [editId, setEditId] = useState<string | null>(null)

  // Form state
  const [form, setForm] = useState<Omit<Appointment, 'id' | 'createdAt'>>({
    titleAr: '', titleEn: '', location: '', date: '', time: '',
    noteAr: '', noteEn: '',
  })

  const reload = useCallback(() => {
    const items = loadAppts().sort((a, b) => a.date.localeCompare(b.date))
    setAppts(items)
  }, [])

  useEffect(() => {
    setMounted(true)
    reload()
  }, [reload])

  if (!mounted) return null

  // Upcoming = not more than 30 days past
  const upcoming = appts.filter(a => daysUntil(a.date) >= -1)
  const hasSoon = upcoming.some(a => daysUntil(a.date) <= 3)

  function resetForm() {
    setForm({ titleAr: '', titleEn: '', location: '', date: '', time: '', noteAr: '', noteEn: '' })
    setEditId(null)
  }

  function startEdit(a: Appointment) {
    setForm({
      titleAr: a.titleAr, titleEn: a.titleEn, location: a.location,
      date: a.date, time: a.time || '', noteAr: a.noteAr || '', noteEn: a.noteEn || '',
    })
    setEditId(a.id)
    setAdding(true)
    setOpen(true)
  }

  function deleteAppt(id: string) {
    const updated = loadAppts().filter(a => a.id !== id)
    saveAppts(updated)
    reload()
  }

  function submitForm(e: React.FormEvent) {
    e.preventDefault()
    if (!form.date) return
    const title = form.titleAr || form.titleEn || (isAr ? 'موعد' : 'Appointment')
    const all = loadAppts()
    if (editId) {
      const updated = all.map(a => a.id === editId
        ? { ...a, ...form, titleAr: form.titleAr || title, titleEn: form.titleEn || title }
        : a)
      saveAppts(updated)
    } else {
      const newAppt: Appointment = {
        id: `appt_${Date.now()}`,
        titleAr: form.titleAr || title,
        titleEn: form.titleEn || title,
        location: form.location,
        date: form.date,
        time: form.time,
        noteAr: form.noteAr,
        noteEn: form.noteEn,
        createdAt: Date.now(),
      }
      saveAppts([...all, newAppt])
    }
    reload()
    setAdding(false)
    resetForm()
    setOpen(true)
  }

  const chipStyle: React.CSSProperties = {
    padding: '3px 8px', borderRadius: 6, fontSize: 10.5, fontWeight: 600,
    border: '1px solid var(--border)', background: 'var(--surface)',
    cursor: 'pointer', fontFamily: 'inherit', color: 'var(--text-2)',
    whiteSpace: 'nowrap', transition: 'border-color 0.12s, color 0.12s',
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px 10px', borderRadius: 8,
    border: '1px solid var(--border)', background: 'var(--bg)',
    fontSize: 13, fontFamily: 'inherit', color: 'var(--text-1)',
    outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        margin: '0 auto 14px',
        maxWidth: 720,
        borderRadius: 14,
        border: `1px solid ${hasSoon ? '#FDE68A' : 'var(--border)'}`,
        background: hasSoon ? '#FFFDF5' : 'var(--surface)',
        overflow: 'hidden',
        animation: 'fadeUp 0.18s ease',
      }}
    >
      {/* ── Header ── */}
      <button
        type="button"
        onClick={() => { setOpen(o => !o); setAdding(false) }}
        style={{
          display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between',
          padding: '11px 14px', background: 'transparent', border: 'none',
          cursor: 'pointer', fontFamily: 'inherit', textAlign: isAr ? 'right' : 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 17 }}>📅</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>
            {isAr ? 'مواعيدي' : 'My Appointments'}
          </span>
          {upcoming.length > 0 && (
            <span style={{
              background: hasSoon ? '#F59E0B' : 'var(--brand)',
              color: '#fff', borderRadius: 20, fontSize: 10, fontWeight: 700,
              padding: '1px 7px', lineHeight: 1.5,
            }}>
              {upcoming.length}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            onClick={e => { e.stopPropagation(); resetForm(); setAdding(true); setOpen(true) }}
            style={{
              fontSize: 11, fontWeight: 700, color: 'var(--brand)',
              background: 'rgba(143,29,44,0.06)', border: '1px solid rgba(143,29,44,0.15)',
              borderRadius: 7, padding: '3px 9px', cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            <svg aria-hidden="true" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            {isAr ? 'موعد جديد' : 'New'}
          </button>
          <svg
            aria-hidden="true" width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="var(--text-3)" strokeWidth="2"
            style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
          >
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </button>

      {/* ── Body ── */}
      {open && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>

          {/* Add / Edit form */}
          {adding && (
            <form
              onSubmit={submitForm}
              style={{
                background: 'var(--surface-muted)', borderRadius: 10,
                border: '1px solid var(--border)', padding: '12px 12px 10px',
                display: 'flex', flexDirection: 'column', gap: 8,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', marginBottom: 2 }}>
                {editId
                  ? (isAr ? 'تعديل الموعد' : 'Edit Appointment')
                  : (isAr ? 'إضافة موعد جديد' : 'Add New Appointment')}
              </div>

              {/* Title */}
              <input
                style={inputStyle}
                placeholder={isAr ? 'اسم الموعد (مثال: تجديد الجواز)' : 'Appointment title (e.g. Passport renewal)'}
                value={isAr ? form.titleAr : form.titleEn}
                onChange={e => setForm(f => isAr
                  ? { ...f, titleAr: e.target.value }
                  : { ...f, titleEn: e.target.value })}
              />

              {/* Quick-fill location chips */}
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>
                  {isAr ? 'الجهة:' : 'Location:'}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 5 }}>
                  {QUICK_PLACES.map(p => (
                    <button
                      key={p.en}
                      type="button"
                      style={{
                        ...chipStyle,
                        borderColor: form.location === (isAr ? p.ar : p.en) ? 'var(--brand)' : 'var(--border)',
                        color: form.location === (isAr ? p.ar : p.en) ? 'var(--brand)' : 'var(--text-2)',
                      }}
                      onClick={() => setForm(f => ({ ...f, location: isAr ? p.ar : p.en }))}
                    >
                      {isAr ? p.ar : p.en}
                    </button>
                  ))}
                </div>
                <input
                  style={inputStyle}
                  placeholder={isAr ? 'أو اكتب الجهة...' : 'Or type location...'}
                  value={form.location}
                  onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                />
              </div>

              {/* Date + Time */}
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 2 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 3 }}>
                    {isAr ? 'التاريخ*' : 'Date*'}
                  </div>
                  <input
                    type="date"
                    required
                    style={inputStyle}
                    value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 3 }}>
                    {isAr ? 'الوقت' : 'Time'}
                  </div>
                  <input
                    type="time"
                    style={inputStyle}
                    value={form.time}
                    onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                  />
                </div>
              </div>

              {/* Note */}
              <input
                style={inputStyle}
                placeholder={isAr ? 'ملاحظة (اختياري)' : 'Note (optional)'}
                value={isAr ? form.noteAr : form.noteEn}
                onChange={e => setForm(f => isAr
                  ? { ...f, noteAr: e.target.value }
                  : { ...f, noteEn: e.target.value })}
              />

              <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
                <button
                  type="submit"
                  style={{
                    flex: 1, padding: '8px 0', borderRadius: 8, fontSize: 12.5, fontWeight: 700,
                    background: 'var(--brand)', color: '#fff', border: 'none', cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  {editId
                    ? (isAr ? 'حفظ التعديل' : 'Save Changes')
                    : (isAr ? 'إضافة الموعد' : 'Add Appointment')}
                </button>
                <button
                  type="button"
                  onClick={() => { setAdding(false); resetForm() }}
                  style={{
                    padding: '8px 14px', borderRadius: 8, fontSize: 12.5, fontWeight: 600,
                    background: 'var(--surface)', color: 'var(--text-2)',
                    border: '1px solid var(--border)', cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </form>
          )}

          {/* Appointment list */}
          {upcoming.length === 0 && !adding && (
            <div style={{
              textAlign: 'center', padding: '18px 0', color: 'var(--text-4)', fontSize: 12.5,
            }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>📅</div>
              <div style={{ fontWeight: 600 }}>
                {isAr ? 'لا مواعيد قادمة' : 'No upcoming appointments'}
              </div>
              <div style={{ fontSize: 11.5, marginTop: 3 }}>
                {isAr ? 'أضف موعدك في الجهات الحكومية لتذكيرك به' : 'Add government office visits to track them'}
              </div>
            </div>
          )}

          {upcoming.map(a => {
            const days = daysUntil(a.date)
            const u = urgency(days)
            const title = isAr ? a.titleAr : a.titleEn
            const note = isAr ? a.noteAr : a.noteEn
            const dateLabel = new Date(a.date + 'T12:00:00').toLocaleDateString(
              isAr ? 'ar-LB' : 'en-LB',
              { weekday: 'short', month: 'short', day: 'numeric' }
            )
            return (
              <div
                key={a.id}
                style={{
                  background: u.bg, border: `1px solid ${u.border}`,
                  borderRadius: 10, padding: '10px 12px',
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                }}
              >
                {/* Date badge */}
                <div style={{
                  flexShrink: 0, textAlign: 'center', minWidth: 44,
                  background: u.badge, borderRadius: 8, padding: '4px 6px',
                }}>
                  <div style={{ fontSize: 15, fontWeight: 900, color: '#fff', lineHeight: 1 }}>
                    {new Date(a.date + 'T12:00:00').getDate()}
                  </div>
                  <div style={{ fontSize: 9, color: '#fff', opacity: 0.85, fontWeight: 600 }}>
                    {new Date(a.date + 'T12:00:00').toLocaleDateString(isAr ? 'ar-LB' : 'en-LB', { month: 'short' })}
                  </div>
                </div>

                {/* Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>
                      {title}
                    </span>
                    <span style={{
                      fontSize: 9.5, fontWeight: 700, color: u.text,
                      background: `${u.badge}22`, border: `1px solid ${u.border}`,
                      borderRadius: 4, padding: '1px 5px',
                    }}>
                      {isAr ? u.label[0] : u.label[1]}
                    </span>
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 2, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {a.location && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <svg aria-hidden="true" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                        </svg>
                        {a.location}
                      </span>
                    )}
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <svg aria-hidden="true" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                      </svg>
                      {dateLabel}{a.time ? ` · ${a.time}` : ''}
                    </span>
                  </div>
                  {note && (
                    <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 3, fontStyle: 'italic' }}>
                      {note}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
                  {onAsk && (
                    <button
                      type="button"
                      onClick={() => onAsk(isAr
                        ? `ما هي المستندات والمتطلبات لـ«${a.titleAr}» في «${a.location}»؟`
                        : `What documents do I need for "${a.titleEn}" at "${a.location}"?`)}
                      title={isAr ? 'اسأل دليلك' : 'Ask Dalilak'}
                      style={{
                        fontSize: 9.5, fontWeight: 700, color: 'var(--brand)',
                        background: 'rgba(143,29,44,0.06)',
                        border: '1px solid rgba(143,29,44,0.15)',
                        borderRadius: 6, padding: '3px 7px', cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      {isAr ? 'اسأل' : 'Ask'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => startEdit(a)}
                    title={isAr ? 'تعديل' : 'Edit'}
                    style={{
                      fontSize: 9.5, color: 'var(--text-3)', background: 'transparent',
                      border: '1px solid var(--border)', borderRadius: 6,
                      padding: '3px 7px', cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteAppt(a.id)}
                    title={isAr ? 'حذف' : 'Delete'}
                    style={{
                      fontSize: 9.5, color: 'var(--text-3)', background: 'transparent',
                      border: '1px solid var(--border)', borderRadius: 6,
                      padding: '3px 7px', cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            )
          })}

          {/* Past appointments note */}
          {appts.length > upcoming.length && (
            <div style={{ fontSize: 11, color: 'var(--text-4)', textAlign: 'center' }}>
              {isAr
                ? `${appts.length - upcoming.length} موعد منتهي مخفي`
                : `${appts.length - upcoming.length} past appointment(s) hidden`}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
