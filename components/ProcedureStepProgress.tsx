'use client'

/**
 * ProcedureStepProgress — interactive step-by-step checklist for a procedure.
 *
 * Each step (from proc.steps: string[]) is a checkable row.
 * Checked state persisted in LS: dalilak_step_check_{code}_{index} = '1'
 *
 * Shows:
 *   - Progress bar (checked / total steps)
 *   - Step rows with checkbox
 *   - "إعادة تعيين" reset button
 *
 * Fires dalilak_saved_change event on check/uncheck.
 *
 * Props: { code: string; steps: string[]; isAr: boolean }
 */

import React, { useState, useEffect, useCallback } from 'react'

interface Props {
  code: string
  steps: string[]
  isAr: boolean
}

function getKey(code: string, idx: number) { return `dalilak_step_check_${code}_${idx}` }

function loadChecked(code: string, total: number): boolean[] {
  try {
    return Array.from({ length: total }, (_, i) => !!localStorage.getItem(getKey(code, i)))
  } catch { return new Array(total).fill(false) }
}

export default function ProcedureStepProgress({ code, steps, isAr }: Props) {
  const [checked, setChecked] = useState<boolean[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setChecked(loadChecked(code, steps.length))
  }, [code, steps.length])

  const toggle = useCallback((idx: number) => {
    setChecked(prev => {
      const next = [...prev]
      next[idx] = !next[idx]
      try {
        if (next[idx]) localStorage.setItem(getKey(code, idx), '1')
        else localStorage.removeItem(getKey(code, idx))
        window.dispatchEvent(new Event('dalilak_saved_change'))
      } catch {}
      return next
    })
  }, [code])

  const reset = useCallback(() => {
    try {
      steps.forEach((_, i) => localStorage.removeItem(getKey(code, i)))
      window.dispatchEvent(new Event('dalilak_saved_change'))
    } catch {}
    setChecked(new Array(steps.length).fill(false))
  }, [code, steps])

  if (!mounted || steps.length === 0) return null

  const doneCount = checked.filter(Boolean).length
  const pct = steps.length ? (doneCount / steps.length) * 100 : 0
  const allDone = doneCount === steps.length

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        background: '#fff', border: '1.5px solid #E6E2DC', borderRadius: 13,
        overflow: 'hidden', marginBottom: 10,
      }}
    >
      {/* Header */}
      <div style={{
        padding: '10px 14px 8px', borderBottom: '1px solid #F0EDE8',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
      }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#191713' }}>
            {isAr ? 'تقدّم الخطوات' : 'Step Progress'}
          </div>
          <div style={{ fontSize: 10, color: '#918B82', marginTop: 1 }}>
            {isAr
              ? `${doneCount} من ${steps.length} خطوة${allDone ? ' — ✅ مكتمل!' : ''}`
              : `${doneCount} of ${steps.length} steps${allDone ? ' — ✅ Complete!' : ''}`}
          </div>
        </div>
        {doneCount > 0 && (
          <button
            type="button" onClick={reset}
            style={{
              fontSize: 10, color: '#918B82', background: 'none', border: 'none',
              cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline', flexShrink: 0,
            }}
          >
            {isAr ? 'إعادة تعيين' : 'Reset'}
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: '#F0EDE8' }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: allDone ? '#10B981' : '#8F1D2C',
          transition: 'width 0.3s ease, background 0.3s ease',
          borderRadius: '0 4px 4px 0',
        }} />
      </div>

      {/* Steps list */}
      <div style={{ padding: '6px 10px 8px' }}>
        {steps.map((step, i) => (
          <label
            key={i}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 9,
              padding: '6px 4px', cursor: 'pointer',
              borderBottom: i < steps.length - 1 ? '1px solid #F7F5F3' : 'none',
            }}
          >
            {/* Custom checkbox */}
            <div
              onClick={() => toggle(i)}
              style={{
                width: 18, height: 18, borderRadius: 5, flexShrink: 0, marginTop: 1,
                border: `2px solid ${checked[i] ? '#8F1D2C' : '#D1CBC2'}`,
                background: checked[i] ? '#8F1D2C' : '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }}
            >
              {checked[i] && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </div>
            <span
              onClick={() => toggle(i)}
              style={{
                fontSize: 11, lineHeight: 1.5, color: checked[i] ? '#918B82' : '#191713',
                textDecoration: checked[i] ? 'line-through' : 'none',
                transition: 'color 0.15s',
                flex: 1,
              }}
            >
              <span style={{ fontWeight: 700, color: checked[i] ? '#C8C2BB' : '#8F1D2C', marginInlineEnd: 4 }}>
                {isAr ? `${i + 1}.` : `${i + 1}.`}
              </span>
              {step}
            </span>
          </label>
        ))}
      </div>

      {/* All done banner */}
      {allDone && (
        <div style={{
          background: 'linear-gradient(90deg, #ECFDF5, #F0FDF4)',
          borderTop: '1px solid #A7F3D0',
          padding: '8px 14px', textAlign: 'center',
          fontSize: 11, fontWeight: 800, color: '#065F46',
        }}>
          🎉 {isAr ? 'أتممت كل الخطوات!' : 'All steps complete!'}
        </div>
      )}
    </div>
  )
}
