'use client'

/**
 * HomepageProcedureStats — animated counter strip showing
 * aggregate statistics across all enriched procedures.
 *
 * Stats:
 *   📋 Total procedures
 *   📝 Total steps (sum of all steps arrays)
 *   📄 Total required documents
 *   🏛️ Unique ministries
 *
 * Numbers animate from 0 to final value on mount (CSS counter animation).
 * Static data — no localStorage or network calls.
 */

import React, { useState, useEffect, useRef } from 'react'
import { useLanguage } from '@/lib/LanguageContext'
import { ENRICHED_PROCEDURES } from '@/lib/enrichedProcedures'

// Pre-compute at module level (static)
const TOTAL_PROCS    = ENRICHED_PROCEDURES.length
const TOTAL_STEPS    = ENRICHED_PROCEDURES.reduce((s, p) => s + p.steps.length, 0)
const TOTAL_DOCS     = ENRICHED_PROCEDURES.reduce((s, p) => s + p.requiredDocuments.length, 0)
const TOTAL_MINISTR  = new Set(ENRICHED_PROCEDURES.map(p => p.ministrySlug).filter(Boolean)).size

interface StatItem {
  icon: string
  labelAr: string
  labelEn: string
  value: number
}

const STATS: StatItem[] = [
  { icon: '📋', labelAr: 'إجراء موثّق', labelEn: 'Procedures', value: TOTAL_PROCS },
  { icon: '📝', labelAr: 'خطوة عملية', labelEn: 'Steps',      value: TOTAL_STEPS },
  { icon: '📄', labelAr: 'وثيقة مطلوبة', labelEn: 'Documents', value: TOTAL_DOCS },
  { icon: '🏛️', labelAr: 'وزارة وجهة',   labelEn: 'Ministries', value: TOTAL_MINISTR },
]

function useCountUp(target: number, duration = 900): number {
  const [count, setCount] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true
    const start = Date.now()
    const step = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration])

  return count
}

function StatCard({ stat, isAr }: { stat: StatItem; isAr: boolean }) {
  const count = useCountUp(stat.value)
  return (
    <div style={{
      flex: '1 1 60px', display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '10px 6px', textAlign: 'center',
    }}>
      <span style={{ fontSize: 20, marginBottom: 4 }}>{stat.icon}</span>
      <div style={{ fontSize: 18, fontWeight: 900, color: '#8F1D2C', lineHeight: 1 }}>
        {count.toLocaleString(isAr ? 'ar-LB' : 'en-US')}
      </div>
      <div style={{ fontSize: 9, fontWeight: 700, color: '#918B82', marginTop: 3, lineHeight: 1.3 }}>
        {isAr ? stat.labelAr : stat.labelEn}
      </div>
    </div>
  )
}

export default function HomepageProcedureStats() {
  const { isAr } = useLanguage()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        background: 'linear-gradient(135deg, #FFF8F8 0%, #FEF5F0 100%)',
        border: '1.5px solid rgba(143,29,44,0.1)',
        borderRadius: 13, marginBottom: 10, overflow: 'hidden',
      }}
    >
      {/* Label */}
      <div style={{ fontSize: 9.5, fontWeight: 800, color: '#8F1D2C', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center', padding: '8px 14px 0' }}>
        {isAr ? 'دليلك بالأرقام' : 'Dalilak by the numbers'}
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', justifyContent: 'space-around', padding: '4px 6px 10px', gap: 4 }}>
        {STATS.map((s, i) => (
          <React.Fragment key={i}>
            <StatCard stat={s} isAr={isAr} />
            {i < STATS.length - 1 && (
              <div style={{ width: 1, background: 'rgba(143,29,44,0.1)', margin: '10px 0' }} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}
