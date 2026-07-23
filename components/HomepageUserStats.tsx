'use client'

/**
 * HomepageUserStats — compact "your activity" stats card.
 *
 * Scans localStorage for:
 *   dalilak_started_{code}   → procedures started
 *   dalilak_completed_{code} → procedures completed
 *   dalilak_views_{code}     → views
 *   dalilak_saved_{code}     → bookmarked
 *
 * Props: { isAr: boolean }
 */

import React, { useState, useEffect } from 'react'
import { ENRICHED_PROCEDURES } from '@/lib/enrichedProcedures'

interface Props {
  isAr: boolean
}

interface Stats {
  started: number
  completed: number
  bookmarked: number
  totalViews: number
}

function computeStats(): Stats {
  let started = 0, completed = 0, bookmarked = 0, totalViews = 0
  try {
    for (const p of ENRICHED_PROCEDURES) {
      if (localStorage.getItem(`dalilak_started_${p.code}`)) started++
      if (localStorage.getItem(`dalilak_completed_${p.code}`)) completed++
      if (localStorage.getItem(`dalilak_saved_${p.code}`)) bookmarked++
      const v = parseInt(localStorage.getItem(`dalilak_views_${p.code}`) ?? '0', 10)
      if (v > 0) totalViews += v
    }
  } catch {}
  return { started, completed, bookmarked, totalViews }
}

export default function HomepageUserStats({ isAr }: Props) {
  const [mounted, setMounted] = useState(false)
  const [stats, setStats]     = useState<Stats>({ started: 0, completed: 0, bookmarked: 0, totalViews: 0 })

  useEffect(() => {
    setMounted(true)
    setStats(computeStats())
    const refresh = () => setStats(computeStats())
    window.addEventListener('dalilak_saved_change', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('dalilak_saved_change', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  if (!mounted || (stats.started === 0 && stats.bookmarked === 0 && stats.totalViews === 0)) return null

  const items = [
    { icon: '🚀', label: isAr ? 'بدأت' : 'Started',   value: stats.started },
    { icon: '✅', label: isAr ? 'أنجزت' : 'Done',     value: stats.completed },
    { icon: '🔖', label: isAr ? 'محفوظة' : 'Saved',   value: stats.bookmarked },
    { icon: '👁️', label: isAr ? 'مشاهدات' : 'Views',  value: stats.totalViews },
  ]

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        border: '1px solid #E5E7EB', borderRadius: 14,
        padding: '10px 14px', background: '#FAFAFA',
      }}
    >
      <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 600, marginBottom: 8 }}>
        {isAr ? 'نشاطك على دليلك' : 'Your Dalilak activity'}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
        {items.map((item, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18 }}>{item.icon}</div>
            <div style={{ fontSize: 15, fontWeight: 900, color: '#111827', lineHeight: 1 }}>{item.value}</div>
            <div style={{ fontSize: 9, color: '#9CA3AF', fontWeight: 600, marginTop: 1 }}>{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
