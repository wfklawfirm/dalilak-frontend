'use client'

/**
 * ProcedureCategoryIcon — small colored icon chip representing a
 * procedure's ministry category, for quick visual scanning in lists.
 *
 * Props: { ministrySlug: string; size?: number }
 */

import React from 'react'

interface Props {
  ministrySlug: string
  size?: number
}

const CATEGORY_STYLE: Record<string, { icon: string; bg: string; fg: string }> = {
  'isf':            { icon: '🚔', bg: '#FEF2F2', fg: '#B91C1C' },
  'civil-registry': { icon: '📋', bg: '#EFF6FF', fg: '#1D4ED8' },
  'moe':            { icon: '🎓', bg: '#F0FDF4', fg: '#15803D' },
  'moph':           { icon: '🏥', bg: '#FDF2F8', fg: '#BE185D' },
  'mol':            { icon: '💼', bg: '#FFFBEB', fg: '#B45309' },
  'mof':            { icon: '🏦', bg: '#F0FDFA', fg: '#0F766E' },
  'moim':           { icon: '🏛️', bg: '#F5F3FF', fg: '#6D28D9' },
  'mofa':           { icon: '✈️', bg: '#ECFEFF', fg: '#0E7490' },
  'mopwt':          { icon: '🔧', bg: '#FFF7ED', fg: '#C2410C' },
  'cdm':            { icon: '🏗️', bg: '#F8FAFC', fg: '#475569' },
}

export default function ProcedureCategoryIcon({ ministrySlug, size = 28 }: Props) {
  const style = CATEGORY_STYLE[ministrySlug] ?? { icon: '📄', bg: '#F9FAFB', fg: '#6B7280' }

  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: size, height: size,
        borderRadius: size / 3,
        background: style.bg, color: style.fg,
        fontSize: size * 0.55,
        flexShrink: 0,
      }}
      aria-hidden="true"
    >
      {style.icon}
    </span>
  )
}
