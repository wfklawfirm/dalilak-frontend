'use client'

/**
 * HomepageTodaysTasks — "Today" strip aggregating all LS-based due items.
 *
 * Scans localStorage for items due TODAY:
 *   - Reminders (dalilak_reminders[].date === today, !dismissed)
 *   - Appointments (dalilak_appointments[].date === today)
 *   - Procedure deadlines (dalilak_proc_deadline_{code} === today)
 *   - Step timers that have elapsed (dalilak_step_timer_*  target < now)
 *
 * Hides if nothing is due today.
 * Refreshes every 60 seconds + on dalilak_saved_change.
 *
 * Props: { isAr: boolean }
 */

import React, { useState, useEffect, useCallback } from 'react'
import { getReminders } from '@/components/SmartReminder'
import { ENRICHED_PROCEDURES } from '@/lib/enrichedProcedures'

interface TodayItem {
  id: string
  icon: string
  label: string
  labelEn: string
  type: 'reminder' | 'appointment' | 'deadline' | 'timer'
  href: string
  urgent: boolean
}

function todayLb(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Beirut' })
}

function gatherItems(): TodayItem[] {
  const today = todayLb()
  const now   = Date.now()
  const items: TodayItem[] = []

  try {
    // ── Reminders due today ──
    getReminders()
      .filter(r => !r.dismissed && r.date === today)
      .forEach(r => items.push({
        id: `rem-${r.id}`,
        icon: '🔔',
        label: r.title,
        labelEn: r.title,
        type: 'reminder',
        href: '/',
        urgent: false,
      }))

    // ── Appointments today ──
    try {
      const raw = localStorage.getItem('dalilak_appointments')
      if (raw) {
        const apps = JSON.parse(raw) as Array<{ id: string; title: string; titleEn?: string; date: string }>
        apps.filter(a => a.date === today).forEach(a => items.push({
          id: `apt-${a.id}`,
          icon: '📅',
          label: a.title,
          labelEn: a.titleEn || a.title,
          type: 'appointment',
          href: '/',
          urgent: false,
        }))
      }
    } catch {}

    // ── Procedure deadlines due today ──
    for (const proc of ENRICHED_PROCEDURES) {
      try {
        const dl = localStorage.getItem(`dalilak_proc_deadline_${proc.code}`)
        if (dl === today) {
          const snoozed = localStorage.getItem(`dalilak_deadline_snoozed_${proc.code}_${today}`)
          if (!snoozed) items.push({
            id: `dl-${proc.code}`,
            icon: '⏰',
            label: proc.title,
            labelEn: proc.title_en || proc.title,
            type: 'deadline',
            href: `/procedures?code=${proc.code}`,
            urgent: true,
          })
        }
      } catch {}
    }

    // ── Elapsed step timers ──
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i) || ''
      if (key.startsWith('dalilak_step_timer_')) {
        try {
          const target = parseInt(localStorage.getItem(key) || '0', 10)
          if (target > 0 && target < now) {
            const parts = key.split('_')
            const code  = parts[3] || ''
            const proc  = ENRICHED_PROCEDURES.find(p => p.code === code)
            items.push({
              id: `tmr-${key}`,
              icon: '⌛',
              label: proc ? `مؤقّت: ${proc.title}` : 'مؤقّت خطوة انتهى',
              labelEn: proc ? `Timer: ${proc.title_en || proc.title}` : 'Step timer elapsed',
              type: 'timer',
              href: proc ? `/procedures?code=${code}` : '/procedures',
              urgent: false,
            })
          }
        } catch {}
      }
    }
  } catch {}

  return items
}

export default function HomepageTodaysTasks({ isAr }: { isAr: boolean }) {
  const [mounted,  setMounted]  = useState(false)
  const [items,    setItems]    = useState<TodayItem[]>([])
  const [expanded, setExpanded] = useState(true)

  const refresh = useCallback(() => setItems(gatherItems()), [])

  useEffect(() => {
    setMounted(true)
    refresh()
    const iv = setInterval(refresh, 60_000)
    window.addEventListener('dalilak_saved_change', refresh)
    return () => {
      clearInterval(iv)
      window.removeEventListener('dalilak_saved_change', refresh)
    }
  }, [refresh])

  if (!mounted || items.length === 0) return null

  const urgent = items.some(i => i.urgent)

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        borderRadius: 12, overflow: 'hidden',
        border: `1.5px solid ${urgent ? '#FECACA' : '#FDE68A'}`,
        background: urgent ? '#FEF9F9' : '#FFFCF0',
        marginBottom: 10,
        animation: 'fadeUp 0.2s ease both',
      }}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 8,
          padding: '9px 12px', background: 'none', border: 'none',
          cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        <span style={{ fontSize: 16 }}>📌</span>
        <div style={{ flex: 1, textAlign: isAr ? 'right' : 'left' }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: urgent ? '#991B1B' : '#92400E' }}>
            {isAr ? `مهام اليوم (${items.length})` : `Today's tasks (${items.length})`}
          </div>
        </div>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
          stroke={urgent ? '#991B1B' : '#92400E'} strokeWidth="2.5"
          style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s', flexShrink: 0 }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {expanded && (
        <div style={{ borderTop: `1px solid ${urgent ? '#FECACA' : '#FDE68A'}` }}>
          {items.map(item => (
            <a
              key={item.id}
              href={item.href}
              style={{
                display: 'flex', alignItems: 'center', gap: 9,
                padding: '8px 12px',
                borderBottom: '1px solid rgba(0,0,0,0.04)',
                textDecoration: 'none',
                background: item.urgent ? 'rgba(239,68,68,0.03)' : 'transparent',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.03)')}
              onMouseLeave={e => (e.currentTarget.style.background = item.urgent ? 'rgba(239,68,68,0.03)' : 'transparent')}
            >
              <span style={{ fontSize: 15, flexShrink: 0 }}>{item.icon}</span>
              <span style={{
                fontSize: 10.5, fontWeight: 700,
                color: item.urgent ? '#991B1B' : '#44403C',
                flex: 1, minWidth: 0,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {isAr ? item.label : item.labelEn}
              </span>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none"
                stroke={item.urgent ? '#991B1B' : '#A8A29E'} strokeWidth="2.5">
                <path strokeLinecap="round" d={isAr ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'}/>
              </svg>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
