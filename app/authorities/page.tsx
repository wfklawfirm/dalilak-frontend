'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import { authHeaders } from '@/lib/auth'
import { PageHeader, EmptyState, LoadingSkeleton } from '@/components/ui'

const API = process.env.NEXT_PUBLIC_API_URL || 'https://dalilak-backend-bvb9.onrender.com'

interface Authority {
  slug: string
  nameAr: string
  nameEn: string
  country: string
  type: string
  proceduresHandled: string[]
  formsLinked: string[]
  confidence: string
  website?: string
}

const TYPE_FILTERS = [
  { key: 'all', labelAr: 'الكل', labelEn: 'All' },
  { key: 'ministry', labelAr: 'وزارة', labelEn: 'Ministry' },
  { key: 'registry', labelAr: 'سجل', labelEn: 'Registry' },
  { key: 'notary', labelAr: 'كاتب عدل', labelEn: 'Notary' },
  { key: 'court', labelAr: 'محكمة', labelEn: 'Court' },
]

function TypeIcon({ type, size = 22 }: { type: string; size?: number }) {
  const s = { width: size, height: size } as const
  if (type === 'ministry') return <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
  if (type === 'registry') return <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h7a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/></svg>
  if (type === 'notary') return <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"/></svg>
  if (type === 'court') return <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"/></svg>
  if (type === 'municipality') return <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
  return <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
}

const TYPE_COLORS: Record<string, { color: string; bg: string }> = {
  ministry: { color: '#78350F', bg: '#FFFBEB' },
  registry: { color: '#8B1A1A', bg: '#FEF2F2' },
  notary: { color: '#B8860B', bg: '#FFFBEB' },
  court: { color: '#DC2626', bg: '#FEF2F2' },
  municipality: { color: '#16a34a', bg: '#F0FDF4' },
  other: { color: '#6B7280', bg: '#F5F5F5' },
}

export default function AuthoritiesPage() {
  const router = useRouter()
  const [lang, setLang] = useState<'ar' | 'en'>('ar')
  const [authorities, setAuthorities] = useState<Authority[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState('all')
  const isAr = lang === 'ar'

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`${API}/authorities`, { headers: authHeaders() })
        if (!res.ok) throw new Error('فشل تحميل الجهات')
        const data = await res.json()
        setAuthorities(data.authorities || [])
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'خطأ في التحميل')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = typeFilter === 'all' ? authorities : authorities.filter(a => a.type === typeFilter)

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: "'Cairo','Inter',sans-serif" }} dir={isAr ? 'rtl' : 'ltr'}>
      <style>{`* { box-sizing: border-box; } ::-webkit-scrollbar { width: 3px; } ::-webkit-scrollbar-thumb { background: #EAE4D9; }`}</style>

      <PageHeader
        icon=""
        titleAr="دليل الجهات الرسمية"
        titleEn="Official Authorities Directory"
        subtitleAr="الوزارات والسجلات والجهات الحكومية اللبنانية"
        subtitleEn="Lebanese ministries, registries, and government bodies"
        isAr={isAr}
        onBack={() => router.push('/')}
        rightSlot={
          <button onClick={() => setLang(l => l === 'ar' ? 'en' : 'ar')} style={{ background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.3)', color: '#fff', borderRadius: 20, padding: '5px 12px', cursor: 'pointer', fontSize: 11, fontFamily: 'inherit', fontWeight: 700 }}>
            {isAr ? 'EN' : 'AR'}
          </button>
        }
      />

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '16px 14px 100px' }}>

        {/* Type filters */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 16 }}>
          {TYPE_FILTERS.map(f => (
            <button key={f.key} onClick={() => setTypeFilter(f.key)} style={{
              padding: '6px 14px',
              borderRadius: 20,
              border: '1.5px solid',
              fontSize: 11.5,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              borderColor: typeFilter === f.key ? '#8B1A1A' : '#EAE4D9',
              background: typeFilter === f.key ? '#FEF2F2' : '#fff',
              color: typeFilter === f.key ? '#8B1A1A' : '#6B7280',
            }}>
              {isAr ? f.labelAr : f.labelEn}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && <LoadingSkeleton lines={4} height={90} />}

        {/* Error */}
        {error && (
          <div style={{ background: '#FEF2F2', border: '1.5px solid #FECACA', borderRadius: 12, padding: '14px 16px', color: '#B91C1C', fontSize: 13, marginBottom: 14 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: 6, flexShrink: 0 }}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg> {error}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <EmptyState
            icon={<TypeIcon type="ministry" size={40} />}
            titleAr="لا توجد جهات في هذه الفئة"
            titleEn="No authorities in this category"
            isAr={isAr}
          />
        )}

        {/* Results count */}
        {!loading && filtered.length > 0 && (
          <p style={{ fontSize: 11.5, color: '#9C8E80', margin: '0 0 12px' }}>
            {filtered.length} {isAr ? 'جهة رسمية' : 'official authorities'}
          </p>
        )}

        {/* Authority cards grid */}
        {!loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
            {filtered.map(auth => {
              const typeInfo = TYPE_COLORS[auth.type] || TYPE_COLORS.other
              return (
                <div key={auth.slug} style={{ background: '#fff', border: '1.5px solid #EAE4D9', borderRadius: 16, padding: '16px', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: typeInfo.bg, border: `1px solid ${typeInfo.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: typeInfo.color, flexShrink: 0 }}>
                      <TypeIcon type={auth.type} size={22} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 800, color: '#1A1208', margin: '0 0 4px', lineHeight: 1.3 }}>
                        {isAr ? auth.nameAr : auth.nameEn}
                      </p>
                      <span style={{ fontSize: 10, fontWeight: 700, color: typeInfo.color, background: typeInfo.bg, borderRadius: 8, padding: '2px 8px' }}>
                        {isAr ? (TYPE_FILTERS.find(f => f.key === auth.type)?.labelAr || auth.type) : (TYPE_FILTERS.find(f => f.key === auth.type)?.labelEn || auth.type)}
                      </span>
                    </div>
                  </div>

                  {/* Procedures count */}
                  {auth.proceduresHandled.length > 0 && (
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
                      <span style={{ fontSize: 10, color: '#6B7280', background: '#F5F5F5', borderRadius: 6, padding: '2px 8px' }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: 3 }}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg> {auth.proceduresHandled.length} {isAr ? 'معاملة' : 'procedures'}
                      </span>
                      {auth.confidence === 'high' && (
                        <span style={{ fontSize: 10, color: '#16a34a', background: '#F0FDF4', borderRadius: 6, padding: '2px 8px', display: 'inline-flex', alignItems: 'center', gap: 3 }}><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>{isAr ? 'موثوق' : 'Verified'}</span>
                      )}
                    </div>
                  )}

                  {/* Procedures list (first 3) */}
                  {auth.proceduresHandled.length > 0 && (
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
                      {auth.proceduresHandled.slice(0, 3).map(proc => (
                        <span key={proc} style={{ fontSize: 9.5, color: '#6B7280', background: '#F9FAFB', border: '1px solid #EAE4D9', borderRadius: 6, padding: '1px 7px' }}>{proc}</span>
                      ))}
                      {auth.proceduresHandled.length > 3 && (
                        <span style={{ fontSize: 9.5, color: '#9CA3AF', borderRadius: 6, padding: '1px 7px' }}>+{auth.proceduresHandled.length - 3}</span>
                      )}
                    </div>
                  )}

                  {/* Website */}
                  {auth.website && (
                    <a href={auth.website} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11.5, color: '#8B1A1A', textDecoration: 'none', fontWeight: 600 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 004 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> {isAr ? 'الموقع الرسمي ↗' : 'Official Website ↗'}
                    </a>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Bottom Nav — mobile */}
      <div className="bottom-nav-wrapper">
        <BottomNav isAr={isAr} activeTab="home" onHomeClick={() => router.push('/')} />
      </div>
    </div>
  )
}
