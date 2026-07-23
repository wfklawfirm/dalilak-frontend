'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import { ALL_SERVICES, SERVICE_CATEGORIES } from '@/lib/allServices'
import { useLanguage } from '@/lib/LanguageContext'

// ── Derive unique authorities from local services data ─────────────────────
interface DerivedAuthority {
  name_ar: string
  name_en: string
  type: string
  serviceCount: number
  categories: string[]
  categories_en: string[]
  website?: string
  phone?: string
  working_hours?: string
  online_count: number
}

function deriveAuthorities(): DerivedAuthority[] {
  const map = new Map<string, DerivedAuthority>()
  for (const svc of ALL_SERVICES) {
    const key = svc.authority_ar
    if (!key) continue
    if (!map.has(key)) {
      // Infer type from authority name
      let type = 'other'
      if (key.includes('وزارة')) type = 'ministry'
      else if (key.includes('محكمة') || key.includes('قضاء') || key.includes('المجلس القضائي')) type = 'court'
      else if (key.includes('بلدية') || key.includes('البلديات') || key.includes('قائمقام')) type = 'municipality'
      else if (key.includes('نقابة') || key.includes('اتحاد')) type = 'union'
      else if (key.includes('مصرف') || key.includes('البنك')) type = 'bank'
      else if (key.includes('أمن') || key.includes('شرطة') || key.includes('مخابرات')) type = 'security'
      else if (key.includes('هيئة') || key.includes('مجلس') || key.includes('ديوان')) type = 'council'

      map.set(key, {
        name_ar: key,
        name_en: svc.authority_en || key,
        type,
        serviceCount: 0,
        categories: [],
        categories_en: [],
        website: svc.website || undefined,
        phone: svc.phone || undefined,
        working_hours: svc.working_hours || undefined,
        online_count: 0,
      })
    }
    const entry = map.get(key)!
    entry.serviceCount++
    if (svc.online_available) entry.online_count++
    if (!entry.categories.includes(svc.category)) {
      entry.categories.push(svc.category)
      entry.categories_en.push(svc.category_en || svc.category)
    }
    if (!entry.website && svc.website) entry.website = svc.website
    if (!entry.phone && svc.phone) entry.phone = svc.phone
    if (!entry.working_hours && svc.working_hours) entry.working_hours = svc.working_hours
  }
  return Array.from(map.values()).sort((a, b) => b.serviceCount - a.serviceCount)
}

const ALL_AUTHORITIES = deriveAuthorities()

const TYPE_FILTERS = [
  { key: 'all', labelAr: 'الكل', labelEn: 'All' },
  { key: 'ministry', labelAr: 'وزارة', labelEn: 'Ministry' },
  { key: 'council', labelAr: 'هيئة ومجلس', labelEn: 'Council' },
  { key: 'municipality', labelAr: 'بلدية', labelEn: 'Municipality' },
  { key: 'court', labelAr: 'قضاء', labelEn: 'Court' },
  { key: 'union', labelAr: 'نقابة', labelEn: 'Union' },
  { key: 'bank', labelAr: 'مصرف', labelEn: 'Bank' },
  { key: 'security', labelAr: 'أمن', labelEn: 'Security' },
  { key: 'other', labelAr: 'أخرى', labelEn: 'Other' },
]

const TYPE_COLORS: Record<string, { color: string; bg: string; border: string }> = {
  ministry:     { color: '#78350F', bg: '#FFFBEB', border: '#FDE68A' },
  council:      { color: '#8F1D2C', bg: '#F8EDEF', border: '#FECACA' },
  municipality: { color: '#69645C', bg: '#F5F0EB', border: '#D5CEC4' },
  court:        { color: '#713F12', bg: '#FEF9EE', border: '#FDE68A' },
  union:        { color: '#92400E', bg: '#FFFBEB', border: '#FDE68A' },
  bank:         { color: '#B45309', bg: '#FFFBEB', border: '#FDE68A' },
  security:     { color: '#44403C', bg: '#F5F5F4', border: '#D4D0CA' },
  other:        { color: '#69645C', bg: '#FAFAF8', border: '#E6E2DC' },
}

function TypeIcon({ type, size = 20 }: { type: string; size?: number }) {
  const s = { width: size, height: size, flexShrink: 0 as const }
  if (type === 'ministry') return (
    <svg aria-hidden="true" {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
    </svg>
  )
  if (type === 'council') return (
    <svg aria-hidden="true" {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"/>
    </svg>
  )
  if (type === 'court') return (
    <svg aria-hidden="true" {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"/>
    </svg>
  )
  if (type === 'municipality') return (
    <svg aria-hidden="true" {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
    </svg>
  )
  if (type === 'union') return (
    <svg aria-hidden="true" {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
    </svg>
  )
  if (type === 'bank') return (
    <svg aria-hidden="true" {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
    </svg>
  )
  if (type === 'security') return (
    <svg aria-hidden="true" {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
    </svg>
  )
  return (
    <svg aria-hidden="true" {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
    </svg>
  )
}

export default function AuthoritiesPage() {
  const router = useRouter()
  const { isAr } = useLanguage()
  const [typeFilter, setTypeFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)

  const filtered = useMemo(() => {
    let list = ALL_AUTHORITIES
    if (typeFilter !== 'all') list = list.filter(a => a.type === typeFilter)
    if (search.trim()) {
      const q = search.trim()
      list = list.filter(a =>
        a.name_ar.includes(q) ||
        a.categories.some(c => c.includes(q))
      )
    }
    return list
  }, [typeFilter, search])

  const stats = useMemo(() => ({
    total: ALL_AUTHORITIES.length,
    ministries: ALL_AUTHORITIES.filter(a => a.type === 'ministry').length,
    withOnline: ALL_AUTHORITIES.filter(a => a.online_count > 0).length,
    totalServices: ALL_SERVICES.length,
  }), [])

  const askAI = (name: string) =>
    router.push(`/?q=${encodeURIComponent(isAr ? `ما هي خدمات ${name} وكيف أتواصل معها؟` : `What services does ${name} provide and how to contact them?`)}`)

  return (
    <div style={{ minHeight: '100vh', background: '#F8F8F6', fontFamily: "'Cairo','Inter',sans-serif" }} dir={isAr ? 'rtl' : 'ltr'}>
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: #E6E2DC; border-radius: 2px; }
        .auth-card { transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s; cursor: pointer; }
        .auth-card:hover { border-color: #8F1D2C !important; box-shadow: 0 4px 20px rgba(143,29,44,0.12) !important; transform: translateY(-2px); }
        .type-chip:hover { opacity: 0.85; }
        .type-chip-row { -ms-overflow-style: none; scrollbar-width: none; }
        .type-chip-row::-webkit-scrollbar { display: none; }
        @keyframes authHeaderIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes authEnter { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 480px) { .auth-grid { grid-template-columns: 1fr !important; } }
        @media (min-width: 481px) and (max-width: 720px) { .auth-grid { grid-template-columns: repeat(2, 1fr) !important; } }
      `}</style>

      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #741622 0%, #8F1D2C 60%, #7a1818 100%)',
        padding: '13px 16px', position: 'sticky', top: 0, zIndex: 50,
        boxShadow: '0 4px 24px rgba(80,10,10,0.3)',
        animation: 'authHeaderIn 0.3s cubic-bezier(0.22,1,0.36,1) both',
      }}>
        <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <button type="button" aria-label={isAr ? 'الرئيسية' : 'Home'} onClick={() => router.push('/')}
            onTouchStart={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.22)' }}
            onTouchEnd={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
            style={{
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 9, color: '#fff', cursor: 'pointer', padding: '6px 8px',
              display: 'flex', flexShrink: 0,
            }}>
<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: isAr ? 'scaleX(-1)' : 'none', display: 'block' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, flex: 1 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9,
              background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0,
            }}>
              <img src="/logo-icon.png" alt="دليلك" style={{ width: 24, height: 24, objectFit: 'contain' }} />
            </div>
            <div>
              <h1 style={{ color: '#fff', fontSize: 15, fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
                {isAr ? 'دليل الجهات الرسمية' : 'Official Authorities Directory'}
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 10, margin: 0 }}>
                {isAr
                  ? `${stats.total} جهة · ${stats.totalServices} خدمة · ${stats.ministries} وزارة`
                  : `${stats.total} authorities · ${stats.totalServices} services · ${stats.ministries} ministries`}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div id="main-content" style={{ maxWidth: 760, margin: '0 auto', padding: '16px 14px 100px' }}>

        {/* Stats banner — premium individual cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 16 }}>
          {[
            { value: String(stats.total),         label: isAr ? 'جهة رسمية' : 'Authorities',     featured: true  },
            { value: String(stats.ministries),     label: isAr ? 'وزارة' : 'Ministries',         featured: false },
            { value: String(stats.withOnline),     label: isAr ? 'خدمات أونلاين' : 'Online services', featured: false },
            { value: String(stats.totalServices),  label: isAr ? 'خدمة موثّقة' : 'Verified services',   featured: false },
          ].map((s, i) => (
            <div key={s.label} style={{
              padding: '13px 8px 15px', textAlign: 'center',
              background: s.featured ? 'linear-gradient(135deg, #F8EDEF 0%, #FDE4E4 100%)' : '#fff',
              border: s.featured ? '1.5px solid rgba(143,29,44,0.18)' : '1.5px solid #E6E2DC',
              borderRadius: 12,
              boxShadow: s.featured ? '0 2px 10px rgba(143,29,44,0.09)' : '0 1px 5px rgba(0,0,0,0.05)',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              animation: 'authEnter 0.28s cubic-bezier(0.22,1,0.36,1) both',
              animationDelay: `${0.05 + i * 0.06}s`,
            }}>
              <div style={{ fontSize: 'clamp(17px,5vw,21px)', fontWeight: 900, color: '#8F1D2C', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 9.5, color: '#918B82', marginTop: 4, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="search-wrap" style={{
          position: 'relative', marginBottom: 12,
          background: '#fff', borderRadius: 14,
          border: `1.5px solid ${searchFocused ? '#8F1D2C' : '#E6E2DC'}`,
          boxShadow: searchFocused ? '0 0 0 3px rgba(143,29,44,0.08), 0 2px 12px rgba(143,29,44,0.06)' : '0 1px 6px rgba(0,0,0,0.04)',
          transition: 'border-color 0.18s, box-shadow 0.18s',
        }}>
          <span style={{
            position: 'absolute', top: '50%', transform: 'translateY(-50%)',
            right: 14, color: searchFocused ? '#8F1D2C' : '#B0A090', pointerEvents: 'none', display: 'flex', transition: 'color 0.18s',
          }}>
<svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/>
            </svg>
          </span>
          <input
            type="text"
            aria-label={isAr ? 'ابحث عن جهة رسمية' : 'Search official authorities'}
            placeholder={isAr ? 'ابحث عن جهة رسمية...' : 'Search official authorities...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={{
              width: '100%', padding: '11px 42px 11px 14px',
              border: 'none', borderRadius: 14, fontSize: 13.5,
              background: 'transparent', outline: 'none',
              fontFamily: 'inherit', color: '#191713',
            }}
          />
          {search && (
            <button type="button" aria-label={isAr ? 'مسح البحث' : 'Clear search'} onClick={() => setSearch('')} style={{
              position: 'absolute', top: '50%', transform: 'translateY(-50%)',
              left: 4, background: '#E6E2DC', border: 'none', borderRadius: '50%',
              width: 36, height: 36, cursor: 'pointer', color: '#69645C',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
<svg aria-hidden="true" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          )}
        </div>

        {/* Type filter chips */}
        <div className="type-chip-row" style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 16 }}>
          {TYPE_FILTERS.map(f => {
            const active = typeFilter === f.key
            return (
              <button type="button" key={f.key} aria-pressed={active} onClick={() => setTypeFilter(f.key)} className="type-chip"
                onTouchStart={e => {
                  e.currentTarget.style.background = active ? '#FDE8E8' : '#FEF9F9'
                  e.currentTarget.style.borderColor = active ? '#8F1D2C' : 'rgba(143,29,44,0.3)'
                }}
                onTouchEnd={e => {
                  e.currentTarget.style.background = active ? '#F8EDEF' : '#fff'
                  e.currentTarget.style.borderColor = active ? '#8F1D2C' : '#E6E2DC'
                }}
                style={{
                padding: '6px 14px', borderRadius: 20, border: '1.5px solid',
                fontSize: 11.5, fontWeight: 700, cursor: 'pointer',
                fontFamily: 'inherit', whiteSpace: 'nowrap', flexShrink: 0,
                borderColor: active ? '#8F1D2C' : '#E6E2DC',
                background: active ? '#F8EDEF' : '#fff',
                color: active ? '#8F1D2C' : '#69645C',
                transition: 'border-color 0.15s, background 0.15s, color 0.15s',
              }}>
                {isAr ? f.labelAr : f.labelEn}
              </button>
            )
          })}
        </div>

        {/* Results count — section header with accent */}
        <div aria-live="polite" aria-atomic="true" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <div style={{ width: 3.5, height: 16, borderRadius: 2, background: 'linear-gradient(180deg, #8F1D2C, #741622)', flexShrink: 0 }} />
          <span style={{ fontSize: 12.5, fontWeight: 800, color: '#191713', letterSpacing: '-0.2px' }}>
            {filtered.length === ALL_AUTHORITIES.length
              ? (isAr ? 'الجهات الرسمية' : 'Official Authorities')
              : (isAr ? `${filtered.length} جهة رسمية` : `${filtered.length} authorities`)}
          </span>
          {search && <span style={{ fontSize: 11, color: '#8F1D2C', fontWeight: 600 }}>— &quot;{search}&quot;</span>}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div role="status" style={{ textAlign: 'center', padding: '48px 16px', color: '#918B82' }}>
            <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}>
              <svg aria-hidden="true" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#D4C5B0" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
            </div>
            <p style={{ fontSize: 13.5, fontWeight: 700, color: '#69645C', margin: '0 0 6px' }}>{isAr ? 'لا توجد جهات مطابقة' : 'No matching authorities'}</p>
            <p style={{ fontSize: 12, color: '#918B82', margin: '0 0 16px' }}>{isAr ? 'جرّب كلمة مختلفة أو اسأل دليلك مباشرة' : 'Try a different word or ask Dalilak directly'}</p>
            <button type="button"
              onClick={() => router.push(`/?q=${encodeURIComponent(isAr ? `ما هي ${search || typeFilter !== 'all' ? `جهات من نوع ${typeFilter}` : 'الجهات الرسمية'} في لبنان؟` : `What are the ${search || typeFilter !== 'all' ? `${typeFilter} type` : 'official'} authorities in Lebanon?`)}`)}
              onTouchStart={e => { e.currentTarget.style.opacity = '0.82'; e.currentTarget.style.transform = 'scale(0.97)' }}
              onTouchEnd={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)' }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '9px 22px', borderRadius: 12,
                background: 'linear-gradient(135deg, #8F1D2C, #741622)',
                border: 'none', color: '#fff', fontSize: 12.5, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit',
                boxShadow: '0 2px 8px rgba(143,29,44,0.28)',
                transition: 'opacity 0.12s, transform 0.12s',
              }}>
              <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
              </svg>
              {isAr ? 'اسأل دليلك' : 'Ask Dalilak'}
            </button>
          </div>
        )}

        {/* Authority cards grid */}
        <div className="auth-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 12 }}>
          {filtered.map((auth, idx) => {
            const colors = TYPE_COLORS[auth.type] || TYPE_COLORS.other
            const typeLabel = isAr
              ? (TYPE_FILTERS.find(f => f.key === auth.type)?.labelAr || 'أخرى')
              : (TYPE_FILTERS.find(f => f.key === auth.type)?.labelEn || 'Other')
            return (
              <div key={auth.name_ar} className="auth-card"
                onTouchStart={e => { e.currentTarget.style.borderColor = 'rgba(143,29,44,0.4)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(143,29,44,0.10)'; e.currentTarget.style.transform = 'scale(0.985)' }}
                onTouchEnd={e => { e.currentTarget.style.borderColor = '#E6E2DC'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'scale(1)' }}
                style={{
                background: '#fff', border: '1.5px solid #E6E2DC',
                borderRadius: 18, padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                display: 'flex', flexDirection: 'column', gap: 0,
                animation: 'authEnter 0.22s cubic-bezier(0.22,1,0.36,1) both',
                animationDelay: `${Math.min(idx, 16) * 0.035}s`,
              }}>
                {/* Icon + name */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                    background: colors.bg, border: `1px solid ${colors.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: colors.color,
                  }}>
                    <TypeIcon type={auth.type} size={20} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 12.5, fontWeight: 800, color: '#191713', lineHeight: 1.35 }}>
                      {isAr ? auth.name_ar : (auth.name_en || auth.name_ar)}
                    </p>
                    <span style={{
                      fontSize: 10, fontWeight: 700, color: colors.color,
                      background: colors.bg, borderRadius: 10, padding: '2px 7px',
                      display: 'inline-block', marginTop: 4,
                    }}>
                      {typeLabel}
                    </span>
                  </div>
                </div>

                {/* Service count + categories */}
                <div style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                    <span style={{
                      fontSize: 10.5, color: '#69645C', background: '#F5F0EB',
                      borderRadius: 8, padding: '3px 9px', display: 'inline-flex', alignItems: 'center', gap: 4,
                    }}>
<svg aria-hidden="true" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                      </svg>
                      {auth.serviceCount} {isAr ? 'خدمة' : 'services'}
                    </span>
                    {auth.online_count > 0 && (
                      <span style={{
                        fontSize: 10.5, color: '#065F46', background: 'rgba(6,95,70,0.07)',
                        borderRadius: 8, padding: '3px 9px', display: 'inline-flex', alignItems: 'center', gap: 4,
                        border: '1px solid rgba(6,95,70,0.2)',
                      }}>
<svg aria-hidden="true" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                        </svg>
                        {auth.online_count} {isAr ? 'أونلاين' : 'online'}
                      </span>
                    )}
                  </div>
                  {/* Category tags — show first 2 */}
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {(isAr ? auth.categories : (auth.categories_en.length ? auth.categories_en : auth.categories)).slice(0, 2).map(cat => (
                      <span key={cat} style={{
                        fontSize: 9.5, color: '#7C6050', background: '#F5F0EB',
                        borderRadius: 6, padding: '2px 6px',
                      }}>{cat}</span>
                    ))}
                    {auth.categories.length > 2 && (
                      <span style={{ fontSize: 9.5, color: '#918B82' }}>+{auth.categories.length - 2}</span>
                    )}
                  </div>
                </div>

                {/* Contact info */}
                {(auth.phone || auth.working_hours) && (
                  <div style={{ marginBottom: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {auth.phone && (
                      <a href={`tel:${auth.phone}`} style={{
                        fontSize: 11, color: '#8F1D2C', textDecoration: 'none',
                        display: 'flex', alignItems: 'center', gap: 5, fontWeight: 600,
                      }}>
<svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                        </svg>
                        {auth.phone}
                      </a>
                    )}
                    {auth.working_hours && (
                      <span style={{ fontSize: 11, color: '#69645C', display: 'flex', alignItems: 'center', gap: 5 }}>
<svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2"/>
                        </svg>
                        {auth.working_hours}
                      </span>
                    )}
                  </div>
                )}

                {/* Footer: website + ask AI */}
                <div style={{ borderTop: '1px solid #E6E2DC', paddingTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                  {auth.website ? (
                    <a href={auth.website} target="_blank" rel="noopener noreferrer" style={{
                      fontSize: 10.5, color: '#8F1D2C', fontWeight: 700, textDecoration: 'none',
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                    }}>
<svg aria-hidden="true" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                      </svg>
                      {isAr ? 'الموقع الرسمي' : 'Official website'}
                    </a>
                  ) : (
                    <span style={{ fontSize: 10, color: '#C4B5A5' }}>{isAr ? 'بلا موقع' : 'No website'}</span>
                  )}
                  <button type="button" aria-label={`اسأل دليلك عن: ${isAr ? auth.name_ar : (auth.name_en || auth.name_ar)}`} onClick={() => askAI(auth.name_ar)}
                    onTouchStart={e => { e.currentTarget.style.background = '#FECACA' }}
                    onTouchEnd={e => { e.currentTarget.style.background = '#F8EDEF' }}
                    style={{
                    fontSize: 10.5, color: '#8F1D2C', fontWeight: 700,
                    background: '#F8EDEF', border: '1px solid rgba(143,29,44,0.15)',
                    borderRadius: 8, padding: '4px 10px', cursor: 'pointer',
                    fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4,
                  }}>
<svg aria-hidden="true" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                    </svg>
                    {isAr ? 'اسألني' : 'Ask'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

      </div>

      <div className="bottom-nav-wrapper"><BottomNav isAr={isAr} activeTab="services" /></div>
    </div>
  )
}
