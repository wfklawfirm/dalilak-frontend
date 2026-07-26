'use client'

/**
 * ProcedureTagSearch — clickable tag cloud of all unique ministry names.
 *
 * Extracts unique ministries from ENRICHED_PROCEDURES, sorts by procedure
 * count (most → fewest), renders as a compact scrollable chip row.
 * Clicking a tag fires onSelect(ministrySlug).
 *
 * batch #429: selection is keyed by the language-independent `ministrySlug`,
 * not the localized display label. Previously onSelect/selectedMinistry
 * carried the *localized* label text (proc.ministry / proc.ministry_en).
 * Since language can be toggled client-side without remounting this page
 * (see lib/LanguageContext), the parent's stored selection stayed frozen in
 * whatever language it was picked in, while this component recomputes tag
 * labels in the *new* language on every isAr change. `selectedMinistry ===
 * label` then compared an old-language string to new-language labels and
 * never matched — so after a language switch, no chip (including "All")
 * ever showed as selected again, even though a ministry filter was still
 * silently applied to the results. Slugs never change with language, so
 * they stay valid across toggles.
 *
 * Props:
 *   { onSelect: (ministrySlug: string) => void; selectedMinistry?: string; isAr: boolean }
 *
 * Used on /procedures page as a quick-filter row above the procedure list.
 */

import React, { useMemo } from 'react'
import { ENRICHED_PROCEDURES } from '@/lib/enrichedProcedures'

interface Props {
  onSelect: (ministrySlug: string) => void
  selectedMinistry?: string
  isAr: boolean
}

const COLORS = [
  { bg: '#FEF2F2', border: '#FECACA', text: '#991B1B' },
  { bg: '#FFFBEB', border: '#FDE68A', text: '#92400E' },
  { bg: '#ECFDF5', border: '#A7F3D0', text: '#065F46' },
  { bg: '#EFF6FF', border: '#BFDBFE', text: '#1D4ED8' },
  { bg: '#F5F3FF', border: '#DDD6FE', text: '#4C1D95' },
  { bg: '#FFF1F2', border: '#FECDD3', text: '#9F1239' },
]

function colorFor(label: string) {
  let h = 0
  for (let i = 0; i < label.length; i++) h = (h * 31 + label.charCodeAt(i)) >>> 0
  return COLORS[h % COLORS.length]
}

export default function ProcedureTagSearch({ onSelect, selectedMinistry, isAr }: Props) {
  const tags = useMemo(() => {
    const countMap = new Map<string, { label: string; count: number }>()
    for (const proc of ENRICHED_PROCEDURES) {
      const slug = proc.ministrySlug
      const label = isAr ? proc.ministry : (proc.ministry_en || proc.ministry)
      const entry = countMap.get(slug)
      countMap.set(slug, { label, count: (entry?.count || 0) + 1 })
    }
    return Array.from(countMap.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .map(([slug, { label, count }]) => ({ slug, label, count }))
  }, [isAr])

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        display: 'flex', flexWrap: 'nowrap', gap: 5, overflowX: 'auto',
        paddingBottom: 4, paddingTop: 2,
        scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch' as any,
      }}
      aria-label={isAr ? 'تصفية حسب الوزارة' : 'Filter by ministry'}
    >
      {/* "All" chip */}
      <button
        type="button"
        onClick={() => onSelect('')}
        style={{
          flexShrink: 0, padding: '3px 10px', borderRadius: 20,
          background: !selectedMinistry ? '#8F1D2C' : '#F5F3EE',
          border: `1.5px solid ${!selectedMinistry ? '#8F1D2C' : '#D1CBC4'}`,
          color: !selectedMinistry ? '#fff' : '#6B5A4A',
          fontSize: 10.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
          transition: 'background 0.12s, color 0.12s',
          whiteSpace: 'nowrap',
        }}
      >
        {/* batch #519: opacity:0.7 on this count span blended its color
            toward the chip background and dropped contrast below 4.5:1
            (axe-core color-contrast). Text at full opacity already has
            enough contrast on its own — opacity was purely decorative
            de-emphasis and not worth the WCAG failure, so removed. */}
        {isAr ? 'الكل' : 'All'} <span>({ENRICHED_PROCEDURES.length})</span>
      </button>

      {tags.map(({ slug, label, count }) => {
        const isSelected = selectedMinistry === slug
        const { bg, border, text } = colorFor(label)
        return (
          <button
            key={slug}
            type="button"
            onClick={() => onSelect(isSelected ? '' : slug)}
            style={{
              flexShrink: 0, padding: '3px 10px', borderRadius: 20,
              background: isSelected ? text : bg,
              border: `1.5px solid ${isSelected ? text : border}`,
              color: isSelected ? '#fff' : text,
              fontSize: 10.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              transition: 'background 0.12s, color 0.12s',
              whiteSpace: 'nowrap',
            }}
          >
            {/* batch #519: same opacity-blend contrast fix as the "All" chip
                above — removed opacity:0.6, which pushed several of the 6
                COLORS palette pairs below 4.5:1 (axe measured as low as
                2.93:1 on the worst pair). */}
            {label} <span>({count})</span>
          </button>
        )
      })}
    </div>
  )
}
