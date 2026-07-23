'use client'

/**
 * HomepageTodayTasks — "مهام اليوم" compact widget.
 *
 * Aggregates:
 *   - Overdue/due deadlines: dalilak_proc_deadline_{code} <= today
 *   - Due reminders: dalilak_reminders where date <= today && !dismissed
 *   - Appointments: dalilak_appointments where date === today (or overdue)
 *
 * Shows a summary card: "لديك X مهام اليوم"
 * Each task is a one-liner with an action link.
 * Hidden when no tasks.
 *
 * Listens to dalilak_saved_change + storage for live refresh.
 * Dismisses for today after user clicks "تم" (done) button.
 */

import React, { useState, useEffect, useCallback } from 'react'
import { useLanguage } from '@/lib/LanguageContext'
import { ENRICHED_PROCEDURES } from '@/lib/enrichedProcedures'
import { getReminders } from '@/components/SmartReminder'

interface Task {
  id: string
  icon: string
  labelAr: string
  labelEn: string
  href: string
  urgent: boolean
}

function getTodayLb(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Beirut' })
}

function getYesterdayLb(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Beirut' })
}

function loadTasks(): Task[] {
  const today = getTodayLb()
  const yesterday = getYesterdayLb()
  const tasks: Task[] = []

  try {
    // Deadlines
    for (const proc of ENRICHED_PROCEDURES) {
      const dl = localStorage.getItem(`dalilak_proc_deadline_${proc.code}`)
      if (dl && dl <= today) {
        const snoozeKey = `dalilak_deadline_snoozed_${proc.code}_${today}`
        if (!localStorage.getItem(snoozeKey)) {
          const isOverdue = dl < today
          tasks.push({
            id: `dl-${proc.code}`, icon: isOverdue ? '⏰' : '📅',
            labelAr: `${isOverdue ? 'متأخر: ' : 'اليوم: '}${proc.title}`,
            labelEn: `${isOverdue ? 'Overdue: ' : 'Due today: '}${proc.title_en || proc.title}`,
            href: `/procedures?q=${encodeURIComponent(proc.title)}`,
            urgent: isOverdue,
          })
        }
      }
    }

    // Reminders
    for (const r of getReminders()) {
      if (!r.dismissed && r.date <= today) {
        tasks.push({
          id: `rem-${r.id}`, icon: '🔔',
          labelAr: r.title, labelEn: r.title,
          href: '/', urgent: r.date < today,
        })
      }
    }

    // Appointments (read from AppointmentTracker LS key)
    try {
      const appts = JSON.parse(localStorage.getItem('dalilak_appointments') || '[]')
      for (const a of appts) {
        if (a.date && (a.date === today || a.date === yesterday)) {
          tasks.push({
            id: `apt-${a.id || a.date}`, icon: '📋',
            labelAr: a.title || a.titleAr || 'موعد',
            labelEn: a.titleEn || a.title || 'Appointment',
            href: '/', urgent: a.date <= yesterday,
          })
        }
      }
    } catch {}
  } catch {}

  return tasks
}

export default function HomepageTodayTasks() {
  const { isAr } = useLanguage()
  const [tasks, setTasks]       = useState<Task[]>([])
  const [dismissed, setDismissed] = useState(false)
  const [mounted, setMounted]   = useState(false)
  const [expanded, setExpanded] = useState(false)

  const refresh = useCallback(() => setTasks(loadTasks()), [])

  useEffect(() => {
    setMounted(true)
    const today = getTodayLb()
    const key = `dalilak_today_tasks_dismissed_${today}`
    try { if (localStorage.getItem(key)) setDismissed(true) } catch {}
    refresh()
    window.addEventListener('dalilak_saved_change', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('dalilak_saved_change', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [refresh])

  function dismissAll() {
    setDismissed(true)
    const today = getTodayLb()
    try { localStorage.setItem(`dalilak_today_tasks_dismissed_${today}`, '1') } catch {}
  }

  if (!mounted || dismissed || tasks.length === 0) return null

  const urgentCount = tasks.filter(t => t.urgent).length
  const hasUrgent = urgentCount > 0

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        background: hasUrgent ? '#FEF2F2' : '#FFFBEB',
        border: `1.5px solid ${hasUrgent ? '#FECACA' : '#FDE68A'}`,
        borderRadius: 12, overflow: 'hidden', marginBottom: 10,
        animation: 'fadeUp 0.2s ease both',
      }}
    >
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 9,
          padding: '10px 13px', background: 'none', border: 'none',
          cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        <span style={{ fontSize: 18, flexShrink: 0 }}>🗂️</span>
        <div style={{ flex: 1, textAlign: isAr ? 'right' : 'left' }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: hasUrgent ? '#991B1B' : '#92400E' }}>
            {isAr ? `مهام اليوم — ${tasks.length}` : `Today's Tasks — ${tasks.length}`}
          </div>
          <div style={{ fontSize: 10, color: hasUrgent ? '#B91C1C' : '#B45309', marginTop: 1 }}>
            {hasUrgent
              ? (isAr ? `${urgentCount} ${urgentCount === 1 ? 'مهمة متأخرة' : 'مهام متأخرة'}` : `${urgentCount} overdue`)
              : (isAr ? 'اضغط للتفاصيل' : 'Tap for details')}
          </div>
        </div>
        <button
          type="button" onClick={e => { e.stopPropagation(); dismissAll() }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: hasUrgent ? '#FCA5A5' : '#FDE68A', fontSize: 11, flexShrink: 0, fontFamily: 'inherit' }}
        >
          {isAr ? 'تم' : 'Done'}
        </button>
        <svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none"
          stroke={hasUrgent ? '#991B1B' : '#92400E'} strokeWidth="2.5"
          style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {expanded && (
        <div style={{
          borderTop: `1px solid ${hasUrgent ? '#FECACA' : '#FDE68A'}`,
          padding: '7px 12px 9px', display: 'flex', flexDirection: 'column', gap: 5,
        }}>
          {tasks.map(t => (
            <a
              key={t.id}
              href={t.href}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 9px', borderRadius: 9,
                background: t.urgent ? 'rgba(239,68,68,0.07)' : 'rgba(245,158,11,0.07)',
                border: `1px solid ${t.urgent ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}`,
                textDecoration: 'none',
              }}
            >
              <span style={{ fontSize: 14, flexShrink: 0 }}>{t.icon}</span>
              <span style={{
                fontSize: 11, fontWeight: 600, flex: 1, lineHeight: 1.4,
                color: t.urgent ? '#991B1B' : '#92400E',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {isAr ? t.labelAr : t.labelEn}
              </span>
              <svg aria-hidden="true" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={t.urgent ? '#EF4444' : '#F59E0B'} strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d={isAr ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'}/>
              </svg>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
