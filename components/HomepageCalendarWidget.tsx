'use client'

/**
 * HomepageCalendarWidget — compact monthly calendar showing upcoming deadlines
 * and active reminders.
 *
 * Data sources:
 *   - Deadlines: localStorage keys dalilak_proc_deadline_{code} for all enriched procs
 *   - Reminders: dalilak_reminders (array of SmartReminder objects with .date)
 *
 * Visual: 7-column grid, current day highlighted, marked days have colored dot.
 * Clicking a marked day expands a tooltip-style list of events for that day.
 *
 * Uses Lebanon timezone (Asia/Beirut) for "today" calculation.
 *
 * LS key: dalilak_calendar_dismissed — if set, hidden; cleared at month boundary.
 * (No per-month dismiss key needed — it's an always-on widget when events exist.)
 */

import React, { useState, useEffect, useMemo } from 'react'
import { useLanguage } from '@/lib/LanguageContext'
import { ENRICHED_PROCEDURES } from '@/lib/enrichedProcedures'
import { getReminders } from '@/components/SmartReminder'

type DayEvent = { label: string; type: 'deadline' | 'reminder' }
type EventMap = Record<string, DayEvent[]> // key: YYYY-MM-DD

function getTodayLb(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Beirut' })
}

function loadEvents(): EventMap {
  const map: EventMap = {}
  const add = (date: string, ev: DayEvent) => {
    if (!map[date]) map[date] = []
    map[date].push(ev)
  }
  try {
    for (const proc of ENRICHED_PROCEDURES) {
      const dl = localStorage.getItem(`dalilak_proc_deadline_${proc.code}`)
      if (dl) add(dl, { label: proc.title, type: 'deadline' })
    }
  } catch {}
  try {
    for (const r of getReminders()) {
      if (!r.dismissed) add(r.date, { label: r.title, type: 'reminder' })
    }
  } catch {}
  return map
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(year: number, month: number): number {
  // 0=Sun…6=Sat; adjust for Sat-Sun weekend: use Sun=0
  return new Date(year, month, 1).getDay()
}

const AR_MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']
const AR_DAYS   = ['أح','إث','ثل','أر','خم','جم','سب']
const EN_DAYS   = ['Su','Mo','Tu','We','Th','Fr','Sa']

export default function HomepageCalendarWidget() {
  const { isAr } = useLanguage()
  const [mounted, setMounted]     = useState(false)
  const [events, setEvents]       = useState<EventMap>({})
  const [selected, setSelected]   = useState<string | null>(null)

  const today = getTodayLb()
  const [year, month] = today.split('-').map(Number)

  useEffect(() => {
    setMounted(true)
    setEvents(loadEvents())
    const handler = () => setEvents(loadEvents())
    window.addEventListener('dalilak_saved_change', handler)
    window.addEventListener('storage', handler)
    return () => {
      window.removeEventListener('dalilak_saved_change', handler)
      window.removeEventListener('storage', handler)
    }
  }, [])

  const { days, firstDow, totalDays, markedCount } = useMemo(() => {
    const totalDays = getDaysInMonth(year, month - 1)
    const firstDow  = getFirstDayOfWeek(year, month - 1) // 0=Sun
    const thisMonthPrefix = `${String(year)}-${String(month).padStart(2, '0')}-`
    const days: Array<{ date: string; day: number; events: DayEvent[] }> = []
    for (let d = 1; d <= totalDays; d++) {
      const date = `${thisMonthPrefix}${String(d).padStart(2, '0')}`
      days.push({ date, day: d, events: events[date] || [] })
    }
    const markedCount = days.filter(d => d.events.length > 0).length
    return { days, firstDow, totalDays, markedCount }
  }, [year, month, events])

  if (!mounted || markedCount === 0) return null

  const monthLabel = isAr
    ? `${AR_MONTHS[month - 1]} ${year}`
    : new Date(year, month - 1, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })

  const dayLabels = isAr ? AR_DAYS : EN_DAYS
  const selectedEvents = selected ? (events[selected] || []) : []

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        background: '#FAFAF9', border: '1.5px solid #E6E2DC',
        borderRadius: 13, padding: '12px 12px 10px', marginBottom: 10,
        animation: 'fadeUp 0.2s ease both',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: '#191713', display: 'flex', alignItems: 'center', gap: 5 }}>
          <span>📅</span> {monthLabel}
        </div>
        <div style={{ fontSize: 10, color: '#918B82', fontWeight: 600 }}>
          {isAr ? `${markedCount} أحداث` : `${markedCount} events`}
        </div>
      </div>

      {/* Day-of-week headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 3 }}>
        {dayLabels.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 9, fontWeight: 700, color: '#C8C2BB', padding: '2px 0' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {/* Blank cells before first day */}
        {Array.from({ length: firstDow }).map((_, i) => <div key={`b${i}`} />)}
        {days.map(({ date, day, events: evs }) => {
          const isToday    = date === today
          const hasEvents  = evs.length > 0
          const isSelected = date === selected
          const hasDeadline = evs.some(e => e.type === 'deadline')
          const hasReminder = evs.some(e => e.type === 'reminder')

          return (
            <button
              key={date}
              type="button"
              onClick={() => hasEvents ? setSelected(isSelected ? null : date) : undefined}
              style={{
                width: '100%', aspectRatio: '1', borderRadius: 7,
                border: isSelected
                  ? '1.5px solid #8F1D2C'
                  : isToday ? '1.5px solid #D1CBC4' : 'none',
                background: isSelected
                  ? 'rgba(143,29,44,0.08)'
                  : isToday ? '#F5F3EE' : 'transparent',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                cursor: hasEvents ? 'pointer' : 'default',
                padding: 1, position: 'relative', fontFamily: 'inherit',
                transition: 'background 0.12s',
              }}
              aria-label={hasEvents ? `${date}: ${evs.length} ${isAr ? 'أحداث' : 'events'}` : undefined}
            >
              <span style={{ fontSize: 9.5, fontWeight: isToday ? 800 : hasEvents ? 700 : 400, color: isToday ? '#8F1D2C' : hasEvents ? '#191713' : '#918B82', lineHeight: 1 }}>
                {day}
              </span>
              {hasEvents && (
                <div style={{ display: 'flex', gap: 1.5, marginTop: 1.5 }}>
                  {hasDeadline && <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#EF4444', display: 'inline-block' }} />}
                  {hasReminder && <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#8B5CF6', display: 'inline-block' }} />}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Selected day events */}
      {selected && selectedEvents.length > 0 && (
        <div style={{ marginTop: 10, padding: '8px 10px', background: '#FEF5F5', border: '1px solid #FECACA', borderRadius: 9 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#8F1D2C', marginBottom: 5 }}>
            {new Date(selected + 'T12:00:00').toLocaleDateString(isAr ? 'ar-LB' : 'en-GB', { day: 'numeric', month: 'short' })}
          </div>
          {selectedEvents.map((ev, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: ev.type === 'deadline' ? '#EF4444' : '#8B5CF6', flexShrink: 0 }} />
              <span style={{ fontSize: 10, color: '#191713', fontWeight: 600, lineHeight: 1.35 }}>
                {ev.label.length > 45 ? ev.label.slice(0, 43) + '…' : ev.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444', display: 'inline-block' }} />
          <span style={{ fontSize: 9, color: '#918B82', fontWeight: 600 }}>{isAr ? 'موعد نهائي' : 'Deadline'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#8B5CF6', display: 'inline-block' }} />
          <span style={{ fontSize: 9, color: '#918B82', fontWeight: 600 }}>{isAr ? 'تذكير' : 'Reminder'}</span>
        </div>
      </div>
    </div>
  )
}
