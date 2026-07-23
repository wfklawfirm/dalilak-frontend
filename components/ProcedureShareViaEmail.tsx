'use client'

/**
 * ProcedureShareViaEmail — opens a mailto: link pre-filled with
 * full procedure details: title, ministry, steps summary, fees, timeline.
 *
 * Props:
 *   proc — EnrichedProcedure object
 *   isAr — current language direction
 *
 * Renders as a small "✉ مشاركة بالبريد" icon-button.
 * No external dependencies — pure mailto: URI.
 */

import React from 'react'
import type { EnrichedProcedure } from '@/lib/enrichedProcedures'

interface Props {
  proc: EnrichedProcedure
  isAr: boolean
}

function buildMailto(proc: EnrichedProcedure, isAr: boolean): string {
  const title    = isAr ? proc.title    : (proc.title_en    || proc.title)
  const ministry = isAr ? proc.ministry : (proc.ministry_en || proc.ministry)
  const fee      = isAr ? proc.fees     : (proc.fees_en     || proc.fees)
  const time     = isAr ? proc.processingTime : (proc.processingTime_en || proc.processingTime)

  const steps = proc.steps.map((s, i) => `${i + 1}. ${s}`)

  const docs = isAr
    ? proc.requiredDocuments.map(d => `• ${d}`)
    : (proc.requiredDocuments_en ?? proc.requiredDocuments).map(d => `• ${d}`)

  if (isAr) {
    const subject = encodeURIComponent(`دليلك — معلومات عن: ${title}`)
    const body = encodeURIComponent(
`مرحباً،

أشاركك معلومات عن معاملة "${title}" من تطبيق دليلك.

━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 المعاملة: ${title}
🏛️ الجهة: ${ministry}
⏱️ المدة: ${time || 'غير محددة'}
💰 الرسوم: ${fee || 'غير محددة'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 الخطوات:
${steps.join('\n')}

📄 الوثائق المطلوبة:
${docs.join('\n')}

---
دليلك — مساعدك للمعاملات الحكومية اللبنانية
https://dalilak-frontend.vercel.app
`
    )
    return `mailto:?subject=${subject}&body=${body}`
  } else {
    const subject = encodeURIComponent(`Dalilak — Procedure info: ${title}`)
    const body = encodeURIComponent(
`Hello,

I'm sharing information about the procedure "${title}" from the Dalilak app.

━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Procedure: ${title}
🏛️  Ministry: ${ministry}
⏱️  Timeline: ${time || 'Not specified'}
💰 Fees: ${fee || 'Not specified'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 Steps:
${steps.join('\n')}

📄 Required Documents:
${docs.join('\n')}

---
Dalilak — Your Lebanese Government Services Guide
https://dalilak-frontend.vercel.app
`
    )
    return `mailto:?subject=${subject}&body=${body}`
  }
}

export default function ProcedureShareViaEmail({ proc, isAr }: Props) {
  const href = buildMailto(proc, isAr)

  return (
    <a
      href={href}
      title={isAr ? 'مشاركة عبر البريد الإلكتروني' : 'Share via Email'}
      aria-label={isAr ? 'مشاركة عبر البريد الإلكتروني' : 'Share via Email'}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '5px 11px', borderRadius: 20,
        background: '#F0F9FF', border: '1.5px solid #BAE6FD',
        color: '#0369A1', fontSize: 10.5, fontWeight: 700,
        textDecoration: 'none', fontFamily: 'inherit',
        transition: 'all 0.12s',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = '#E0F2FE'
        e.currentTarget.style.borderColor = '#7DD3FC'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = '#F0F9FF'
        e.currentTarget.style.borderColor = '#BAE6FD'
      }}
    >
      <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
      {isAr ? 'مشاركة بالبريد' : 'Share via Email'}
    </a>
  )
}
