'use client'

/**
 * HomepageRecentMinistries — quick-access chips for recently browsed ministries.
 *
 * Reads dalilak_viewed_* keys to determine which procedures were visited,
 * maps them to ministries via ENRICHED_PROCEDURES, deduplicates, shows last 4.
 *
 * LS keys: dalilak_views_{code} — written by ProcedureViewCount
 * Links to /procedures?ministry={slug}
 *
 * Props: { isAr: boolean }
 */

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ENRICHED_PROCEDURES } from '@/lib/enrichedProcedures'

interface Props {
  isAr: boolean
}

interface MinistryChip {
  slug: string
  labelAr: string
  labelEn: string
  icon: string
}

// Ministry display names keyed by slug
const MINISTRY_LABELS: Record<string, { ar: string; en: string; icon: string }> = {
  'isf':           { ar: 'قوى الأمن الداخلي', en: 'Internal Security Forces', icon: '🚔' },
  'civil-registry':{ ar: 'الأحوال المدنية',   en: 'Civil Registry',           icon: '📋' },
  'moe':           { ar: 'وزارة التعليم',      en: 'Ministry of Education',    icon: '🎓' },
  'moph':          { ar: 'وزارة الصحة',        en: 'Ministry of Health',       icon: '🏥' },
  'mol':           { ar: 'وزارة العمل',         en: 'Ministry of Labor',        icon: '💼' },
  'mof':           { ar: 'وزارة المالية',       en: 'Ministry of Finance',      icon: '🏦' },
  'moim':          { ar: 'وزارة الداخلية',      en: 'Ministry of Interior',     icon: '🏛️' },
  'mofa':          { ar: 'وزارة الخارجية',      en: 'Ministry of Foreign Affairs', icon: '✈️' },
  'mopwt':         { ar: 'وزارة الأشغال العامة', en: 'Ministry of Public Works', icon: '🔧' },
  'cdm':           { ar: 'مجلس الإنماء والإعمار', en: 'Council for Development', icon: '🏗️' },
}

function getRecentMinistries(): MinistryChip[] {
  const seen = new Map<string, number>() // slug → last view timestamp
  try {
    for (const proc of ENRICHED_PROCEDURES) {
      const raw = localStorage.getItem(`dalilak_views_${proc.code}`)
      if (!raw) continue
      const count = parseInt(raw, 10)
      if (count < 1) continue
      const slug = proc.ministrySlug ?? ''
      if (!slug) continue
      const prev = seen.get(slug) ?? 0
      seen.set(slug, Math.max(prev, count)) // use count as a proxy for recency
    }
  } catch {}
  return Array.from(seen.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([slug]) => {
      const meta = MINISTRY_LABELS[slug] ?? { ar: slug, en: slug, icon: '🏢' }
      return { slug, labelAr: meta.ar, labelEn: meta.en, icon: meta.icon }
    })
}

export default function HomepageRecentMinistries({ isAr }: Props) {
  const [mounted, setMounted]         = useState(false)
  const [chips, setChips]             = useState<MinistryChip[]>([])

  useEffect(() => {
    setMounted(true)
    setChips(getRecentMinistries())
  }, [])

  if (!mounted || chips.length === 0) return null

  return (
    <div dir={isAr ? 'rtl' : 'ltr'} style={{ marginBottom: 4 }}>
      <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 600, marginBottom: 6 }}>
        {isAr ? 'الوزارات التي تصفّحتها أخيرًا' : 'Recently browsed ministries'}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {chips.map(chip => (
          <Link
            key={chip.slug}
            href={`/procedures?ministry=${chip.slug}`}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '5px 10px',
              background: '#F9FAFB',
              border: '1px solid #E5E7EB',
              borderRadius: 20,
              fontSize: 11, fontWeight: 600, color: '#374151',
              textDecoration: 'none',
              transition: 'background 0.15s',
            }}
          >
            <span>{chip.icon}</span>
            <span>{isAr ? chip.labelAr : chip.labelEn}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
