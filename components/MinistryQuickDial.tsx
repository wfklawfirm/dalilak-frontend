'use client'

/**
 * MinistryQuickDial — bottom sheet with clickable phone numbers
 * for key Lebanese government ministries and departments.
 *
 * Triggered by a phone FAB fixed at the bottom.
 * Searchable list. Each card: ministry name (AR/EN), phone, hours.
 * Tapping a number opens tel: link.
 */

import React, { useState, useMemo, useEffect } from 'react'
import { useLanguage } from '@/lib/LanguageContext'

interface Ministry {
  ar: string
  en: string
  phone: string
  hours: string
  icon: string
}

const MINISTRIES: Ministry[] = [
  { ar: 'وزارة الداخلية والبلديات',      en: 'Ministry of Interior',           phone: '01-821001', hours: '8:00–14:30', icon: '🏛️' },
  { ar: 'الأمن العام',                    en: 'General Security',               phone: '01-425610', hours: '8:00–14:00', icon: '🛂' },
  { ar: 'وزارة الخارجية والمغتربين',     en: 'Ministry of Foreign Affairs',    phone: '01-327230', hours: '8:00–14:30', icon: '🌐' },
  { ar: 'وزارة العدل',                   en: 'Ministry of Justice',            phone: '01-422929', hours: '8:00–14:30', icon: '⚖️' },
  { ar: 'وزارة المالية',                 en: 'Ministry of Finance',            phone: '01-981001', hours: '8:00–14:30', icon: '💰' },
  { ar: 'وزارة الاقتصاد والتجارة',       en: 'Ministry of Economy',            phone: '01-340540', hours: '8:00–14:30', icon: '📊' },
  { ar: 'وزارة الصحة العامة',            en: 'Ministry of Public Health',      phone: '01-830000', hours: '8:00–14:00', icon: '🏥' },
  { ar: 'وزارة التربية والتعليم',        en: 'Ministry of Education',          phone: '01-789000', hours: '8:00–14:30', icon: '📚' },
  { ar: 'وزارة العمل',                   en: 'Ministry of Labour',             phone: '01-556800', hours: '8:00–14:30', icon: '👷' },
  { ar: 'وزارة الأشغال العامة والنقل',   en: 'Ministry of Public Works',       phone: '05-455600', hours: '8:00–14:30', icon: '🏗️' },
  { ar: 'وزارة الزراعة',                en: 'Ministry of Agriculture',         phone: '05-952700', hours: '8:00–14:30', icon: '🌾' },
  { ar: 'قوى الأمن الداخلي (ISF)',       en: 'Internal Security Forces',       phone: '1717',      hours: '24/7',      icon: '👮' },
  { ar: 'الدفاع المدني',                 en: 'Civil Defense',                  phone: '175',       hours: '24/7',      icon: '🚒' },
  { ar: 'الصليب الأحمر اللبناني',        en: 'Lebanese Red Cross',             phone: '140',       hours: '24/7',      icon: '🔴' },
  { ar: 'مصرف لبنان (BDL)',             en: 'Banque du Liban',                phone: '01-750000', hours: '8:30–14:00', icon: '🏦' },
  { ar: 'مديرية السير والآليات',         en: 'Traffic & Vehicle Directorate',  phone: '01-486600', hours: '8:00–14:00', icon: '🚗' },
  { ar: 'النافعة — مياه بيروت',         en: 'Beirut Water Authority',         phone: '01-567000', hours: '8:00–14:00', icon: '💧' },
  { ar: 'كهرباء لبنان',                 en: 'Electricité du Liban',           phone: '1480',      hours: '24/7',      icon: '⚡' },
  { ar: 'طوارئ عامة',                    en: 'General Emergency',              phone: '112',       hours: '24/7',      icon: '🆘' },
  { ar: 'وزارة الشؤون الاجتماعية',       en: 'Ministry of Social Affairs',     phone: '01-738800', hours: '8:00–14:30', icon: '🤝' },
]

export default function MinistryQuickDial() {
  const { isAr } = useLanguage()
  const [open, setOpen]     = useState(false)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return MINISTRIES
    return MINISTRIES.filter(m =>
      m.ar.includes(search) ||
      m.en.toLowerCase().includes(q) ||
      m.phone.includes(q)
    )
  }, [search])

  // Escape closes the sheet — standard dialog behavior.
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open])

  return (
    <>
      {/* FAB trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={isAr ? 'أرقام الوزارات' : 'Ministry phone numbers'}
        className="no-print"
        style={{
          position: 'fixed',
          bottom: 'calc(82px + env(safe-area-inset-bottom, 0px))',
          [isAr ? 'left' : 'right']: 14,
          width: 44, height: 44, borderRadius: '50%',
          background: 'linear-gradient(135deg, #1D4ED8, #1E40AF)',
          border: 'none', color: '#fff',
          boxShadow: '0 4px 16px rgba(29,78,216,0.4)',
          cursor: 'pointer', zIndex: 8400,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, transition: 'transform 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
      >
        📞
      </button>

      {/* Bottom sheet */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setOpen(false)}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.45)', zIndex: 9000,
              backdropFilter: 'blur(2px)',
              animation: 'fadeIn 0.2s ease',
            }}
          />

          {/* Sheet */}
          <div
            dir={isAr ? 'rtl' : 'ltr'}
            style={{
              position: 'fixed', bottom: 0, left: 0, right: 0,
              background: '#fff', borderRadius: '20px 20px 0 0',
              padding: '0 0 env(safe-area-inset-bottom)',
              maxHeight: '85vh', display: 'flex', flexDirection: 'column',
              zIndex: 9001,
              animation: 'slideUp 0.25s cubic-bezier(0.22,1,0.36,1)',
              boxShadow: '0 -8px 40px rgba(0,0,0,0.15)',
            }}
          >
            {/* Handle */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
              <div style={{ width: 40, height: 4, borderRadius: 2, background: '#E6E2DC' }} />
            </div>

            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 16px 12px',
              borderBottom: '1px solid #F0EDE8',
            }}>
              <span style={{ fontSize: 22 }}>📞</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#191713' }}>
                  {isAr ? 'أرقام الوزارات والجهات الحكومية' : 'Ministry & Gov. Phone Numbers'}
                </div>
                <div style={{ fontSize: 10.5, color: '#918B82' }}>
                  {isAr ? `${MINISTRIES.length} جهة حكومية` : `${MINISTRIES.length} government offices`}
                </div>
              </div>
              <button type="button" onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#918B82', fontSize: 20 }}>✕</button>
            </div>

            {/* Search */}
            <div style={{ padding: '10px 16px 6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F8F8F6', border: '1px solid #E6E2DC', borderRadius: 10, padding: '8px 12px' }}>
                <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#918B82" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/></svg>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={isAr ? 'ابحث عن جهة...' : 'Search ministry...'}
                  dir={isAr ? 'rtl' : 'ltr'}
                  style={{ border: 'none', background: 'none', outline: 'none', flex: 1, fontSize: 13, fontFamily: 'inherit', color: '#191713' }}
                />
              </div>
            </div>

            {/* List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '4px 16px 16px' }}>
              {filtered.map((m, i) => (
                <a
                  key={i}
                  href={`tel:${m.phone}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '11px 12px', borderRadius: 11, marginBottom: 5,
                    background: '#FAFAF8', border: '1px solid #F0EDE8',
                    textDecoration: 'none', color: 'inherit',
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F8EDEF' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#FAFAF8' }}
                >
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{m.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: '#191713', lineHeight: 1.3 }}>
                      {isAr ? m.ar : m.en}
                    </div>
                    <div style={{ fontSize: 10, color: '#918B82', marginTop: 2 }}>
                      {isAr ? `ساعات: ${m.hours}` : `Hours: ${m.hours}`}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 800, color: '#1D4ED8', fontFamily: 'monospace', letterSpacing: '0.03em' }}>
                      {m.phone}
                    </span>
                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#1D4ED8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="#fff"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                    </div>
                  </div>
                </a>
              ))}
              {filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: '28px 0', color: '#918B82', fontSize: 13 }}>
                  {isAr ? 'لا توجد نتائج' : 'No results found'}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}
