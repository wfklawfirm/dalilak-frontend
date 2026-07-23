'use client'

/**
 * LiveBeirutClock — small live clock showing Beirut time.
 *
 * Updates every second via setInterval.
 * Displays: day name + date + time (HH:MM:SS)
 * Shows "مفتوح الآن" / "مغلق" chip based on gov working hours (8:00–14:30 Mon–Thu, 8:00–13:00 Fri).
 * Lebanese weekend = Sat + Sun (gov offices closed).
 *
 * Bilingual via useLanguage(). SSR-safe via mounted state.
 */

import React, { useState, useEffect } from 'react'
import { useLanguage } from '@/lib/LanguageContext'

function getBeirutTime(): Date {
  // Convert to Beirut
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Beirut' }))
}

function isGovOpen(d: Date): boolean {
  const dow  = d.getDay()   // 0=Sun,1=Mon,...,6=Sat
  const hour = d.getHours()
  const min  = d.getMinutes()
  const totalMin = hour * 60 + min

  if (dow === 0 || dow === 6) return false // weekend
  if (dow === 5) return totalMin >= 8 * 60 && totalMin < 13 * 60 // Fri
  return totalMin >= 8 * 60 && totalMin < 14 * 60 + 30           // Mon–Thu
}

const DAYS_AR = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
const DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function pad(n: number): string { return n < 10 ? `0${n}` : `${n}` }

export default function LiveBeirutClock() {
  const { isAr } = useLanguage()
  const [time, setTime] = useState<Date | null>(null)

  useEffect(() => {
    setTime(getBeirutTime())
    const id = setInterval(() => setTime(getBeirutTime()), 1000)
    return () => clearInterval(id)
  }, [])

  if (!time) return null

  const dow  = time.getDay()
  const day  = isAr ? DAYS_AR[dow] : DAYS_EN[dow]
  const dateStr = time.toLocaleDateString(isAr ? 'ar-LB' : 'en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Beirut',
  })
  const timeStr = `${pad(time.getHours())}:${pad(time.getMinutes())}:${pad(time.getSeconds())}`
  const open = isGovOpen(time)

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '5px 12px', borderRadius: 12,
        background: '#FAFAF8', border: '1px solid #E6E2DC',
        fontSize: 11, color: '#69645C',
        marginBottom: 10,
      }}
    >
      {/* Clock icon */}
      <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8F1D2C" strokeWidth="2" style={{ flexShrink: 0 }}>
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>

      {/* Day + date */}
      <span style={{ fontWeight: 600 }}>{day}، {dateStr}</span>

      {/* Separator */}
      <span style={{ color: '#C8C2BB' }}>|</span>

      {/* Live time */}
      <span style={{ fontWeight: 800, fontFamily: 'monospace', color: '#191713', letterSpacing: '0.05em' }}>
        {timeStr}
      </span>

      {/* Lebanon flag */}
      <span aria-label="Lebanon" style={{ fontSize: 13 }}>🇱🇧</span>

      {/* Gov open/closed chip */}
      <span style={{
        fontSize: 9, fontWeight: 800, padding: '2px 7px', borderRadius: 8,
        background: open ? '#D1FAE5' : '#FEF2F2',
        color: open ? '#065F46' : '#991B1B',
        border: `1px solid ${open ? '#A7F3D0' : '#FECACA'}`,
        flexShrink: 0,
      }}>
        {open
          ? (isAr ? '🟢 الدوائر مفتوحة' : '🟢 Gov open')
          : (isAr ? '🔴 الدوائر مغلقة' : '🔴 Gov closed')}
      </span>
    </div>
  )
}
