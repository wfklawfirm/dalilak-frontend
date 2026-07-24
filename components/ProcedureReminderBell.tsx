'use client'

/**
 * ProcedureReminderBell — inline bell button for per-procedure reminders.
 *
 * Shows a bell icon on each enriched procedure card.
 * If active (non-dismissed) reminders exist for this procedure → amber pulsing bell + count.
 * Clicking opens a popover to add a new reminder for the procedure.
 *
 * A "reminder for this procedure" is any ReminderEntry whose title contains the proc title.
 *
 * LS key: dalilak_reminders (shared with SmartReminder)
 * Dispatches dalilak_saved_change on add.
 *
 * Props: { code: string; titleAr: string; titleEn?: string; isAr: boolean }
 */

import React, { useState, useEffect, useRef } from 'react'
import { getReminders, type ReminderEntry } from '@/components/SmartReminder'

interface Props {
  code: string
  titleAr: string
  titleEn?: string
  isAr: boolean
}

function getTodayLb(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Beirut' })
}

function getTomorrowLb(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Beirut' })
}

function getInWeek(): string {
  const d = new Date()
  d.setDate(d.getDate() + 7)
  return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Beirut' })
}

function addReminder(title: string, date: string) {
  try {
    const list: ReminderEntry[] = JSON.parse(localStorage.getItem('dalilak_reminders') || '[]')
    list.push({ id: Date.now().toString(), title, date, dismissed: false, createdAt: getTodayLb() })
    localStorage.setItem('dalilak_reminders', JSON.stringify(list))
    window.dispatchEvent(new Event('dalilak_saved_change'))
  } catch {}
}

export default function ProcedureReminderBell({ code, titleAr, titleEn, isAr }: Props) {
  const [open, setOpen]         = useState(false)
  const [remCount, setRemCount] = useState(0)
  const [added, setAdded]       = useState(false)
  const [mounted, setMounted]   = useState(false)
  const [customDate, setCustomDate] = useState('')
  const popRef = useRef<HTMLDivElement>(null)

  const procTitle = isAr ? titleAr : (titleEn || titleAr)

  function refresh() {
    const rems = getReminders().filter(r => !r.dismissed && r.title.includes(titleAr))
    setRemCount(rems.length)
  }

  useEffect(() => {
    setMounted(true)
    refresh()
    window.addEventListener('dalilak_saved_change', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('dalilak_saved_change', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (popRef.current && !popRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  function quickAdd(date: string) {
    const label = isAr
      ? `تذكير: ${titleAr} — ${date}`
      : `Reminder: ${titleEn || titleAr} — ${date}`
    addReminder(label, date)
    setAdded(true)
    setOpen(false)
    refresh()
    setTimeout(() => setAdded(false), 2500)
  }

  if (!mounted) return null

  const isActive = remCount > 0

  return (
    <span style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        type="button"
        className="tap-hit-9"
        onClick={() => { setOpen(v => !v); setAdded(false) }}
        aria-label={isAr ? 'إضافة تذكير' : 'Add reminder'}
        title={isAr ? 'إضافة تذكير' : 'Add reminder'}
        style={{
          width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: isActive ? 'rgba(245,158,11,0.12)' : 'transparent',
          border: `1px solid ${isActive ? 'rgba(245,158,11,0.35)' : '#D1CBC4'}`,
          cursor: 'pointer', position: 'relative',
          transition: 'background 0.15s, border 0.15s',
        }}
      >
        <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none"
          stroke={isActive ? '#D97706' : '#918B82'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ animation: isActive ? 'bellRing 1.4s infinite' : 'none' }}
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {remCount > 0 && (
          <span style={{
            position: 'absolute', top: -3, right: isAr ? undefined : -3, left: isAr ? -3 : undefined,
            width: 12, height: 12, borderRadius: '50%', background: '#F59E0B',
            fontSize: 7, fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {remCount > 9 ? '9+' : remCount}
          </span>
        )}
      </button>

      {/* Popover */}
      {open && (
        <div ref={popRef} dir={isAr ? 'rtl' : 'ltr'} style={{
          position: 'absolute', top: 32, [isAr ? 'right' : 'left']: 0, zIndex: 120,
          background: '#fff', border: '1.5px solid #E6E2DC', borderRadius: 12,
          boxShadow: '0 6px 24px rgba(0,0,0,0.12)', padding: '12px 14px', minWidth: 210,
        }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#191713', marginBottom: 8 }}>
            🔔 {isAr ? 'تذكير لـ' : 'Reminder for'}
            <div style={{ fontSize: 10, fontWeight: 600, color: '#8F1D2C', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 170 }}>
              {procTitle}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {[
              { label: isAr ? 'غداً' : 'Tomorrow', date: getTomorrowLb() },
              { label: isAr ? 'بعد أسبوع' : 'In one week', date: getInWeek() },
            ].map(opt => (
              <button key={opt.date} type="button" onClick={() => quickAdd(opt.date)}
                style={{
                  padding: '6px 10px', background: '#F5F3EE', border: '1px solid #E6E2DC',
                  borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit',
                  fontSize: 11, fontWeight: 600, color: '#191713', textAlign: isAr ? 'right' : 'left',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}
              >
                {opt.label}
                <span style={{ fontSize: 9.5, color: '#918B82' }}>{opt.date}</span>
              </button>
            ))}

            {/* Custom date picker */}
            <input
              type="date"
              value={customDate}
              min={getTodayLb()}
              onChange={e => setCustomDate(e.target.value)}
              style={{ padding: '5px 8px', border: '1px solid #E6E2DC', borderRadius: 8, fontSize: 11, fontFamily: 'inherit', color: '#191713', width: '100%' }}
            />
            {customDate && (
              <button type="button" onClick={() => { quickAdd(customDate); setCustomDate('') }}
                style={{ padding: '6px', background: '#8F1D2C', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 11, fontWeight: 700, fontFamily: 'inherit' }}
              >
                {isAr ? 'تعيين التذكير' : 'Set reminder'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Added flash */}
      {added && (
        <span style={{
          position: 'absolute', top: -24, [isAr ? 'right' : 'left']: 0,
          background: '#059669', color: '#fff', fontSize: 9.5, fontWeight: 700,
          padding: '2px 8px', borderRadius: 6, whiteSpace: 'nowrap', zIndex: 200,
          pointerEvents: 'none',
        }}>
          {isAr ? '✓ تم الحفظ' : '✓ Saved'}
        </span>
      )}

      <style>{`
        @keyframes bellRing {
          0%,100% { transform: rotate(0deg); }
          10%,50%  { transform: rotate(-12deg); }
          30%,70%  { transform: rotate(12deg); }
        }
      `}</style>
    </span>
  )
}
