'use client'

/**
 * ProcedureRemindMeLater — one-click "remind me in X days" button.
 *
 * Attaches to a specific procedure. User picks 1 / 3 / 7 / 14 days
 * and a reminder is added to dalilak_reminders (same store as SmartReminder).
 *
 * Shows a confirmation chip once set. Clicking the chip cancels the reminder.
 *
 * Props: { code: string; titleAr: string; titleEn?: string; isAr: boolean }
 */

import React, { useState, useEffect } from 'react'
import { getReminders, type ReminderEntry } from '@/components/SmartReminder'

interface Props {
  code: string
  titleAr: string
  titleEn?: string
  isAr: boolean
}

const REMINDER_ID_PREFIX = 'quick_'
const DURATIONS = [
  { days: 1,  labelAr: 'غداً',      labelEn: 'Tomorrow' },
  { days: 3,  labelAr: 'بعد 3 أيام', labelEn: 'In 3 days' },
  { days: 7,  labelAr: 'أسبوع',     labelEn: '1 week' },
  { days: 14, labelAr: 'أسبوعين',   labelEn: '2 weeks' },
]

function addDays(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Beirut' })
}

function saveReminder(entry: ReminderEntry) {
  try {
    const list: ReminderEntry[] = JSON.parse(localStorage.getItem('dalilak_reminders') || '[]')
    list.push(entry)
    localStorage.setItem('dalilak_reminders', JSON.stringify(list))
    window.dispatchEvent(new Event('dalilak_saved_change'))
  } catch {}
}

function removeReminder(id: string) {
  try {
    const list: ReminderEntry[] = JSON.parse(localStorage.getItem('dalilak_reminders') || '[]')
    const updated = list.filter(r => r.id !== id)
    localStorage.setItem('dalilak_reminders', JSON.stringify(updated))
    window.dispatchEvent(new Event('dalilak_saved_change'))
  } catch {}
}

function getExistingReminder(code: string): ReminderEntry | null {
  const list = getReminders()
  const id = `${REMINDER_ID_PREFIX}${code}`
  return list.find(r => r.id === id) || null
}

export default function ProcedureRemindMeLater({ code, titleAr, titleEn, isAr }: Props) {
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const [existing, setExisting] = useState<ReminderEntry | null>(null)
  const [justAdded, setJustAdded] = useState(false)

  useEffect(() => {
    setMounted(true)
    setExisting(getExistingReminder(code))
  }, [code])

  function pick(days: number) {
    const id = `${REMINDER_ID_PREFIX}${code}`
    const title = isAr ? titleAr : (titleEn || titleAr)
    const entry: ReminderEntry = {
      id,
      title: `📋 ${title}`,
      date: addDays(days),
      dismissed: false,
      createdAt: new Date().toISOString(),
    }
    // Remove any existing quick reminder for this code first
    removeReminder(id)
    saveReminder(entry)
    setExisting(entry)
    setOpen(false)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 2500)
  }

  function cancel() {
    const id = `${REMINDER_ID_PREFIX}${code}`
    removeReminder(id)
    setExisting(null)
  }

  if (!mounted) return null

  // Already has a reminder — show it as a cancellable chip
  if (existing) {
    const dateStr = new Date(existing.date + 'T00:00:00').toLocaleDateString(
      isAr ? 'ar-LB' : 'en-GB',
      { day: 'numeric', month: 'short', timeZone: 'Asia/Beirut' }
    )
    return (
      <div dir={isAr ? 'rtl' : 'ltr'} style={{ marginBottom: 6 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: justAdded ? '#D1FAE5' : '#EFF6FF',
          border: `1.5px solid ${justAdded ? 'rgba(16,185,129,0.4)' : '#BFDBFE'}`,
          borderRadius: 20, padding: '5px 11px',
          fontSize: 10.5, fontWeight: 700,
          color: justAdded ? '#065F46' : '#1D4ED8',
          transition: 'background 0.4s, border 0.4s, color 0.4s',
        }}>
          <span style={{ fontSize: 13 }}>{justAdded ? '✅' : '🔔'}</span>
          {justAdded
            ? (isAr ? 'تم إضافة التذكير!' : 'Reminder set!')
            : (isAr ? `تذكير في ${dateStr}` : `Reminder on ${dateStr}`)
          }
          {!justAdded && (
            <button
              type="button"
              onClick={cancel}
              title={isAr ? 'إلغاء التذكير' : 'Cancel reminder'}
              aria-label={isAr ? 'إلغاء التذكير' : 'Cancel reminder'}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#93C5FD', fontSize: 11, lineHeight: 1, padding: '0 0 0 3px' }}
            >✕</button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div dir={isAr ? 'rtl' : 'ltr'} style={{ marginBottom: 6, position: 'relative', display: 'inline-block' }}>
      {/* Duration picker */}
      {open && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 4px)',
          [isAr ? 'right' : 'left']: 0,
          background: '#fff', border: '1.5px solid #BFDBFE',
          borderRadius: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
          padding: 5, zIndex: 40,
          display: 'flex', flexDirection: 'column', gap: 2, minWidth: 130,
        }}>
          {DURATIONS.map(d => (
            <button
              key={d.days}
              type="button"
              onClick={() => pick(d.days)}
              style={{
                textAlign: 'start', padding: '6px 10px', borderRadius: 7,
                border: 'none', background: 'transparent', cursor: 'pointer',
                fontSize: 11, fontWeight: 700, color: '#1D4ED8',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#EFF6FF')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              🔔 {isAr ? d.labelAr : d.labelEn}
            </button>
          ))}
        </div>
      )}

      {/* Trigger chip */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '4px 10px', borderRadius: 20,
          background: '#EFF6FF', border: '1.5px solid #BFDBFE',
          cursor: 'pointer', fontFamily: 'inherit',
          fontSize: 10.5, fontWeight: 700, color: '#1D4ED8',
          transition: 'background 0.12s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = '#DBEAFE')}
        onMouseLeave={e => (e.currentTarget.style.background = '#EFF6FF')}
      >
        <span style={{ fontSize: 12 }}>🔔</span>
        {isAr ? 'ذكّرني لاحقاً' : 'Remind me later'}
        <span style={{ fontSize: 9, opacity: 0.7 }}>{open ? '▲' : '▼'}</span>
      </button>
    </div>
  )
}
