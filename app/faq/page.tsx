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
  const isAr = lang === 'ar'

  const filtered = useMemo(() => {
    let items = searchFAQ(search)
    if (catFilter !== 'all') items = items.filter(f => f.category === catFilter)
    return items
  }, [search, catFilter])

  const askAI = (prompt: string) => router.push(`/?q=${encodeURIComponent(prompt)}`)

  function FaqCatIcon({ cat, size = 16 }: { cat: string; size?: number }) {
    const s = { width: size, height: size, flexShrink: 0 as const }
    if (cat === 'الطوارئ والأرقام المهمة') return <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
    if (cat === 'الخدمات البلدية') return <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
    if (cat === 'أسئلة شائعة') return <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
    if (cat === 'قانون العمل') return <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
    if (cat === 'الخدمات الاجتماعية') return <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
    if (cat === 'المعاملات العقارية') return <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
    if (cat === 'الخدمات العامة والمرافق') return <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
    if (cat === 'مراجع قانونية') return <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
    if (cat === 'جدول الرسوم') return <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
    if (cat === 'حقوق الأجانب في لبنان') return <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 004 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
    return <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: "'Cairo','Inter',sans-serif" }} dir="rtl">
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 3px; height: 3px; }
        ::-webkit-scrollbar-thumb { background: #EAE4D9; }
        .faq-card:hover { border-color: #8B1A1A !important; }
      `}</style>

      {/* Header */}
      <header style={{ background: 'linear-gradient(135deg, #6b2737 0%, #8B1A1A 60%, #7a1a1a 100%)', padding: '14px 16px', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 4px 24px rgba(80,10,10,0.3)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => router.push('/')} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 9, color: '#fff', cursor: 'pointer', padding: '6px 8px', display: 'flex', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, flex: 1 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
              <img src="/logo.PNG" alt="دليلك" style={{ width: 24, height: 24, objectFit: 'contain', display: 'block' }} />
            </div>
            <div>
              <h1 style={{ color: '#fff', fontSize: 15, fontWeight: 800, margin: 0, lineHeight: 1.2 }}>{isAr ? 'الأسئلة الشائعة' : 'FAQ & Guide'}</h1>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, margin: 0 }}>{isAr ? '48 سؤال · أرقام طوارئ · قانون العمل' : '48 questions · emergency numbers · labor law'}</p>
            </div>
          </div>
          <button onClick={() => setLang(l => l === 'ar' ? 'en' : 'ar')} style={{ background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.25)', color: '#fff', borderRadius: 9, padding: '5px 12px', cursor: 'pointer', fontSize: 11, fontFamily: 'inherit', fontWeight: 700, flexShrink: 0 }}>
            {isAr ? 'EN' : 'AR'}
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '14px 14px 100px' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
          {[
            { labelAr: 'سؤال عملي', labelEn: 'Questions', value: '48', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8B1A1A" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> },
            { labelAr: 'فئة خدمية', labelEn: 'Categories', value: '10', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8B1A1A" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h7a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/></svg> },
            { labelAr: 'رقم طوارئ', labelEn: 'Emergency', value: '10+', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8B1A1A" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg> },
          ].map(({ labelAr, labelEn, value, icon }) => (
            <div key={labelAr} style={{ background: '#fff', border: '1.5px solid #EAE4D9', borderRadius: 14, padding: '14px 10px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ marginBottom: 6, display: 'flex', justifyContent: 'center' }}>{icon}</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#8B1A1A', lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: 9.5, color: '#6B7280', marginTop: 4, fontWeight: 600 }}>{isAr ? labelAr : labelEn}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <span style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: 14, color: '#B0A090', pointerEvents: 'none', display: 'flex' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/></svg>
          </span>
          <input type="text" placeholder="ابحث... (طوارئ، بناء، عمل، أجانب...)"
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '11px 42px 11px 14px', border: '1.5px solid #EAE4D9', borderRadius: 14, fontSize: 13, background: '#fff', outline: 'none', fontFamily: 'inherit', color: '#1A1208', direction: 'rtl' }}
          />
          {search && <button onClick={() => setSearch('')} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: 12, background: '#EAE4D9', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12"/></svg></button>}
        </div>

        {/* Category filter */}
        <div style={{ display: 'flex', gap: 5, overflowX: 'auto', paddingBottom: 4, marginBottom: 14 }}>
          <button onClick={() => setCatFilter('all')} style={{
            padding: '4px 12px', borderRadius: 20, border: '1.5px solid', whiteSpace: 'nowrap', fontSize: 10.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
            borderColor: catFilter === 'all' ? '#8B1A1A' : '#EAE4D9',
            background: catFilter === 'all' ? '#FEF2F2' : '#fff',
            color: catFilter === 'all' ? '#8B1A1A' : '#6B7280',
          }}>الكل ({SERVICE_FAQ.length})</button>
          {FAQ_CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCatFilter(cat)} style={{
              padding: '4px 11px', borderRadius: 20, border: '1.5px solid', whiteSpace: 'nowrap', fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
              borderColor: catFilter === cat ? '#8B1A1A' : '#EAE4D9',
              background: catFilter === cat ? '#FEF2F2' : '#fff',
              color: catFilter === cat ? '#8B1A1A' : '#6B7280',
            }}>
              <FaqCatIcon cat={cat} size={12} /> {cat}
            </button>
          ))}
        </div>

        <p style={{ fontSize: 11, color: '#9C8E80', margin: '0 0 10px' }}>{filtered.length} نتيجة</p>

        {/* FAQ Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map((item: FAQItem) => (
            <div key={item.id} className="faq-card" style={{ background: '#fff', border: '1.5px solid #EAE4D9', borderRadius: 14, overflow: 'hidden', transition: 'border-color 0.15s' }}>
              {/* Header */}
              <button
                onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                style={{ width: '100%', padding: '12px 14px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'right', display: 'flex', alignItems: 'center', gap: 10 }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 9, background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B1A1A', flexShrink: 0 }}>
                  <FaqCatIcon cat={item.category} size={18} />
                </div>
                <div style={{ flex: 1, textAlign: 'right' }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: '#1A1208', lineHeight: 1.4 }}>{item.title}</div>
                  <div style={{ fontSize: 10, color: '#8B1A1A', fontWeight: 600, marginTop: 1 }}>{item.category}</div>
                </div>
                <span style={{ color: '#9C8E80', flexShrink: 0, display: 'inline-flex', transform: expanded === item.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6"/></svg></span>
              </button>

              {/* Expanded content */}
              {expanded === item.id && (
                <div style={{ padding: '0 14px 14px', borderTop: '1px solid #F3F4F6' }}>

                  {item.summary && (
                    <p style={{ fontSize: 11.5, color: '#4B5563', margin: '10px 0 8px', lineHeight: 1.6 }}>{item.summary}</p>
                  )}

                  {item.steps.length > 0 && (
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#1A1208', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg> الخطوات:</div>
                      {item.steps.map((s, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 4, alignItems: 'flex-start' }}>
                          <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#8B1A1A', color: '#fff', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                          <span style={{ fontSize: 11, color: '#374151', lineHeight: 1.5 }}>{s}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {item.requiredDocuments.length > 0 && (
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#1A1208', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h7a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/></svg> الوثائق المطلوبة:</div>
                      {item.requiredDocuments.map((d, i) => (
                        <div key={i} style={{ fontSize: 11, color: '#374151', padding: '3px 0', borderBottom: '1px solid #F9FAFB', display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                          <span style={{ flexShrink: 0, marginTop: 3, display: 'inline-flex' }}><svg width="5" height="5" viewBox="0 0 10 10"><circle cx="5" cy="5" r="3.5" fill="#8B1A1A" opacity="0.6"/></svg></span><span>{d}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {item.fees && (
                    <div style={{ background: '#FFFBEB', border: '1px solid #FEF3C7', borderRadius: 8, padding: '8px 10px', marginBottom: 10 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#854D0E' }}>الرسوم:</span>
                      <span style={{ fontSize: 10.5, color: '#6B7280' }}>{item.fees.slice(0, 150)}</span>
                    </div>
                  )}

                  {item.duration && (
                    <div style={{ fontSize: 10.5, color: '#8B1A1A', marginBottom: 10 }}>المدة: {item.duration}</div>
                  )}

                  {item.authority && (
                    <div style={{ fontSize: 10.5, color: '#6B7280', marginBottom: 10 }}>الجهة: {item.authority}</div>
                  )}

                  <button onClick={() => askAI(item.chatPrompt)} style={{ width: '100%', padding: '10px', background: 'linear-gradient(135deg, #7a1a1a, #8B1A1A)', color: '#fff', border: 'none', borderRadius: 10, fontFamily: 'inherit', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/></svg>
                    {isAr ? 'اسأل دليلك عن هذا الموضوع' : 'Ask Dalilak about this topic'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Back to home */}
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <button onClick={() => router.push('/')} style={{ padding: '11px 28px', borderRadius: 14, background: 'linear-gradient(135deg, #7a1a1a, #8B1A1A)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(139,26,26,0.25)', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/></svg>
            {isAr ? 'اسأل دليلك' : 'Ask Dalilak'}
          </button>
        </div>
      </div>

      {/* Bottom Nav — mobile */}
      <div className="bottom-nav-wrapper">
        <BottomNav isAr={isAr} activeTab="home" onHomeClick={() => router.push('/')} />
      </div>
    </div>
  )
}
