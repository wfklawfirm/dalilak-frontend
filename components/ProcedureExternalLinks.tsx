'use client'

/**
 * ProcedureExternalLinks — shows 1–4 relevant government portal links
 * based on the procedure's ministrySlug.
 *
 * Links are static, curated mappings — no user data.
 * Opens in new tab. Compact icon + label chips.
 */

import React from 'react'

interface GovLink {
  labelAr: string
  labelEn: string
  url: string
  icon: string
}

const LINKS_BY_SLUG: Record<string, GovLink[]> = {
  interior: [
    { labelAr: 'بوابة الداخلية', labelEn: 'MoI Portal', url: 'https://www.interior.gov.lb', icon: '🏛️' },
    { labelAr: 'النفوس اللبناني', labelEn: 'Civil Registry', url: 'https://www.dawlati.gov.lb', icon: '🪪' },
  ],
  security: [
    { labelAr: 'الأمن العام', labelEn: 'General Security', url: 'https://www.general-security.gov.lb', icon: '🛂' },
    { labelAr: 'تتبع الطلب', labelEn: 'Track request', url: 'https://www.general-security.gov.lb/ar/Pages/services', icon: '🔍' },
  ],
  foreign: [
    { labelAr: 'وزارة الخارجية', labelEn: 'Ministry of Foreign Affairs', url: 'https://www.foreign.gov.lb', icon: '🌐' },
  ],
  justice: [
    { labelAr: 'وزارة العدل', labelEn: 'Ministry of Justice', url: 'https://www.justice.gov.lb', icon: '⚖️' },
  ],
  finance: [
    { labelAr: 'وزارة المالية', labelEn: 'Ministry of Finance', url: 'https://www.finance.gov.lb', icon: '💰' },
    { labelAr: 'الضرائب والرسوم', labelEn: 'Tax portal', url: 'https://efilers.finance.gov.lb', icon: '🧾' },
  ],
  economy: [
    { labelAr: 'وزارة الاقتصاد', labelEn: 'Ministry of Economy', url: 'https://www.economy.gov.lb', icon: '📊' },
    { labelAr: 'تسجيل الشركات', labelEn: 'Company registration', url: 'https://www.ogero.gov.lb', icon: '🏢' },
  ],
  labor: [
    { labelAr: 'وزارة العمل', labelEn: 'Ministry of Labour', url: 'https://www.labor.gov.lb', icon: '👷' },
  ],
  health: [
    { labelAr: 'وزارة الصحة', labelEn: 'Ministry of Health', url: 'https://www.moph.gov.lb', icon: '🏥' },
  ],
  education: [
    { labelAr: 'وزارة التربية', labelEn: 'Ministry of Education', url: 'https://www.mehe.gov.lb', icon: '📚' },
  ],
  publicworks: [
    { labelAr: 'الأشغال العامة', labelEn: 'Ministry of Public Works', url: 'https://www.public-works.gov.lb', icon: '🏗️' },
    { labelAr: 'تراخيص البناء', labelEn: 'Building permits', url: 'https://www.public-works.gov.lb/ar', icon: '📐' },
  ],
  isf: [
    { labelAr: 'قوى الأمن الداخلي', labelEn: 'Internal Security Forces', url: 'https://www.isf.gov.lb', icon: '👮' },
  ],
  traffic: [
    { labelAr: 'رخص السير', labelEn: 'Traffic Directorate', url: 'https://www.isf.gov.lb', icon: '🚗' },
  ],
  dawlati: [
    { labelAr: 'بوابة دولتي', labelEn: 'Dawlati Portal', url: 'https://www.dawlati.gov.lb', icon: '🏛️' },
  ],
}

// Fallback for any unknown slug
const FALLBACK_LINKS: GovLink[] = [
  { labelAr: 'بوابة دولتي', labelEn: 'Dawlati Portal', url: 'https://www.dawlati.gov.lb', icon: '🏛️' },
  { labelAr: 'الموقع الرسمي', labelEn: 'Gov Portal', url: 'https://www.lebanon.gov.lb', icon: '🇱🇧' },
]

interface Props {
  ministrySlug?: string
  isAr: boolean
}

export default function ProcedureExternalLinks({ ministrySlug, isAr }: Props) {
  const links = (ministrySlug && LINKS_BY_SLUG[ministrySlug]) || FALLBACK_LINKS

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{ marginBottom: 12 }}
    >
      <div style={{ fontSize: 9.5, fontWeight: 700, color: '#918B82', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 5 }}>
        {isAr ? 'البوابات الإلكترونية الرسمية' : 'Official Gov Portals'}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {links.map((link, i) => (
          <a
            key={i}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
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
            <span style={{ fontSize: 12 }}>{link.icon}</span>
            {isAr ? link.labelAr : link.labelEn}
            <svg aria-hidden="true" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ opacity: 0.6 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
            </svg>
          </a>
        ))}
      </div>
    </div>
  )
}
