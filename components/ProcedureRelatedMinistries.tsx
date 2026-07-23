'use client'

/**
 * ProcedureRelatedMinistries — compact ministry contact strip
 * shown inside an expanded enriched procedure card.
 *
 * Looks up the procedure's ministrySlug in MINISTRIES_MAP to find
 * the relevant ministry entry (phone, hours, icon), then renders
 * a tappable row with a tel: link for the phone number.
 *
 * If no match is found, renders nothing.
 */

import React from 'react'

interface MinistryEntry {
  ar: string
  en: string
  phone: string
  hours: string
  icon: string
}

const SLUG_MAP: Record<string, MinistryEntry> = {
  interior: {
    ar: 'وزارة الداخلية والبلديات', en: 'Ministry of Interior',
    phone: '01-821001', hours: '8:00–14:30', icon: '🏛️',
  },
  security: {
    ar: 'الأمن العام', en: 'General Security',
    phone: '01-425610', hours: '8:00–14:00', icon: '🛂',
  },
  foreign: {
    ar: 'وزارة الخارجية والمغتربين', en: 'Ministry of Foreign Affairs',
    phone: '01-327230', hours: '8:00–14:30', icon: '🌐',
  },
  justice: {
    ar: 'وزارة العدل', en: 'Ministry of Justice',
    phone: '01-422929', hours: '8:00–14:30', icon: '⚖️',
  },
  finance: {
    ar: 'وزارة المالية', en: 'Ministry of Finance',
    phone: '01-981001', hours: '8:00–14:30', icon: '💰',
  },
  economy: {
    ar: 'وزارة الاقتصاد والتجارة', en: 'Ministry of Economy',
    phone: '01-340540', hours: '8:00–14:30', icon: '📊',
  },
  health: {
    ar: 'وزارة الصحة العامة', en: 'Ministry of Public Health',
    phone: '01-830000', hours: '8:00–14:00', icon: '🏥',
  },
  education: {
    ar: 'وزارة التربية والتعليم', en: 'Ministry of Education',
    phone: '01-789000', hours: '8:00–14:30', icon: '📚',
  },
  labor: {
    ar: 'وزارة العمل', en: 'Ministry of Labour',
    phone: '01-556800', hours: '8:00–14:30', icon: '👷',
  },
  publicworks: {
    ar: 'وزارة الأشغال العامة والنقل', en: 'Ministry of Public Works',
    phone: '05-455600', hours: '8:00–14:30', icon: '🏗️',
  },
  isf: {
    ar: 'قوى الأمن الداخلي (ISF)', en: 'Internal Security Forces',
    phone: '1717', hours: '24/7', icon: '👮',
  },
  traffic: {
    ar: 'مديرية السير والآليات', en: 'Traffic & Vehicle Directorate',
    phone: '01-486600', hours: '8:00–14:00', icon: '🚗',
  },
  social: {
    ar: 'وزارة الشؤون الاجتماعية', en: 'Ministry of Social Affairs',
    phone: '01-738800', hours: '8:00–14:30', icon: '🤝',
  },
  agriculture: {
    ar: 'وزارة الزراعة', en: 'Ministry of Agriculture',
    phone: '05-952700', hours: '8:00–14:30', icon: '🌾',
  },
}

interface Props {
  ministrySlug?: string
  isAr: boolean
}

export default function ProcedureRelatedMinistries({ ministrySlug, isAr }: Props) {
  if (!ministrySlug) return null
  const entry = SLUG_MAP[ministrySlug]
  if (!entry) return null

  const name  = isAr ? entry.ar : entry.en
  const label = isAr ? 'الجهة المختصة' : 'Responsible Ministry'

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{ marginBottom: 12 }}
    >
      <div style={{ fontSize: 9.5, fontWeight: 700, color: '#918B82', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 5 }}>
        {label}
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '9px 12px', borderRadius: 10,
        background: '#FAFAF8', border: '1px solid #E6E2DC',
      }}>
        {/* Icon */}
        <div style={{
          width: 36, height: 36, borderRadius: 9,
          background: '#F0F9FF', border: '1px solid #BAE6FD',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, flexShrink: 0,
        }}>
          {entry.icon}
        </div>

        {/* Name + hours */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: '#191713', lineHeight: 1.3 }}>{name}</div>
          <div style={{ fontSize: 10, color: '#918B82', marginTop: 2 }}>
            {isAr ? `ساعات العمل: ${entry.hours}` : `Hours: ${entry.hours}`}
          </div>
        </div>

        {/* Phone CTA */}
        <a
          href={`tel:${entry.phone}`}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '6px 12px', borderRadius: 20,
            background: 'linear-gradient(135deg, #1D4ED8, #1E40AF)',
            color: '#fff', fontSize: 11, fontWeight: 800,
            textDecoration: 'none', flexShrink: 0,
            fontFamily: 'monospace', letterSpacing: '0.03em',
            boxShadow: '0 2px 6px rgba(29,78,216,0.3)',
            transition: 'opacity 0.12s',
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.85' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
          aria-label={isAr ? `اتصل بـ ${name}` : `Call ${name}`}
        >
          <svg aria-hidden="true" width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
          </svg>
          {entry.phone}
        </a>
      </div>
    </div>
  )
}
