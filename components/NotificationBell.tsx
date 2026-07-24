'use client'

/**
 * NotificationBell — badge in TopNav showing count of:
 *  • Documents expiring within 30 days (from dalilak_doc_expiry)
 *  • Appointments within 3 days (from dalilak_appointments)
 *
 * Reads localStorage directly so it works without prop drilling.
 * Listens to `dalilak_saved_change` + storage events to stay in sync.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useLanguage } from '@/lib/LanguageContext'

// ── Types mirroring DocExpiryBanner + AppointmentTracker ────────────────────

interface DocDates { [docId: string]: string }  // ISO date strings
interface Appointment {
  id: string; titleAr: string; titleEn: string
  location: string; date: string; time?: string
  noteAr?: string; noteEn?: string; createdAt: number
}

const DOC_LS_KEY  = 'dalilak_doc_expiry'
const APPT_LS_KEY = 'dalilak_appointments'
const WARN_DAYS   = 30
const APPT_DAYS   = 3

function daysUntil(dateStr: string): number {
  const now = new Date(); now.setHours(0, 0, 0, 0)
  const d = new Date(dateStr + 'T00:00:00')
  return Math.round((d.getTime() - now.getTime()) / 86_400_000)
}

interface NotiItem {
  id: string
  icon: string
  labelAr: string
  labelEn: string
  days: number
  type: 'doc' | 'appt'
  promptAr: string
  promptEn: string
}

const DOC_LABELS: Record<string, [string, string]> = {
  passport:     ['جواز السفر', 'Passport'],
  national_id:  ['بطاقة الهوية', 'ID Card'],
  driving:      ['رخصة القيادة', 'Driver\'s License'],
  residence:    ['إقامة', 'Residence Permit'],
  work:         ['تصريح العمل', 'Work Permit'],
}

function loadItems(): NotiItem[] {
  if (typeof window === 'undefined') return []
  const items: NotiItem[] = []

  // Docs
  try {
    const raw = localStorage.getItem(DOC_LS_KEY)
    if (raw) {
      const dates = JSON.parse(raw) as DocDates
      Object.entries(dates).forEach(([id, dateStr]) => {
        if (!dateStr) return
        const days = daysUntil(dateStr)
        if (days >= 0 && days <= WARN_DAYS) {
          const [ar, en] = DOC_LABELS[id] || [id, id]
          items.push({
            id: `doc_${id}`, icon: '📄', labelAr: ar, labelEn: en, days, type: 'doc',
            promptAr: `كيف أجدد ${ar}؟ تنتهي صلاحيته خلال ${days} يوم.`,
            promptEn: `How do I renew my ${en}? It expires in ${days} day(s).`,
          })
        }
      })
    }
  } catch { /* ignore */ }

  // Appointments
  try {
    const raw = localStorage.getItem(APPT_LS_KEY)
    if (raw) {
      const appts = JSON.parse(raw) as Appointment[]
      appts.forEach(a => {
        const days = daysUntil(a.date)
        if (days >= 0 && days <= APPT_DAYS) {
          items.push({
            id: a.id, icon: '📅', labelAr: a.titleAr, labelEn: a.titleEn, days, type: 'appt',
            promptAr: `ما هي المستندات والمتطلبات لـ«${a.titleAr}»؟ الموعد بعد ${days} يوم.`,
            promptEn: `What do I need for "${a.titleEn}"? The appointment is in ${days} day(s).`,
          })
        }
      })
    }
  } catch { /* ignore */ }

  return items.sort((a, b) => a.days - b.days)
}

interface Props {
  onAsk?: (q: string) => void
}

export default function NotificationBell({ onAsk }: Props) {
  const { isAr } = useLanguage()
  const [items, setItems] = useState<NotiItem[]>([])
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const reload = useCallback(() => setItems(loadItems()), [])

  useEffect(() => {
    setMounted(true)
    reload()
    window.addEventListener('dalilak_saved_change', reload)
    window.addEventListener('storage', reload)
    const t = setInterval(reload, 60_000)
    return () => {
      window.removeEventListener('dalilak_saved_change', reload)
      window.removeEventListener('storage', reload)
      clearInterval(t)
    }
  }, [reload])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  if (!mounted || items.length === 0) return null

  const hasUrgent = items.some(i => i.days <= 3)
  const count = items.length

  function urgencyColor(days: number) {
    if (days === 0) return '#DC2626'
    if (days <= 3)  return '#F97316'
    if (days <= 7)  return '#F59E0B'
    return '#6366F1'
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        aria-label={isAr ? `${count} تنبيه` : `${count} notification${count > 1 ? 's' : ''}`}
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'relative',
          width: 34, height: 34, borderRadius: 9,
          background: 'transparent', border: '1.5px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: 'var(--text-2)',
          transition: 'border-color 0.13s, background 0.13s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.color = 'var(--brand)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-2)' }}
      >
        <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
        </svg>
        {/* Badge */}
        <span style={{
          position: 'absolute', top: -4, right: isAr ? 'auto' : -4, left: isAr ? -4 : 'auto',
          minWidth: 16, height: 16, borderRadius: 8, padding: '0 4px',
          background: hasUrgent ? '#DC2626' : '#F59E0B',
          color: '#fff', fontSize: 9, fontWeight: 800, lineHeight: '16px',
          textAlign: 'center',
          animation: hasUrgent ? 'pulse 2s infinite' : 'none',
        }}>
          {count > 9 ? '9+' : count}
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          dir={isAr ? 'rtl' : 'ltr'}
          style={{
            position: 'absolute',
            top: 40, [isAr ? 'left' : 'right']: 0,
            // clamp instead of a fixed 300px — the bell sits close to the screen
            // edge on mobile, so a fixed width could overflow off-screen there.
            width: 'min(300px, calc(100vw - 24px))', zIndex: 1000,
            background: 'var(--bg)', border: '1px solid var(--border)',
            borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '10px 14px', borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--text-1)' }}>
              {isAr ? '🔔 تنبيهاتك' : '🔔 Notifications'}
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 2, fontSize: 14 }}
            >×</button>
          </div>

          {/* Items */}
          <div style={{ maxHeight: 320, overflowY: 'auto' }}>
            {items.map(item => {
              const color = urgencyColor(item.days)
              const dayLabel = item.days === 0
                ? (isAr ? 'اليوم' : 'Today')
                : isAr ? `خلال ${item.days} يوم` : `in ${item.days} day${item.days > 1 ? 's' : ''}`
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (onAsk) onAsk(isAr ? item.promptAr : item.promptEn)
                    setOpen(false)
                  }}
                  style={{
                    display: 'flex', width: '100%', alignItems: 'flex-start', gap: 10,
                    padding: '10px 14px', background: 'transparent', border: 'none',
                    borderBottom: '1px solid var(--border)', cursor: 'pointer',
                    fontFamily: 'inherit', textAlign: isAr ? 'right' : 'left',
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-muted)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <span style={{
                    flexShrink: 0, width: 30, height: 30, borderRadius: 8,
                    background: `${color}18`, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 14,
                  }}>
                    {item.icon}
                  </span>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-1)', lineHeight: 1.4 }}>
                      {isAr ? item.labelAr : item.labelEn}
                    </div>
                    <div style={{ fontSize: 11, color, fontWeight: 600, marginTop: 2 }}>
                      {item.type === 'doc'
                        ? (isAr ? `تنتهي الصلاحية ${dayLabel}` : `Expires ${dayLabel}`)
                        : (isAr ? `موعد ${dayLabel}` : `Appointment ${dayLabel}`)}
                    </div>
                    {onAsk && (
                      <div style={{ fontSize: 10.5, color: 'var(--brand)', marginTop: 3, fontWeight: 600 }}>
                        {isAr ? 'اضغط لاسأل دليلك ←' : 'Tap to ask Dalilak →'}
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
