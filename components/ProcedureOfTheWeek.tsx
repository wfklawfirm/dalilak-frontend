'use client'

/**
 * ProcedureOfTheWeek — featured procedure card on the homepage.
 *
 * Rotates through ENRICHED_PROCEDURES weekly: picks index = (weekNumber % total).
 * Shows: icon, title (AR/EN), ministry, fee, processing time, and two CTAs:
 *   - "اسأل دليلك عنها" → fires onAsk with a prepared question
 *   - "عرض التفاصيل" → navigates to /procedures
 */

import React, { useState, useEffect } from 'react'
import { useLanguage } from '@/lib/LanguageContext'
import { ENRICHED_PROCEDURES } from '@/lib/enrichedProcedures'

function getWeekNumber(): number {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1)
  return Math.floor((now.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000))
}

interface Props {
  onAsk: (q: string) => void
}

export default function ProcedureOfTheWeek({ onAsk }: Props) {
  const { isAr } = useLanguage()
  const [mounted, setMounted] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    setMounted(true)
    const week = getWeekNumber()
    try {
      const key = `dalilak_potw_dismissed_w${week}`
      if (localStorage.getItem(key)) setDismissed(true)
    } catch {}
  }, [])

  if (!mounted || dismissed) return null

  const week = getWeekNumber()
  const proc = ENRICHED_PROCEDURES[week % ENRICHED_PROCEDURES.length]
  if (!proc) return null

  const title    = isAr ? proc.title    : (proc.title_en    || proc.title)
  const ministry = isAr ? proc.ministry : (proc.ministry_en || proc.ministry)
  const fee      = isAr ? proc.fees     : (proc.fees_en     || proc.fees)
  const time     = isAr ? proc.processingTime : (proc.processingTime_en || proc.processingTime)

  const isFree = fee && (fee.includes('مجان') || fee.toLowerCase().includes('free') || fee === '0')

  const handleDismiss = () => {
    setDismissed(true)
    try {
      localStorage.setItem(`dalilak_potw_dismissed_w${week}`, '1')
    } catch {}
  }

  const handleAsk = () => {
    onAsk(isAr
      ? `أخبرني بكل التفاصيل عن معاملة "${proc.title}" — خطواتها والوثائق المطلوبة والرسوم ومدة الإنجاز.`
      : `Tell me everything about the "${proc.title_en || proc.title}" procedure — steps, required documents, fees, and timeline.`
    )
  }

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        background: 'linear-gradient(135deg, #FFF8F8 0%, #FEF5F0 100%)',
        border: '1.5px solid rgba(143,29,44,0.15)',
        borderRadius: 14, padding: '13px 14px', marginBottom: 10,
        position: 'relative', overflow: 'hidden',
        animation: 'fadeUp 0.25s ease both',
      }}
    >
      {/* Decorative arc */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: -30, right: isAr ? -30 : 'auto', left: isAr ? 'auto' : -30,
        width: 100, height: 100, borderRadius: '50%',
        background: 'rgba(143,29,44,0.04)', pointerEvents: 'none',
      }} />

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9 }}>
        {/* Week badge */}
        <span style={{
          fontSize: 9, fontWeight: 800, color: '#8F1D2C',
          background: 'rgba(143,29,44,0.08)', padding: '2px 7px', borderRadius: 8,
          textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0,
        }}>
          {isAr ? '✨ إجراء الأسبوع' : '✨ Procedure of the Week'}
        </span>
        <div style={{ flex: 1 }} />
        <button
          type="button"
          onClick={handleDismiss}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#918B82', fontSize: 14, padding: 0 }}
          title={isAr ? 'إغلاق' : 'Dismiss'}
        >✕</button>
      </div>

      {/* Body */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        {/* Icon */}
        <div style={{
          width: 44, height: 44, borderRadius: 11,
          background: '#F8EDEF', border: '1.5px solid rgba(143,29,44,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, flexShrink: 0,
        }}>
          {proc.icon || '📄'}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Title */}
          <div style={{ fontSize: 13, fontWeight: 800, color: '#191713', lineHeight: 1.35, marginBottom: 2 }}>
            {title}
          </div>
          {/* Ministry */}
          <div style={{ fontSize: 10.5, color: '#8F1D2C', fontWeight: 600, marginBottom: 5 }}>
            🏛️ {ministry}
          </div>
          {/* Meta pills */}
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {fee && (
              <span style={{
                fontSize: 9.5, padding: '2px 8px', borderRadius: 8, fontWeight: 700,
                background: isFree ? '#D1FAE5' : '#FEF3C7',
                color: isFree ? '#065F46' : '#92400E',
                border: `1px solid ${isFree ? '#A7F3D0' : '#FDE68A'}`,
              }}>
                💰 {isFree ? (isAr ? 'مجاني' : 'Free') : (fee.length > 16 ? fee.slice(0, 16) + '…' : fee)}
              </span>
            )}
            {time && (
              <span style={{
                fontSize: 9.5, padding: '2px 8px', borderRadius: 8, fontWeight: 600,
                background: '#F0F9FF', color: '#0369A1', border: '1px solid #BAE6FD',
              }}>
                ⏱️ {time.length > 18 ? time.slice(0, 18) + '…' : time}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div style={{ display: 'flex', gap: 7, marginTop: 11, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={handleAsk}
          style={{
            flex: 1, minWidth: 110, padding: '8px 14px', borderRadius: 10,
            background: 'linear-gradient(135deg, #8F1D2C, #741622)',
            border: 'none', color: '#fff', fontSize: 11.5, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
          }}
        >
          <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
          {isAr ? 'اسأل دليلك عنها' : 'Ask Dalilak'}
        </button>
        <a
          href={`/procedures#proc-${proc.code}`}
          style={{
            padding: '8px 14px', borderRadius: 10,
            background: '#fff', border: '1.5px solid #E6E2DC',
            color: '#2D1B0E', fontSize: 11.5, fontWeight: 700,
            textDecoration: 'none', fontFamily: 'inherit',
            display: 'inline-flex', alignItems: 'center', gap: 5,
          }}
        >
          {isAr ? 'عرض التفاصيل' : 'View details'}
          <svg aria-hidden="true" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6"/></svg>
        </a>
      </div>
    </div>
  )
}
