'use client'

/**
 * ProcedurePrintSummary — print-optimized one-page procedure summary.
 *
 * Opens a new window with a clean, print-ready HTML page summarizing:
 *   - Title + ministry
 *   - Required documents
 *   - Steps
 *   - Fees
 *   - Processing time
 *   - Source: دليلك / Dalilak
 *
 * Uses window.open + document.write — no CSS framework needed.
 * The printed page uses @media print optimizations.
 *
 * Shows as a "طباعة ملخّص" chip button.
 * Props match EnrichedProcedure fields.
 */

import React from 'react'

interface Props {
  code: string
  title: string
  title_en?: string
  ministry?: string
  ministry_en?: string
  steps: string[]
  steps_en?: string[]
  requiredDocuments: string[]
  requiredDocuments_en?: string[]
  fees?: string
  fees_en?: string
  processingTime?: string
  processingTime_en?: string
  isAr: boolean
}

export default function ProcedurePrintSummary({
  title, title_en, ministry, ministry_en,
  steps, steps_en, requiredDocuments, requiredDocuments_en,
  fees, fees_en, processingTime, processingTime_en, isAr,
}: Props) {

  function handlePrint() {
    const displayTitle    = isAr ? title : (title_en || title)
    const displayMinistry = isAr ? (ministry || '') : (ministry_en || ministry || '')
    const displaySteps    = isAr ? steps : (steps_en || steps)
    const displayDocs     = isAr ? requiredDocuments : (requiredDocuments_en || requiredDocuments)
    const displayFees     = isAr ? fees : (fees_en || fees)
    const displayTime     = isAr ? processingTime : (processingTime_en || processingTime)
    const dir             = isAr ? 'rtl' : 'ltr'
    const lang            = isAr ? 'ar' : 'en'
    const today           = new Date().toLocaleDateString(isAr ? 'ar-LB' : 'en-GB', {
      day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Beirut',
    })

    const html = `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
<meta charset="UTF-8">
<title>${displayTitle} — دليلك</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;600;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'IBM Plex Sans Arabic',system-ui,sans-serif;color:#191713;padding:32px 40px;line-height:1.6;direction:${dir}}
  .header{border-bottom:3px solid #8F1D2C;padding-bottom:14px;margin-bottom:22px}
  .brand{font-size:11px;font-weight:800;color:#8F1D2C;letter-spacing:0.05em;text-transform:uppercase;margin-bottom:6px}
  h1{font-size:22px;font-weight:900;color:#191713;line-height:1.2;margin-bottom:4px}
  .ministry{font-size:13px;color:#918B82}
  .meta{display:flex;gap:20px;flex-wrap:wrap;margin-bottom:22px}
  .meta-item{background:#F5F3F0;border-radius:8px;padding:8px 12px}
  .meta-item .label{font-size:9px;font-weight:800;color:#918B82;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:2px}
  .meta-item .value{font-size:12px;font-weight:700;color:#191713}
  section{margin-bottom:20px}
  h2{font-size:13px;font-weight:800;color:#8F1D2C;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:10px;padding-bottom:4px;border-bottom:1px solid #F0EDE8}
  ul{padding-inline-start:18px}
  li{font-size:12px;margin-bottom:5px;color:#3D3830}
  ol li{padding-inline-start:4px}
  .footer{margin-top:32px;padding-top:12px;border-top:1px solid #F0EDE8;display:flex;justify-content:space-between;align-items:center}
  .footer-brand{font-size:11px;font-weight:800;color:#8F1D2C}
  .footer-date{font-size:10px;color:#C8C2BB}
  @media print{body{padding:20px 24px}button{display:none!important}}
</style>
</head>
<body>
<div class="header">
  <div class="brand">دليلك — Dalilak</div>
  <h1>${displayTitle}</h1>
  ${displayMinistry ? `<div class="ministry">${displayMinistry}</div>` : ''}
</div>

${(displayFees || displayTime) ? `
<div class="meta">
  ${displayFees ? `<div class="meta-item"><div class="label">${isAr ? 'الرسوم' : 'Fees'}</div><div class="value">${displayFees}</div></div>` : ''}
  ${displayTime ? `<div class="meta-item"><div class="label">${isAr ? 'مدة الإنجاز' : 'Processing time'}</div><div class="value">${displayTime}</div></div>` : ''}
</div>
` : ''}

${displayDocs.length > 0 ? `
<section>
  <h2>${isAr ? 'الوثائق المطلوبة' : 'Required Documents'}</h2>
  <ul>
    ${displayDocs.map(d => `<li>${d}</li>`).join('')}
  </ul>
</section>
` : ''}

${displaySteps.length > 0 ? `
<section>
  <h2>${isAr ? 'خطوات الإنجاز' : 'Procedure Steps'}</h2>
  <ol>
    ${displaySteps.map(s => `<li>${s}</li>`).join('')}
  </ol>
</section>
` : ''}

<div class="footer">
  <div class="footer-brand">dalilak.app</div>
  <div class="footer-date">${today}</div>
</div>

<script>window.onload=()=>window.print();</script>
</body>
</html>`

    const win = window.open('', '_blank', 'width=800,height=900')
    if (win) { win.document.write(html); win.document.close() }
  }

  return (
    <button
      type="button"
      onClick={handlePrint}
      title={isAr ? 'طباعة ملخّص الإجراء' : 'Print procedure summary'}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '5px 10px', borderRadius: 8,
        background: '#F5F3F0', border: '1.5px solid #E6E2DC',
        cursor: 'pointer', fontFamily: 'inherit',
        fontSize: 11, fontWeight: 700, color: '#6B7280',
        transition: 'background 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = '#E6E2DC')}
      onMouseLeave={e => (e.currentTarget.style.background = '#F5F3F0')}
    >
      <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z"/>
      </svg>
      <span>{isAr ? 'طباعة ملخّص' : 'Print'}</span>
    </button>
  )
}
