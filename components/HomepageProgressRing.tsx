'use client'

/**
 * HomepageProgressRing — compact SVG ring showing completed vs started procedures.
 *
 * Reads:
 *   dalilak_started_{code}   — procedure has been started
 *   dalilak_completed_{code} — procedure has been completed
 *
 * Ring fill = completed / started (or completed / total if no started yet)
 * Listens to dalilak_saved_change + storage events for live updates.
 *
 * Collapsed by default — a small ring chip.
 * Expands to show: X إجراء أُنجز / Y بدأت
 */

import React, { useState, useEffect, useCallback } from 'react'
import { useLanguage } from '@/lib/LanguageContext'
import { ENRICHED_PROCEDURES } from '@/lib/enrichedProcedures'

const TOTAL = ENRICHED_PROCEDURES.length
const RADIUS = 20
const CIRC   = 2 * Math.PI * RADIUS

function readProgress(): { started: number; completed: number; codes: string[] } {
  try {
    const codes = ENRICHED_PROCEDURES.map(p => p.code)
    let started   = 0
    let completed = 0
    for (const code of codes) {
      if (localStorage.getItem(`dalilak_started_${code}`))   started++
      if (localStorage.getItem(`dalilak_completed_${code}`)) completed++
    }
    return { started, completed, codes }
  } catch {
    return { started: 0, completed: 0, codes: [] }
  }
}

export default function HomepageProgressRing() {
  const { isAr } = useLanguage()
  const [mounted, setMounted] = useState(false)
  const [progress, setProgress] = useState({ started: 0, completed: 0 })
  const [expanded, setExpanded] = useState(false)

  const refresh = useCallback(() => {
    const p = readProgress()
    setProgress(p)
  }, [])

  useEffect(() => {
    setMounted(true)
    refresh()
    window.addEventListener('dalilak_saved_change', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('dalilak_saved_change', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [refresh])

  if (!mounted || (progress.started === 0 && progress.completed === 0)) return null

  const denominator = progress.started || 1
  const ratio       = Math.min(progress.completed / denominator, 1)
  const dash        = ratio * CIRC
  const gap         = CIRC - dash

  // Color by completion ratio
  const ringColor = ratio >= 1
    ? '#10B981'   // all done — green
    : ratio >= 0.5
      ? '#F59E0B' // halfway — amber
      : '#8F1D2C' // early — brand red

  const pct = progress.started > 0 ? Math.round(ratio * 100) : 0

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 10,
        padding: expanded ? '10px 14px' : '6px 10px',
        background: '#FAFAF8', border: '1.5px solid #E6E2DC',
        borderRadius: 16, cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: expanded ? '0 2px 12px rgba(0,0,0,0.06)' : 'none',
      }}
      onClick={() => setExpanded(v => !v)}
      role="button"
      aria-label={isAr ? 'تقدّم المعاملات' : 'Procedure progress'}
    >
      {/* SVG Ring */}
      <svg
        width={expanded ? 52 : 38}
        height={expanded ? 52 : 38}
        viewBox="0 0 50 50"
        style={{ flexShrink: 0, transition: 'all 0.2s' }}
      >
        {/* Track */}
        <circle
          cx="25" cy="25" r={RADIUS}
          fill="none"
          stroke="#E6E2DC"
          strokeWidth="5"
        />
        {/* Progress arc */}
        <circle
          cx="25" cy="25" r={RADIUS}
          fill="none"
          stroke={ringColor}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${gap}`}
          strokeDashoffset={CIRC * 0.25} /* start from top */
          style={{ transition: 'stroke-dasharray 0.5s ease, stroke 0.3s' }}
        />
        {/* Center label */}
        <text
          x="25" y="29"
          textAnchor="middle"
          fontSize={expanded ? '11' : '9'}
          fontWeight="800"
          fill={ringColor}
          fontFamily="Cairo, sans-serif"
          style={{ transition: 'font-size 0.2s' }}
        >
          {pct}%
        </text>
      </svg>

      {/* Labels */}
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: expanded ? 12 : 10.5, fontWeight: 800, color: '#191713', whiteSpace: 'nowrap' }}>
          {isAr ? 'تقدّم المعاملات' : 'Procedure Progress'}
        </div>

        {expanded ? (
          <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Completed */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', flexShrink: 0 }} />
              <span style={{ fontSize: 10.5, color: '#374151', fontWeight: 600 }}>
                {isAr
                  ? `${progress.completed} ${progress.completed === 1 ? 'إجراء أُنجز' : 'إجراء أُنجز'}`
                  : `${progress.completed} completed`}
              </span>
            </div>
            {/* Started */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B', flexShrink: 0 }} />
              <span style={{ fontSize: 10.5, color: '#374151', fontWeight: 600 }}>
                {isAr
                  ? `${progress.started} ${progress.started === 1 ? 'إجراء بدأت' : 'إجراء بدأت'}`
                  : `${progress.started} started`}
              </span>
            </div>
            {/* Total */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#E6E2DC', flexShrink: 0 }} />
              <span style={{ fontSize: 10.5, color: '#918B82', fontWeight: 500 }}>
                {isAr ? `من أصل ${TOTAL} إجراء` : `out of ${TOTAL} procedures`}
              </span>
            </div>

            {/* Progress bar */}
            <div style={{ marginTop: 4, height: 4, borderRadius: 2, background: '#E6E2DC', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 2, background: ringColor,
                width: `${pct}%`, transition: 'width 0.5s ease',
              }} />
            </div>

            {/* CTA */}
            <a
              href="/procedures"
              onClick={e => e.stopPropagation()}
              style={{
                marginTop: 6, fontSize: 10, fontWeight: 700,
                color: '#8F1D2C', textDecoration: 'none',
                display: 'inline-flex', alignItems: 'center', gap: 3,
              }}
            >
              {isAr ? 'عرض كل المعاملات ←' : 'View all procedures →'}
            </a>
          </div>
        ) : (
          <div style={{ fontSize: 10, color: '#918B82', whiteSpace: 'nowrap', marginTop: 1 }}>
            {isAr
              ? `${progress.completed}/${progress.started} ${progress.started === 1 ? 'معاملة' : 'معاملات'}`
              : `${progress.completed}/${progress.started} done`}
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <svg
        aria-hidden="true"
        width="11" height="11"
        viewBox="0 0 24 24" fill="none" stroke="#918B82" strokeWidth="2.5"
        style={{ flexShrink: 0, transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
      >
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    </div>
  )
}
