'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { PROCEDURES_DATA, getComplexityColor, getComplexityBg, getComplexityLabel } from '@/lib/procedures'
import { ALL_SERVICES, SERVICE_CATEGORIES } from '@/lib/allServices'
import { ENRICHED_PROCEDURES, searchEnrichedProcedures, type EnrichedProcedure } from '@/lib/enrichedProcedures'
import BottomNav from '@/components/BottomNav'
import { TX_MINISTRIES } from '@/lib/allTransactions'

const GUIDED_ACTIVE_COUNT = PROCEDURES_DATA.filter(p => p.status === 'active').length
const PROCEDURES_TOTAL = GUIDED_ACTIVE_COUNT + ENRICHED_PROCEDURES.length

// Ministry filter data
const MINISTRY_CHIPS = [
  { slug: 'all',              ar: 'الكل',              en: 'All' },
  { slug: 'interior',         ar: 'الداخلية',          en: 'Interior' },
  { slug: 'general-security', ar: 'الأمن العام',       en: 'Gen. Security' },
  { slug: 'economy',          ar: 'الاقتصاد',          en: 'Economy' },
  { slug: 'labor',            ar: 'العمل',             en: 'Labor' },
  { slug: 'customs',          ar: 'الجمارك',           en: 'Customs' },
  { slug: 'health',           ar: 'الصحة',             en: 'Health' },
  { slug: 'agriculture',      ar: 'الزراعة',           en: 'Agriculture' },
  { slug: 'social',           ar: 'الشؤون الاجتماعية', en: 'Social Affairs' },
  { slug: 'tourism',          ar: 'السياحة',           en: 'Tourism' },
]

// Map guided procedure categorySlug → ministry filter slug
const CAT_TO_MINISTRY: Record<string, string> = {
  'travel': 'general-security',
  'civil-status': 'interior',
  'business': 'economy',
  'real-estate': 'interior',
  'vehicles': 'interior',
  'work-social': 'labor',
  'attestation': 'interior',
  'official-docs': 'interior',
  'legal-docs': 'interior',
  'construction': 'interior',
  'expat': 'general-security',
  'transport': 'interior',
  'associations': 'interior',
  'industry': 'economy',
}

// Ministry icon SVGs (inline, brand-color strokes)
function MinistryIcon({ slug, size = 18 }: { slug: string; size?: number }) {
  const s = { width: size, height: size }
  if (slug === 'interior') return <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
  if (slug === 'general-security') return <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
  if (slug === 'economy') return <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
  if (slug === 'labor') return <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
  if (slug === 'customs') return <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
  if (slug === 'health') return <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
  if (slug === 'agriculture') return <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 004 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
  if (slug === 'social') return <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
  if (slug === 'tourism') return <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  return <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
}

export default function ProceduresPage() {
  const router = useRouter()
  const [lang, setLang] = useState<'ar' | 'en'>('ar')
  const [search, setSearch] = useState('')
  const [expandedProc, setExpandedProc] = useState<string | null>(null)
  const [ministryFilter, setMinistryFilter] = useState('all')
  const isAr = lang === 'ar'

  const filteredGuided = useMemo(() => {
    let list = PROCEDURES_DATA.filter(p => p.status === 'active')
    if (ministryFilter !== 'all') {
      list = list.filter(p => (CAT_TO_MINISTRY[p.categorySlug] || 'interior') === ministryFilter)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(p =>
        p.title_ar.includes(search) || p.title_en.toLowerCase().includes(q) ||
        p.description_ar.includes(search) || p.tags.some(t => t.toLowerCase().includes(q))
      )
    }
    return list
  }, [search, ministryFilter])

  const filteredEnriched = useMemo(() => {
    let list = searchEnrichedProcedures(search)
    if (ministryFilter !== 'all') {
      list = list.filter(p => p.ministrySlug === ministryFilter)
    }
    return list
  }, [search, ministryFilter])

  const handleAsk = useCallback((prompt: string) => {
    router.push(`/?q=${encodeURIComponent(prompt)}`)
  }, [router])

  const totalResults = filteredGuided.length + filteredEnriched.length

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: "'Cairo', 'Inter', sans-serif", overflowX: 'hidden' }} dir="rtl">
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 3px; height: 3px; }
        ::-webkit-scrollbar-thumb { background: #EAE4D9; border-radius: 2px; }
        .proc-card:hover { border-color: rgba(139,26,26,0.4) !important; box-shadow: 0 2px 12px rgba(139,26,26,0.08) !important; }
        .proc-chip-row { -ms-overflow-style: none; scrollbar-width: none; }
        .proc-chip-row::-webkit-scrollbar { display: none; }
        .proc-chip { transition: all 0.14s; }
        .proc-chip:hover { border-color: #8B1A1A !important; }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #6b2737 0%, #8B1A1A 60%, #7a1818 100%)',
        padding: '13px 16px', position: 'sticky', top: 0, zIndex: 50,
        boxShadow: '0 4px 24px rgba(80,10,10,0.3)',
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => router.push('/')}
            onTouchStart={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.22)' }}
            onTouchEnd={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 9, color: '#fff', cursor: 'pointer', padding: '6px 8px', display: 'flex', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, flex: 1 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
              <img src="/logo.PNG" alt="دليلك" style={{ width: 24, height: 24, objectFit: 'contain', display: 'block' }} />
            </div>
            <div>
              <h1 style={{ color: '#fff', fontSize: 15, fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
                {isAr ? 'المعاملات الحكومية' : 'Government Procedures'}
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, margin: 0 }}>
                {isAr ? `${PROCEDURES_TOTAL} إجراء موثّق بالخطوات والوثائق` : `${PROCEDURES_TOTAL} documented step-by-step`}
              </p>
            </div>
          </div>
          <button onClick={() => setLang(l => l === 'ar' ? 'en' : 'ar')} style={{ background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.25)', color: '#fff', borderRadius: 9, padding: '5px 12px', cursor: 'pointer', fontSize: 11, fontFamily: 'inherit', fontWeight: 700, flexShrink: 0 }}>
            {isAr ? 'EN' : 'AR'}
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '16px 14px 100px' }}>

        {/* Stats strip */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 16, background: '#fff', borderRadius: 14, border: '1.5px solid #EAE4D9', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          {[
            { value: String(PROCEDURES_TOTAL), label: isAr ? 'إجراء موثّق' : 'Procedures' },
            { value: String(ALL_SERVICES.length), label: isAr ? 'خدمة متاحة' : 'Services' },
            { value: String(TX_MINISTRIES.length) + '+', label: isAr ? 'جهة مختصة' : 'Authorities' },
          ].map((stat, idx) => (
            <div key={stat.value} style={{
              flex: 1, padding: '12px 8px', textAlign: 'center',
              borderRight: idx < 2 ? '1px solid #EAE4D9' : 'none',
            }}>
              <div style={{ fontSize: 'clamp(16px,5vw,19px)', fontWeight: 900, color: '#8B1A1A', lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: 9.5, color: '#9C8E80', marginTop: 3 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Ministry filter chips */}
        <div style={{ marginBottom: 12, marginRight: -14, marginLeft: -14 }}>
          <div className="proc-chip-row" style={{ display: 'flex', flexWrap: 'nowrap', overflowX: 'auto', gap: 6, paddingRight: 14, paddingLeft: 14, paddingBottom: 2 }}>
            {MINISTRY_CHIPS.map(chip => {
              const active = ministryFilter === chip.slug
              return (
                <button
                  key={chip.slug}
                  className="proc-chip"
                  onClick={() => { setMinistryFilter(chip.slug); setExpandedProc(null) }}
                  onTouchStart={e => { e.currentTarget.style.background = active ? '#FDE8E8' : '#FEF9F9'; e.currentTarget.style.borderColor = '#8B1A1A' }}
                  onTouchEnd={e => { e.currentTarget.style.background = active ? '#FEF2F2' : '#fff'; e.currentTarget.style.borderColor = active ? '#8B1A1A' : '#EAE4D9' }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '5px 12px', borderRadius: 20, cursor: 'pointer',
                    fontFamily: 'inherit', fontSize: 11.5, fontWeight: active ? 700 : 600,
                    border: active ? '2px solid #8B1A1A' : '1.5px solid #EAE4D9',
                    background: active ? '#FEF2F2' : '#fff',
                    color: active ? '#8B1A1A' : '#5C4A3A',
                    boxShadow: active ? '0 2px 8px rgba(139,26,26,0.12)' : 'none',
                    whiteSpace: 'nowrap', flexShrink: 0,
                  }}
                >
                  {chip.slug !== 'all' && (
                    <span style={{ color: active ? '#8B1A1A' : '#9C8E80', display: 'flex' }}>
                      <MinistryIcon slug={chip.slug} size={13} />
                    </span>
                  )}
                  {isAr ? chip.ar : chip.en}
                </button>
              )
            })}
          </div>
        </div>

        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1.5px solid #EAE4D9', borderRadius: 14, padding: '10px 14px', marginBottom: 10, boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9C8E80" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/></svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={isAr ? `ابحث في ${PROCEDURES_TOTAL} إجراء...` : `Search ${PROCEDURES_TOTAL} procedures...`}
            dir="rtl"
            style={{ border: 'none', background: 'none', outline: 'none', flex: 1, fontSize: 13.5, color: '#1A1208', fontFamily: 'inherit' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9C8E80', display: 'flex', alignItems: 'center' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          )}
        </div>

        {/* Count + active filter badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, color: '#9C8E80' }}>
            {totalResults} {isAr ? `إجراء${search ? ` لـ "${search}"` : ''}` : `procedures${search ? ` for "${search}"` : ''}`}
          </span>
          {ministryFilter !== 'all' && (
            <>
              <span style={{ color: '#D4C5B0', fontSize: 11 }}>·</span>
              <button
                onClick={() => setMinistryFilter('all')}
                style={{
                  fontSize: 10.5, color: '#8B1A1A', fontWeight: 700,
                  background: '#FEF2F2', border: '1px solid rgba(139,26,26,0.2)',
                  borderRadius: 20, padding: '2px 10px', cursor: 'pointer',
                  fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 4,
                }}
              >
                {isAr
                  ? (MINISTRY_CHIPS.find(c => c.slug === ministryFilter)?.ar || ministryFilter)
                  : (MINISTRY_CHIPS.find(c => c.slug === ministryFilter)?.en || ministryFilter)}
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </>
          )}
        </div>

        {/* Results */}
        {totalResults === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: '#9C8E80' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D4C5B0" strokeWidth="1.4"><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/></svg>
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
              {isAr ? 'لم نجد إجراءات مطابقة' : 'No matching procedures'}
            </p>
            <button onClick={() => handleAsk(search)} style={{
              padding: '10px 20px', borderRadius: 12,
              background: 'linear-gradient(135deg, #8B1A1A, #6b2737)',
              border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 2px 8px rgba(139,26,26,0.25)',
            }}>
              {isAr ? `اسأل دليلك عن: ${search}` : `Ask about: ${search}`}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

            {/* Guided procedures */}
            {filteredGuided.map(proc => {
              const isExpanded = expandedProc === proc.slug
              return (
                <div key={proc.slug} className="proc-card" style={{
                  background: '#fff',
                  border: `1.5px solid ${isExpanded ? '#8B1A1A' : '#EAE4D9'}`,
                  borderRadius: 14, overflow: 'hidden',
                  boxShadow: isExpanded ? '0 4px 16px rgba(139,26,26,0.1)' : '0 1px 4px rgba(0,0,0,0.04)',
                  transition: 'all 0.18s',
                }}>
                  <button
                    onClick={() => setExpandedProc(isExpanded ? null : proc.slug)}
                    style={{ width: '100%', padding: '13px 14px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'right', display: 'flex', alignItems: 'center', gap: 10 }}
                    onTouchStart={e => { e.currentTarget.style.background = '#FEF5F5' }}
                    onTouchEnd={e => { e.currentTarget.style.background = 'none' }}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: isExpanded ? 'rgba(139,26,26,0.1)' : '#FEF2F2', border: '1px solid rgba(139,26,26,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B1A1A', flexShrink: 0 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
                    </div>
                    <div style={{ flex: 1, textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 9.5, fontWeight: 700, color: '#8B1A1A', background: 'rgba(139,26,26,0.08)', borderRadius: 6, padding: '1px 7px', border: '1px solid rgba(139,26,26,0.15)' }}>
                          {isAr ? 'مُرشدة' : 'Guided'}
                        </span>
                        <span style={{ fontSize: 9.5, borderRadius: 6, padding: '1px 7px', fontWeight: 600, background: getComplexityBg(proc.complexity), color: getComplexityColor(proc.complexity) }}>
                          {getComplexityLabel(proc.complexity, isAr)}
                        </span>
                        {proc.estimatedDuration_ar && (
                          <span style={{ fontSize: 9.5, color: '#5C4A3A', background: '#EAE4D9', borderRadius: 6, padding: '1px 7px' }}>
                            {isAr ? proc.estimatedDuration_ar : proc.estimatedDuration_en}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: isExpanded ? '#8B1A1A' : '#1A1208', lineHeight: 1.4 }}>
                        {isAr ? proc.title_ar : proc.title_en}
                      </div>
                    </div>
                    <span style={{ color: isExpanded ? '#8B1A1A' : '#9C8E80', transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0, display: 'inline-flex' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6"/></svg>
                    </span>
                  </button>

                  {isExpanded && (
                    <div style={{ padding: '0 14px 16px', borderTop: '1px solid #EAE4D9', animation: 'slideDown 0.2s ease' }}>
                      <p style={{ margin: '12px 0 12px', fontSize: 12.5, color: '#2D1B0E', lineHeight: 1.75, background: '#FAFAF8', borderRadius: 9, padding: '9px 12px', border: '1px solid #EAE4D9' }}>
                        {isAr ? proc.description_ar : proc.description_en}
                      </p>
                      {proc.requiredDocuments.length > 0 && (
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ fontSize: 11, fontWeight: 800, color: '#1A1208', marginBottom: 7, display: 'flex', alignItems: 'center', gap: 5 }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8B1A1A" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                            {isAr ? 'الوثائق المطلوبة' : 'Required Documents'}
                            <span style={{ fontWeight: 600, color: '#9C8E80', fontSize: 10 }}>({proc.requiredDocuments.length})</span>
                          </div>
                          <div style={{ borderRadius: 9, border: '1px solid #EAE4D9', overflow: 'hidden' }}>
                            {proc.requiredDocuments.map((doc, i) => (
                              <div key={i} style={{ fontSize: 11.5, color: '#2D1B0E', padding: '7px 12px', background: i % 2 === 0 ? '#FAFAF8' : '#fff', borderBottom: i < proc.requiredDocuments.length - 1 ? '1px solid #EAE4D9' : 'none', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                                <span style={{ color: '#8B1A1A', flexShrink: 0, marginTop: 5 }}>
                                  <svg width="5" height="5" viewBox="0 0 10 10"><circle cx="5" cy="5" r="3.5" fill="#8B1A1A" opacity="0.7"/></svg>
                                </span>
                                <span style={{ lineHeight: 1.5 }}>{isAr ? doc.name_ar : doc.name_en}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {proc.steps.length > 0 && (
                        <div style={{ marginBottom: 14 }}>
                          <div style={{ fontSize: 11, fontWeight: 800, color: '#1A1208', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8B1A1A" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                            {isAr ? 'خطوات الإجراء' : 'Steps'}
                            <span style={{ fontWeight: 600, color: '#9C8E80', fontSize: 10 }}>({proc.steps.length} {isAr ? 'خطوات' : 'steps'})</span>
                          </div>
                          {proc.steps.map((s, i) => {
                            const isLastStep = i === proc.steps.length - 1
                            return (
                              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'stretch', paddingBottom: isLastStep ? 0 : 10 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg, #8B1A1A, #6b2737)', color: '#fff', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 1px 4px rgba(139,26,26,0.25)' }}>{i + 1}</span>
                                  {!isLastStep && <div style={{ width: 1.5, flex: 1, background: 'rgba(139,26,26,0.15)', marginTop: 3, borderRadius: 1 }} />}
                                </div>
                                <div style={{ paddingTop: 3, paddingBottom: isLastStep ? 0 : 4 }}>
                                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1A1208', lineHeight: 1.45 }}>{isAr ? s.title_ar : s.title_en}</div>
                                  {s.description_ar && (
                                    <div style={{ fontSize: 11.5, color: '#5C4A3A', marginTop: 2, lineHeight: 1.55 }}>
                                      {isAr ? s.description_ar : ((s as unknown as { description_en?: string }).description_en || s.description_ar)}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                      <button onClick={() => handleAsk(isAr ? proc.chatPrompt_ar : proc.chatPrompt_en)}
                        onTouchStart={e => { e.currentTarget.style.opacity = '0.82'; e.currentTarget.style.transform = 'scale(0.97)' }}
                        onTouchEnd={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)' }}
                        style={{
                        width: '100%', padding: '11px 18px', borderRadius: 11,
                        background: 'linear-gradient(135deg, #8B1A1A, #6b2737)',
                        border: 'none', color: '#fff', fontSize: 12.5, fontWeight: 700,
                        cursor: 'pointer', fontFamily: 'inherit',
                        boxShadow: '0 2px 8px rgba(139,26,26,0.25)',
                        transition: 'opacity 0.12s, transform 0.12s',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                      }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
                        {isAr ? 'اسأل دليلك عن هذا الإجراء' : 'Ask about this procedure'}
                      </button>
                    </div>
                  )}
                </div>
              )
            })}

            {/* Section divider — only when both groups are present */}
            {filteredGuided.length > 0 && filteredEnriched.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0 2px' }}>
                <div style={{ flex: 1, height: 1, background: '#EAE4D9' }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: '#9C8E80', whiteSpace: 'nowrap', padding: '3px 10px', background: '#F5F0EB', borderRadius: 20, border: '1px solid #EAE4D9' }}>
                  {isAr ? 'إجراءات موثّقة' : 'Documented procedures'}
                </span>
                <div style={{ flex: 1, height: 1, background: '#EAE4D9' }} />
              </div>
            )}

            {/* Enriched procedures */}
            {filteredEnriched.map((proc: EnrichedProcedure) => (
              <div key={proc.code} className="proc-card" style={{
                background: '#fff', border: `1.5px solid ${expandedProc === proc.code ? '#8B1A1A' : '#EAE4D9'}`,
                borderRadius: 14, overflow: 'hidden', transition: 'all 0.18s',
                boxShadow: expandedProc === proc.code ? '0 4px 16px rgba(139,26,26,0.1)' : '0 1px 4px rgba(0,0,0,0.04)',
              }}>
                <button
                  onClick={() => setExpandedProc(expandedProc === proc.code ? null : proc.code)}
                  style={{ width: '100%', padding: '13px 14px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'right', display: 'flex', alignItems: 'center', gap: 10 }}
                  onTouchStart={e => { e.currentTarget.style.background = '#FEF5F5' }}
                  onTouchEnd={e => { e.currentTarget.style.background = 'none' }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: expandedProc === proc.code ? 'rgba(139,26,26,0.1)' : '#FEF2F2', border: '1px solid rgba(139,26,26,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B1A1A', flexShrink: 0 }}>
                    <MinistryIcon slug={proc.ministrySlug} size={18} />
                  </div>
                  <div style={{ flex: 1, textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 9.5, fontWeight: 700, color: '#8B1A1A', background: 'rgba(139,26,26,0.07)', borderRadius: 6, padding: '1px 7px', border: '1px solid rgba(139,26,26,0.12)' }}>
                        {isAr
                          ? (MINISTRY_CHIPS.find(c => c.slug === proc.ministrySlug)?.ar || proc.ministry)
                          : (MINISTRY_CHIPS.find(c => c.slug === proc.ministrySlug)?.en || proc.ministry)}
                      </span>
                      {proc.requiredDocuments.length > 0 && <span style={{ fontSize: 9.5, background: '#FEF2F2', color: '#8B1A1A', borderRadius: 6, padding: '1px 7px', border: '1px solid rgba(139,26,26,0.2)' }}>{proc.requiredDocuments.length} وثيقة</span>}
                      {proc.steps.length > 0 && <span style={{ fontSize: 9.5, background: '#FEF2F2', color: '#8B1A1A', borderRadius: 6, padding: '1px 7px', border: '1px solid rgba(139,26,26,0.2)' }}>{proc.steps.length} خطوة</span>}
                      {proc.hasForm && <span style={{ fontSize: 9.5, background: '#FFFBEB', color: '#854D0E', borderRadius: 6, padding: '1px 7px', border: '1px solid #FEF3C7' }}>نموذج</span>}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: expandedProc === proc.code ? '#8B1A1A' : '#1A1208', lineHeight: 1.4 }}>{proc.title}</div>
                    <div style={{ fontSize: 10, color: '#8B1A1A', fontWeight: 600, marginTop: 2 }}>{proc.ministry}</div>
                    {proc.description && expandedProc !== proc.code && (
                      <div style={{ fontSize: 10.5, color: '#6B5A4A', marginTop: 3, lineHeight: 1.5, opacity: 0.85 }}>
                        {proc.description.length > 90 ? proc.description.slice(0, 90) + '…' : proc.description}
                      </div>
                    )}
                  </div>
                  <span style={{ color: expandedProc === proc.code ? '#8B1A1A' : '#9C8E80', transform: expandedProc === proc.code ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0, display: 'inline-flex' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6"/></svg>
                  </span>
                </button>

                {expandedProc === proc.code && (
                  <div style={{ padding: '0 14px 18px', borderTop: '1px solid #EAE4D9', animation: 'slideDown 0.2s ease' }}>

                    {/* Description */}
                    {proc.description && (
                      <p style={{ margin: '12px 0 12px', fontSize: 12.5, color: '#2D1B0E', lineHeight: 1.75, background: '#FAFAF8', borderRadius: 9, padding: '9px 12px', border: '1px solid #EAE4D9' }}>
                        {proc.description}
                      </p>
                    )}

                    {/* Meta strip: processing time + where to apply */}
                    {(proc.processingTime || proc.whereToApply) && (
                      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                        {proc.processingTime && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#FFFBEB', border: '1px solid #FEF3C7', borderRadius: 9, padding: '6px 12px', flex: '1 1 auto', minWidth: 0 }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#92400E" strokeWidth="2" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: 9, fontWeight: 700, color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.04em' }}>مدة الإنجاز</div>
                              <div style={{ fontSize: 11, color: '#78350F', fontWeight: 600, lineHeight: 1.3 }}>{proc.processingTime}</div>
                            </div>
                          </div>
                        )}
                        {proc.whereToApply && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#FEF2F2', border: '1px solid rgba(139,26,26,0.15)', borderRadius: 9, padding: '6px 12px', flex: '1 1 auto', minWidth: 0 }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8B1A1A" strokeWidth="2" style={{ flexShrink: 0 }}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: 9, fontWeight: 700, color: '#8B1A1A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>مكان التقديم</div>
                              <div style={{ fontSize: 11, color: '#5C1A1A', fontWeight: 600, lineHeight: 1.3 }}>{proc.whereToApply}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Required documents */}
                    {proc.requiredDocuments.length > 0 && (
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: '#1A1208', marginBottom: 7, display: 'flex', alignItems: 'center', gap: 5 }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8B1A1A" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                          الوثائق المطلوبة
                          <span style={{ fontWeight: 600, color: '#9C8E80', fontSize: 10 }}>({proc.requiredDocuments.length})</span>
                        </div>
                        <div style={{ borderRadius: 9, border: '1px solid #EAE4D9', overflow: 'hidden' }}>
                          {proc.requiredDocuments.map((d, i) => (
                            <div key={i} style={{ fontSize: 11.5, color: '#2D1B0E', padding: '7px 12px', background: i % 2 === 0 ? '#FAFAF8' : '#fff', borderBottom: i < proc.requiredDocuments.length - 1 ? '1px solid #EAE4D9' : 'none', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                              <span style={{ color: '#8B1A1A', flexShrink: 0, marginTop: 5 }}>
                                <svg width="5" height="5" viewBox="0 0 10 10"><circle cx="5" cy="5" r="3.5" fill="#8B1A1A" opacity="0.7"/></svg>
                              </span>
                              <span style={{ lineHeight: 1.5 }}>{d}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Steps */}
                    {proc.steps.length > 0 && (
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: '#1A1208', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8B1A1A" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                          خطوات الإجراء
                          <span style={{ fontWeight: 600, color: '#9C8E80', fontSize: 10 }}>({proc.steps.length} خطوات)</span>
                        </div>
                        {proc.steps.map((s, i) => {
                          const isLast = i === proc.steps.length - 1
                          return (
                            <div key={i} style={{ display: 'flex', gap: 10, paddingBottom: isLast ? 0 : 10, alignItems: 'stretch' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                                <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg, #8B1A1A, #6b2737)', color: '#fff', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 1px 4px rgba(139,26,26,0.25)' }}>{i + 1}</span>
                                {!isLast && <div style={{ width: 1.5, flex: 1, background: 'rgba(139,26,26,0.15)', marginTop: 3, borderRadius: 1 }} />}
                              </div>
                              <div style={{ paddingTop: 3, paddingBottom: isLast ? 0 : 4 }}>
                                <span style={{ fontSize: 12, color: '#2D1B0E', lineHeight: 1.65 }}>{s}</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Fees */}
                    {proc.fees && (
                      <div style={{ background: '#FFFBEB', border: '1px solid #FEF3C7', borderRadius: 9, padding: '9px 12px', marginBottom: 12 }}>
                        <div style={{ fontSize: 9, fontWeight: 800, color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#92400E" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                          الرسوم والتكاليف
                        </div>
                        <span style={{ fontSize: 11.5, color: '#78350F', lineHeight: 1.6 }}>{proc.fees.length > 200 ? proc.fees.slice(0, 200) + '…' : proc.fees}</span>
                      </div>
                    )}

                    {/* PDF download links */}
                    {proc.pdfUrls && proc.pdfUrls.length > 0 && (
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                        {proc.pdfUrls.map((url, pi) => (
                          <a key={pi} href={url} target="_blank" rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 5,
                              padding: '7px 14px', borderRadius: 9,
                              background: '#fff', border: '1.5px solid #EAE4D9',
                              color: '#5C4A3A', fontSize: 11, fontWeight: 700,
                              textDecoration: 'none',
                            }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8B1A1A" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                            {isAr ? `تنزيل النموذج${proc.pdfUrls.length > 1 ? ` ${pi + 1}` : ''}` : `Download Form${proc.pdfUrls.length > 1 ? ` ${pi + 1}` : ''}`}
                          </a>
                        ))}
                      </div>
                    )}

                    {/* CTA */}
                    <button onClick={() => handleAsk(proc.title)}
                      onTouchStart={e => { e.currentTarget.style.opacity = '0.82'; e.currentTarget.style.transform = 'scale(0.97)' }}
                      onTouchEnd={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)' }}
                      style={{
                        width: '100%', padding: '11px 18px', borderRadius: 11,
                        background: 'linear-gradient(135deg, #8B1A1A, #6b2737)',
                        border: 'none', color: '#fff', fontSize: 12.5, fontWeight: 700,
                        cursor: 'pointer', fontFamily: 'inherit',
                        transition: 'opacity 0.12s, transform 0.12s',
                        boxShadow: '0 2px 8px rgba(139,26,26,0.25)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                      }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
                      {isAr ? 'اسأل دليلك عن هذا الإجراء' : 'Ask about this procedure'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Link to full services directory */}
        <div style={{ marginTop: 28, borderTop: '1px solid #EAE4D9', paddingTop: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', border: '1.5px solid #EAE4D9', borderRadius: 14, padding: '14px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1208', marginBottom: 3 }}>
                {isAr ? 'دليل الخدمات الحكومية' : 'Government Services Directory'}
              </div>
              <div style={{ fontSize: 11, color: '#9C8E80' }}>
                {isAr ? `${ALL_SERVICES.length} خدمة · ${SERVICE_CATEGORIES.length} فئة` : `${ALL_SERVICES.length} services · ${SERVICE_CATEGORIES.length} categories`}
              </div>
            </div>
            <button
              onClick={() => router.push('/services')}
              style={{
                padding: '9px 16px', borderRadius: 10,
                background: 'linear-gradient(135deg, #8B1A1A, #6b2737)',
                border: 'none', color: '#fff', fontSize: 12, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6,
                boxShadow: '0 2px 8px rgba(139,26,26,0.25)', whiteSpace: 'nowrap',
              }}
            >
              {isAr ? 'استعرض الكل' : 'Browse all'}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
          </div>
        </div>

      </div>

      <BottomNav isAr={lang === 'ar'} activeTab="procedures" />
    </div>
  )
}
