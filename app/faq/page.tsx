'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import MobileHeader from '@/components/MobileHeader'
import SearchInput from '@/components/SearchInput'
import StatsRow from '@/components/StatsRow'
import AskDalilakButton from '@/components/AskDalilakButton'
import { SERVICE_FAQ, FAQ_CATEGORIES, searchFAQ, type FAQItem } from '@/lib/serviceFAQ'
import { useLanguage } from '@/lib/LanguageContext'

const CAT_EN: Record<string, string> = {
  'الطوارئ والأرقام المهمة':       'Emergency Numbers',
  'الخدمات البلدية':                'Municipal Services',
  'أسئلة شائعة':                    'General FAQ',
  'قانون العمل':                    'Labor Law',
  'الخدمات الاجتماعية':             'Social Services',
  'المعاملات العقارية':             'Real Estate',
  'الخدمات العامة والمرافق':        'Public Utilities',
  'مراجع قانونية':                  'Legal References',
  'جدول الرسوم':                    'Fee Schedule',
  'حقوق الأجانب في لبنان':          'Expat Rights',
  'السجل المدني والأحوال الشخصية':  'Civil Registry',
  'الضمان الاجتماعي والتأمينات':    'Social Security',
  'الجمارك والاستيراد':             'Customs & Import',
  'الضرائب والمالية العامة':        'Taxes & Finance',
  'الصحة والترخيص المهني':          'Health & Licensing',
  'الأشغال العامة والنقل':          'Public Works & Transport',
  'التوثيق والشهر العقاري':         'Notary & Land Registry',
}

/** Highlight search term in text — returns array of spans */
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>
  // Escape regex special chars
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'))
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase()
          ? <mark key={i} style={{ background: '#fde68a', color: '#78350f', borderRadius: 3, padding: '0 2px' }}>{part}</mark>
          : <React.Fragment key={i}>{part}</React.Fragment>
      )}
    </>
  )
}

export default function FAQPage() {
  const router = useRouter()
  const { isAr, toggleLang } = useLanguage()
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('all')
  const [expanded, setExpanded] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let items = searchFAQ(search)
    if (catFilter !== 'all') items = items.filter(f => f.category === catFilter)
    return items
  }, [search, catFilter])

  const askAI = (prompt: string) => router.push(`/?q=${encodeURIComponent(prompt)}`)

  function FaqCatIcon({ cat, size = 16 }: { cat: string; size?: number }) {
    const s = { width: size, height: size, flexShrink: 0 as const }
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
    <div style={{ minHeight: '100vh', background: '#F8F8F6', fontFamily: "'Cairo','Inter',sans-serif" }} dir={isAr ? 'rtl' : 'ltr'}>
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 3px; height: 3px; }
        ::-webkit-scrollbar-thumb { background: var(--border); }
        .faq-card:hover { border-color: var(--brand) !important; }
        .faq-chip-row { -ms-overflow-style: none; scrollbar-width: none; }
        .faq-chip-row::-webkit-scrollbar { display: none; }
        @keyframes faqEnter { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 400px) { .faq-stats { grid-template-columns: repeat(3, 1fr) !important; gap: 6px !important; } }
      `}</style>

      {/* Header — v4.0 flat surface header, extracted to components/MobileHeader.tsx
          (batch #378). Same visual output as before. */}
      <MobileHeader
        titleAr="الأسئلة الشائعة" titleEn="FAQ & Guide"
        isAr={isAr} onBack={() => router.push('/')} toggleLang={toggleLang}
      />

      <main id="main-content" style={{ maxWidth: 'var(--container-md)', margin: '0 auto', padding: '16px 14px var(--bottom-nav-clearance)' }}>

        {/* Stats — v4.0: extracted to components/StatsRow.tsx (batch #380) */}
        <StatsRow stats={[
          { label: isAr ? 'سؤال عملي' : 'Questions', value: String(SERVICE_FAQ.length) },
          { label: isAr ? 'فئة خدمية' : 'Categories', value: String(FAQ_CATEGORIES.length) },
          { label: isAr ? 'رقم طوارئ' : 'Emergency', value: '10+' },
        ]} />

        {/* Search — v4.0: extracted to components/SearchInput.tsx (batch #379) */}
        <SearchInput
          value={search} onChange={setSearch} isAr={isAr}
          ariaLabel={isAr ? 'ابحث في الأسئلة الشائعة' : 'Search FAQ'}
          placeholder={isAr ? 'ابحث... (طوارئ، بناء، عمل، أجانب...)' : 'Search... (emergency, work, property...)'}
          clearAriaLabel="مسح البحث"
        />

        {/* Category filters */}
        <div className="faq-chip-row" style={{ display: 'flex', gap: 5, overflowX: 'auto', paddingBottom: 4, marginBottom: 14 }}>
          <button type="button" aria-pressed={catFilter === 'all'} onClick={() => setCatFilter('all')}
            onTouchStart={e => { e.currentTarget.style.transform = 'scale(0.95)'; e.currentTarget.style.opacity = '0.85' }}
            onTouchEnd={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '1' }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.85' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
            style={{
              padding: '5px 13px', borderRadius: 999, border: '1px solid', whiteSpace: 'nowrap',
              fontSize: 10.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
              transition: 'background 0.14s',
              borderColor: catFilter === 'all' ? 'var(--brand)' : 'var(--border)',
              background: catFilter === 'all' ? 'var(--brand-soft)' : 'var(--surface)',
              color: catFilter === 'all' ? 'var(--brand)' : 'var(--text-2)',
          }}>
            {isAr ? `الكل (${SERVICE_FAQ.length})` : `All (${SERVICE_FAQ.length})`}
          </button>
          {FAQ_CATEGORIES.map(cat => (
            <button type="button" key={cat} aria-pressed={catFilter === cat} onClick={() => setCatFilter(cat)}
              onTouchStart={e => { e.currentTarget.style.transform = 'scale(0.95)'; e.currentTarget.style.opacity = '0.85' }}
              onTouchEnd={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '1' }}
              style={{
                padding: '4px 10px', borderRadius: 999, border: '1px solid', whiteSpace: 'nowrap',
                fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
                display: 'inline-flex', alignItems: 'center', gap: 4,
                transition: 'background 0.14s',
                borderColor: catFilter === cat ? 'var(--brand)' : 'var(--border)',
                background: catFilter === cat ? 'var(--brand-soft)' : 'var(--surface)',
                color: catFilter === cat ? 'var(--brand)' : 'var(--text-2)',
              }}>
              <FaqCatIcon cat={cat} size={11} />
              {(() => { const label = isAr ? cat : (CAT_EN[cat] || cat); return label.length > 20 ? label.slice(0, 20) + '…' : label })()}
            </button>
          ))}
        </div>

        {/* Results count */}
        <div aria-live="polite" aria-atomic="true" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 3.5, height: 16, borderRadius: 2, background: 'var(--brand)', flexShrink: 0 }} />
            <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-1)' }}>
              {filtered.length === SERVICE_FAQ.length
                ? (isAr ? 'الأسئلة الشائعة' : 'FAQ')
                : `${filtered.length} ${isAr ? 'سؤال' : 'questions'}`}
            </span>
          </div>
          {catFilter !== 'all' && (
            <span style={{ fontSize: 11, color: 'var(--brand)', fontWeight: 600 }}>— {isAr ? catFilter : (CAT_EN[catFilter] || catFilter)}</span>
          )}
          {search && (
            <span style={{ fontSize: 11, color: 'var(--brand)', fontWeight: 600 }}>— &quot;{search}&quot;</span>
          )}
        </div>

        {/* FAQ Accordion */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-3)' }}>
            <div style={{ marginBottom: 12, color: 'var(--text-3)' }}>
              <svg aria-hidden="true" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/>
              </svg>
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, margin: '0 0 8px', color: 'var(--text-1)' }}>{isAr ? 'لم يُعثر على نتائج' : 'No results found'}</p>
            <p style={{ fontSize: 12, margin: '0 0 14px' }}>{isAr ? 'جرّب كلمة مختلفة أو اسأل دليلك مباشرة' : 'Try a different word or ask Dalilak directly'}</p>
            <AskDalilakButton isAr={isAr} onClick={() => askAI(search || (isAr ? 'دليلك' : 'Dalilak'))} searchTerm={search} />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map((item: FAQItem, idx) => {
              const isOpen = expanded === item.id
              return (
                <div key={item.id} className="faq-card" style={{
                  background: 'var(--surface)',
                  border: `1px solid ${isOpen ? 'var(--brand)' : 'var(--border)'}`,
                  borderRadius: 14, overflow: 'hidden',
                  transition: 'border-color 0.18s',
                  animation: 'faqEnter 0.22s cubic-bezier(0.22,1,0.36,1) both',
                  animationDelay: `${Math.min(idx, 14) * 0.03}s`,
                }}>
                  {/* Question row */}
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setExpanded(isOpen ? null : item.id)}
                    onTouchStart={e => { e.currentTarget.style.background = 'var(--brand-soft)' }}
                    onTouchEnd={e => { e.currentTarget.style.background = 'none' }}
                    style={{
                      width: '100%', padding: '12px 14px', background: 'none', border: 'none',
                      cursor: 'pointer', fontFamily: 'inherit', textAlign: isAr ? 'right' : 'left',
                      display: 'flex', alignItems: 'center', gap: 10,
                    }}
                  >
                    <div style={{
                      width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                      background: isOpen ? 'var(--brand-soft)' : 'var(--bg)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: isOpen ? 'var(--brand)' : 'var(--text-2)', transition: 'background 0.15s, color 0.15s',
                    }}>
                      <FaqCatIcon cat={item.category} size={16} />
                    </div>
                    <div style={{ flex: 1, textAlign: 'right' }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: isOpen ? 'var(--brand)' : 'var(--text-1)', lineHeight: 1.5 }}>
                        <Highlight text={item.title} query={search} />
                      </div>
                      <div style={{ fontSize: 9.5, color: 'var(--text-3)', marginTop: 2 }}>{isAr ? item.category : (CAT_EN[item.category] || item.category)}</div>
                    </div>
                    <span style={{
                      color: isOpen ? 'var(--brand)' : 'var(--text-3)',
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
                    <div style={{ padding: '0 14px 14px', borderTop: '1px solid var(--border)' }}>
                      {/* Summary */}
                      {item.summary && (
                        <p style={{ margin: '12px 0 12px', fontSize: 12.5, color: 'var(--text-1)', lineHeight: 1.8, background: 'var(--bg)', borderRadius: 9, padding: '9px 12px', border: '1px solid var(--border)' }}>
                          {item.summary}
                        </p>
                      )}
                      {/* Steps */}
                      {item.steps && item.steps.length > 0 && (
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-1)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
<svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                            {isAr ? 'الخطوات:' : 'Steps:'}
                          </div>
                          {item.steps.map((step, si) => {
                            const isLast = si === (item.steps?.length ?? 0) - 1
                            return (
                              <div key={si} style={{ display: 'flex', gap: 9, paddingBottom: isLast ? 0 : 8, alignItems: 'stretch' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                                  <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--brand)', color: '#fff', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{si + 1}</span>
                                  {!isLast && <div style={{ width: 1.5, flex: 1, background: 'var(--border-brand)', marginTop: 3, borderRadius: 1 }} />}
                                </div>
                                <div style={{ paddingTop: 2 }}>
                                  <span style={{ fontSize: 11.5, color: 'var(--text-1)', lineHeight: 1.6 }}>{step}</span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                      {/* Required docs */}
                      {item.requiredDocuments && item.requiredDocuments.length > 0 && (
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-1)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
<svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                            {isAr ? 'الوثائق المطلوبة:' : 'Required documents:'}
                          </div>
                          <div style={{ borderRadius: 9, border: '1px solid var(--border)', overflow: 'hidden' }}>
                            {item.requiredDocuments.map((doc, di) => (
                              <div key={di} style={{ fontSize: 11.5, color: 'var(--text-1)', padding: '6px 12px', background: di % 2 === 0 ? 'var(--bg)' : 'var(--surface)', borderBottom: di < (item.requiredDocuments?.length ?? 0) - 1 ? '1px solid var(--border)' : 'none', display: 'flex', gap: 7, alignItems: 'flex-start' }}>
                                <span style={{ color: 'var(--brand)', flexShrink: 0, marginTop: 5 }}><svg aria-hidden="true" width="4" height="4" viewBox="0 0 10 10"><circle cx="5" cy="5" r="3.5" fill="currentColor" opacity="0.7"/></svg></span>
                                <span style={{ lineHeight: 1.5 }}>{doc}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {/* Fees + authority + duration meta strip */}
                      {(item.fees || item.duration || item.authority) && (
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                          {item.fees && item.fees.trim() && !/^[{[]/.test(item.fees.trim()) && (
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
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--brand-soft)', border: '1px solid var(--border-brand)', borderRadius: 9, padding: '5px 10px' }}>
                              <svg aria-hidden="true" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                              <span style={{ fontSize: 10.5, color: 'var(--brand)', fontWeight: 600 }}>{item.authority.length > 50 ? item.authority.slice(0, 50) + '…' : item.authority}</span>
                            </div>
                          )}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => askAI(item.chatPrompt || item.title)}
                        className="btn-primary"
                        style={{
                          width: '100%', padding: '10px 18px', borderRadius: 11,
                          background: 'var(--brand)',
                          border: 'none', color: '#fff', fontSize: 12.5, fontWeight: 700,
                          cursor: 'pointer', fontFamily: 'inherit',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
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

      </main>

      <div className="bottom-nav-wrapper">
        <BottomNav isAr={isAr} activeTab="services" />
      </div>
    </div>
  )
}