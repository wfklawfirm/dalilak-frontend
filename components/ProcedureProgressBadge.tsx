'use client'

/**
 * ProcedureProgressBadge — small inline checklist progress badge for procedure cards.
 *
 * Reads `dalilak_checklist_{code}` from localStorage.
 * If the user has no checklist data for this procedure, renders nothing.
 * Otherwise shows "X/Y ✓" in a compact colored badge.
 *
 * Colors:
 *   Green  — all checked (100%)
 *   Amber  — some checked (> 0%)
 *   Gray   — nothing checked yet (but key exists)
 *
 * Props:
 *   code      — procedure code (e.g. "PASS-001")
 *   total     — total number of required documents
 *   compact   — if true, shows only the fraction, no label text
 */

import React, { useState, useEffect } from 'react'
import { useLanguage } from '@/lib/LanguageContext'

const LS_PREFIX = 'dalilak_checklist_'

interface Props {
  code: string
  total: number
  compact?: boolean
}

function loadChecked(code: string): Set<number> {
  try {
    const raw = localStorage.getItem(LS_PREFIX + code)
    if (!raw) return new Set()
    const arr: number[] = JSON.parse(raw)
    return new Set(arr)
  } catch { return new Set() }
}

export default function ProcedureProgressBadge({ code, total, compact = false }: Props) {
  const { isAr } = useLanguage()
  const [checked, setChecked] = useState(0)
  const [hasData, setHasData] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    function refresh() {
      const raw = localStorage.getItem(LS_PREFIX + code)
      if (raw === null) { setHasData(false); return }
      setHasData(true)
      const set = loadChecked(code)
      setChecked(set.size)
    }

    refresh()
    window.addEventListener('storage', refresh)
    // Also listen to custom event from DocChecklistBuilder / ProcedureTimeline
    const handler = () => refresh()
    window.addEventListener('dalilak_saved_change', handler)
    return () => {
      window.removeEventListener('storage', refresh)
      window.removeEventListener('dalilak_saved_change', handler)
    }
  }, [code])

  if (!mounted || !hasData || total === 0) return null

  const pct = Math.round((checked / total) * 100)
  const done = checked >= total

  const color  = done ? '#059669' : checked > 0 ? '#d97706' : '#9ca3af'
  const bgColor = done ? '#D1FAE5' : checked > 0 ? '#FEF3C7' : '#F3F4F6'
  const borderColor = done ? '#A7F3D0' : checked > 0 ? '#FDE68A' : '#E5E7EB'
  const icon = done ? '✅' : checked > 0 ? '📋' : '📋'

  if (compact) {
    return (
      <span
        title={isAr ? `${checked} من ${total} وثيقة محضّرة` : `${checked} of ${total} docs ready`}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 3,
          padding: '1px 6px', borderRadius: 5,
          background: bgColor, border: `1px solid ${borderColor}`,
          fontSize: 9.5, fontWeight: 700, color,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {icon} {checked}/{total}
      </span>
    )
  }

  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '5px 10px',
        background: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: 8,
      }}
    >
      {/* Mini progress bar */}
      <div style={{
        width: 40, height: 4, borderRadius: 2,
        background: '#E5E7EB', overflow: 'hidden', flexShrink: 0,
      }}>
        <div style={{
          width: `${pct}%`, height: '100%',
          background: color, borderRadius: 2,
          transition: 'width 0.3s',
        }} />
      </div>

      <span style={{ fontSize: 10.5, fontWeight: 700, color, whiteSpace: 'nowrap' }}>
        {done
          ? (isAr ? '✅ الوثائق جاهزة' : '✅ Docs ready')
          : (isAr ? `${checked}/${total} وثيقة` : `${checked}/${total} docs`)
        }
      </span>
    </div>
  )
}
