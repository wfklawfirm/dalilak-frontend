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

const TYPE_ICONS: Record<string, string> = {
  ministry: '🏛️',
  registry: '📂',
  notary: '⚖️',
  court: '🔨',
  municipality: '🏙️',
  other: '🔸',
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
        icon="🏛️"
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
            ⚠️ {error}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <EmptyState
            icon="🏛️"
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
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: typeInfo.bg, border: `1px solid ${typeInfo.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                      {TYPE_ICONS[auth.type] || '🏛️'}
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
                        📋 {auth.proceduresHandled.length} {isAr ? 'معاملة' : 'procedures'}
                      </span>
                      {auth.confidence === 'high' && (
                        <span style={{ fontSize: 10, color: '#16a34a', background: '#F0FDF4', borderRadius: 6, padding: '2px 8px' }}>✅ {isAr ? 'موثوق' : 'Verified'}</span>
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
                      🌐 {isAr ? 'الموقع الرسمي ↗' : 'Official Website ↗'}
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
