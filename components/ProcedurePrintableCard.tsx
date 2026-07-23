'use client'

/**
 * ProcedurePrintableCard — opens a print-ready window with procedure summary.
 *
 * Renders a print-styled HTML page in a new browser window with:
 * - Procedure title, ministry, icon
 * - Steps as numbered list
 * - Required documents
 * - Fees & processing time
 * - Footer: "طُبع من دليلك | dalilak.app"
 *
 * No external dependencies; pure string HTML injection via window.open.
 *
 * Props: { proc: EnrichedProcedure; isAr: boolean }
 */

import React from 'react'
import { type EnrichedProcedure } from '@/lib/enrichedProcedures'

interface Props {
  proc: EnrichedProcedure
  isAr: boolean
}

function buildHtml(proc: EnrichedProcedure, isAr: boolean): string {
  const title   = isAr ? proc.title    : (proc.title_en    || proc.title)
  const ministry= isAr ? proc.ministry : (proc.ministry_en || proc.ministry)
  const desc    = isAr ? proc.description : (proc.description_en || proc.description)
  const steps   = isAr ? proc.steps    : (proc.steps_en?.length    ? proc.steps_en    : proc.steps)
  const docs    = isAr ? proc.requiredDocuments : (proc.requiredDocuments_en?.length ? proc.requiredDocuments_en : proc.requiredDocuments)
  const fees    = isAr ? proc.fees     : (proc.fees_en     || proc.fees)
  const time    = isAr ? proc.processingTime : (proc.processingTime_en || proc.processingTime)
  const dir     = isAr ? 'rtl' : 'ltr'

  const stepRows = steps.map((s, i) => `<li>${i+1}. ${s}</li>`).join('')
  const docRows  = docs.map(d => `<li>☐ ${d}</li>`).join('')

  return `<!DOCTYPE html>
<html dir="${dir}" lang="${isAr ? 'ar' : 'en'}">
<head>
  <meta charset="UTF-8"/>
  <title>${title} — دليلك</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0 }
    body { font-family: 'IBM Plex Sans Arabic', Arial, sans-serif; color: #1a1a1a; padding: 32px 40px; line-height: 1.6; font-size: 13px; }
    h1 { font-size: 20px; font-weight: 800; color: #8F1D2C; margin-bottom: 4px }
    .ministry { font-size: 12px; color: #6B5A4A; font-weight: 600; margin-bottom: 12px }
    .desc { font-size: 12px; color: #444; margin-bottom: 18px; background: #FFF9F5; border-${isAr ? 'right' : 'left'}: 3px solid #8F1D2C; padding: 8px 12px; border-radius: 4px }
    h2 { font-size: 13px; font-weight: 800; color: #191713; margin-bottom: 8px; margin-top: 18px; padding-bottom: 4px; border-bottom: 1px solid #E6E2DC }
    ol, ul { padding-${isAr ? 'right' : 'left'}: 18px }
    li { margin-bottom: 5px; font-size: 12px }
    .info-row { display: flex; gap: 24px; margin-top: 18px; padding: 10px 14px; background: #FFF9F5; border-radius: 8px; border: 1px solid #F0EAE2 }
    .info-item { flex: 1 }
    .info-label { font-size: 10px; font-weight: 700; color: #8F1D2C; text-transform: uppercase; margin-bottom: 2px }
    .info-value { font-size: 12px; color: #444 }
    .footer { margin-top: 28px; padding-top: 12px; border-top: 1px solid #E6E2DC; font-size: 10px; color: #999; display: flex; justify-content: space-between }
    @media print { body { padding: 20px } }
  </style>
</head>
<body>
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:4px">
    <span style="font-size:30px">${proc.icon || '📋'}</span>
    <h1>${title}</h1>
  </div>
  <div class="ministry">🏛 ${ministry}</div>
  ${desc ? `<div class="desc">${desc}</div>` : ''}
  ${steps.length > 0 ? `<h2>${isAr ? 'خطوات الإجراء' : 'Steps'}</h2><ol>${stepRows}</ol>` : ''}
  ${docs.length > 0 ? `<h2>${isAr ? 'الوثائق المطلوبة' : 'Required Documents'}</h2><ul>${docRows}</ul>` : ''}
  ${(fees || time) ? `
  <div class="info-row">
    ${fees ? `<div class="info-item"><div class="info-label">${isAr ? 'الرسوم' : 'Fees'}</div><div class="info-value">${fees}</div></div>` : ''}
    ${time ? `<div class="info-item"><div class="info-label">${isAr ? 'مدة المعالجة' : 'Processing Time'}</div><div class="info-value">${time}</div></div>` : ''}
  </div>` : ''}
  <div class="footer">
    <span>طُبع من دليلك | dalilak.app</span>
    <span>${new Date().toLocaleDateString(isAr ? 'ar-LB' : 'en-LB', { timeZone: 'Asia/Beirut', year: 'numeric', month: 'long', day: 'numeric' })}</span>
  </div>
</body>
</html>`
}

export default function ProcedurePrintableCard({ proc, isAr }: Props) {
  function handlePrint() {
    const html = buildHtml(proc, isAr)
    const win = window.open('', '_blank', 'width=800,height=700,scrollbars=yes')
    if (!win) return
    win.document.open()
    win.document.write(html)
    win.document.close()
    // Delay print so fonts can load
    win.setTimeout(() => { win.focus(); win.print() }, 600)
  }

  return (
    <button
      type="button"
      onClick={handlePrint}
      title={isAr ? 'طباعة بطاقة المعاملة' : 'Print procedure card'}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '5px 10px', borderRadius: 8,
        background: '#F5F3EE', border: '1px solid #D1CBC4',
        cursor: 'pointer', fontFamily: 'inherit',
        fontSize: 10, fontWeight: 700, color: '#6B5A4A',
        transition: 'background 0.12s',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = '#EDE9E0')}
      onMouseLeave={e => (e.currentTarget.style.background = '#F5F3EE')}
    >
      <svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="6 9 6 2 18 2 18 9"/>
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
        <rect x="6" y="14" width="12" height="8"/>
      </svg>
      {isAr ? 'طباعة' : 'Print'}
    </button>
  )
}
