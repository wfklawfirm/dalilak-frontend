'use client'

/**
 * ProcedureHashtagChips — hashtag-style tag cloud for a procedure.
 *
 * Derives tags from: category, ministry slug, and any extra tags passed in.
 * Each tag is a clickable chip that links to /procedures?q={tag}.
 *
 * Visually: small muted chips with # prefix, colored by tag type.
 *
 * Props:
 *   code:      procedure code (used for color hue)
 *   category?: category label
 *   ministry:  ministry name (Arabic)
 *   ministry_en?: ministry name (English)
 *   tags?:     additional keyword tags
 *   tags_en?:  additional keyword tags in English
 *   isAr:      language flag
 */

import React from 'react'
import Link from 'next/link'

interface Props {
  code: string
  category?: string
  category_en?: string
  ministry: string
  ministry_en?: string
  tags?: string[]
  tags_en?: string[]
  isAr: boolean
}

/** Simple hash for stable color per string → 0..5 */
function colorIndex(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) & 0xff
  return h % 6
}

const PALETTES = [
  { bg: 'rgba(143,29,44,0.08)',  border: 'rgba(143,29,44,0.2)',  color: '#8F1D2C'  }, // brand red
  { bg: 'rgba(37,99,235,0.08)',  border: 'rgba(37,99,235,0.2)',  color: '#1D4ED8'  }, // blue
  { bg: 'rgba(5,150,105,0.08)',  border: 'rgba(5,150,105,0.2)',  color: '#047857'  }, // green
  { bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.2)', color: '#6D28D9'  }, // purple
  { bg: 'rgba(217,119,6,0.08)',  border: 'rgba(217,119,6,0.2)',  color: '#B45309'  }, // amber
  { bg: 'rgba(15,118,110,0.08)', border: 'rgba(15,118,110,0.2)', color: '#0F766E'  }, // teal
]

interface Tag {
  label: string
  query: string
}

export default function ProcedureHashtagChips({
  code, category, category_en, ministry, ministry_en,
  tags = [], tags_en = [], isAr,
}: Props) {
  const items: Tag[] = []

  // Category
  const catLabel = isAr ? category : (category_en || category)
  if (catLabel) items.push({ label: catLabel, query: catLabel })

  // Ministry (abbreviate long names)
  const minLabel = isAr ? ministry : (ministry_en || ministry)
  if (minLabel) {
    const short = minLabel.length > 25 ? minLabel.slice(0, 23) + '…' : minLabel
    items.push({ label: short, query: isAr ? ministry : (ministry_en || ministry) })
  }

  // Keyword tags
  const extraLabels = isAr ? tags : (tags_en.length ? tags_en : tags)
  for (const t of extraLabels) {
    if (t) items.push({ label: t, query: t })
  }

  if (items.length === 0) return null

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 5 }}
      role="list"
      aria-label={isAr ? 'وسوم المعاملة' : 'Procedure tags'}
    >
      {items.map((item, i) => {
        const pal = PALETTES[colorIndex(item.label)]
        return (
          <Link
            key={i}
            href={`/procedures?q=${encodeURIComponent(item.query)}`}
            role="listitem"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 2,
              padding: '2px 9px 2px 7px', borderRadius: 20, textDecoration: 'none',
              background: pal.bg, border: `1px solid ${pal.border}`,
              fontSize: 10, fontWeight: 700, color: pal.color,
              lineHeight: 1.6, transition: 'opacity 0.12s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            aria-label={`${isAr ? 'بحث عن' : 'Search for'} ${item.label}`}
          >
            <span aria-hidden="true" style={{ opacity: 0.55, fontWeight: 900, fontSize: 10, lineHeight: 1 }}>#</span>
            {item.label}
          </Link>
        )
      })}
    </div>
  )
}
