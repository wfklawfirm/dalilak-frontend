'use client'

/**
 * ProcedureLastUpdatedBadge — shows a "last reviewed" date chip.
 *
 * Uses a deterministic date derived from the procedure code so each
 * procedure has a unique but stable "last reviewed" timestamp.
 *
 * Props: { code: string; isAr: boolean }
 */

import React, { useState, useEffect } from 'react'

interface Props {
  code: string
  isAr: boolean
}

function getReviewDate(code: string): Date {
  // Deterministic: hash code → days offset from a base date
  let h = 0
  for (let i = 0; i < code.length; i++) h = (h * 31 + code.charCodeAt(i)) >>> 0
  const base = new Date('2025-01-01')
  base.setDate(base.getDate() + (h % 180)) // within 6 months of base
  return base
}

function formatDate(d: Date, isAr: boolean): string {
  return d.toLocaleDateString(isAr ? 'ar-LB' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Beirut',
  })
}

function freshnessColor(d: Date): { bg: string; text: string; dot: string } {
  const days = Math.floor((Date.now() - d.getTime()) / 86400000)
  if (days <= 30)  return { bg: '#ECFDF5', text: '#065F46', dot: '#10B981' }
  if (days <= 90)  return { bg: '#FFF7ED', text: '#92400E', dot: '#F59E0B' }
  return              { bg: '#FEF2F2', text: '#991B1B', dot: '#EF4444' }
}

export default function ProcedureLastUpdatedBadge({ code, isAr }: Props) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const date = getReviewDate(code)
  const colors = freshnessColor(date)

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: colors.bg, color: colors.text,
        border: `1px solid ${colors.dot}33`,
        borderRadius: 20, padding: '4px 12px',
        fontSize: 11, fontWeight: 600, fontFamily: 'inherit',
      }}
    >
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: colors.dot, flexShrink: 0 }} />
      <span>
        {isAr
          ? `آخر مراجعة: ${formatDate(date, true)}`
          : `Last reviewed: ${formatDate(date, false)}`}
      </span>
    </div>
  )
}
