'use client'

/**
 * ProcedureProgressBadge — small inline checklist progress badge for procedure cards.
 *
 * Reads the per-document `dalilak_doc_{code}_{index}` keys (the same live
 * schema written by ProcedureDocumentChecklist.tsx and already read by
 * ProcedureChecklistExport.tsx / ProcedureDocumentShare.tsx) — NOT a flat
 * `dalilak_checklist_{code}` array key, which no live component in the app
 * has ever written (its only writer, DocChecklistBuilder.tsx, is orphaned
 * dead code), so this badge previously could never render for any real
 * user regardless of actual checklist progress.
 * If the user has no checked documents for this procedure, renders nothing.
 * Otherwise shows "X/Y ✓" in a compact colored badge.
 *
 * Colors:
 *   Green  — all checked (100%)
 *   Amber  — some checked (> 0%)
 *
 * Props:
 *   code      — procedure code (e.g. "PASS-001")
 *   total     — total number of required documents
 *   compact   — if true, shows only the fraction, no label text
 */

import React, { useState, useEffect } from 'react'
import { useLanguage } from '@/lib/LanguageContext'

const LS_PREFIX = 'dalilak_doc_'

interface Props {
  code: string
  total: number
  compact?: boolean
}

function countChecked(code: string, total: number): number {
  try {
    let n = 0
    for (let i = 0; i < total; i++) {
      if (localStorage.getItem(`${LS_PREFIX}${code}_${i}`) === '1') n++
    }
    return n
  } catch { return 0 }
}

export default function ProcedureProgressBadge({ code, total, compact = false }: Props) {
  const { isAr } = useLanguage()
  const [checked, setChecked] = useState(0)
  const [hasData, setHasData] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    function refresh() {
      const n = countChecked(code, total)
      setHasData(n > 0)
      setChecked(n)
    }

    refresh()
    window.addEventListener('storage', refresh)
    // ProcedureDocumentChecklist.tsx dispatches dalilak_saved_change on every toggle
    const handler = () => refresh()
    window.addEventListener('dalilak_saved_change', handler)
    return () => {
      window.removeEventListener('storage', refresh)
      window.removeEventListener('dalilak_saved_change', handler)
    }
  }, [code, total])

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
