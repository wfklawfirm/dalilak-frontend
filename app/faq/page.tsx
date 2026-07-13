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

  const CAT_ICONS: Record<string, string> = {
    'الطوارئ والأرقام المهمة': '🚨',
    'الخدمات البلدية': '🏘️',
    'أسئلة شائعة': '❓',
    'قانون العمل': '👷',
    'الخدمات الاجتماعية': '🤝',
    'المعاملات العقارية': '🏠',
    'الخدمات العامة والمرافق': '💡',
    'مراجع قانونية': '📖',
    'جدول الرسوم': '💰',
    'حقوق الأجانب في لبنان': '✈️',
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
      <header style={{ background: 'linear-gradient(135deg, #6b2737 0%, #8B1A1A 60%, #7a1a1a 100%)', padding: '14px 16px', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', padding: 4, display: 'flex' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          </button>
          <div>
            <h1 style={{ color: '#fff', fontSize: 15, fontWeight: 800, margin: 0 }}>❓ دليل الأسئلة الشائعة</h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10.5, margin: 0 }}>48 سؤال عملي · أرقام طوارئ · قوانين العمل · الخدمات البلدية</p>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '14px 14px 100px' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
          {[
            { label: 'سؤال عملي', value: '48', icon: '❓' },
            { label: 'فئة خدمية', value: '10', icon: '📂' },
            { label: 'أرقام طوارئ', value: '10+', icon: '🚨' },
          ].map(({ label, value, icon }) => (
            <div key={label} style={{ background: '#fff', border: '1.5px solid #EAE4D9', borderRadius: 12, padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: 18, marginBottom: 2 }}>{icon}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#8B1A1A' }}>{value}</div>
              <div style={{ fontSize: 9.5, color: '#6B7280' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <span style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: 14, color: '#B0A090', fontSize: 15, pointerEvents: 'none' }}>🔍</span>
          <input type="text" placeholder="ابحث... (طوارئ، بناء، عمل، أجانب...)"
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '11px 42px 11px 14px', border: '1.5px solid #EAE4D9', borderRadius: 14, fontSize: 13, background: '#fff', outline: 'none', fontFamily: 'inherit', color: '#1A1208', direction: 'rtl' }}
          />
          {search && <button onClick={() => setSearch('')} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: 12, background: '#EAE4D9', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', fontSize: 10, color: '#6B7280' }}>✕</button>}
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
              {CAT_ICONS[cat] || '📋'} {cat}
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
                <div style={{ width: 36, height: 36, borderRadius: 9, background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>
                  {item.categoryIcon}
                </div>
                <div style={{ flex: 1, textAlign: 'right' }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: '#1A1208', lineHeight: 1.4 }}>{item.title}</div>
                  <div style={{ fontSize: 10, color: '#8B1A1A', fontWeight: 600, marginTop: 1 }}>{item.category}</div>
                </div>
                <span style={{ color: '#9C8E80', fontSize: 16, flexShrink: 0, transform: expanded === item.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
              </button>

              {/* Expanded content */}
              {expanded === item.id && (
                <div style={{ padding: '0 14px 14px', borderTop: '1px solid #F3F4F6' }}>

                  {item.summary && (
                    <p style={{ fontSize: 11.5, color: '#4B5563', margin: '10px 0 8px', lineHeight: 1.6 }}>{item.summary}</p>
                  )}

                  {item.steps.length > 0 && (
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#1A1208', marginBottom: 6 }}>📋 الخطوات:</div>
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
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#1A1208', marginBottom: 6 }}>📁 الوثائق المطلوبة:</div>
                      {item.requiredDocuments.map((d, i) => (
                        <div key={i} style={{ fontSize: 11, color: '#374151', padding: '3px 0', borderBottom: '1px solid #F9FAFB', display: 'flex', gap: 6 }}>
                          <span>•</span><span>{d}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {item.fees && (
                    <div style={{ background: '#FFFBEB', border: '1px solid #FEF3C7', borderRadius: 8, padding: '8px 10px', marginBottom: 10 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#854D0E' }}>💰 الرسوم: </span>
                      <span style={{ fontSize: 10.5, color: '#6B7280' }}>{item.fees.slice(0, 150)}</span>
                    </div>
                  )}

                  {item.duration && (
                    <div style={{ fontSize: 10.5, color: '#8B1A1A', marginBottom: 10 }}>⏱️ المدة: {item.duration}</div>
                  )}

                  {item.authority && (
                    <div style={{ fontSize: 10.5, color: '#6B7280', marginBottom: 10 }}>🏛️ الجهة: {item.authority}</div>
                  )}

                  <button onClick={() => askAI(item.chatPrompt)} style={{ width: '100%', padding: '9px', background: '#8B1A1A', color: '#fff', border: 'none', borderRadius: 10, fontFamily: 'inherit', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                    🤖 اسأل الذكاء الاصطناعي عن هذا الموضوع
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Back to home */}
        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <button onClick={() => router.push('/')} style={{ padding: '10px 24px', borderRadius: 12, background: 'linear-gradient(135deg, #7a1a1a, #9B2335)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            🤖 اسأل دليلك الذكي
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
