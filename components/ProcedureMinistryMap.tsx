'use client'

/**
 * ProcedureMinistryMap — static visual map placeholder for a ministry.
 *
 * Derives Google Maps search URL from ministry name.
 * Shows a styled placeholder "map" with district dot and "عرض على خرائط Google" link.
 * No external tiles — fully self-contained with inline SVG street pattern.
 *
 * Props: { ministry: string; ministry_en?: string; isAr: boolean }
 */

import React, { useState } from 'react'

interface Props {
  ministry: string
  ministry_en?: string
  isAr: boolean
}

// Static district hints per known ministry keywords
const DISTRICT_HINTS: Array<{ keywords: string[]; district: string; lat: number; lng: number }> = [
  { keywords: ['داخلية', 'interior'], district: 'الصنائع', lat: 33.888, lng: 35.488 },
  { keywords: ['عدل', 'justice'], district: 'منطقة الحمراء', lat: 33.896, lng: 35.474 },
  { keywords: ['مالية', 'finance'], district: 'وسط بيروت', lat: 33.897, lng: 35.502 },
  { keywords: ['خارجية', 'foreign'], district: 'الأشرفية', lat: 33.883, lng: 35.512 },
  { keywords: ['تربية', 'education'], district: 'الحمراء', lat: 33.900, lng: 35.476 },
  { keywords: ['صحة', 'health'], district: 'الرمل', lat: 33.875, lng: 35.493 },
  { keywords: ['اقتصاد', 'economy'], district: 'وسط بيروت', lat: 33.895, lng: 35.499 },
  { keywords: ['أشغال', 'public works'], district: 'الكرنتينا', lat: 33.906, lng: 35.519 },
  { keywords: ['نقل', 'transport'], district: 'الكرنتينا', lat: 33.905, lng: 35.517 },
  { keywords: ['زراعة', 'agriculture'], district: 'بدارو', lat: 33.877, lng: 35.509 },
  { keywords: ['بيئة', 'environment'], district: 'الأشرفية', lat: 33.882, lng: 35.514 },
  { keywords: ['سياحة', 'tourism'], district: 'وسط بيروت', lat: 33.898, lng: 35.500 },
  { keywords: ['صناعة', 'industry'], district: 'وسط بيروت', lat: 33.894, lng: 35.498 },
  { keywords: ['اتصالات', 'telecom'], district: 'الأشرفية', lat: 33.880, lng: 35.516 },
  { keywords: ['طاقة', 'energy'], district: 'السان سيمون', lat: 33.872, lng: 35.483 },
  { keywords: ['شؤون', 'social affairs'], district: 'بيروت', lat: 33.888, lng: 35.491 },
  { keywords: ['عمل', 'labor'], district: 'الحمراء', lat: 33.899, lng: 35.473 },
  { keywords: ['ثقافة', 'culture'], district: 'وسط بيروت', lat: 33.896, lng: 35.501 },
  { keywords: ['مهجرين', 'displaced'], district: 'السان شارل', lat: 33.887, lng: 35.483 },
  { keywords: ['بلدية', 'municipality'], district: 'الباشورة', lat: 33.887, lng: 35.497 },
  { keywords: ['نفوس', 'civil'], district: 'رأس بيروت', lat: 33.893, lng: 35.470 },
]

function getHint(ministry: string) {
  const lower = ministry.toLowerCase()
  return DISTRICT_HINTS.find(h => h.keywords.some(k => lower.includes(k)))
    ?? { district: 'بيروت / Beirut', lat: 33.888, lng: 35.495 }
}

function mapsUrl(query: string): string {
  return `https://www.google.com/maps/search/${encodeURIComponent(query + ' Lebanon')}`
}

export default function ProcedureMinistryMap({ ministry, ministry_en, isAr }: Props) {
  const [expanded, setExpanded] = useState(false)
  const hint = getHint(isAr ? ministry : (ministry_en || ministry))
  const label = isAr ? ministry : (ministry_en || ministry)
  const districtLabel = isAr ? hint.district : (hint.district.includes('/') ? hint.district.split('/')[1].trim() : hint.district)

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 10px', borderRadius: 8,
          background: '#F0FDF4', border: '1px solid #BBF7D0',
          cursor: 'pointer', fontFamily: 'inherit',
          fontSize: 10, fontWeight: 700, color: '#065F46',
        }}
      >
        <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        {isAr ? `الموقع: ${districtLabel}` : `Location: ${districtLabel}`}
        <span style={{ color: '#4ADE80', marginInlineStart: 2 }}>↓</span>
      </button>
    )
  }

  return (
    <div dir={isAr ? 'rtl' : 'ltr'} style={{
      borderRadius: 10, overflow: 'hidden',
      border: '1.5px solid #BBF7D0',
      marginBottom: 8,
    }}>
      {/* Map visual placeholder */}
      <div style={{ position: 'relative', height: 110, background: '#E6F4EA', overflow: 'hidden' }}>
        {/* SVG street grid pattern */}
        <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <pattern id={`grid-${ministry.slice(0,3)}`} width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#C8E6C9" strokeWidth="0.8"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#grid-${ministry.slice(0,3)})`}/>

          {/* Main "road" lines */}
          <line x1="0" y1="55" x2="100%" y2="55" stroke="#A5D6A7" strokeWidth="3"/>
          <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#A5D6A7" strokeWidth="3"/>
          <line x1="0" y1="25" x2="100%" y2="25" stroke="#C8E6C9" strokeWidth="1.5"/>
          <line x1="0" y1="85" x2="100%" y2="85" stroke="#C8E6C9" strokeWidth="1.5"/>
          <line x1="25%" y1="0" x2="25%" y2="100%" stroke="#C8E6C9" strokeWidth="1.5"/>
          <line x1="75%" y1="0" x2="75%" y2="100%" stroke="#C8E6C9" strokeWidth="1.5"/>

          {/* Location dot */}
          <circle cx="50%" cy="55" r="14" fill="rgba(220,38,38,0.15)"/>
          <circle cx="50%" cy="55" r="7" fill="#DC2626"/>
          <circle cx="50%" cy="55" r="3" fill="#fff"/>

          {/* Compass NE */}
          <text x="93%" y="12" fontSize="9" fill="#6B7280" textAnchor="middle">N</text>
          <line x1="93%" y1="14" x2="93%" y2="22" stroke="#9CA3AF" strokeWidth="1"/>
        </svg>

        {/* Overlay info */}
        <div style={{
          position: 'absolute', bottom: 6, [isAr ? 'right' : 'left']: 8,
          background: 'rgba(255,255,255,0.92)', borderRadius: 6, padding: '3px 8px',
          fontSize: 9.5, fontWeight: 700, color: '#065F46',
        }}>
          📍 {districtLabel}
        </div>

        {/* Close button */}
        <button type="button" onClick={() => setExpanded(false)}
          aria-label={isAr ? 'إغلاق الخريطة' : 'Close map'}
          style={{ position: 'absolute', top: 5, [isAr ? 'left' : 'right']: 5, background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >✕</button>
      </div>

      {/* Footer link */}
      <div style={{ background: '#F0FDF4', padding: '6px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 9.5, color: '#065F46', fontWeight: 600 }}>
          {label}
        </span>
        <a
          href={mapsUrl(label)}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: 9.5, fontWeight: 700, color: '#059669', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}
        >
          {isAr ? 'افتح في خرائط Google' : 'Open in Google Maps'}
          <svg aria-hidden="true" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        </a>
      </div>
    </div>
  )
}
