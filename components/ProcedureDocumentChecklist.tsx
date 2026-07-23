'use client'

/**
 * ProcedureDocumentChecklist — interactive document readiness checklist.
 *
 * Each required document is a checkbox. Checked state persists in LS.
 * LS key: dalilak_doc_{code}_{index} → "1"
 *
 * Shows a small progress bar at top (checked / total).
 * Dispatches dalilak_saved_change on toggle.
 *
 * Props: { code: string; docs: string[]; isAr: boolean }
 */

import React, { useState, useEffect } from 'react'

interface Props {
  code: string
  docs: string[]
  isAr: boolean
}

function loadChecked(code: string, count: number): boolean[] {
  const result: boolean[] = []
  try {
    for (let i = 0; i < count; i++) {
      result.push(localStorage.getItem(`dalilak_doc_${code}_${i}`) === '1')
    }
  } catch { for (let i = 0; i < count; i++) result.push(false) }
  return result
}

export default function ProcedureDocumentChecklist({ code, docs, isAr }: Props) {
  const [checked, setChecked] = useState<boolean[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setChecked(loadChecked(code, docs.length))
  }, [code, docs.length])

  function toggle(i: number) {
    setChecked(prev => {
      const next = [...prev]
      next[i] = !next[i]
      try {
        localStorage.setItem(`dalilak_doc_${code}_${i}`, next[i] ? '1' : '0')
        window.dispatchEvent(new Event('dalilak_saved_change'))
      } catch {}
      return next
    })
  }

  if (!mounted || docs.length === 0) return null

  const doneCount = checked.filter(Boolean).length
  const pct = Math.round((doneCount / docs.length) * 100)
  const allDone = doneCount === docs.length

  return (
    <div dir={isAr ? 'rtl' : 'ltr'} style={{ marginBottom: 10 }}>
      {/* Progress bar header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: allDone ? '#059669' : '#191713' }}>
          {allDone ? '✅' : '📁'} {isAr ? 'الوثائق المطلوبة' : 'Required Documents'}
        </span>
        <div style={{ flex: 1, height: 5, background: '#E6E2DC', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 10,
            background: allDone ? '#10B981' : '#8F1D2C',
            width: `${pct}%`, transition: 'width 0.3s ease',
          }}/>
        </div>
        <span style={{ fontSize: 9.5, fontWeight: 700, color: allDone ? '#059669' : '#8F1D2C', flexShrink: 0 }}>
          {doneCount}/{docs.length}
        </span>
      </div>

      {/* Document rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {docs.map((doc, i) => (
          <label key={i} style={{
            display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer',
            padding: '5px 8px', borderRadius: 7,
            background: checked[i] ? 'rgba(16,185,129,0.06)' : '#FDFCFA',
            border: `1px solid ${checked[i] ? 'rgba(16,185,129,0.25)' : '#E6E2DC'}`,
            transition: 'background 0.15s, border 0.15s',
          }}>
            <input
              type="checkbox"
              checked={checked[i] ?? false}
              onChange={() => toggle(i)}
              style={{ marginTop: 1, flexShrink: 0, accentColor: '#059669', width: 14, height: 14, cursor: 'pointer' }}
            />
            <span style={{
              fontSize: 11, color: checked[i] ? '#6B7280' : '#191713',
              fontWeight: checked[i] ? 400 : 600,
              textDecoration: checked[i] ? 'line-through' : 'none',
              lineHeight: 1.4,
              transition: 'color 0.15s',
            }}>
              {doc}
            </span>
          </label>
        ))}
      </div>

      {allDone && (
        <div style={{ marginTop: 6, fontSize: 10.5, fontWeight: 700, color: '#059669', textAlign: 'center', background: 'rgba(16,185,129,0.07)', borderRadius: 7, padding: '5px 10px' }}>
          🎉 {isAr ? 'جميع الوثائق جاهزة!' : 'All documents ready!'}
        </div>
      )}
    </div>
  )
}
