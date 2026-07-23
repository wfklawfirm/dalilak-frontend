'use client'

/**
 * HomepageProcedureOfTheDay — daily featured procedure card.
 *
 * Picks a procedure deterministically based on day-of-year index into ENRICHED_PROCEDURES.
 * Shows icon, title, ministry, processing time, and a quick-link to /procedures?q=.
 * Refreshes each calendar day (Lebanon timezone).
 *
 * Different from ProcedureOfTheWeek (weekly rotation, chat-ask focused);
 * this one is a compact visual card with direct deep-link.
 *
 * Hidden until mounted (SSR-safe).
 */

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/lib/LanguageContext'
import { ENRICHED_PROCEDURES } from '@/lib/enrichedProcedures'

function getDayIndex(): number {
  const d = new Date()
  const jan1 = new Date(d.getFullYear(), 0, 0)
  const diff = d.getTime() - jan1.getTime()
  const oneDay = 1000 * 60 * 60 * 24
  return Math.floor(diff / oneDay)
}

export default function HomepageProcedureOfTheDay() {
  const { isAr } = useLanguage()
  const [mounted, setMounted] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Beirut' })
      if (localStorage.getItem('dalilak_potd_dismissed') === today) setDismissed(true)
    } catch {}
  }, [])

  function dismiss() {
    setDismissed(true)
    try {
      const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Beirut' })
      localStorage.setItem('dalilak_potd_dismissed', today)
    } catch {}
  }

  if (!mounted || dismissed || ENRICHED_PROCEDURES.length === 0) return null

  const idx = getDayIndex() % ENRICHED_PROCEDURES.length
  const proc = ENRICHED_PROCEDURES[idx]
  const title = isAr ? proc.title : (proc.title_en || proc.title)
  const ministry = isAr ? proc.ministry : (proc.ministry_en || proc.ministry)
  const time = isAr ? proc.processingTime : (proc.processingTime_en || proc.processingTime)

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        background: 'linear-gradient(135deg, #FFF9F5 0%, #FFF0F0 100%)',
        border: '1.5px solid rgba(143,29,44,0.18)',
        borderRadius: 12, padding: '10px 13px',
        marginBottom: 10, position: 'relative',
        animation: 'fadeUp 0.25s ease both',
      }}
    >
      {/* Dismiss */}
      <button
        type="button" onClick={dismiss}
        aria-label={isAr ? 'إغلاق' : 'Dismiss'}
        style={{ position: 'absolute', top: 7, [isAr ? 'left' : 'right']: 9, background: 'none', border: 'none', cursor: 'pointer', color: '#D1CBC4', fontSize: 13, lineHeight: 1 }}
      >✕</button>

      {/* Label */}
      <div style={{ fontSize: 9, fontWeight: 800, color: '#8F1D2C', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
        <span>✨</span>
        {isAr ? 'معاملة اليوم' : "Today's Procedure"}
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <span style={{ fontSize: 26, flexShrink: 0, lineHeight: 1 }}>{proc.icon || '📋'}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 800, color: '#191713', lineHeight: 1.3, marginBottom: 3 }}>{title}</div>
          <div style={{ fontSize: 10, color: '#6B5A4A', fontWeight: 600, marginBottom: 2 }}>🏛 {ministry}</div>
          {time && <div style={{ fontSize: 9.5, color: '#918B82' }}>⏱ {time}</div>}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, marginTop: 9 }}>
        <Link
          href={`/procedures?q=${encodeURIComponent(proc.title)}`}
          style={{
            flex: 1, textAlign: 'center', padding: '6px 12px',
            background: '#8F1D2C', color: '#fff', borderRadius: 8,
            textDecoration: 'none', fontSize: 10.5, fontWeight: 700,
          }}
        >
          {isAr ? 'عرض المعاملة ←' : 'View Procedure →'}
        </Link>
        <Link
          href="/procedures"
          style={{
            padding: '6px 10px', background: '#F5F3EE', color: '#6B5A4A',
            borderRadius: 8, textDecoration: 'none', fontSize: 10, fontWeight: 600,
            border: '1px solid #E6E2DC',
          }}
        >
          {isAr ? 'كل المعاملات' : 'All'}
        </Link>
      </div>
    </div>
  )
}
