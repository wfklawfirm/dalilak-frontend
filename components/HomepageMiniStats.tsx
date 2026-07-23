'use client'

/**
 * HomepageMiniStats — compact 4-stat strip on the homepage.
 *
 * Shows live counts derived from localStorage:
 *   ✅ Completed procedures  (dalilak_completed_{code} = "1")
 *   🚀 Started procedures    (dalilak_started_{code} = "1")
 *   🔔 Active reminders      (dalilak_reminders → !dismissed)
 *   ⭐ Saved procedures      (savedItems from lib/savedItems)
 *
 * Updates on dalilak_saved_change + storage events.
 * Hidden until mounted (SSR-safe).
 */

import React, { useState, useEffect, useCallback } from 'react'
import { useLanguage } from '@/lib/LanguageContext'
import { ENRICHED_PROCEDURES } from '@/lib/enrichedProcedures'
import { getReminders } from '@/components/SmartReminder'

function getSavedCount(): number {
  try {
    const raw = localStorage.getItem('dalilak_saved') || localStorage.getItem('dalilak_savedItems') || '[]'
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr.length : 0
  } catch { return 0 }
}

function computeStats() {
  let completed = 0, started = 0
  for (const proc of ENRICHED_PROCEDURES) {
    if (localStorage.getItem(`dalilak_completed_${proc.code}`) === '1') completed++
    else if (localStorage.getItem(`dalilak_started_${proc.code}`) === '1') started++
  }
  const reminders = getReminders().filter(r => !r.dismissed).length
  const saved = getSavedCount()
  return { completed, started, reminders, saved }
}

interface Stat {
  icon: string
  valueAr: string
  valueEn: string
  labelAr: string
  labelEn: string
  color: string
}

export default function HomepageMiniStats() {
  const { isAr } = useLanguage()
  const [stats, setStats] = useState({ completed: 0, started: 0, reminders: 0, saved: 0 })
  const [mounted, setMounted] = useState(false)

  const refresh = useCallback(() => {
    try { setStats(computeStats()) } catch {}
  }, [])

  useEffect(() => {
    setMounted(true)
    refresh()
    window.addEventListener('dalilak_saved_change', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('dalilak_saved_change', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [refresh])

  if (!mounted) return null

  const total = stats.completed + stats.started + stats.reminders + stats.saved
  if (total === 0) return null

  const items: Stat[] = [
    {
      icon: '✅',
      valueAr: stats.completed.toLocaleString('ar-EG'),
      valueEn: String(stats.completed),
      labelAr: 'مكتملة',
      labelEn: 'Done',
      color: '#059669',
    },
    {
      icon: '🚀',
      valueAr: stats.started.toLocaleString('ar-EG'),
      valueEn: String(stats.started),
      labelAr: 'جارية',
      labelEn: 'Active',
      color: '#7C3AED',
    },
    {
      icon: '🔔',
      valueAr: stats.reminders.toLocaleString('ar-EG'),
      valueEn: String(stats.reminders),
      labelAr: 'تذكيرات',
      labelEn: 'Reminders',
      color: '#D97706',
    },
    {
      icon: '⭐',
      valueAr: stats.saved.toLocaleString('ar-EG'),
      valueEn: String(stats.saved),
      labelAr: 'محفوظة',
      labelEn: 'Saved',
      color: '#0369A1',
    },
  ]

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 7,
        marginBottom: 10,
        animation: 'fadeUp 0.2s ease both',
      }}
    >
      {items.map(item => {
        const val = isAr ? item.valueAr : item.valueEn
        if (val === '0') return null
        return (
          <div key={item.labelEn} style={{
            background: '#FDFCFA', border: '1px solid #E6E2DC', borderRadius: 10,
            padding: '8px 6px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 16, marginBottom: 2 }}>{item.icon}</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: item.color, fontVariantNumeric: 'tabular-nums' }}>{val}</div>
            <div style={{ fontSize: 9, fontWeight: 600, color: '#918B82', marginTop: 1 }}>
              {isAr ? item.labelAr : item.labelEn}
            </div>
          </div>
        )
      })}
    </div>
  )
}
