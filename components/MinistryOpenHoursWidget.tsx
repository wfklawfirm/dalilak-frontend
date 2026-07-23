'use client'

/**
 * MinistryOpenHoursWidget — compact working hours badge for Lebanese ministries.
 *
 * Shows open/closed status + hours text for any ministry/government office.
 * Computes real-time status from Lebanon timezone (Asia/Beirut).
 *
 * Props:
 *   ministry   — ministry name (used for lookup)
 *   hoursAr    — hours string in Arabic, e.g. "من 8:00 إلى 14:00"
 *   hoursEn    — hours string in English, e.g. "8:00 AM – 2:00 PM"
 *   openH      — opening hour (24h, Lebanon time)
 *   openM      — opening minute
 *   closeH     — closing hour
 *   closeM     — closing minute
 *   compact    — if true shows only dot + status, no hours string
 */

import React, { useState, useEffect } from 'react'
import { useLanguage } from '@/lib/LanguageContext'

interface Props {
  ministry?: string
  hoursAr?: string
  hoursEn?: string
  openH?: number
  openM?: number
  closeH?: number
  closeM?: number
  compact?: boolean
}

const LB_TZ = 'Asia/Beirut'

function getLebTime(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: LB_TZ }))
}

function isCurrentlyOpen(openH: number, openM: number, closeH: number, closeM: number): boolean {
  const now = getLebTime()
  const day = now.getDay() // 0=Sun, 5=Fri, 6=Sat
  // Lebanese government offices: Sun–Thu 8:00–14:30, Fri/Sat closed
  if (day === 0 || day === 5 || day === 6) return false
  const nowMin = now.getHours() * 60 + now.getMinutes()
  const openMin = openH * 60 + openM
  const closeMin = closeH * 60 + closeM
  return nowMin >= openMin && nowMin < closeMin
}

export default function MinistryOpenHoursWidget({
  hoursAr,
  hoursEn,
  openH = 8,
  openM = 0,
  closeH = 14,
  closeM = 30,
  compact = false,
}: Props) {
  const { isAr } = useLanguage()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setOpen(isCurrentlyOpen(openH, openM, closeH, closeM))
    const id = setInterval(() => {
      setOpen(isCurrentlyOpen(openH, openM, closeH, closeM))
    }, 60_000)
    return () => clearInterval(id)
  }, [openH, openM, closeH, closeM])

  if (!mounted) return null

  const statusLabel = open
    ? (isAr ? 'مفتوح الآن' : 'Open now')
    : (isAr ? 'مغلق الآن' : 'Closed now')

  const dotColor = open ? '#10b981' : '#ef4444'
  const textColor = open ? '#065F46' : '#991B1B'
  const bgColor   = open ? '#D1FAE5' : '#FEE2E2'
  const hoursText = isAr ? hoursAr : hoursEn

  if (compact) {
    return (
      <span
        title={hoursText}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontSize: 10, fontWeight: 700, color: textColor,
          background: bgColor, borderRadius: 6, padding: '2px 6px',
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
        {statusLabel}
      </span>
    )
  }

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontSize: 11, color: 'var(--text-3)',
    }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
      <span style={{ fontWeight: 700, color: textColor }}>{statusLabel}</span>
      {hoursText && (
        <span style={{ color: 'var(--text-4)' }}>
          · {hoursText}
        </span>
      )}
    </div>
  )
}
