'use client'

/**
 * HomepageStreakCounter — days-in-a-row usage tracker.
 *
 * LS keys:
 *   dalilak_last_visit  — YYYY-MM-DD of last recorded visit
 *   dalilak_streak      — current consecutive-day streak (integer)
 *
 * Logic on mount:
 *   If last_visit === yesterday → streak++ (new day), update last_visit
 *   If last_visit === today     → no change (already counted today)
 *   If last_visit < yesterday   → streak resets to 1
 *   If no last_visit             → streak = 1, set last_visit = today
 *
 * Shows a badge when streak >= 2 (so it only appears from day 2 onward).
 * Streak 1 is silent — just records the visit.
 *
 * Milestones celebrated at 3, 7, 14, 30, 60, 100 days.
 */

import React, { useState, useEffect } from 'react'
import { useLanguage } from '@/lib/LanguageContext'

function getTodayLb(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Beirut' })
}

function getYesterdayLb(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Beirut' })
}

function computeStreak(): number {
  try {
    const today     = getTodayLb()
    const yesterday = getYesterdayLb()
    const lastVisit = localStorage.getItem('dalilak_last_visit')
    const saved     = parseInt(localStorage.getItem('dalilak_streak') || '0', 10)

    let streak = saved || 1

    if (!lastVisit) {
      streak = 1
    } else if (lastVisit === today) {
      return streak // already counted today
    } else if (lastVisit === yesterday) {
      streak = (saved || 1) + 1
    } else {
      streak = 1 // gap → reset
    }

    localStorage.setItem('dalilak_last_visit', today)
    localStorage.setItem('dalilak_streak', String(streak))
    return streak
  } catch {
    return 0
  }
}

const MILESTONES: Record<number, { emoji: string; labelAr: string; labelEn: string }> = {
  3:   { emoji: '🔥', labelAr: 'أسبوع قريباً',   labelEn: 'Almost a week!'    },
  7:   { emoji: '⭐', labelAr: 'أسبوع متواصل',   labelEn: 'One full week!'     },
  14:  { emoji: '💎', labelAr: 'أسبوعان متواصلان', labelEn: 'Two weeks strong!' },
  30:  { emoji: '🏆', labelAr: 'شهر متواصل',      labelEn: 'Monthly champion!'  },
  60:  { emoji: '🚀', labelAr: 'شهران متواصلان',  labelEn: '2 months solid!'    },
  100: { emoji: '👑', labelAr: '١٠٠ يوم متواصل',  labelEn: '100 days!'          },
}

function getMilestone(streak: number) {
  const key = (Object.keys(MILESTONES)
    .map(Number)
    .filter(n => n <= streak)
    .sort((a, b) => b - a)[0]) as number | undefined
  return key ? MILESTONES[key] : null
}

export default function HomepageStreakCounter() {
  const { isAr } = useLanguage()
  const [streak, setStreak]   = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setStreak(computeStreak())
  }, [])

  if (!mounted || streak < 2) return null

  const milestone = getMilestone(streak)
  const icon      = milestone?.emoji || (streak >= 7 ? '🔥' : '🔥')

  // Color: cool blue for low, red/orange for high
  const isHot  = streak >= 7
  const bg     = isHot  ? 'linear-gradient(135deg, #FFF1F0, #FEF3C7)' : 'linear-gradient(135deg, #EFF6FF, #DBEAFE)'
  const border = isHot  ? '#FCA5A5' : '#93C5FD'
  const text   = isHot  ? '#9A3412' : '#1E40AF'
  const sub    = isHot  ? '#C2410C' : '#2563EB'

  const streakNum = isAr
    ? streak.toLocaleString('ar-EG')
    : String(streak)

  const label = isAr
    ? `${streakNum} ${streak === 1 ? 'يوم' : 'أيام'} متواصلة`
    : `${streakNum}-day streak`

  const sublabel = milestone
    ? (isAr ? milestone.labelAr : milestone.labelEn)
    : (isAr ? 'استمر في الزيارة اليومية!' : 'Keep visiting daily!')

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        background: bg, border: `1.5px solid ${border}`,
        borderRadius: 12, padding: '7px 12px', marginBottom: 8,
        animation: 'fadeUp 0.2s ease both', maxWidth: '100%',
      }}
      role="status"
      aria-label={`${label} — ${sublabel}`}
    >
      <span style={{ fontSize: 22, lineHeight: 1, flexShrink: 0 }}>
        {icon}
      </span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: text, lineHeight: 1.2 }}>
          {label}
        </div>
        <div style={{ fontSize: 10, color: sub, marginTop: 2, fontWeight: 600 }}>
          {sublabel}
        </div>
      </div>
    </div>
  )
}
