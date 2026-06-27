'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { PROCEDURES_DATA, getComplexityColor, getComplexityBg, getComplexityLabel } from '@/lib/procedures'

const CATEGORIES = [
  { slug: 'all', ar: 'الكل', en: 'All' },
  { slug: 'travel', ar: 'سفر وهوية', en: 'Travel & Identity' },
  { slug: 'civil-status', ar: 'الأحوال الشخصية', en: 'Civil Status' },
  { slug: 'business', ar: 'الأعمال', en: 'Business' },
  { slug: 'real-estate', ar: 'العقارات', en: 'Real Estate' },
  { slug: 'vehicles', ar: 'المركبات', en: 'Vehicles' },
  { slug: 'work-social', ar: 'العمل والضمان', en: 'Work & Social' },
  { slug: 'attestation', ar: 'توثيق وتصديق', en: 'Attestation' },
]

export default function ProceduresPage() {
  const router = useRouter()
  const [lang, setLang] = useState<'ar' | 'en'>('ar')
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeComplexity, setActiveComplexity] = useState('all')
  const isAr = lang === 'ar'

  const filtered = useMemo(() => {
    let list = PROCEDURES_DATA.filter(p => p.status === 'active')
    if (activeCategory !== 'all') list = list.filter(p => p.categorySlug === activeCategory)
    if (activeComplexity !== 'all') list = list.filter(p => p.complexity === activeComplexity)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(p =>
        p.title_ar.includes(search) || p.title_en.toLowerCase().includes(q) ||
        p.description_ar.includes(search) || p.tags.some(t => t.toLowerCase().includes(q))
      )
    }
    return list
  }, [search, activeCategory, activeComplexity])

  const handleProcedure = (slug: string) => router.push(`/procedures/${slug}`)

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: "'Cairo', 'Inter', sans-serif" }} dir={isAr ? 'rtl' : 'ltr'}>
      <style>{`* { box-sizing: border-box; } ::-webkit-scrollbar { width: 3px; } ::-webkit-scrollbar-thumb { background: #EAE4D9; }`}</style>

      {/* Header */}
      <header style={{ background: 'linear-gradient(135deg, #7a1a1a 0%, #8B1A1A 60%, #7a1a1a 100%)', padding: '12px 16px', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => router.push('/')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', borderRadius: 20, padding: '5px 12px', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
            {isAr ? 'الرئيسية' : 'Home'}
          </button>
          <h1 style={{ color: '#fff', fontSize: 15, fontWeight: 700, margin: 0 }}>{isAr ? 'دليل المعاملات' : 'Procedures Directory'}</h1>
          <button onClick={() => setLang(l => l === 'ar' ? 'en' : 'ar')} style={{ background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.3)', color: '#fff', borderRadius: 20, padding: '5px 12px', cursor: 'pointer', fontSize: 11, fontFamily: 'inherit', fontWeight: 700 }}>
            {isAr ? 'EN' : 'AR'}
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '16px 14px 100px' }}>

        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: 14, padding: '10px 14px', marginBottom: 14, boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9C8E80" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={isAr ? 'ابحث عن معاملة...' : 'Search procedures...'} dir={isAr ? 'rtl' : 'ltr'}
            style={{ border: 'none', background: 'none', outline: 'none', flex: 1, fontSize: 13.5, color: '#1A1208', fontFamily: 'inherit' }} />
          {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9C8E80', fontSize: 16, lineHeight: 1 }}>×</button>}
        </div>

        {/* Category filters */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 10, paddingBottom: 4 }}>
          {CATEGORIES.map(cat => (
            <button key={cat.slug} onClick={() => setActiveCategory(cat.slug)} style={{
              whiteSpace: 'nowrap', padding: '5px 13px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', border: '1.5px solid',
              borderColor: activeCategory === cat.slug ? '#8B1A1A' : '#EAE4D9',
              background: activeCategory === cat.slug ? '#FEF2F2' : '#fff',
              color: activeCategory === cat.slug ? '#8B1A1A' : '#6B7280',
              transition: 'all 0.15s',
            }}>
              {isAr ? cat.ar : cat.en}
            </button>
          ))}
        </div>

        {/* Complexity filters */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {[
            { slug: 'all', ar: 'جميع المستويات', en: 'All levels' },
            { slug: 'easy', ar: '🟢 سهل', en: '🟢 Easy' },
            { slug: 'medium', ar: '🟡 متوسط', en: '🟡 Medium' },
            { slug: 'complex', ar: '🔴 معقد', en: '🔴 Complex' },
          ].map(c => (
            <button key={c.slug} onClick={() => setActiveComplexity(c.slug)} style={{
              padding: '4px 11px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', border: '1.5px solid',
              borderColor: activeComplexity === c.slug ? '#8B1A1A' : '#EAE4D9',
              background: activeComplexity === c.slug ? '#FEF2F2' : '#fff',
              color: activeComplexity === c.slug ? '#8B1A1A' : '#6B7280',
            }}>
              {isAr ? c.ar : c.en}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p style={{ fontSize: 11, color: '#9C8E80', marginBottom: 12 }}>
          {isAr ? `${filtered.length} معاملة` : `${filtered.length} procedures`}
        </p>

        {/* Procedure cards */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: '#9C8E80' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <p style={{ fontSize: 14, fontWeight: 600 }}>{isAr ? 'لم نجد نتائج' : 'No results found'}</p>
            <p style={{ fontSize: 12, marginTop: 4 }}>{isAr ? 'جرب كلمة بحث مختلفة' : 'Try a different search term'}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map((proc) => (
              <button key={proc.slug} onClick={() => handleProcedure(proc.slug)} style={{
                display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', borderRadius: 16,
                background: '#fff', border: '1.5px solid #EAE4D9', cursor: 'pointer', fontFamily: 'inherit',
                textAlign: isAr ? 'right' : 'left', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', transition: 'all 0.15s', width: '100%',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#8B1A1A'; e.currentTarget.style.boxShadow = '0 3px 12px rgba(139,26,26,0.1)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#EAE4D9'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)' }}
              onTouchStart={e => { e.currentTarget.style.background = '#FEF2F2' }}
              onTouchEnd={e => { e.currentTarget.style.background = '#fff' }}>
                {/* Icon */}
                <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: 'linear-gradient(135deg, #FEF2F2 0%, #FDE8E8 100%)', border: '1px solid rgba(139,26,26,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                  {proc.icon}
                </div>
                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', marginBottom: 3 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: '#1A1208' }}>
                      {isAr ? proc.title_ar : proc.title_en}
                    </span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: getComplexityColor(proc.complexity), background: getComplexityBg(proc.complexity), borderRadius: 8, padding: '1px 7px', flexShrink: 0 }}>
                      {getComplexityLabel(proc.complexity, isAr)}
                    </span>
                  </div>
                  <p style={{ fontSize: 11, color: '#9C8E80', margin: '0 0 6px', lineHeight: 1.5 }}>
                    {isAr ? proc.description_ar : proc.description_en}
                  </p>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 10, color: '#6B7280', background: '#F5F5F5', borderRadius: 8, padding: '1px 7px' }}>
                      {isAr ? proc.category_ar : proc.category_en}
                    </span>
                    {proc.estimatedDuration_ar && (
                      <span style={{ fontSize: 10, color: '#6B7280', background: '#F5F5F5', borderRadius: 8, padding: '1px 7px' }}>
                        ⏱️ {isAr ? proc.estimatedDuration_ar : proc.estimatedDuration_en}
                      </span>
                    )}
                    {proc.forms.length > 0 && (
                      <span style={{ fontSize: 10, color: '#854D0E', background: '#FEFCE8', borderRadius: 8, padding: '1px 7px', border: '1px solid #FEF08A' }}>
                        📄 {isAr ? 'نموذج متوفر' : 'Form available'}
                      </span>
                    )}
                  </div>
                </div>
                {/* Arrow */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9C8E80" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2, transform: isAr ? 'rotate(180deg)' : 'none' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6"/>
                </svg>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
