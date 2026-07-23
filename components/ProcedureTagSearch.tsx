'use client'

/**
 * ProcedureTagSearch — clickable tag cloud of all unique ministry names.
 *
 * Extracts unique ministry labels from ENRICHED_PROCEDURES,
 * sorts by procedure count (most → fewest), renders as a compact
 * scrollable chip row. Clicking a tag fires onSelect(ministry).
 *
 * Props:
 *   { onSelect: (ministry: string) => void; selectedMinistry?: string; isAr: boolean }
 *
 * Used on /procedures page as a quick-filter row above the procedure list.
 */

import React, { useMemo } from 'react'
import { ENRICHED_PROCEDURES } from '@/lib/enrichedProcedures'

interface Props {
  onSelect: (ministry: string) => void
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
    const countMap = new Map<string, number>()
    for (const proc of ENRICHED_PROCEDURES) {
      const label = isAr ? proc.ministry : (proc.ministry_en || proc.ministry)
      countMap.set(label, (countMap.get(label) || 0) + 1)
    }
    return Array.from(countMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([label, count]) => ({ label, count }))
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
        {isAr ? 'الكل' : 'All'} <span style={{ opacity: 0.7 }}>({ENRICHED_PROCEDURES.length})</span>
      </button>

      {tags.map(({ label, count }) => {
        const isSelected = selectedMinistry === label
        const { bg, border, text } = colorFor(label)
        return (
          <button
            key={label}
            type="button"
            onClick={() => onSelect(isSelected ? '' : label)}
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
            {label} <span style={{ opacity: 0.6 }}>({count})</span>
          </button>
        )
      })}
    </div>
  )
}
