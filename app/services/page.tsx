'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dalilak-backend-bvb9.onrender.com'

const CATEGORIES = [
  { id: 'civil_status',  label_ar: 'الأحوال الشخصية', label_en: 'Civil Status' },
  { id: 'vehicles',      label_ar: 'المركبات والسير',  label_en: 'Vehicles & Traffic' },
  { id: 'business',      label_ar: 'الأعمال والتجارة', label_en: 'Business' },
  { id: 'real_estate',   label_ar: 'العقارات',         label_en: 'Real Estate' },
  { id: 'education',     label_ar: 'التعليم والعمل',   label_en: 'Education & Work' },
  { id: 'health',        label_ar: 'الصحة',            label_en: 'Health' },
]

function CatIcon({ id, active }: { id: string; active: boolean }) {
  const c = active ? '#8B1A1A' : '#6B7280'
  const s = { width: 22, height: 22 } as const
  if (id === 'civil_status') return <svg {...s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
  if (id === 'vehicles')     return <svg {...s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4zM1 3h2l2.4 9H19l2-6H7"/></svg>
  if (id === 'business')     return <svg {...s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
  if (id === 'real_estate')  return <svg {...s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
  if (id === 'education')    return <svg {...s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>
  return <svg {...s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
}

interface Procedure {
  id: string
  slug: string
  title_ar: string
  title_en: string
  category: string
  country: string
  authority: string
  summary_ar: string
  status: string
  last_verified: string
}

export default function ServicesPage() {
  const router = useRouter()
  const [procedures, setProcedures] = useState<Procedure[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [lang, setLang] = useState<'ar' | 'en'>('ar')

  const fetchProcedures = async (cat?: string, q?: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('country', 'lebanon')
      if (cat) params.set('category', cat)
      if (q)   params.set('q', q)
      params.set('limit', '50')
      const res  = await fetch(`${API_URL}/procedures?${params}`)
      const data = await res.json()
      setProcedures(data.procedures || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProcedures(selectedCategory || undefined, search || undefined)
  }, [selectedCategory, search])

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: "'Cairo','Inter',sans-serif" }} dir="rtl">
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-thumb { background: #EAE4D9; border-radius: 4px; }
        .cat-btn:hover  { border-color: #8B1A1A !important; background: #FEF2F2 !important; }
        .proc-card:hover { border-color: #8B1A1A !important; box-shadow: 0 6px 24px rgba(139,26,26,0.13) !important; transform: translateY(-2px); }
        .proc-card { transition: all 0.15s ease; }
        @keyframes srv-spin { to { transform: rotate(360deg) } }
        @media (max-width: 767px) {
          .cat-grid-mobile { grid-template-columns: repeat(3, 1fr) !important; }
        }
      `}</style>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header style={{
        background: 'linear-gradient(135deg, #6b2737 0%, #8B1A1A 60%, #7a1818 100%)',
        boxShadow: '0 1px 0 rgba(255,255,255,0.06), 0 4px 24px rgba(80,10,10,0.3)',
        padding: '14px 16px', position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => router.push('/')}
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 9, color: '#fff', cursor: 'pointer', padding: '6px 8px', display: 'flex', flexShrink: 0 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, flex: 1 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
              <img src="/logo.PNG" alt="دليلك" style={{ width: 24, height: 24, objectFit: 'contain', display: 'block' }} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
                {lang === 'ar' ? 'الخدمات الحكومية' : 'Government Services'}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.60)', marginTop: 2 }}>
                {lang === 'ar' ? 'كل المعاملات اللبنانية' : 'All Lebanese procedures'}
              </div>
            </div>
          </div>
          <button
            onClick={() => setLang(l => l === 'ar' ? 'en' : 'ar')}
            style={{
              background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.25)',
              borderRadius: 9, padding: '5px 12px', color: '#fff', fontSize: 11,
              fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            {lang === 'ar' ? 'EN' : 'AR'}
          </button>
        </div>
      </header>

      {/* ── Search banner ────────────────────────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(180deg, #7a1a1a 0%, #5c1212 100%)', padding: '20px 16px 28px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', position: 'relative' }}>
          <input
            type="text"
            placeholder={lang === 'ar' ? 'ابحث: جواز سفر، تسجيل سيارة، شهادة ولادة...' : 'Search: passport, car registration, birth certificate...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '14px 20px', borderRadius: 16,
              fontSize: 14, border: 'none', outline: 'none',
              fontFamily: "'Cairo','Inter',sans-serif",
              boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
              direction: 'rtl',
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', background: '#EAE4D9', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            ><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12"/></svg></button>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '20px 14px 100px' }}>

        {/* ── Category grid ────────────────────────────────────────────────── */}
        <div className="cat-grid-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10, marginBottom: 24 }}>
          {CATEGORIES.map(cat => {
            const active = selectedCategory === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(active ? null : cat.id)}
                className="cat-btn"
                style={{
                  padding: '12px 6px', borderRadius: 16,
                  border: active ? '2px solid #8B1A1A' : '1.5px solid #EAE4D9',
                  background: active ? '#FEF2F2' : '#fff',
                  cursor: 'pointer', textAlign: 'center',
                  boxShadow: active ? '0 2px 10px rgba(139,26,26,0.18)' : '0 1px 3px rgba(0,0,0,0.04)',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 5 }}><CatIcon id={cat.id} active={active} /></div>
                <div style={{ fontSize: 10, fontWeight: 700, color: active ? '#8B1A1A' : '#374151', lineHeight: 1.3 }}>
                  {lang === 'ar' ? cat.label_ar : cat.label_en}
                </div>
              </button>
            )
          })}
        </div>

        {/* ── Results header ───────────────────────────────────────────────── */}
        {!loading && procedures.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 12, color: '#9C8E80', fontWeight: 500 }}>
              {procedures.length} {lang === 'ar' ? 'معاملة' : 'procedures'}
            </span>
            {selectedCategory && (
              <>
                <span style={{ color: '#D4C5B0', fontSize: 10 }}>·</span>
                <button
                  onClick={() => setSelectedCategory(null)}
                  style={{ fontSize: 11, color: '#8B1A1A', fontWeight: 700, background: '#FEF2F2', border: '1px solid rgba(139,26,26,0.2)', borderRadius: 20, padding: '2px 10px', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  {CATEGORIES.find(c => c.id === selectedCategory)?.[lang === 'ar' ? 'label_ar' : 'label_en']}
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </>
            )}
          </div>
        )}

        {/* ── States ───────────────────────────────────────────────────────── */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ width: 36, height: 36, border: '3px solid #EAE4D9', borderTopColor: '#8B1A1A', borderRadius: '50%', margin: '0 auto 14px', animation: 'srv-spin 0.8s linear infinite' }} />
            <p style={{ fontSize: 13, color: '#9C8E80', margin: 0 }}>جارٍ التحميل...</p>
          </div>
        ) : procedures.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
              <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#D4C5B0" strokeWidth="1.4"><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/></svg>
            </div>
            <p style={{ color: '#9C8E80', fontSize: 14, margin: '0 0 16px' }}>
              {lang === 'ar' ? 'لم يُعثر على نتائج — جرّب مصطلحاً آخر' : 'No results — try a different search term'}
            </p>
            <button
              onClick={() => router.push(`/?q=${encodeURIComponent(search)}`)}
              style={{ padding: '10px 24px', background: '#8B1A1A', color: '#fff', border: 'none', borderRadius: 12, fontFamily: 'inherit', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
            >
              {lang === 'ar' ? 'اسأل دليلك' : 'Ask Dalilak'}
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 14 }}>
            {procedures.map(proc => (
              <Link
                key={proc.id}
                href={`/procedures/${proc.slug || proc.id}`}
                className="proc-card"
                style={{
                  display: 'block', background: '#fff', borderRadius: 18, padding: '18px',
                  border: '1.5px solid #EAE4D9', textDecoration: 'none',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{
                    fontSize: 10, padding: '3px 9px', borderRadius: 20,
                    background: '#FEF2F2', color: '#8B1A1A', fontWeight: 700,
                    border: '1px solid rgba(139,26,26,0.12)',
                  }}>
                    {CATEGORIES.find(c => c.id === proc.category)?.[lang === 'ar' ? 'label_ar' : 'label_en'] || proc.category}
                  </span>
                  {proc.status === 'verified' && (
                    <span style={{ fontSize: 10, color: '#16A34A', display: 'flex', alignItems: 'center', gap: 3, fontWeight: 600 }}>
                      <span style={{ width: 14, height: 14, borderRadius: '50%', background: '#DCFCE7', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg></span>
                      {lang === 'ar' ? 'محقق' : 'Verified'}
                    </span>
                  )}
                </div>
                <h3 style={{ fontSize: 13.5, fontWeight: 800, color: '#1A1208', margin: '0 0 8px', lineHeight: 1.45 }}>
                  {proc.title_ar}
                </h3>
                <p style={{ fontSize: 11.5, color: '#6B7280', margin: '0 0 14px', lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {proc.summary_ar}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid #F0EBE0' }}>
                  <span style={{ fontSize: 10.5, color: '#9C8E80' }}>{proc.authority}</span>
                  <span style={{ fontSize: 11, color: '#8B1A1A', fontWeight: 700 }}>
                    <span style={{ display:'inline-flex', alignItems:'center', gap:3 }}>
                      {lang !== 'ar' && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#8B1A1A" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6"/></svg>}
                      {lang === 'ar' ? 'التفاصيل' : 'Details'}
                      {lang === 'ar' && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#8B1A1A" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>}
                    </span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* ── CTA ──────────────────────────────────────────────────────────── */}
        <div style={{
          marginTop: 52,
          background: 'linear-gradient(135deg, #5c1212 0%, #8B1A1A 60%, #9B2335 100%)',
          borderRadius: 20, padding: '28px 24px', textAlign: 'center', color: '#fff',
          boxShadow: '0 4px 24px rgba(139,26,26,0.3)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M9 12H3m6 6H3m9-12v12m3-8l3 4m0 0l3-4m-3 4V6"/></svg>
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 8px' }}>
            {lang === 'ar' ? 'ابدأ متابعة معاملتك' : 'Start tracking your procedure'}
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', margin: '0 0 18px', lineHeight: 1.5 }}>
            {lang === 'ar' ? 'سجّل دخولك لإنشاء ملف معاملة وتتبّع تقدّمك خطوة بخطوة' : 'Log in to create a procedure file and track your progress step by step'}
          </p>
          <Link
            href="/login"
            style={{
              display: 'inline-block', background: '#fff', color: '#8B1A1A',
              fontWeight: 800, padding: '12px 36px', borderRadius: 14,
              textDecoration: 'none', fontSize: 14,
            }}
          >
            {lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
          </Link>
        </div>
      </div>

      {/* Bottom Nav — mobile */}
      <div className="bottom-nav-wrapper">
        <BottomNav isAr={lang === 'ar'} activeTab="services" onHomeClick={() => router.push('/')} />
      </div>
    </div>
  )
}
