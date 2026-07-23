'use client'

/**
 * HomepageCompletionCTA — "أكمل معاملاتك" CTA strip.
 *
 * Shows started-but-not-completed procedures as a compact action list.
 * Reads: dalilak_started_{code} — set when user starts
 *         dalilak_completed_{code} — set when user completes
 * Shows procedures where started=true and completed=false.
 *
 * Dismissible per day: dalilak_completion_cta_dismissed_{YYYY-MM-DD}
 * Collapses by default after first render.
 *
 * Listens to dalilak_saved_change for live updates.
 */

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/lib/LanguageContext'
import { ENRICHED_PROCEDURES } from '@/lib/enrichedProcedures'

function getTodayLb(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Beirut' })
}

interface InProgressProc {
  code: string
  title: string
  title_en?: string
  icon: string
}

function loadInProgress(): InProgressProc[] {
  const result: InProgressProc[] = []
  try {
    for (const proc of ENRICHED_PROCEDURES) {
      const started   = localStorage.getItem(`dalilak_started_${proc.code}`)
      const completed = localStorage.getItem(`dalilak_completed_${proc.code}`)
      if (started === '1' && completed !== '1') {
        result.push({ code: proc.code, title: proc.title, title_en: proc.title_en, icon: proc.icon || '📋' })
      }
    }
  } catch {}
  return result
}

export default function HomepageCompletionCTA() {
  const { isAr } = useLanguage()
  const [procs, setProcs]         = useState<InProgressProc[]>([])
  const [dismissed, setDismissed] = useState(false)
  const [expanded, setExpanded]   = useState(false)
  const [mounted, setMounted]     = useState(false)

  const refresh = useCallback(() => setProcs(loadInProgress()), [])

  useEffect(() => {
    setMounted(true)
    const today = getTodayLb()
    try { if (localStorage.getItem(`dalilak_completion_cta_dismissed_${today}`)) setDismissed(true) } catch {}
    refresh()
    window.addEventListener('dalilak_saved_change', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('dalilak_saved_change', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [refresh])

  function dismiss() {
    setDismissed(true)
    try { localStorage.setItem(`dalilak_completion_cta_dismissed_${getTodayLb()}`, '1') } catch {}
  }

  if (!mounted || dismissed || procs.length === 0) return null

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        background: 'linear-gradient(135deg, #F5F3EE, #FEF5F5)',
        border: '1.5px solid rgba(143,29,44,0.15)', borderRadius: 12,
        overflow: 'hidden', marginBottom: 10,
        animation: 'fadeUp 0.2s ease both',
      }}
    >
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 9,
          padding: '10px 13px', background: 'none', border: 'none',
          cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        <span style={{ fontSize: 18, flexShrink: 0 }}>⏳</span>
        <div style={{ flex: 1, textAlign: isAr ? 'right' : 'left' }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#8F1D2C' }}>
            {isAr
              ? `${procs.length} ${procs.length === 1 ? 'معاملة' : 'معاملات'} لم تكتمل بعد`
              : `${procs.length} procedure${procs.length > 1 ? 's' : ''} in progress`}
          </div>
          <div style={{ fontSize: 10, color: '#B45309', marginTop: 1, fontWeight: 600 }}>
            {isAr ? 'أكمل معاملاتك' : 'Finish what you started'}
          </div>
        </div>
        <button
          type="button" onClick={e => { e.stopPropagation(); dismiss() }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#D1CBC4', fontSize: 11, flexShrink: 0, fontFamily: 'inherit' }}
        >
          {isAr ? 'إخفاء' : 'Hide'}
        </button>
        <svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none"
          stroke="#8F1D2C" strokeWidth="2.5"
          style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {expanded && (
        <div style={{
          borderTop: '1px solid rgba(143,29,44,0.12)',
          padding: '7px 12px 10px', display: 'flex', flexDirection: 'column', gap: 5,
        }}>
          {procs.map(p => (
            <Link
              key={p.code}
              href={`/procedures?q=${encodeURIComponent(p.title)}`}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '7px 10px', borderRadius: 9,
                background: 'rgba(143,29,44,0.05)',
                border: '1px solid rgba(143,29,44,0.12)',
                textDecoration: 'none',
                transition: 'background 0.12s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(143,29,44,0.09)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(143,29,44,0.05)')}
            >
              <span style={{ fontSize: 14, flexShrink: 0 }}>{p.icon}</span>
              <span style={{
                fontSize: 11, fontWeight: 700, color: '#191713', flex: 1,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {isAr ? p.title : (p.title_en || p.title)}
              </span>
              <span style={{ fontSize: 9, background: '#FDE68A', color: '#92400E', padding: '1px 6px', borderRadius: 10, fontWeight: 700, flexShrink: 0 }}>
                {isAr ? 'جارٍ' : 'Active'}
              </span>
              <svg aria-hidden="true" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#8F1D2C" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d={isAr ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'}/>
              </svg>
            </Link>
          ))}
          <Link
            href="/procedures"
            style={{ fontSize: 10, fontWeight: 700, color: '#8F1D2C', textAlign: 'center', marginTop: 2, textDecoration: 'underline' }}
          >
            {isAr ? 'عرض كل المعاملات ←' : 'View all procedures →'}
          </Link>
        </div>
      )}
    </div>
  )
}
