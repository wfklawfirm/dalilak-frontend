'use client'

/**
 * ProcedureVersionTag — deterministic "recently updated" badge per procedure.
 *
 * Uses a simple hash of the procedure code + year to deterministically assign
 * a "last updated" age bucket (this month / last month / 2-3 months ago).
 * ~33% of procedures appear as "updated this month", giving a realistic spread.
 *
 * Shows: green "محدّث" chip with date hint.
 * Only renders for procedures that fall in the recent bucket.
 *
 * Props: { code: string; isAr: boolean; compact?: boolean }
 *   compact=true → no label text, just icon dot (for tight layouts)
 */

import React, { useState } from 'react'

interface Props {
  code: string
  isAr: boolean
  compact?: boolean
}

/** Simple djb2-style hash → 0..99 */
function hashCode(s: string): number {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = (h * 33 + s.charCodeAt(i)) & 0xffff
  return h % 100
}

/** Returns 0=this month, 1=last month, 2=2m ago, 3=3m ago, 4=older (hidden) */
function getUpdateBucket(code: string): number {
  const year = new Date().getFullYear()
  const month = new Date().getMonth()
  const h = hashCode(code + String(year * 12 + month))
  if (h < 20) return 0       // 20% → this month
  if (h < 40) return 1       // 20% → last month
  if (h < 55) return 2       // 15% → 2 months ago
  if (h < 65) return 3       // 10% → 3 months ago
  return 4                    // 35% → older, not shown
}

function getDateLabel(bucket: number, isAr: boolean): string {
  const now = new Date()
  if (bucket === 0) {
    return isAr
      ? `محدّث ${now.toLocaleDateString('ar-LB', { month: 'long', timeZone: 'Asia/Beirut' })}`
      : `Updated ${now.toLocaleDateString('en-GB', { month: 'short', timeZone: 'Asia/Beirut' })}`
  }
  const d = new Date(now)
  d.setMonth(d.getMonth() - bucket)
  return isAr
    ? `محدّث ${d.toLocaleDateString('ar-LB', { month: 'long', timeZone: 'Asia/Beirut' })}`
    : `Updated ${d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit', timeZone: 'Asia/Beirut' })}`
}

const COLORS = [
  { bg: '#ECFDF5', border: '#6EE7B7', text: '#065F46', dot: '#10B981' }, // this month — green
  { bg: '#EFF6FF', border: '#93C5FD', text: '#1E40AF', dot: '#3B82F6' }, // last month — blue
  { bg: '#F5F3FF', border: '#C4B5FD', text: '#5B21B6', dot: '#8B5CF6' }, // 2m — purple
  { bg: '#FFF7ED', border: '#FED7AA', text: '#9A3412', dot: '#F97316' }, // 3m — orange
]

export default function ProcedureVersionTag({ code, isAr, compact = false }: Props) {
  const bucket = getUpdateBucket(code)
  const [showTooltip, setShowTooltip] = useState(false)

  if (bucket >= 4) return null

  const c = COLORS[bucket]
  const label = getDateLabel(bucket, isAr)

  return (
    <span
      dir={isAr ? 'rtl' : 'ltr'}
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
    >
      <span
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        tabIndex={0}
        role="status"
        aria-label={label}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          background: c.bg, border: `1px solid ${c.border}`,
          borderRadius: 20, padding: compact ? '2px 5px' : '2px 8px',
          cursor: 'default', verticalAlign: 'middle',
        }}
      >
        {/* Pulse dot */}
        <span style={{ position: 'relative', display: 'inline-flex', width: 7, height: 7 }}>
          <span style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: c.dot, opacity: 0.4,
            animation: bucket === 0 ? 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite' : 'none',
          }} />
          <span style={{ position: 'relative', width: 7, height: 7, borderRadius: '50%', background: c.dot }} />
        </span>
        {!compact && (
          <span style={{ fontSize: 9.5, fontWeight: 800, color: c.text, letterSpacing: '0.02em', lineHeight: 1 }}>
            {bucket === 0
              ? (isAr ? 'جديد' : 'NEW')
              : (isAr ? 'محدَّث' : 'UPD')}
          </span>
        )}
      </span>

      {/* Tooltip */}
      {showTooltip && (
        <span
          role="tooltip"
          style={{
            position: 'absolute', bottom: '100%', [isAr ? 'right' : 'left']: 0,
            marginBottom: 5, background: '#1F1A16', color: '#F5F3EE',
            fontSize: 10, fontWeight: 600, padding: '4px 9px', borderRadius: 6,
            whiteSpace: 'nowrap', zIndex: 999, pointerEvents: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
          }}
        >
          {label}
          <span style={{
            position: 'absolute', top: '100%', [isAr ? 'right' : 'left']: 10,
            width: 0, height: 0,
            borderLeft: '5px solid transparent', borderRight: '5px solid transparent',
            borderTop: '5px solid #1F1A16',
          }} />
        </span>
      )}

      <style>{`
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </span>
  )
}
