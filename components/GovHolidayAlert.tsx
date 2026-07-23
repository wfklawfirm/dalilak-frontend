'use client'

/**
 * GovHolidayAlert — shows a dismissible alert when government offices
 * will be closed tomorrow (Lebanese public holiday or weekend).
 *
 * Lebanon weekend: Friday (5) and Saturday (6) are gov office closures
 * in most ministries (some close Friday only or Saturday only — we flag both).
 *
 * Dismissed per day: dalilak_holiday_alert_dismissed_{YYYY-MM-DD}
 *
 * Usage: render anywhere, shows nothing when no alert is relevant.
 */

import React, { useState, useEffect } from 'react'
import { useLanguage } from '@/lib/LanguageContext'

interface Holiday {
  month: number
  day: number
  nameAr: string
  nameEn: string
  icon: string
}

const HOLIDAYS: Holiday[] = [
  { month: 1,  day: 1,  nameAr: 'رأس السنة الميلادية',       nameEn: "New Year's Day",          icon: '🎆' },
  { month: 2,  day: 9,  nameAr: 'عيد مار مارون',             nameEn: 'Saint Maroun Day',         icon: '⛪' },
  { month: 3,  day: 8,  nameAr: 'يوم المرأة العالمي',        nameEn: "Women's Day",              icon: '🌺' },
  { month: 3,  day: 25, nameAr: 'عيد البشارة',               nameEn: 'Annunciation Day',         icon: '✨' },
  { month: 5,  day: 1,  nameAr: 'عيد العمال',                nameEn: 'Labour Day',               icon: '⚒️' },
  { month: 5,  day: 6,  nameAr: 'عيد الشهداء',               nameEn: "Martyrs' Day",             icon: '🕊️' },
  { month: 5,  day: 25, nameAr: 'يوم المقاومة والتحرير',     nameEn: 'Resistance & Liberation',  icon: '🏳️' },
  { month: 3,  day: 30, nameAr: 'عيد الفطر',                 nameEn: 'Eid Al-Fitr',             icon: '🌙' },
  { month: 6,  day: 6,  nameAr: 'عيد الأضحى',                nameEn: 'Eid Al-Adha',             icon: '🌙' },
  { month: 6,  day: 26, nameAr: 'رأس السنة الهجرية',         nameEn: 'Islamic New Year',         icon: '🌙' },
  { month: 8,  day: 15, nameAr: 'عيد انتقال السيدة العذراء', nameEn: 'Assumption Day',           icon: '🕊️' },
  { month: 9,  day: 4,  nameAr: 'المولد النبوي الشريف',      nameEn: "Prophet's Birthday",       icon: '🌙' },
  { month: 11, day: 1,  nameAr: 'عيد جميع القديسين',         nameEn: "All Saints' Day",          icon: '✝️' },
  { month: 11, day: 22, nameAr: 'عيد الاستقلال',             nameEn: 'Independence Day',         icon: '🇱🇧' },
  { month: 12, day: 25, nameAr: 'عيد الميلاد المجيد',        nameEn: 'Christmas Day',            icon: '🎄' },
]

interface AlertInfo {
  type: 'holiday' | 'weekend'
  icon: string
  nameAr: string
  nameEn: string
  daysAhead: number // 1 = tomorrow, 2 = day after, etc.
  dateLabel: string
}

function getBeyrouthTomorrow(): Date {
  // Get tomorrow in Lebanon time
  const now = new Date()
  const lbNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Beirut' }))
  lbNow.setDate(lbNow.getDate() + 1)
  lbNow.setHours(0, 0, 0, 0)
  return lbNow
}

function checkAlert(): AlertInfo | null {
  const tomorrow = getBeyrouthTomorrow()
  const dow = tomorrow.getDay() // 0=Sun, 5=Fri, 6=Sat
  const m = tomorrow.getMonth() + 1
  const d = tomorrow.getDate()

  const dateLabel = tomorrow.toLocaleDateString('en-GB', { weekday: 'long', month: 'short', day: 'numeric' })

  // Check weekend (Fri/Sat for Lebanon gov offices)
  if (dow === 5 || dow === 6) {
    return {
      type: 'weekend',
      icon: '🏛️',
      nameAr: dow === 5 ? 'الجمعة — الدوائر الحكومية مغلقة' : 'السبت — الدوائر الحكومية مغلقة',
      nameEn: dow === 5 ? 'Friday — Government offices closed' : 'Saturday — Government offices closed',
      daysAhead: 1,
      dateLabel,
    }
  }

  // Check public holiday
  const hit = HOLIDAYS.find(h => h.month === m && h.day === d)
  if (hit) {
    return {
      type: 'holiday',
      icon: hit.icon,
      nameAr: hit.nameAr,
      nameEn: hit.nameEn,
      daysAhead: 1,
      dateLabel,
    }
  }

  return null
}

export default function GovHolidayAlert() {
  const { isAr } = useLanguage()
  const [alert, setAlert] = useState<AlertInfo | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const info = checkAlert()
    if (!info) return

    // Check dismiss key
    const today = new Date().toISOString().slice(0, 10)
    const key = `dalilak_holiday_alert_dismissed_${today}`
    try {
      if (localStorage.getItem(key)) return
    } catch {}

    setAlert(info)
  }, [])

  function dismiss() {
    const today = new Date().toISOString().slice(0, 10)
    try { localStorage.setItem(`dalilak_holiday_alert_dismissed_${today}`, '1') } catch {}
    setDismissed(true)
  }

  if (!mounted || !alert || dismissed) return null

  const isHoliday = alert.type === 'holiday'

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      role="alert"
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 10,
        padding: '10px 13px', marginBottom: 12,
        background: isHoliday ? '#FFF7ED' : '#F0F9FF',
        border: `1px solid ${isHoliday ? '#FED7AA' : '#BAE6FD'}`,
        borderRadius: 12,
        animation: 'fadeUp 0.2s ease both',
      }}
    >
      <span style={{ fontSize: 18, lineHeight: 1.3, flexShrink: 0 }}>{alert.icon}</span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: isHoliday ? '#92400E' : '#0369A1', marginBottom: 2 }}>
          {isAr
            ? `غداً — ${isAr ? alert.nameAr : alert.nameEn}`
            : `Tomorrow — ${alert.nameEn}`}
        </div>
        <div style={{ fontSize: 10.5, color: isHoliday ? '#78350F' : '#0C4A6E', opacity: 0.8 }}>
          {isAr
            ? `تأكد من إنهاء معاملاتك قبل الغد (${alert.dateLabel})`
            : `Plan ahead — offices closed ${alert.dateLabel}`}
        </div>
      </div>

      <button
        type="button"
        onClick={dismiss}
        aria-label={isAr ? 'إغلاق' : 'Dismiss'}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: isHoliday ? '#D97706' : '#0284C7', opacity: 0.5,
          fontSize: 13, flexShrink: 0, padding: 2,
          display: 'flex', alignItems: 'center',
        }}
      >✕</button>
    </div>
  )
}
