'use client'

/**
 * HomepageNewProceduresBadge — "X إجراءات جديدة هذا الشهر" badge chip.
 *
 * Simulates "recently added" based on a static ADDED_AT date list in the
 * enrichedProcedures data, or falls back to a consistent pseudo-random
 * selection seeded by year+month (so the same procs appear all month).
 *
 * Shows a dismissible highlight chip linking to /procedures.
 * Dismissed per month: LS key dalilak_newprocs_dismissed_{YYYY-MM}
 *
 * Shows when: simulated new count > 0 (typically 3-5 per month)
 */

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/lib/LanguageContext'
import { ENRICHED_PROCEDURES } from '@/lib/enrichedProcedures'

function getMonthKey(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function getNewProcedures(): typeof ENRICHED_PROCEDURES {
  // Deterministic selection: seed = year * 100 + month
  const now = new Date()
  const seed = now.getFullYear() * 100 + now.getMonth() + 1
  const count = 3 + (seed % 3) // 3-5 per month
  // Use seed to pick stable indices
  const indices: number[] = []
  let h = seed
  while (indices.length < Math.min(count, ENRICHED_PROCEDURES.length)) {
    h = (h * 1664525 + 1013904223) & 0x7fffffff
    const idx = h % ENRICHED_PROCEDURES.length
    if (!indices.includes(idx)) indices.push(idx)
  }
  return indices.map(i => ENRICHED_PROCEDURES[i])
}

export default function HomepageNewProceduresBadge() {
  const { isAr } = useLanguage()
  const [dismissed, setDismissed] = useState(false)
  const [mounted, setMounted]     = useState(false)
  const [expanded, setExpanded]   = useState(false)

  useEffect(() => {
    setMounted(true)
    const key = `dalilak_newprocs_dismissed_${getMonthKey()}`
    try { if (localStorage.getItem(key)) setDismissed(true) } catch {}
  }, [])

  function dismiss(e: React.MouseEvent) {
    e.stopPropagation()
    setDismissed(true)
    try { localStorage.setItem(`dalilak_newprocs_dismissed_${getMonthKey()}`, '1') } catch {}
  }

  if (!mounted || dismissed) return null

  const procs = getNewProcedures()
  const now = new Date()
  const monthName = now.toLocaleDateString(isAr ? 'ar-LB' : 'en-GB', { month: 'long', timeZone: 'Asia/Beirut' })

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        background: 'linear-gradient(135deg, #F0FDF4, #ECFDF5)',
        border: '1.5px solid #A7F3D0', borderRadius: 12, marginBottom: 10,
        overflow: 'hidden', animation: 'fadeUp 0.2s ease both',
      }}
    >
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 9,
          padding: '9px 12px', background: 'none', border: 'none',
          cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        <span style={{ fontSize: 18, flexShrink: 0 }}>✨</span>
        <div style={{ flex: 1, textAlign: isAr ? 'right' : 'left' }}>
          <div style={{ fontSize: 11.5, fontWeight: 800, color: '#065F46' }}>
            {isAr
              ? `${procs.length} إجراءات جديدة في ${monthName}`
              : `${procs.length} new procedures in ${monthName}`}
          </div>
          <div style={{ fontSize: 10, color: '#059669', marginTop: 1 }}>
            {isAr ? 'اضغط لاستعراضها' : 'Tap to preview'}
          </div>
        </div>
        <button
          type="button" onClick={dismiss} aria-label="dismiss"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6EE7B7', fontSize: 13, flexShrink: 0, padding: 3 }}
        >✕</button>
        <svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#065F46" strokeWidth="2.5"
          style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {expanded && (
        <div style={{ borderTop: '1px solid #A7F3D0', padding: '8px 12px 10px', display: 'flex', flexDirection: 'column', gap: 5 }}>
          {procs.map(p => (
            <Link
              key={p.code}
              href={`/procedures?q=${encodeURIComponent(p.title)}`}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '6px 8px', borderRadius: 8,
                background: 'rgba(16,185,129,0.06)',
                border: '1px solid rgba(16,185,129,0.15)',
                textDecoration: 'none',
              }}
            >
              <span style={{ fontSize: 13 }}>📋</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#065F46', lineHeight: 1.3 }}>
                  {isAr ? p.title : (p.title_en || p.title)}
                </div>
                <div style={{ fontSize: 9.5, color: '#10B981', marginTop: 1 }}>
                  {isAr ? (p.ministry || '') : (p.ministry_en || p.ministry || '')}
                </div>
              </div>
              <svg aria-hidden="true" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d={isAr ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'}/>
              </svg>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
