'use client'

/**
 * ProcedureAlternativeOffices — shows alternative offices/branches where
 * a procedure can be submitted, keyed by ministry slug.
 *
 * Props: { ministrySlug: string; isAr: boolean }
 */

import React, { useState } from 'react'

interface Office {
  nameAr: string
  nameEn: string
  area: string
  phone?: string
}

const OFFICES: Record<string, Office[]> = {
  'isf': [
    { nameAr: 'مفوضية بيروت', nameEn: 'Beirut Commissariat', area: 'بيروت / Beirut', phone: '01-861861' },
    { nameAr: 'مفوضية جبل لبنان', nameEn: 'Mount Lebanon Commissariat', area: 'بعبدا / Baabda', phone: '05-922001' },
    { nameAr: 'مفوضية الشمال', nameEn: 'North Commissariat', area: 'طرابلس / Tripoli', phone: '06-430020' },
    { nameAr: 'مفوضية الجنوب', nameEn: 'South Commissariat', area: 'صيدا / Sidon', phone: '07-720030' },
  ],
  'civil-registry': [
    { nameAr: 'قلم النفوس — بيروت', nameEn: 'Civil Registry Beirut', area: 'بيروت / Beirut', phone: '01-981601' },
    { nameAr: 'قلم النفوس — جبل لبنان', nameEn: 'Civil Registry Mt. Lebanon', area: 'بعبدا / Baabda' },
    { nameAr: 'قلم النفوس — الشمال', nameEn: 'Civil Registry North', area: 'طرابلس / Tripoli' },
    { nameAr: 'قلم النفوس — الجنوب', nameEn: 'Civil Registry South', area: 'صيدا / Sidon' },
    { nameAr: 'قلم النفوس — البقاع', nameEn: 'Civil Registry Bekaa', area: 'زحلة / Zahle' },
  ],
  'moe': [
    { nameAr: 'مديرية التعليم العام — بيروت', nameEn: 'Directorate of Education Beirut', area: 'بيروت / Beirut', phone: '01-789200' },
    { nameAr: 'مديرية التعليم العام — الشمال', nameEn: 'Directorate of Education North', area: 'طرابلس / Tripoli' },
  ],
  'moph': [
    { nameAr: 'مستشفى رفيق الحريري الجامعي', nameEn: 'Rafik Hariri University Hospital', area: 'بيروت / Beirut', phone: '01-840000' },
    { nameAr: 'مديرية الصحة — الشمال', nameEn: 'Health Directorate North', area: 'طرابلس / Tripoli' },
  ],
  'moim': [
    { nameAr: 'مديرية الشؤون السياسية — بيروت', nameEn: 'Political Affairs Directorate Beirut', area: 'بيروت / Beirut', phone: '01-754100' },
    { nameAr: 'محافظة جبل لبنان', nameEn: 'Mount Lebanon Governorate', area: 'بعبدا / Baabda' },
    { nameAr: 'محافظة الشمال', nameEn: 'North Governorate', area: 'طرابلس / Tripoli' },
  ],
}

interface Props {
  ministrySlug: string
  isAr: boolean
}

export default function ProcedureAlternativeOffices({ ministrySlug, isAr }: Props) {
  const [open, setOpen] = useState(false)
  const offices = OFFICES[ministrySlug]
  if (!offices?.length) return null

  return (
    <div dir={isAr ? 'rtl' : 'ltr'} style={{ marginBottom: 8 }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          fontSize: 11, fontWeight: 700, color: '#374151',
          background: '#F3F4F6', border: '1px solid #E5E7EB',
          borderRadius: 8, padding: '5px 12px',
          cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        🏢 {isAr ? `${offices.length} مكاتب متاحة` : `${offices.length} offices available`}
        <span style={{ fontSize: 9 }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {offices.map((o, idx) => (
            <div
              key={idx}
              style={{
                padding: '8px 12px', background: '#F9FAFB',
                border: '1px solid #E5E7EB', borderRadius: 8,
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 12, color: '#111827' }}>
                {isAr ? o.nameAr : o.nameEn}
              </div>
              <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>
                📍 {o.area}
                {o.phone && <span style={{ marginInlineStart: 10 }}>📞 {o.phone}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
