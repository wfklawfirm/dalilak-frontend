'use client'

/**
 * ProcedureEstimatedCompletion — shows expected finish date.
 *
 * Reads dalilak_started_{code} (start date ISO string) and
 * parses the procedure's processingTime string to estimate
 * how many days the procedure takes, then calculates:
 *   expectedDate = startDate + estimatedDays
 *
 * Processing time parsing (rough):
 *   "يوم واحد" / "1 day"              → 1
 *   "3 أيام" / "3 days"               → 3
 *   "أسبوع" / "1 week"                → 7
 *   "أسبوعين" / "2 weeks"             → 14
 *   "شهر" / "1 month"                 → 30
 *   "3 أشهر" / "3 months"             → 90
 *
 * Shows nothing if:
 *   - procedure not started
 *   - processingTime is empty or unparseable
 *   - procedure already marked completed
 */

import React, { useState, useEffect } from 'react'
import { useLanguage } from '@/lib/LanguageContext'

function parseProcessingDays(pt: string): number | null {
  if (!pt) return null
  const lower = pt.toLowerCase()

  // Named durations — Arabic
  if (lower.includes('يوم واحد') || lower.includes('يوم عمل واحد')) return 1
  if (lower.includes('أسبوعين') || lower.includes('اسبوعين'))        return 14
  if (lower.includes('أسبوع') || lower.includes('اسبوع'))             return 7

  // Numbers with units — Arabic
  const arDayMatch   = pt.match(/(\d+)\s*(?:أيام|يوم)/)
  const arWeekMatch  = pt.match(/(\d+)\s*(?:أسابيع|أسبوع)/)
  const arMonthMatch = pt.match(/(\d+)\s*(?:أشهر|شهر|أشهر)/)

  // Numbers with units — English
  const enDayMatch   = lower.match(/(\d+)\s*day/)
  const enWeekMatch  = lower.match(/(\d+)\s*week/)
  const enMonthMatch = lower.match(/(\d+)\s*month/)

  if (arDayMatch)   return parseInt(arDayMatch[1], 10)
  if (enDayMatch)   return parseInt(enDayMatch[1], 10)
  if (arWeekMatch)  return parseInt(arWeekMatch[1], 10) * 7
  if (enWeekMatch)  return parseInt(enWeekMatch[1], 10) * 7
  if (arMonthMatch) return parseInt(arMonthMatch[1], 10) * 30
  if (enMonthMatch) return parseInt(enMonthMatch[1], 10) * 30

  // Single named — Arabic months/weeks
  if (lower.includes('شهر'))  return 30
  if (lower.includes('month')) return 30

  return null
}

function addWorkdays(start: Date, days: number): Date {
  // Skip Fridays (5) and Saturdays (6) — Lebanese weekend
  const result = new Date(start)
  let added = 0
  while (added < days) {
    result.setDate(result.getDate() + 1)
    const dow = result.getDay()
    if (dow !== 5 && dow !== 6) added++
  }
  return result
}

function formatDate(d: Date, isAr: boolean): string {
  return d.toLocaleDateString(isAr ? 'ar-LB' : 'en-GB', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
    timeZone: 'Asia/Beirut',
  })
}

interface Props {
  code: string
  processingTime?: string
  processingTimeEn?: string
}

export default function ProcedureEstimatedCompletion({ code, processingTime, processingTimeEn }: Props) {
  const { isAr } = useLanguage()
  const [info, setInfo] = useState<{ startDate: Date; expectedDate: Date; days: number } | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const startStr = localStorage.getItem(`dalilak_started_${code}`)
      const completedStr = localStorage.getItem(`dalilak_completed_${code}`)
      if (!startStr || completedStr) return

      const pt = processingTime || processingTimeEn || ''
      const days = parseProcessingDays(pt)
      if (!days) return

      const start = new Date(startStr)
      const expected = addWorkdays(start, days)
      setInfo({ startDate: start, expectedDate: expected, days })
    } catch {}
  }, [code, processingTime, processingTimeEn])

  useEffect(() => {
    const refresh = () => {
      try {
        const startStr = localStorage.getItem(`dalilak_started_${code}`)
        const completedStr = localStorage.getItem(`dalilak_completed_${code}`)
        if (!startStr || completedStr) { setInfo(null); return }
        const pt = processingTime || processingTimeEn || ''
        const days = parseProcessingDays(pt)
        if (!days) { setInfo(null); return }
        const start = new Date(startStr)
        const expected = addWorkdays(start, days)
        setInfo({ startDate: start, expectedDate: expected, days })
      } catch {}
    }
    window.addEventListener('dalilak_saved_change', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('dalilak_saved_change', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [code, processingTime, processingTimeEn])

  if (!mounted || !info) return null

  const today = new Date(); today.setHours(0,0,0,0)
  const exp   = new Date(info.expectedDate); exp.setHours(0,0,0,0)
  const daysLeft = Math.ceil((exp.getTime() - today.getTime()) / 86_400_000)
  const isPast   = daysLeft < 0
  const isToday  = daysLeft === 0

  const statusColor = isPast ? '#991B1B' : isToday ? '#92400E' : '#1D4ED8'
  const statusBg    = isPast ? '#FEF2F2' : isToday ? '#FFFBEB' : '#EFF6FF'
  const statusBorder= isPast ? '#FECACA' : isToday ? '#FDE68A' : '#BFDBFE'

  const daysLeftLabel = isPast
    ? (isAr ? `تأخر ${Math.abs(daysLeft)} ${Math.abs(daysLeft) === 1 ? 'يوم' : 'أيام'}` : `${Math.abs(daysLeft)} day${Math.abs(daysLeft) !== 1 ? 's' : ''} overdue`)
    : isToday
      ? (isAr ? 'اليوم!' : 'Today!')
      : (isAr ? `${daysLeft} ${daysLeft === 1 ? 'يوم' : 'أيام'} متبقية` : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`)

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 11px', borderRadius: 9, marginBottom: 10,
        background: statusBg, border: `1px solid ${statusBorder}`,
        animation: 'fadeUp 0.2s ease both',
      }}
    >
      <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={statusColor} strokeWidth="2" style={{ flexShrink: 0 }}>
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 9.5, fontWeight: 700, color: statusColor, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {isAr ? 'التاريخ المتوقع للإنجاز' : 'Expected completion'}
        </div>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: statusColor, marginTop: 1 }}>
          {formatDate(info.expectedDate, isAr)}
        </div>
      </div>
      <span style={{ fontSize: 10, fontWeight: 800, color: statusColor, flexShrink: 0, background: 'rgba(255,255,255,0.6)', padding: '2px 7px', borderRadius: 8 }}>
        {daysLeftLabel}
      </span>
    </div>
  )
}
