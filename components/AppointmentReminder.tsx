'use client'

/**
 * AppointmentReminder — toast popup for appointments within 24h.
 * On page load, reads dalilak_appointments and shows a fixed bottom toast
 * for each appointment ≤24h away (max 1 at a time, dismissable per session).
 * Session key: dalilak_reminder_dismissed_${id}
 */

import React, { useState, useEffect } from 'react'
import { useLanguage } from '@/lib/LanguageContext'

interface Appointment {
  id: string
  titleAr: string
  titleEn?: string
  location: string
  date: string   // YYYY-MM-DD
  time?: string  // HH:MM
  noteAr?: string
  noteEn?: string
  createdAt: number
}

const LS_APPOINTMENTS = 'dalilak_appointments'

function hoursUntil(dateStr: string, timeStr?: string): number {
  try {
    const iso = timeStr ? `${dateStr}T${timeStr}:00` : `${dateStr}T08:00:00`
    const diff = new Date(iso).getTime() - Date.now()
    return diff / (1000 * 60 * 60)
  } catch { return Infinity }
}

interface Props {
  onAsk?: (q: string) => void
}

export default function AppointmentReminder({ onAsk }: Props) {
  const { isAr } = useLanguage()
  const [reminder, setReminder] = useState<Appointment | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_APPOINTMENTS)
      if (!raw) return
      const apts: Appointment[] = JSON.parse(raw)
      // Find first non-dismissed appointment within 24h
      for (const apt of apts) {
        const h = hoursUntil(apt.date, apt.time)
        if (h >= 0 && h <= 24) {
          const dismissKey = `dalilak_reminder_dismissed_${apt.id}`
          if (!sessionStorage.getItem(dismissKey)) {
            setReminder(apt)
            // Slight delay so it doesn't flash on instant load
            setTimeout(() => setVisible(true), 800)
            break
          }
        }
      }
    } catch {}
  }, [])

  const dismiss = () => {
    if (reminder) {
      try { sessionStorage.setItem(`dalilak_reminder_dismissed_${reminder.id}`, '1') } catch {}
    }
    setVisible(false)
    setTimeout(() => setReminder(null), 300)
  }

  if (!reminder) return null

  const h = hoursUntil(reminder.date, reminder.time)
  const isToday = h >= 0 && h < 24
  const isVerySoon = h < 3

  const urgencyColor = isVerySoon ? '#dc2626' : '#d97706'
  const urgencyBg = isVerySoon ? '#fef2f2' : '#fffbeb'
  const urgencyBorder = isVerySoon ? '#fca5a5' : '#fde68a'

  const timeLabel = reminder.time
    ? (isAr ? `الساعة ${reminder.time}` : `at ${reminder.time}`)
    : ''

  const hLabel = h < 1
    ? (isAr ? 'خلال أقل من ساعة' : 'in less than an hour')
    : (isAr ? `خلال ~${Math.round(h)} ساعة` : `in ~${Math.round(h)}h`)

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      role="alert"
      aria-live="assertive"
      style={{
        position: 'fixed', bottom: 80, [isAr ? 'right' : 'left']: 16,
        maxWidth: 340, width: 'calc(100vw - 32px)',
        background: urgencyBg, border: `1.5px solid ${urgencyBorder}`,
        borderRadius: 16, zIndex: 9990,
        boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transition: 'opacity 0.28s ease, transform 0.28s ease',
        overflow: 'hidden',
      }}
    >
      {/* Top urgency stripe */}
      <div style={{ height: 3, background: urgencyColor }} />

      <div style={{ padding: '12px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <span style={{ fontSize: 22, flexShrink: 0 }}>
            {isVerySoon ? '🚨' : '🔔'}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: urgencyColor, marginBottom: 3 }}>
              {isAr ? 'تذكير بموعد قادم' : 'Upcoming Appointment'}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 3, lineHeight: 1.4 }}>
              {isAr ? reminder.titleAr : (reminder.titleEn || reminder.titleAr)}
            </div>
            <div style={{ fontSize: 11.5, color: '#6b7280', marginBottom: 2 }}>
              📍 {reminder.location}
            </div>
            {timeLabel && (
              <div style={{ fontSize: 11.5, color: '#6b7280', marginBottom: 4 }}>
                🕐 {timeLabel}
              </div>
            )}
            <div style={{
              fontSize: 11, fontWeight: 700, color: urgencyColor,
              background: `${urgencyColor}18`, borderRadius: 6, padding: '2px 8px',
              display: 'inline-block',
            }}>
              ⏳ {hLabel}
            </div>
          </div>
          <button
            type="button"
            onClick={dismiss}
            aria-label={isAr ? 'إغلاق' : 'Dismiss'}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#9ca3af', fontSize: 18, padding: '0 2px', flexShrink: 0,
            }}
          >×</button>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 7, marginTop: 10 }}>
          {onAsk && (
            <button
              type="button"
              onClick={() => {
                onAsk(isAr
                  ? `ما المستندات التي أحتاجها لموعد: ${reminder.titleAr}؟`
                  : `What documents do I need for appointment: ${reminder.titleEn || reminder.titleAr}?`)
                dismiss()
              }}
              style={{
                flex: 1, padding: '7px 10px', borderRadius: 8,
                background: urgencyColor, color: '#fff',
                border: 'none', cursor: 'pointer', fontSize: 11.5, fontWeight: 700,
              }}
            >
              💬 {isAr ? 'اسأل دليلك' : 'Ask Dalilak'}
            </button>
          )}
          <button
            type="button"
            onClick={dismiss}
            style={{
              padding: '7px 12px', borderRadius: 8,
              background: 'transparent', color: '#6b7280',
              border: '1px solid #e5e7eb', cursor: 'pointer', fontSize: 11.5, fontWeight: 600,
            }}
          >
            {isAr ? 'موافق' : 'OK'}
          </button>
        </div>
      </div>
    </div>
  )
}
