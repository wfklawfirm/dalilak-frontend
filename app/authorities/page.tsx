'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import { ALL_SERVICES, SERVICE_CATEGORIES } from '@/lib/allServices'

// ── Derive unique authorities from local services data ─────────────────────
interface DerivedAuthority {
  name_ar: string
  type: string
  serviceCount: number
  categories: string[]
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
        type,
        serviceCount: 0,
        categories: [],
        website: svc.website || undefined,
        phone: svc.phone || undefined,
        working_hours: svc.working_hours || undefined,
        online_count: 0,
      })
    }
    const entry = map.get(key)!
    entry.serviceCount++
    if (svc.online_available) entry.online_count++
    if (!entry.categories.includes(svc.category)) entry.categories.push(svc.category)
    if (!entry.website && svc.website) entry.website = svc.website
    if (!entry.phone && svc.phone) entry.phone = svc.phone
    if (!entry.working_hours && svc.working_hours) entry.working_hours = svc.working_hours
  }
  return Array.from(map.values()).sort((a, b) => b.serviceCount - a.serviceCount)
}

const ALL_AUTHORITIES = deriveAuthorities()

const TYPE_FILTERS = [
  { key: 'all', labelAr: 'الكل' },
  { key: 'ministry', labelAr: 'وزارة' },
  { key: 'council', labelAr: 'هيئة ومجلس' },
  { key: 'municipality', labelAr: 'بلدية' },
  { key: 'court', labelAr: 'قضاء' },
  { key: 'union', labelAr: 'نقابة' },
  { key: 'bank', labelAr: 'مصرف' },
  { key: 'security', labelAr: 'أمن' },
  { key: 'other', labelAr: 'أخرى' },
]

const TYPE_COLORS: Record<string, { color: string; bg: string; border: string }> = {
  ministry:     { color: '#78350F', bg: '#FFFBEB', border: '#FDE68A' },
  council:      { color: '#8B1A1A', bg: '#FEF2F2', border: '#FECACA' },
  municipality: { color: '#5C4A3A', bg: '#F5F0EB', border: '#D5CEC4' },
  court:        { color: '#6B21A8', bg: '#F5F3FF', border: '#DDD6FE' },
  union:        { color: '#92400E', bg: '#FFF7ED', border: '#FED7AA' },
  bank:         { color: '#B45309', bg: '#FEF3C7', border: '#FCD34D' },
  security:     { color: '#44403C', bg: '#F5F5F4', border: '#D4D0CA' },
  other:        { color: '#5C4A3A', bg: '#FAFAF8', border: '#EAE4D9' },
}

function TypeIcon({ type, size = 20 }: { type: string; size?: number }) {
  const s = { width: size, height: size, flexShrink: 0 as const }
  if (type === 'ministry') return (
    <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
    </svg>
  )
  if (type === 'council') return (
    <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"/>
    </svg>
  )
  if (type === 'court') return (
    <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"/>
    </svg>
  )
  if (type === 'municipality') return (
    <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
    </svg>
  )
  if (type === 'union') return (
    <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
    </svg>
  )
  if (type === 'bank') return (
    <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
    </svg>
  )
  if (type === 'security') return (
    <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
    </svg>
  )
  return (
    <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
    </svg>
  )
}

export default function AuthoritiesPage() {
  const router = useRouter()
  const [typeFilter, setTypeFilter] = useState('all')
  const [search, setSearch] = useState('')

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
    router.push(`/?q=${encodeURIComponent(`ما هي خدمات ${name} وكيف أتواصل معها؟`)}`)

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: "'Cairo','Inter',sans-serif" }} dir="rtl">
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: #EAE4D9; border-radius: 2px; }
        .auth-card { transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s; }
        .auth-card:hover { border-color: #8B1A1A !important; box-shadow: 0 4px 20px rgba(139,26,26,0.12) !important; transform: translateY(-1px); }
        .type-chip:hover { opacity: 0.85; }
        .type-chip-row { -ms-overflow-style: none; scrollbar-width: none; }
        .type-chip-row::-webkit-scrollbar { display: none; }
        @media (max-width: 480px) { .auth-grid { grid-template-columns: 1fr !important; } }
        @media (min-width: 481px) and (max-width: 720px) { .auth-grid { grid-template-columns: repeat(2, 1fr) !important; } }
      `}</style>

      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #6b2737 0%, #8B1A1A 60%, #7a1818 100%)',
        padding: '13px 16px', position: 'sticky', top: 0, zIndex: 50,
        boxShadow: '0 4px 24px rgba(80,10,10,0.3)',
      }}>
        <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => router.push('/')} style={{
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 9, color: '#fff', cursor: 'pointer', padding: '6px 8px',
            display: 'flex', flexShrink: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, flex: 1 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9,
              background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0,
            }}>
              <img src="/logo.PNG" alt="دليلك" style={{ width: 24, height: 24, objectFit: 'contain' }} />
            </div>
            <div>
              <h1 style={{ color: '#fff', fontSize: 15, fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
                دليل الجهات الرسمية
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 10, margin: 0 }}>
                {stats.total} جهة · {stats.totalServices} خدمة · {stats.ministries} وزارة
              </p>
            </div>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '16px 14px 100px' }}>

        {/* Stats banner */}
        <div style={{
          background: 'linear-gradient(135deg, #FEF2F2, #FFF7F7)',
          border: '1px solid rgba(139,26,26,0.12)', borderRadius: 16,
          padding: '12px 16px', marginBottom: 16,
          display: 'flex', gap: 0, alignItems: 'stretch',
        }}>
          {[
            { value: String(stats.total), label: 'جهة رسمية' },
            { value: String(stats.ministries), label: 'وزارة' },
            { value: String(stats.withOnline), label: 'خدمات أونلاين' },
            { value: String(stats.totalServices), label: 'خدمة موثّقة' },
          ].map((s, i) => (
            <div key={s.label} style={{
              flex: 1, textAlign: 'center', padding: '4px 8px',
              borderRight: i < 3 ? '1px solid rgba(139,26,26,0.12)' : 'none',
            }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#8B1A1A', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 9.5, color: '#5C4A3A', marginTop: 3, fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div style={{
          position: 'relative', marginBottom: 12,
          background: '#fff', border: '1.5px solid #EAE4D9', borderRadius: 14,
          boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
        }}>
          <span style={{
            position: 'absolute', top: '50%', transform: 'translateY(-50%)',
            right: 14, color: '#B0A090', pointerEvents: 'none', display: 'flex',
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/>
            </svg>
          </span>
          <input
            type="text"
            placeholder="ابحث عن جهة رسمية..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '11px 42px 11px 14px',
              border: 'none', borderRadius: 14, fontSize: 13.5,
              background: 'transparent', outline: 'none',
              fontFamily: 'inherit', color: '#1A1208',
            }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{
              position: 'absolute', top: '50%', transform: 'translateY(-50%)',
              left: 12, background: '#EAE4D9', border: 'none', borderRadius: '50%',
              width: 20, height: 20, cursor: 'pointer', color: '#5C4A3A',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
              <button key={f.key} onClick={() => setTypeFilter(f.key)} className="type-chip" style={{
                padding: '6px 14px', borderRadius: 20, border: '1.5px solid',
                fontSize: 11.5, fontWeight: 700, cursor: 'pointer',
                fontFamily: 'inherit', whiteSpace: 'nowrap', flexShrink: 0,
                borderColor: active ? '#8B1A1A' : '#EAE4D9',
                background: active ? '#FEF2F2' : '#fff',
                color: active ? '#8B1A1A' : '#5C4A3A',
                transition: 'all 0.15s',
              }}>
                {f.labelAr}
              </button>
            )
          })}
        </div>

        {/* Results count */}
        <p style={{ fontSize: 11.5, color: '#9C8E80', margin: '0 0 12px' }}>
          {filtered.length} جهة رسمية
          {search && <span style={{ color: '#8B1A1A', fontWeight: 600 }}> — &quot;{search}&quot;</span>}
        </p>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 16px', color: '#9C8E80' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#EAE4D9" strokeWidth="1.5" style={{ marginBottom: 12 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
            <p style={{ fontSize: 13, margin: 0 }}>لا توجد جهات مطابقة</p>
          </div>
        )}

        {/* Authority cards grid */}
        <div className="auth-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 12 }}>
          {filtered.map(auth => {
            const colors = TYPE_COLORS[auth.type] || TYPE_COLORS.other
            const typeLabel = TYPE_FILTERS.find(f => f.key === auth.type)?.labelAr || 'أخرى'
            return (
              <div key={auth.name_ar} className="auth-card" style={{
                background: '#fff', border: '1.5px solid #EAE4D9',
                borderRadius: 18, padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                display: 'flex', flexDirection: 'column', gap: 0,
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
                    <p style={{ margin: 0, fontSize: 12.5, fontWeight: 800, color: '#1A1208', lineHeight: 1.35 }}>
                      {auth.name_ar}
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
                      fontSize: 10.5, color: '#5C4A3A', background: '#F5F0EB',
                      borderRadius: 8, padding: '3px 9px', display: 'inline-flex', alignItems: 'center', gap: 4,
                    }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                      </svg>
                      {auth.serviceCount} خدمة
                    </span>
                    {auth.online_count > 0 && (
                      <span style={{
                        fontSize: 10.5, color: '#065F46', background: '#ECFDF5',
                        borderRadius: 8, padding: '3px 9px', display: 'inline-flex', alignItems: 'center', gap: 4,
                        border: '1px solid #A7F3D0',
                      }}>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                        </svg>
                        {auth.online_count} أونلاين
                      </span>
                    )}
                  </div>
                  {/* Category tags — show first 2 */}
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {auth.categories.slice(0, 2).map(cat => (
                      <span key={cat} style={{
                        fontSize: 9.5, color: '#7C6050', background: '#F5F0EB',
                        borderRadius: 6, padding: '2px 6px',
                      }}>{cat}</span>
                    ))}
                    {auth.categories.length > 2 && (
                      <span style={{ fontSize: 9.5, color: '#9C8E80' }}>+{auth.categories.length - 2}</span>
                    )}
                  </div>
                </div>

                {/* Contact info */}
                {(auth.phone || auth.working_hours) && (
                  <div style={{ marginBottom: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {auth.phone && (
                      <a href={`tel:${auth.phone}`} style={{
                        fontSize: 11, color: '#8B1A1A', textDecoration: 'none',
                        display: 'flex', alignItems: 'center', gap: 5, fontWeight: 600,
                      }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                        </svg>
                        {auth.phone}
                      </a>
                    )}
                    {auth.working_hours && (
                      <span style={{ fontSize: 11, color: '#5C4A3A', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2"/>
                        </svg>
                        {auth.working_hours}
                      </span>
                    )}
                  </div>
                )}

                {/* Footer: website + ask AI */}
                <div style={{ borderTop: '1px solid #EAE4D9', paddingTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                  {auth.website ? (
                    <a href={auth.website} target="_blank" rel="noopener noreferrer" style={{
                      fontSize: 10.5, color: '#8B1A1A', fontWeight: 700, textDecoration: 'none',
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                    }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                      </svg>
                      الموقع الرسمي
                    </a>
                  ) : (
                    <span style={{ fontSize: 10, color: '#C4B5A5' }}>بلا موقع</span>
                  )}
                  <button onClick={() => askAI(auth.name_ar)} style={{
                    fontSize: 10.5, color: '#8B1A1A', fontWeight: 700,
                    background: '#FEF2F2', border: '1px solid rgba(139,26,26,0.15)',
                    borderRadius: 8, padding: '4px 10px', cursor: 'pointer',
                    fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                    </svg>
                    اسألني
                  </button>
                </div>
              </div>
            )
          })}
        </div>

      </div>

      <BottomNav isAr={true} activeTab="services" />
    </div>
  )
}
