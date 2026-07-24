'use client'

/**
 * GovCalendar — Lebanese public holidays and upcoming closure dates.
 * Shows on homepage empty state as a compact horizontal strip.
 * Static data (doesn't need an API — official Lebanese holidays are fixed).
 */

import React, { useState, useEffect } from 'react'
import { useLanguage } from '@/lib/LanguageContext'

interface Holiday {
  month: number   // 1-12
  day: number
  nameAr: string
  nameEn: string
  icon: string
  type: 'official' | 'religious' | 'national'
}

// Official Lebanese public holidays (fixed + approximate for variable ones)
const HOLIDAYS: Holiday[] = [
  { month: 1,  day: 1,  nameAr: 'رأس السنة الميلادية',     nameEn: "New Year's Day",         icon: '🎆', type: 'official' },
  { month: 2,  day: 9,  nameAr: 'عيد مار مارون',           nameEn: 'Saint Maroun Day',        icon: '⛪', type: 'religious' },
  { month: 3,  day: 8,  nameAr: 'يوم المرأة العالمي',      nameEn: "Women's Day",             icon: '🌺', type: 'official' },
  { month: 3,  day: 21, nameAr: 'عيد الأم',                nameEn: "Mother's Day",            icon: '💐', type: 'official' },
  { month: 3,  day: 25, nameAr: 'عيد البشارة',             nameEn: 'Annunciation Day',        icon: '✨', type: 'religious' },
  { month: 5,  day: 1,  nameAr: 'عيد العمال',              nameEn: "Labour Day",              icon: '⚒️', type: 'official' },
  { month: 5,  day: 6,  nameAr: 'عيد الشهداء',             nameEn: "Martyrs' Day",            icon: '🕊️', type: 'national' },
  { month: 5,  day: 25, nameAr: 'يوم المقاومة والتحرير',   nameEn: 'Resistance & Liberation', icon: '🏳️', type: 'national' },
  { month: 8,  day: 15, nameAr: 'عيد انتقال السيدة العذراء', nameEn: 'Assumption Day',        icon: '🕊️', type: 'religious' },
  { month: 11, day: 1,  nameAr: 'عيد جميع القديسين',       nameEn: "All Saints' Day",         icon: '✝️', type: 'religious' },
  { month: 11, day: 22, nameAr: 'عيد الاستقلال',           nameEn: 'Independence Day',        icon: '🇱🇧', type: 'national' },
  { month: 12, day: 25, nameAr: 'عيد الميلاد المجيد',      nameEn: 'Christmas Day',           icon: '🎄', type: 'official' },
  // Variable Islamic holidays (approximate 2025-2026 dates)
  { month: 3,  day: 30, nameAr: 'عيد الفطر',               nameEn: 'Eid Al-Fitr',            icon: '🌙', type: 'religious' },
  { month: 6,  day: 6,  nameAr: 'عيد الأضحى',              nameEn: 'Eid Al-Adha',            icon: '🌙', type: 'religious' },
  { month: 6,  day: 26, nameAr: 'رأس السنة الهجرية',       nameEn: 'Islamic New Year',        icon: '🌙', type: 'religious' },
  { month: 9,  day: 4,  nameAr: 'المولد النبوي الشريف',    nameEn: "Prophet's Birthday",      icon: '🌙', type: 'religious' },
]

/** Days until the next occurrence of month/day */
function daysUntilFixed(month: number, day: number): number {
  const now = new Date(); now.setHours(0, 0, 0, 0)
  let target = new Date(now.getFullYear(), month - 1, day)
  if (target < now) target = new Date(now.getFullYear() + 1, month - 1, day)
  return Math.round((target.getTime() - now.getTime()) / 86_400_000)
}

const TYPE_COLOR = {
  official:  '#4F46E5',
  religious: '#059669',
  national:  '#DC2626',
}

interface Props {
  onAsk?: (q: string) => void
}

export default function GovCalendar({ onAsk }: Props) {
  const { isAr } = useLanguage()
  const [mounted, setMounted] = useState(false)
  const [upcoming, setUpcoming] = useState<Array<Holiday & { daysLeft: number }>>([])

  useEffect(() => {
    setMounted(true)
    const withDays = HOLIDAYS
      .map(h => ({ ...h, daysLeft: daysUntilFixed(h.month, h.day) }))
      .filter(h => h.daysLeft <= 60)   // show only next 60 days
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 6)
    setUpcoming(withDays)
  }, [])

  if (!mounted || upcoming.length === 0) return null

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        margin: '0 auto 16px',
        maxWidth: 'var(--container-md)',
        animation: 'fadeUp 0.2s ease',
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, paddingInline: 2,
      }}>
        <span style={{ fontSize: 12 }}>🗓️</span>
        <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-3)' }}>
          {isAr ? 'أيام العطل القادمة' : 'Upcoming Holidays'}
        </span>
        <span style={{ fontSize: 10, color: 'var(--text-4)', fontStyle: 'italic' }}>
          {isAr ? '(الدوائر مغلقة)' : '(offices closed)'}
        </span>
      </div>

      <div style={{
        display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 4,
        scrollbarWidth: 'none',
      }}>
        {upcoming.map(h => {
          const color = TYPE_COLOR[h.type]
          const isToday = h.daysLeft === 0
          const isTomorrow = h.daysLeft === 1
          const dayLabel = isToday
            ? (isAr ? 'اليوم' : 'Today')
            : isTomorrow
              ? (isAr ? 'غداً' : 'Tomorrow')
              : isAr
                ? `${h.daysLeft} يوم`
                : `${h.daysLeft}d`

          return (
            <button
              key={`${h.month}-${h.day}`}
              type="button"
              onClick={() => onAsk?.(isAr
                ? `ما هو ${h.nameAr} ولماذا يُعتبر عطلة رسمية في لبنان؟`
                : `What is ${h.nameEn} and why is it a public holiday in Lebanon?`)}
              style={{
                flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 12px', borderRadius: 11,
                border: `1px solid ${isToday ? color + '60' : 'var(--border)'}`,
                background: isToday ? `${color}0E` : 'var(--surface)',
                cursor: onAsk ? 'pointer' : 'default',
                fontFamily: 'inherit', textAlign: isAr ? 'right' : 'left',
                transition: 'border-color 0.13s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = color + '60' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = isToday ? color + '60' : 'var(--border)' }}
            >
              <span style={{ fontSize: 18, flexShrink: 0 }}>{h.icon}</span>
              <div>
                <div style={{
                  fontSize: 11.5, fontWeight: 700, color: 'var(--text-1)',
                  whiteSpace: 'nowrap',
                }}>
                  {isAr ? h.nameAr : h.nameEn}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  <span style={{
                    fontSize: 9.5, fontWeight: 700, color,
                    background: `${color}15`, border: `1px solid ${color}30`,
                    borderRadius: 4, padding: '1px 5px',
                  }}>
                    {dayLabel}
                  </span>
                  {h.type === 'national' && (
                    <span style={{ fontSize: 9, color: 'var(--text-4)' }}>
                      {isAr ? 'وطني' : 'National'}
                    </span>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
