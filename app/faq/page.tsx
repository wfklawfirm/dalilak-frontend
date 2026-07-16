'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import { SERVICE_FAQ, FAQ_CATEGORIES, searchFAQ, type FAQItem } from '@/lib/serviceFAQ'

export default function FAQPage() {
  const router = useRouter()
  const [lang, setLang] = useState<'ar' | 'en'>('ar')
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [searchFocused, setSearchFocused] = useState(false)
  const isAr = lang === 'ar'

  const filtered = useMemo(() => {
    let items = searchFAQ(search)
    if (catFilter !== 'all') items = items.filter(f => f.category === catFilter)
    return items
  }, [search, catFilter])

  const askAI = (prompt: string) => router.push(`/?q=${encodeURIComponent(prompt)}`)

  function FaqCatIcon({ cat, size = 16 }: { cat: string; size?: number }) {
    const s = { width: size, height: size, flexShrink: 0 as const, 'aria-hidden': true as const }
    if (cat === 'الطوارئ والأرقام المهمة') return <svg aria-hidden="true" {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
    if (cat === 'الخدمات البلدية') return <svg aria-hidden="true" {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
    if (cat === 'أسئلة شائعة') return <svg aria-hidden="true" {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
    if (cat === 'قانون العمل') return <svg aria-hidden="true" {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
    if (cat === 'الخدمات الاجتماعية') return <svg aria-hidden="true" {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
    if (cat === 'المعاملات العقارية') return <svg aria-hidden="true" {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
    if (cat === 'الخدمات العامة والمرافق') return <svg aria-hidden="true" {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
    if (cat === 'مراجع قانونية') return <svg aria-hidden="true" {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
    if (cat === 'جدول الرسوم') return <svg aria-hidden="true" {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
    if (cat === 'حقوق الأجانب في لبنان') return <svg aria-hidden="true" {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 004 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
    if (cat === 'السجل المدني والأحوال الشخصية') return <svg aria-hidden="true" {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c0 3-3 4-3 4h6s-3-1-3-4"/></svg>
    if (cat === 'الضمان الاجتماعي والتأمينات') return <svg aria-hidden="true" {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
    if (cat === 'الجمارك والاستيراد') return <svg aria-hidden="true" {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
    if (cat === 'الضرائب والمالية العامة') return <svg aria-hidden="true" {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"/></svg>
    if (cat === 'الصحة والترخيص المهني') return <svg aria-hidden="true" {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
    if (cat === 'الأشغال العامة والنقل') return <svg aria-hidden="true" {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
    if (cat === 'التوثيق والشهر العقاري') return <svg aria-hidden="true" {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
    return <svg aria-hidden="true" {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: "'Cairo','Inter',sans-serif" }} dir="rtl">
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 3px; height: 3px; }
        ::-webkit-scrollbar-thumb { background: #EAE4D9; }
        .faq-card:hover { border-color: #8B1A1A !important; }
        .faq-chip-row { -ms-overflow-style: none; scrollbar-width: none; }
        .faq-chip-row::-webkit-scrollbar { display: none; }
        @keyframes faqHeaderIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes faqEnter { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 400px) { .faq-stats { grid-template-columns: repeat(3, 1fr) !important; gap: 6px !important; } }
      `}</style>

      {/* Header */}
      <header style={{ background: 'linear-gradient(135deg, #6b2737 0%, #8B1A1A 60%, #7a1818 100%)', padding: '14px 16px', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 4px 24px rgba(80,10,10,0.3)', animation: 'faqHeaderIn 0.3s cubic-bezier(0.22,1,0.36,1) both' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <button type="button" aria-label="الرئيسية" onClick={() => router.push('/')}
            onTouchStart={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.22)' }}
            onTouchEnd={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 9, color: '#fff', cursor: 'pointer', padding: '6px 8px', display: 'flex', flexShrink: 0 }}>
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: isAr ? 'scaleX(-1)' : 'none', display: 'block' }}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, flex: 1 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
              <img src="/logo.PNG" alt="دليلك" style={{ width: 24, height: 24, objectFit: 'contain', display: 'block' }} />
            </div>
            <div>
              <h1 style={{ color: '#fff', fontSize: 15, fontWeight: 800, margin: 0, lineHeight: 1.2 }}>{isAr ? 'الأسئلة الشائعة' : 'FAQ & Guide'}</h1>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, margin: 0 }}>{isAr ? `${SERVICE_FAQ.length} سؤال · أرقام طوارئ · قانون العمل` : `${SERVICE_FAQ.length} questions · emergency numbers · labor law`}</p>
            </div>
          </div>
          <button type="button" onClick={() => setLang(l => l === 'ar' ? 'en' : 'ar')} aria-label="تغيير اللغة" style={{ background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.25)', color: '#fff', borderRadius: 9, padding: '5px 12px', cursor: 'pointer', fontSize: 11, fontFamily: 'inherit', fontWeight: 700, flexShrink: 0 }}>
            {isAr ? 'EN' : 'AR'}
          </button>
        </div>
      </header>

      <div id="main-content" style={{ maxWidth: 720, margin: '0 auto', padding: '14px 14px 100px' }}>

        {/* Stats — premium individual cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
          {[
            { labelAr: 'سؤال عملي', labelEn: 'Questions', value: String(SERVICE_FAQ.length), featured: true },
            { labelAr: 'فئة خدمية', labelEn: 'Categories', value: String(FAQ_CATEGORIES.length), featured: false },
            { labelAr: 'رقم طوارئ', labelEn: 'Emergency', value: '10+', featured: false },
          ].map(({ labelAr, labelEn, value, featured }, i) => (
            <div key={labelAr} style={{
              padding: '14px 8px 16px', textAlign: 'center',
              background: featured ? 'linear-gradient(135deg, #FEF2F2 0%, #FDE4E4 100%)' : '#fff',
              border: featured ? '1.5px solid rgba(139,26,26,0.18)' : '1.5px solid #EAE4D9',
              borderRadius: 12,
              boxShadow: featured ? '0 2px 10px rgba(139,26,26,0.09)' : '0 1px 5px rgba(0,0,0,0.05)',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              animation: 'faqEnter 0.28s cubic-bezier(0.22,1,0.36,1) both',
              animationDelay: `${0.06 + i * 0.07}s`,
            }}>
              <div style={{ fontSize: 'clamp(18px,5vw,22px)', fontWeight: 900, color: '#8B1A1A', lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: 9.5, color: '#9C8E80', marginTop: 4, fontWeight: 500 }}>{isAr ? labelAr : labelEn}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="search-wrap" style={{ position: 'relative', marginBottom: 12, border: `1.5px solid ${searchFocused ? '#8B1A1A' : '#EAE4D9'}`, borderRadius: 14, background: '#fff', transition: 'border-color 0.18s, box-shadow 0.18s', boxShadow: searchFocused ? '0 0 0 3px rgba(139,26,26,0.08), 0 2px 12px rgba(139,26,26,0.06)' : 'none' }}>
          <span style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: 14, color: searchFocused ? '#8B1A1A' : '#B0A090', pointerEvents: 'none', display: 'flex', transition: 'color 0.18s' }}>
<svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/></svg>
          </span>
          <input type="text" aria-label="ابحث في الأسئلة الشائعة" placeholder="ابحث... (طوارئ، بناء، عمل، أجانب...)"
            value={search} onChange={e => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={{ width: '100%', padding: '11px 42px 11px 14px', border: 'none', borderRadius: 14, fontSize: 13, background: 'transparent', outline: 'none', fontFamily: 'inherit', color: '#1A1208', direction: 'rtl' }}
          />
          {search && <button type="button" aria-label="مسح البحث" onClick={() => setSearch('')} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: 12, background: '#EAE4D9', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', color: '#5C4A3A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg aria-hidden="true" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12"/></svg></button>}
        </div>

        {/* Category filters */}
        <div className="faq-chip-row" style={{ display: 'flex', gap: 5, overflowX: 'auto', paddingBottom: 4, marginBottom: 14 }}>
          <button type="button" aria-pressed={catFilter === 'all'} onClick={() => setCatFilter('all')}
            onTouchStart={e => { e.currentTarget.style.transform = 'scale(0.95)'; e.currentTarget.style.opacity = '0.85' }}
            onTouchEnd={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '1' }}
            style={{
              padding: '5px 13px', borderRadius: 20, border: '1.5px solid', whiteSpace: 'nowrap',
              fontSize: 10.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
              transition: 'transform 0.12s, opacity 0.12s',
              borderColor: catFilter === 'all' ? '#8B1A1A' : '#EAE4D9',
              background: catFilter === 'all' ? '#FEF2F2' : '#fff',
              color: catFilter === 'all' ? '#8B1A1A' : '#5C4A3A',
          }}>
            {isAr ? `الكل (${SERVICE_FAQ.length})` : `All (${SERVICE_FAQ.length})`}
          </button>
          {FAQ_CATEGORIES.map(cat => (
            <button type="button" key={cat} aria-pressed={catFilter === cat} onClick={() => setCatFilter(cat)}
              onTouchStart={e => { e.currentTarget.style.transform = 'scale(0.95)'; e.currentTarget.style.opacity = '0.85' }}
              onTouchEnd={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '1' }}
              style={{
                padding: '4px 10px', borderRadius: 20, border: '1.5px solid', whiteSpace: 'nowrap',
                fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
                display: 'inline-flex', alignItems: 'center', gap: 4,
                transition: 'transform 0.12s, opacity 0.12s',
                borderColor: catFilter === cat ? '#8B1A1A' : '#EAE4D9',
                background: catFilter === cat ? '#FEF2F2' : '#fff',
                color: catFilter === cat ? '#8B1A1A' : '#5C4A3A',
              }}>
              <FaqCatIcon cat={cat} size={11} />
              {cat.length > 20 ? cat.slice(0, 20) + '…' : cat}
            </button>
          ))}
        </div>

        {/* Results count */}
        <div aria-live="polite" aria-atomic="true" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 3.5, height: 16, borderRadius: 2, background: 'linear-gradient(180deg, #8B1A1A, #6b2737)', flexShrink: 0 }} />
            <span style={{ fontSize: 12.5, fontWeight: 800, color: '#1A1208', letterSpacing: '-0.2px' }}>
              {filtered.length === SERVICE_FAQ.length
                ? (isAr ? 'الأسئلة الشائعة' : 'FAQ')
                : `${filtered.length} ${isAr ? 'سؤال' : 'questions'}`}
            </span>
          </div>
          {catFilter !== 'all' && (
            <span style={{ fontSize: 11, color: '#8B1A1A', fontWeight: 600 }}>— {catFilter}</span>
          )}
          {search && (
            <span style={{ fontSize: 11, color: '#8B1A1A', fontWeight: 600 }}>— &quot;{search}&quot;</span>
          )}
        </div>

        {/* FAQ Accordion */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: '#9C8E80' }}>
            <div style={{ marginBottom: 12, color: '#C4B5A5' }}>
              <svg aria-hidden="true" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/>
              </svg>
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, margin: '0 0 8px' }}>لم يُعثر على نتائج</p>
            <p style={{ fontSize: 12, margin: '0 0 14px' }}>جرّب كلمة مختلفة أو اسأل دليلك مباشرة</p>
            <button type="button" onClick={() => askAI(search || (isAr ? 'دليلك' : 'Dalilak'))}
              onTouchStart={e => { e.currentTarget.style.opacity = '0.82'; e.currentTarget.style.transform = 'scale(0.97)' }}
              onTouchEnd={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)' }}
              style={{
              padding: '10px 22px', borderRadius: 12,
              background: 'linear-gradient(135deg, #8B1A1A, #6b2737)',
              border: 'none', color: '#fff', fontSize: 12.5, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 2px 8px rgba(139,26,26,0.28)',
              transition: 'opacity 0.12s, transform 0.12s',
              display: 'inline-flex', alignItems: 'center', gap: 7,
            }}>
              <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
              {isAr ? (search ? `اسأل دليلك عن: ${search}` : 'اسأل دليلك') : (search ? `Ask about: ${search}` : 'Ask Dalilak')}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map((item: FAQItem, idx) => {
              const isOpen = expanded === item.id
              return (
                <div key={item.id} className="faq-card" style={{
                  background: '#fff',
                  border: `1.5px solid ${isOpen ? '#8B1A1A' : '#EAE4D9'}`,
                  borderRadius: 14, overflow: 'hidden',
                  boxShadow: isOpen ? '0 4px 16px rgba(139,26,26,0.1)' : '0 1px 4px rgba(0,0,0,0.04)',
                  transition: 'border-color 0.18s, box-shadow 0.18s cubic-bezier(0.22,1,0.36,1)',
                  animation: 'faqEnter 0.22s cubic-bezier(0.22,1,0.36,1) both',
                  animationDelay: `${Math.min(idx, 14) * 0.03}s`,
                }}>
                  {/* Question row */}
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setExpanded(isOpen ? null : item.id)}
                    onTouchStart={e => { e.currentTarget.style.background = '#FEF7F7' }}
                    onTouchEnd={e => { e.currentTarget.style.background = 'none' }}
                    style={{
                      width: '100%', padding: '12px 14px', background: 'none', border: 'none',
                      cursor: 'pointer', fontFamily: 'inherit', textAlign: 'right',
                      display: 'flex', alignItems: 'center', gap: 10,
                    }}
                  >
                    <div style={{
                      width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                      background: isOpen ? 'rgba(139,26,26,0.1)' : '#EAE4D9',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: isOpen ? '#8B1A1A' : '#5C4A3A', transition: 'background 0.15s, color 0.15s',
                    }}>
                      <FaqCatIcon cat={item.category} size={16} />
                    </div>
                    <div style={{ flex: 1, textAlign: 'right' }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: isOpen ? '#8B1A1A' : '#1A1208', lineHeight: 1.5 }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: 9.5, color: '#9C8E80', marginTop: 2 }}>{item.category}</div>
                    </div>
                    <span style={{
                      color: isOpen ? '#8B1A1A' : '#9C8E80',
                      transform: isOpen ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s', flexShrink: 0, display: 'inline-flex',
                    }}>
<svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6"/>
                      </svg>
                    </span>
                  </button>

                  {/* Answer */}
                  {isOpen && (
                    <div style={{ padding: '0 14px 14px', borderTop: '1px solid #EAE4D9' }}>
                      {/* Summary */}
                      {item.summary && (
                        <p style={{ margin: '12px 0 12px', fontSize: 12.5, color: '#2D1B0E', lineHeight: 1.8, background: '#FAFAF8', borderRadius: 9, padding: '9px 12px', border: '1px solid #EAE4D9' }}>
                          {item.summary}
                        </p>
                      )}
                      {/* Steps */}
                      {item.steps && item.steps.length > 0 && (
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ fontSize: 11, fontWeight: 800, color: '#1A1208', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
<svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#8B1A1A" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                            {isAr ? 'الخطوات:' : 'Steps:'}
                          </div>
                          {item.steps.map((step, si) => {
                            const isLast = si === (item.steps?.length ?? 0) - 1
                            return (
                              <div key={si} style={{ display: 'flex', gap: 9, paddingBottom: isLast ? 0 : 8, alignItems: 'stretch' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                                  <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'linear-gradient(135deg, #8B1A1A, #6b2737)', color: '#fff', fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 1px 3px rgba(139,26,26,0.2)' }}>{si + 1}</span>
                                  {!isLast && <div style={{ width: 1.5, flex: 1, background: 'rgba(139,26,26,0.15)', marginTop: 3, borderRadius: 1 }} />}
                                </div>
                                <div style={{ paddingTop: 2 }}>
                                  <span style={{ fontSize: 11.5, color: '#2D1B0E', lineHeight: 1.6 }}>{step}</span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                      {/* Required docs */}
                      {item.requiredDocuments && item.requiredDocuments.length > 0 && (
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ fontSize: 11, fontWeight: 800, color: '#1A1208', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
<svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#8B1A1A" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                            {isAr ? 'الوثائق المطلوبة:' : 'Required documents:'}
                          </div>
                          <div style={{ borderRadius: 9, border: '1px solid #EAE4D9', overflow: 'hidden' }}>
                            {item.requiredDocuments.map((doc, di) => (
                              <div key={di} style={{ fontSize: 11.5, color: '#2D1B0E', padding: '6px 12px', background: di % 2 === 0 ? '#FAFAF8' : '#fff', borderBottom: di < (item.requiredDocuments?.length ?? 0) - 1 ? '1px solid #EAE4D9' : 'none', display: 'flex', gap: 7, alignItems: 'flex-start' }}>
                                <span style={{ color: '#8B1A1A', flexShrink: 0, marginTop: 5 }}><svg aria-hidden="true" width="4" height="4" viewBox="0 0 10 10"><circle cx="5" cy="5" r="3.5" fill="#8B1A1A" opacity="0.7"/></svg></span>
                                <span style={{ lineHeight: 1.5 }}>{doc}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {/* Fees + authority + duration meta strip */}
                      {(item.fees || item.duration || item.authority) && (
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                          {item.fees && item.fees.trim() && !item.fees.startsWith('{') && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#FFFBEB', border: '1px solid #FEF3C7', borderRadius: 9, padding: '5px 10px' }}>
                              <svg aria-hidden="true" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#92400E" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3"/></svg>
                              <span style={{ fontSize: 10.5, color: '#78350F', fontWeight: 600 }}>{item.fees.length > 50 ? item.fees.slice(0, 50) + '…' : item.fees}</span>
                            </div>
                          )}
                          {item.duration && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#FFFBEB', border: '1px solid #FEF3C7', borderRadius: 9, padding: '5px 10px' }}>
                              <svg aria-hidden="true" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#92400E" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                              <span style={{ fontSize: 10.5, color: '#78350F', fontWeight: 600 }}>{item.duration}</span>
                            </div>
                          )}
                          {item.authority && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#FEF2F2', border: '1px solid rgba(139,26,26,0.15)', borderRadius: 9, padding: '5px 10px' }}>
                              <svg aria-hidden="true" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#8B1A1A" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                              <span style={{ fontSize: 10.5, color: '#5C1A1A', fontWeight: 600 }}>{item.authority.length > 50 ? item.authority.slice(0, 50) + '…' : item.authority}</span>
                            </div>
                          )}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => askAI(item.chatPrompt || item.title)}
                        onTouchStart={e => { e.currentTarget.style.opacity = '0.82'; e.currentTarget.style.transform = 'scale(0.98)' }}
                        onTouchEnd={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)' }}
                        style={{
                          width: '100%', padding: '10px 18px', borderRadius: 11,
                          background: 'linear-gradient(135deg, #8B1A1A, #6b2737)',
                          border: 'none', color: '#fff', fontSize: 12.5, fontWeight: 700,
                          cursor: 'pointer', fontFamily: 'inherit',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                          boxShadow: '0 2px 8px rgba(139,26,26,0.25)',
                          transition: 'opacity 0.12s, transform 0.12s',
                        }}
                      >
<svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                        </svg>
                        {isAr ? 'اسأل دليلك تفصيلاً' : 'Ask Dalilak for details'}
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

      </div>

      <div className="bottom-nav-wrapper">
        <BottomNav isAr={lang === 'ar'} activeTab="services" />
      </div>
    </div>
  )
}