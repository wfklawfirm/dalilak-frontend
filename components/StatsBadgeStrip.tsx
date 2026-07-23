'use client'

/**
 * StatsBadgeStrip — horizontal strip of trust-building platform statistics.
 * Shows: procedures, services, ministries, forms, FAQ, users count.
 * Appears on the homepage empty state to build user trust.
 * Static data derived from real lib data counts.
 */

import React, { useRef, useState, useEffect } from 'react'
import { useLanguage } from '@/lib/LanguageContext'
import { ENRICHED_PROCEDURES } from '@/lib/enrichedProcedures'
import { ALL_SERVICES } from '@/lib/allServices'

// ── Static counts ────────────────────────────────────────────────────────────
const PROC_COUNT      = ENRICHED_PROCEDURES.length        // ~60+
const SVC_COUNT       = ALL_SERVICES.length               // ~366
const MINISTRY_COUNT  = new Set(ENRICHED_PROCEDURES.map(p => p.ministry)).size
const FAQ_COUNT       = 48   // from serviceFAQ.ts
const FORMS_COUNT     = 200  // estimate of available forms
const USERS_COUNT     = '10,000+'

interface Stat {
  icon: string
  valueAr: string
  valueEn: string
  labelAr: string
  labelEn: string
  color: string
}

const STATS: Stat[] = [
  {
    icon: '📋',
    valueAr: `${PROC_COUNT}+`,
    valueEn: `${PROC_COUNT}+`,
    labelAr: 'إجراء حكومي',
    labelEn: 'Gov. Procedures',
    color: '#8F1D2C',
  },
  {
    icon: '🏛️',
    valueAr: `${SVC_COUNT}+`,
    valueEn: `${SVC_COUNT}+`,
    labelAr: 'خدمة حكومية',
    labelEn: 'Gov. Services',
    color: '#1a56db',
  },
  {
    icon: '🏢',
    valueAr: `${MINISTRY_COUNT}`,
    valueEn: `${MINISTRY_COUNT}`,
    labelAr: 'وزارة وجهة',
    labelEn: 'Ministries',
    color: '#059669',
  },
  {
    icon: '📝',
    valueAr: `${FORMS_COUNT}+`,
    valueEn: `${FORMS_COUNT}+`,
    labelAr: 'نموذج رسمي',
    labelEn: 'Official Forms',
    color: '#7c3aed',
  },
  {
    icon: '❓',
    valueAr: `${FAQ_COUNT}+`,
    valueEn: `${FAQ_COUNT}+`,
    labelAr: 'سؤال وجواب',
    labelEn: 'FAQ',
    color: '#d97706',
  },
  {
    icon: '👥',
    valueAr: USERS_COUNT,
    valueEn: USERS_COUNT,
    labelAr: 'مستخدم نشط',
    labelEn: 'Active Users',
    color: '#0891b2',
  },
]

export default function StatsBadgeStrip() {
  const { isAr } = useLanguage()
  const [mounted, setMounted] = useState(false)
  const stripRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setMounted(true) }, [])

  // Count-up animation
  const [counts, setCounts] = useState<Record<number, number>>({})
  useEffect(() => {
    if (!mounted) return
    STATS.forEach((s, i) => {
      const target = parseInt((isAr ? s.valueAr : s.valueEn).replace(/[^0-9]/g, ''), 10)
      if (isNaN(target)) return
      let current = 0
      const steps = 20
      const increment = Math.ceil(target / steps)
      const id = setInterval(() => {
        current = Math.min(current + increment, target)
        setCounts(prev => ({ ...prev, [i]: current }))
        if (current >= target) clearInterval(id)
      }, 30)
    })
  }, [mounted, isAr])

  function formatValue(stat: Stat, idx: number): string {
    const raw = isAr ? stat.valueAr : stat.valueEn
    const hasPlus = raw.includes('+')
    const num = counts[idx]
    if (num === undefined) return raw
    const target = parseInt(raw.replace(/[^0-9]/g, ''), 10)
    if (isNaN(target)) return raw
    const display = num.toLocaleString(isAr ? 'ar-LB' : 'en-US')
    return hasPlus ? `${display}+` : display
  }

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        marginBottom: 10,
        animation: 'fadeUp 0.2s ease both',
      }}
    >
      {/* Section label */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        marginBottom: 8, paddingInline: 4,
      }}>
        <svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)' }}>
          {isAr ? 'دليلك بالأرقام' : 'Dalilak by the numbers'}
        </span>
      </div>

      {/* Scrollable stat cards */}
      <div
        ref={stripRef}
        style={{
          display: 'flex', gap: 8, overflowX: 'auto',
          paddingBottom: 4, scrollbarWidth: 'none',
        }}
      >
        {STATS.map((s, i) => (
          <div
            key={i}
            style={{
              flexShrink: 0,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: '10px 14px',
              minWidth: 95, textAlign: 'center',
              transition: 'border-color 0.15s',
            }}
          >
            <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
            <div style={{
              fontSize: 17, fontWeight: 900,
              color: s.color, lineHeight: 1.1, marginBottom: 3,
              fontVariantNumeric: 'tabular-nums',
            }}>
              {formatValue(s, i)}
            </div>
            <div style={{
              fontSize: 9.5, fontWeight: 600, color: 'var(--text-4)',
              lineHeight: 1.3,
            }}>
              {isAr ? s.labelAr : s.labelEn}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
