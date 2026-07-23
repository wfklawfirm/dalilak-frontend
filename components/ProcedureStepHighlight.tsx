'use client'

/**
 * ProcedureStepHighlight — interactive step checklist with per-step done state.
 *
 * LS key: dalilak_step_done_{code}_{idx} → '1'
 * Highlights the first uncompleted step as "current".
 * Shows overall progress bar.
 *
 * Props: { code: string; steps: string[]; isAr: boolean }
 */

import React, { useState, useEffect, useCallback } from 'react'

interface Props {
  code: string
  steps: string[]
  isAr: boolean
}

function lsKey(code: string, idx: number) { return `dalilak_step_done_${code}_${idx}` }

export default function ProcedureStepHighlight({ code, steps, isAr }: Props) {
  const [mounted, setMounted]   = useState(false)
  const [done, setDone]         = useState<boolean[]>([])
  const [open, setOpen]         = useState(false)

  useEffect(() => {
    setMounted(true)
    const initial = steps.map((_, i) => {
      try { return !!localStorage.getItem(lsKey(code, i)) } catch { return false }
    })
    setDone(initial)
  }, [code, steps])

  const toggle = useCallback((idx: number) => {
    setDone(prev => {
      const next = [...prev]
      next[idx] = !next[idx]
      try {
        next[idx]
          ? localStorage.setItem(lsKey(code, idx), '1')
          : localStorage.removeItem(lsKey(code, idx))
      } catch {}
      return next
    })
    window.dispatchEvent(new Event('dalilak_saved_change'))
  }, [code])

  const reset = useCallback(() => {
    steps.forEach((_, i) => { try { localStorage.removeItem(lsKey(code, i)) } catch {} })
    setDone(steps.map(() => false))
    window.dispatchEvent(new Event('dalilak_saved_change'))
  }, [code, steps])

  if (!mounted || !done.length) return null

  const completedCount = done.filter(Boolean).length
  const total          = steps.length
  const pct            = total > 0 ? Math.round((completedCount / total) * 100) : 0
  const currentIdx     = done.findIndex(d => !d) // first uncompleted

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{ border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden', marginBottom: 12 }}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 14px', background: '#F9FAFB',
          border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          borderBottom: open ? '1px solid #E5E7EB' : 'none',
        }}
      >
        <span style={{ fontSize: 15 }}>🗂️</span>
        <span style={{ fontWeight: 700, fontSize: 13, color: '#111827', flex: 1, textAlign: isAr ? 'right' : 'left' }}>
          {isAr ? `تتبّع خطوات التنفيذ (${completedCount}/${total})` : `Step progress (${completedCount}/${total})`}
        </span>
        <span style={{ fontSize: 11, color: '#6B7280' }}>{open ? '▲' : '▼'}</span>
      </button>

      {/* Progress bar */}
      <div style={{ height: 3, background: '#E5E7EB' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? '#10B981' : '#8F1D2C', transition: 'width 0.3s' }} />
      </div>

      {/* Steps */}
      {open && (
        <div style={{ padding: '8px 0' }}>
          {steps.map((step, idx) => {
            const isCurrent = idx === currentIdx
            const isDone    = done[idx]
            return (
              <div
                key={idx}
                onClick={() => toggle(idx)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: '8px 14px',
                  background: isCurrent ? '#FFF8F8' : 'transparent',
                  borderInlineStart: isCurrent ? '3px solid #8F1D2C' : '3px solid transparent',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
              >
                {/* Checkbox */}
                <div style={{
                  width: 18, height: 18, borderRadius: 5, flexShrink: 0, marginTop: 1,
                  border: `2px solid ${isDone ? '#10B981' : isCurrent ? '#8F1D2C' : '#D1D5DB'}`,
                  background: isDone ? '#10B981' : 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {isDone && <span style={{ color: 'white', fontSize: 11, fontWeight: 900 }}>✓</span>}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 12, fontWeight: isCurrent ? 700 : 500,
                    color: isDone ? '#9CA3AF' : isCurrent ? '#8F1D2C' : '#374151',
                    textDecoration: isDone ? 'line-through' : 'none',
                    lineHeight: 1.4,
                  }}>
                    {isAr ? '' : `${idx + 1}. `}{step}{!isAr ? '' : ` .${idx + 1}`}
                  </div>
                  {isCurrent && !isDone && (
                    <div style={{ fontSize: 10, color: '#8F1D2C', fontWeight: 600, marginTop: 2 }}>
                      {isAr ? '← الخطوة الحالية' : '← Current step'}
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {/* Reset */}
          {completedCount > 0 && (
            <div style={{ padding: '6px 14px 4px', textAlign: isAr ? 'right' : 'left' }}>
              <button
                type="button"
                onClick={e => { e.stopPropagation(); reset() }}
                style={{ fontSize: 10, color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                {isAr ? 'إعادة تعيين' : 'Reset progress'}
              </button>
            </div>
          )}

          {pct === 100 && (
            <div style={{ padding: '8px 14px', textAlign: 'center', fontSize: 13, color: '#065F46', fontWeight: 800 }}>
              🎉 {isAr ? 'أنجزت جميع الخطوات!' : 'All steps done!'}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
