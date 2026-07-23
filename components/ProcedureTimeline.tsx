'use client'

/**
 * ProcedureTimeline — visual numbered step timeline for an enriched procedure.
 * User can mark steps as done. State is localStorage-persisted per procedure.
 * Renders inside the expanded enriched procedure card.
 */

import React, { useState, useEffect, useCallback } from 'react'
import { useLanguage } from '@/lib/LanguageContext'

interface Props {
  /** Unique key for localStorage (e.g. procedure code or slug) */
  storageKey: string
  stepsAr: string[]
  stepsEn?: string[]
  titleAr?: string
  titleEn?: string
  onAsk?: (q: string) => void
}

const LS_PREFIX = 'dalilak_timeline_'
const LS_RATING = 'dalilak_ratings_'

// ── Inline rating widget ─────────────────────────────────────────────────────
function RatingWidget({ storageKey, isAr }: { storageKey: string; isAr: boolean }) {
  const [rating, setRating] = useState<number>(() => {
    if (typeof window === 'undefined') return 0
    return parseInt(localStorage.getItem(LS_RATING + storageKey) || '0', 10)
  })
  const [hover, setHover] = useState(0)
  const [thanked, setThanked] = useState(false)

  const handleRate = (r: number) => {
    const next = rating === r ? 0 : r
    setRating(next)
    if (next) {
      try { localStorage.setItem(LS_RATING + storageKey, String(next)) } catch {}
      setThanked(true)
      setTimeout(() => setThanked(false), 1800)
    } else {
      try { localStorage.removeItem(LS_RATING + storageKey) } catch {}
    }
  }

  return (
    <div style={{
      marginTop: 8, padding: '9px 12px',
      background: 'var(--bg)', borderRadius: 8,
      border: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', gap: 10,
      flexWrap: 'wrap',
    }}>
      <span style={{ fontSize: 11.5, color: 'var(--text-3)', fontWeight: 600 }}>
        {isAr ? 'هل أفادك هذا الدليل؟' : 'Was this guide helpful?'}
      </span>
      <div style={{ display: 'flex', gap: 3 }}>
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => handleRate(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            aria-label={isAr ? `${star} نجوم` : `${star} star${star > 1 ? 's' : ''}`}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '1px 2px',
              fontSize: 18, lineHeight: 1,
              color: star <= (hover || rating) ? '#f59e0b' : 'var(--border)',
              transform: hover === star ? 'scale(1.2)' : 'scale(1)',
              transition: 'transform 0.1s, color 0.1s',
            }}
          >
            ★
          </button>
        ))}
      </div>
      {thanked && (
        <span style={{ fontSize: 11.5, color: '#f59e0b', fontWeight: 700, animation: 'fadeUp 0.2s ease' }}>
          {isAr ? '✓ شكراً على تقييمك!' : '✓ Thanks for your rating!'}
        </span>
      )}
    </div>
  )
}

function loadProgress(key: string): Set<number> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem(LS_PREFIX + key)
    return raw ? new Set<number>(JSON.parse(raw) as number[]) : new Set()
  } catch { return new Set() }
}

function saveProgress(key: string, done: Set<number>) {
  try { localStorage.setItem(LS_PREFIX + key, JSON.stringify(Array.from(done))) } catch { /* ignore */ }
}

export default function ProcedureTimeline({
  storageKey, stepsAr, stepsEn, titleAr, titleEn, onAsk,
}: Props) {
  const { isAr } = useLanguage()
  const steps = isAr ? stepsAr : (stepsEn?.length ? stepsEn : stepsAr)
  const total = steps.length

  const [done, setDone] = useState<Set<number>>(new Set())
  const [mounted, setMounted] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    setMounted(true)
    setDone(loadProgress(storageKey))
  }, [storageKey])

  const toggle = useCallback((i: number) => {
    setDone(prev => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      saveProgress(storageKey, next)
      return next
    })
  }, [storageKey])

  const reset = () => {
    setDone(new Set())
    try { localStorage.removeItem(LS_PREFIX + storageKey) } catch { /* ignore */ }
  }

  if (!mounted || total === 0) return null

  const doneCount = done.size
  const pct = Math.round((doneCount / total) * 100)
  const allDone = doneCount === total

  // Find the first uncompleted step
  const nextStep = steps.findIndex((_, i) => !done.has(i))

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        margin: '8px 0',
        borderRadius: 12,
        border: `1px solid ${allDone ? 'var(--success-border)' : 'var(--border)'}`,
        background: allDone ? 'var(--success-bg)' : 'var(--surface)',
        overflow: 'hidden',
        fontFamily: 'inherit',
      }}
    >
      {/* ── Header ── */}
      <button
        type="button"
        onClick={() => setCollapsed(c => !c)}
        style={{
          display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 12px', background: 'transparent', border: 'none',
          cursor: 'pointer', fontFamily: 'inherit', textAlign: isAr ? 'right' : 'left',
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 16 }}>{allDone ? '✅' : '🗺️'}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--text-1)' }}>
              {isAr ? 'خطوات الإنجاز' : 'Procedure Steps'}
              {titleAr || titleEn
                ? ` — ${isAr ? titleAr : titleEn}`
                : ''}
            </div>
            {/* Mini progress bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <div style={{ flex: 1, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${pct}%`,
                  background: allDone ? 'var(--success)' : 'var(--brand)',
                  borderRadius: 2,
                  transition: 'width 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                }} />
              </div>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: allDone ? 'var(--success)' : 'var(--text-3)', whiteSpace: 'nowrap' }}>
                {doneCount}/{total}
              </span>
            </div>
          </div>
        </div>
        <svg
          aria-hidden="true" width="13" height="13" viewBox="0 0 24 24"
          fill="none" stroke="var(--text-3)" strokeWidth="2"
          style={{ transform: collapsed ? 'none' : 'rotate(180deg)', transition: 'transform 0.2s', flexShrink: 0 }}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {/* ── Steps ── */}
      {!collapsed && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 0 }}>
          {steps.map((step, i) => {
            const isDone = done.has(i)
            const isNext = i === nextStep
            const isPast = isDone || (nextStep > 0 && i < nextStep)

            return (
              <div key={i} style={{ display: 'flex', gap: 10, position: 'relative' }}>
                {/* Connector line */}
                {i < total - 1 && (
                  <div style={{
                    position: 'absolute',
                    [isAr ? 'right' : 'left']: 15,
                    top: 32, bottom: 0,
                    width: 2,
                    background: isDone ? 'var(--success)' : 'var(--border)',
                    transition: 'background 0.25s',
                  }} />
                )}

                {/* Step number / check circle */}
                <button
                  type="button"
                  onClick={() => toggle(i)}
                  aria-label={isDone
                    ? (isAr ? `إلغاء الخطوة ${i + 1}` : `Unmark step ${i + 1}`)
                    : (isAr ? `إنجاز الخطوة ${i + 1}` : `Complete step ${i + 1}`)}
                  style={{
                    flexShrink: 0, zIndex: 1, position: 'relative',
                    width: 30, height: 30, borderRadius: '50%',
                    border: `2px solid ${isDone ? 'var(--success)' : isNext ? 'var(--brand)' : 'var(--border)'}`,
                    background: isDone ? 'var(--success)' : 'var(--bg)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', fontFamily: 'inherit',
                    transition: 'border-color 0.2s, background 0.2s',
                    boxShadow: isNext && !isDone ? '0 0 0 3px rgba(143,29,44,0.12)' : 'none',
                  }}
                >
                  {isDone ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>
                  ) : (
                    <span style={{
                      fontSize: 11, fontWeight: 800,
                      color: isNext ? 'var(--brand)' : 'var(--text-3)',
                    }}>
                      {i + 1}
                    </span>
                  )}
                </button>

                {/* Step text */}
                <div style={{
                  flex: 1, paddingBottom: i < total - 1 ? 16 : 0,
                  paddingTop: 4,
                  opacity: isDone ? 0.55 : 1,
                  transition: 'opacity 0.2s',
                }}>
                  <div style={{
                    fontSize: 12.5, fontWeight: isDone ? 400 : isNext ? 700 : 500,
                    color: isDone ? 'var(--success-fg)' : isNext ? 'var(--text-1)' : 'var(--text-2)',
                    lineHeight: 1.55,
                    textDecoration: isDone ? 'line-through' : 'none',
                    textDecorationColor: 'var(--success)',
                  }}>
                    {step}
                  </div>

                  {/* Next step CTA */}
                  {isNext && onAsk && !isDone && (
                    <button
                      type="button"
                      onClick={() => onAsk(isAr
                        ? `كيف أنجز الخطوة: «${step}» في معاملة ${titleAr || ''}؟`
                        : `How do I complete this step: "${step}" for procedure "${titleEn || ''}"?`)}
                      style={{
                        marginTop: 5, fontSize: 10.5, fontWeight: 700,
                        color: 'var(--brand)', background: 'rgba(143,29,44,0.05)',
                        border: '1px solid rgba(143,29,44,0.15)',
                        borderRadius: 6, padding: '3px 9px', cursor: 'pointer',
                        fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 4,
                      }}
                    >
                      <svg aria-hidden="true" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="9"/><path strokeLinecap="round" d="M12 8v4m0 4h.01"/>
                      </svg>
                      {isAr ? 'اسأل دليلك عن هذه الخطوة' : 'Ask Dalilak about this step'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}

          {/* All done banner */}
          {allDone && (
            <>
              <div style={{
                marginTop: 10, padding: '10px 12px',
                background: 'var(--success-bg)', borderRadius: 8,
                border: '1px solid var(--success-border)',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{ fontSize: 20 }}>🎉</span>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--success-fg)' }}>
                    {isAr ? 'أكملت جميع الخطوات!' : 'All steps complete!'}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--success-fg)', opacity: 0.75 }}>
                    {isAr ? 'تهانينا — معاملتك جاهزة.' : 'Congratulations — your procedure is done.'}
                  </div>
                </div>
              </div>
              {/* Rating widget appears after completion */}
              <RatingWidget storageKey={storageKey} isAr={isAr} />
            </>
          )}

          {/* Reset link */}
          {doneCount > 0 && (
            <button
              type="button"
              onClick={reset}
              style={{
                marginTop: 8, alignSelf: 'center',
                fontSize: 10.5, color: 'var(--text-4)', background: 'none',
                border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                textDecoration: 'underline',
              }}
            >
              {isAr ? 'إعادة ضبط التقدم' : 'Reset progress'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
