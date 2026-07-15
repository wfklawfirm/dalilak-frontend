'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
  const c = active ? '#8B1A1A' : '#5C4A3A'
  const s = { width: 22, height: 22 } as const
  if (id === 'civil_status') return (
    <svg {...s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
    </svg>
  )
  if (id === 'vehicles') return (
    <svg {...s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4zM1 3h2l2.4 9H19l2-6H7"/>
    </svg>
  )
  if (id === 'business') return (
    <svg {...s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
    </svg>
  )
  if (id === 'real_estate') return (
    <svg {...s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
    </svg>
  )
  if (id === 'education') return (
    <svg {...s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
    </svg>
  )
  return (
    <svg {...s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
    </svg>
  )
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

function ProcedureSheet({ proc, lang, onClose, onAsk }: {
  proc: Procedure
  lang: 'ar' | 'en'
  onClose: () => void
  onAsk: (q: string) => void
}) {
  const isAr = lang === 'ar'
  const catLabel = CATEGORIES.find(c => c.id === proc.category)?.[isAr ? 'label_ar' : 'label_en'] || proc.category
  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'flex-end', background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ background: '#fff', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 720, margin: '0 auto', maxHeight: '75vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 -8px 40px rgba(0,0,0,0.2)' }}>
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 16px 6px' }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: '#D5CEC4' }} />
        </div>
        {/* Header */}
        <div style={{ padding: '0 20px 14px', borderBottom: '1px solid #EAE4D9' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: 'linear-gradient(135deg, #FEF2F2, #FDE8E8)', border: '1px solid rgba(139,26,26,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B1A1A', flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#1A1208', lineHeight: 1.3 }}>
                {isAr ? proc.title_ar : (proc.title_en || proc.title_ar)}
              </h2>
              {proc.authority && <p style={{ margin: '4px 0 0', fontSize: 11, color: '#8B1A1A', fontWeight: 600 }}>{proc.authority}</p>}
            </div>
            <button onClick={onClose} style={{ background: '#EAE4D9', border: 'none', borderRadius: 10, width: 32, height: 32, cursor: 'pointer', color: '#5C4A3A', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, color: '#8B1A1A', background: '#FEF2F2', borderRadius: 8, padding: '3px 9px', border: '1px solid rgba(139,26,26,0.15)', fontWeight: 600 }}>
              {catLabel}
            </span>
            {proc.status === 'active' && (
              <span style={{ fontSize: 11, color: '#065F46', background: '#ECFDF5', borderRadius: 8, padding: '3px 9px', border: '1px solid #A7F3D0', fontWeight: 600 }}>
                {isAr ? 'متاح' : 'Active'}
              </span>
            )}
          </div>
        </div>
        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {proc.summary_ar ? (
            <p style={{ margin: 0, fontSize: 13, color: '#2D1B0E', lineHeight: 1.7 }}>{proc.summary_ar}</p>
          ) : (
            <p style={{ margin: 0, fontSize: 13, color: '#9C8E80', lineHeight: 1.7 }}>اسأل دليلك للحصول على تفاصيل كاملة وخطوات هذه الخدمة.</p>
          )}
          <p style={{ fontSize: 10, color: '#9C8E80', marginTop: 16, lineHeight: 1.5, padding: '10px 14px', background: '#FAFAF8', borderRadius: 8 }}>
            المعلومات للإرشاد العام — تأكد دائماً من المصادر الرسمية قبل تقديم أي طلب.
          </p>
        </div>
        {/* Footer */}
        <div style={{ padding: '12px 20px 28px', borderTop: '1px solid #EAE4D9', display: 'flex', gap: 10 }}>
          <button
            onClick={() => onAsk(isAr ? proc.title_ar : (proc.title_en || proc.title_ar))}
            style={{ flex: 1, padding: '12px 16px', borderRadius: 14, background: 'linear-gradient(135deg, #8B1A1A, #6b2737)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
            اسأل دليلك عن هذه الخدمة
          </button>
          <button onClick={onClose} style={{ padding: '12px 16px', borderRadius: 14, background: '#FAFAF8', border: '1.5px solid #EAE4D9', color: '#5C4A3A', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            إغلاق
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ServicesPage() {
  const router = useRouter()
  const [procedures, setProcedures] = useState<Procedure[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [lang, setLang] = useState<'ar' | 'en'>('ar')
  const [selectedProc, setSelectedProc] = useState<Procedure | null>(null)

  const handleAsk = (title: string) => {
    setSelectedProc(null)
    router.push(`/?q=${encodeURIComponent(title)}`)
  }

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
        .proc-card { transition: all 0.15s ease; }
        .proc-card:hover { border-color: #8B1A1A !important; box-shadow: 0 4px 18px rgba(139,26,26,0.13) !important; transform: translateY(-2px); }
        .cat-btn { transition: all 0.15s ease; }
        .cat-btn:hover { border-color: #8B1A1A !important; color: #8B1A1A; background: #FEF7F7 !important; }
        @keyframes srv-spin { to { transform: rotate(360deg) } }
        @keyframes srv-fade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .srv-animate { animation: srv-fade 0.25s ease forwards; }
        @media (max-width: 767px) {
          .cat-grid-mobile { grid-template-columns: repeat(3, 1fr) !important; }
          .proc-grid { grid-template-columns: 1fr !important; }
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
            style={{
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 9, color: '#fff', cursor: 'pointer', padding: '6px 8px',
              display: 'flex', flexShrink: 0, transition: 'background 0.14s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.18)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 9, flex: 1 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9,
              background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', flexShrink: 0,
            }}>
              <img src="/logo.PNG" alt="دليلك" style={{ width: 24, height: 24, objectFit: 'contain', display: 'block' }} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
                {lang === 'ar' ? 'الخدمات الحكومية' : 'Government Services'}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>
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
              transition: 'background 0.14s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
          >
            {lang === 'ar' ? 'EN' : 'AR'}
          </button>
        </div>
      </header>

      {/* ── Search banner ────────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(180deg, #6b2737 0%, #4a1020 100%)',
        padding: '20px 16px 32px',
      }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ position: 'relative' }}>
            {/* Search icon */}
            <span style={{
              position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
              color: '#9C8E80', display: 'flex', alignItems: 'center', pointerEvents: 'none',
            }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/>
              </svg>
            </span>
            <input
              type="text"
              placeholder={lang === 'ar' ? 'ابحث: جواز سفر، تسجيل سيارة، شهادة ولادة...' : 'Search: passport, car registration, birth certificate...'}
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '14px 48px 14px 44px', borderRadius: 16,
                fontSize: 14, border: 'none', outline: 'none',
                fontFamily: "'Cairo','Inter',sans-serif",
                boxShadow: '0 4px 20px rgba(0,0,0,0.22)',
                direction: 'rtl', color: '#1A1208', background: '#fff',
              }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                  background: '#EAE4D9', border: 'none', borderRadius: '50%',
                  width: 22, height: 22, cursor: 'pointer', color: '#5C4A3A',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '20px 14px 100px' }}>

        {/* ── Category grid ────────────────────────────────────────────────── */}
        <div className="cat-grid-mobile" style={{
          display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)',
          gap: 10, marginBottom: 22,
        }}>
          {CATEGORIES.map(cat => {
            const active = selectedCategory === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(active ? null : cat.id)}
                className="cat-btn"
                style={{
                  padding: '12px 6px', borderRadius: 14,
                  border: active ? '2px solid #8B1A1A' : '1.5px solid #EAE4D9',
                  background: active ? '#FEF2F2' : '#fff',
                  cursor: 'pointer', textAlign: 'center',
                  boxShadow: active ? '0 2px 10px rgba(139,26,26,0.18)' : '0 1px 3px rgba(0,0,0,0.04)',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 5 }}>
                  <CatIcon id={cat.id} active={active} />
                </div>
                <div style={{ fontSize: 10, fontWeight: 700, color: active ? '#8B1A1A' : '#2D1B0E', lineHeight: 1.3 }}>
                  {lang === 'ar' ? cat.label_ar : cat.label_en}
                </div>
              </button>
            )
          })}
        </div>

        {/* ── Results meta bar ─────────────────────────────────────────────── */}
        {!loading && procedures.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 12, color: '#9C8E80', fontWeight: 500 }}>
              {procedures.length} {lang === 'ar' ? 'معاملة' : 'procedures'}
            </span>
            {selectedCategory && (
              <>
                <span style={{ color: '#D4C5B0', fontSize: 12 }}>·</span>
                <button
                  onClick={() => setSelectedCategory(null)}
                  style={{
                    fontSize: 11, color: '#8B1A1A', fontWeight: 700,
                    background: '#FEF2F2', border: '1px solid rgba(139,26,26,0.2)',
                    borderRadius: 20, padding: '2px 10px', cursor: 'pointer',
                    fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4,
                    transition: 'background 0.14s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#FEE2E2')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#FEF2F2')}
                >
                  {CATEGORIES.find(c => c.id === selectedCategory)?.[lang === 'ar' ? 'label_ar' : 'label_en']}
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </>
            )}
          </div>
        )}

        {/* ── Loading ──────────────────────────────────────────────────────── */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{
              width: 36, height: 36, border: '3px solid #EAE4D9', borderTopColor: '#8B1A1A',
              borderRadius: '50%', margin: '0 auto 14px', animation: 'srv-spin 0.8s linear infinite',
            }} />
            <p style={{ fontSize: 13, color: '#9C8E80', margin: 0 }}>
              {lang === 'ar' ? 'جارٍ التحميل...' : 'Loading...'}
            </p>
          </div>

        ) : procedures.length === 0 ? (
          /* ── Empty / no-results state ─────────────────────────────────── */
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
              <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#D4C5B0" strokeWidth="1.4">
                <circle cx="11" cy="11" r="8"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/>
              </svg>
            </div>
            <p style={{ color: '#9C8E80', fontSize: 14, margin: '0 0 16px' }}>
              {lang === 'ar' ? 'لم يُعثر على نتائج — جرّب مصطلحاً آخر' : 'No results — try a different search term'}
            </p>
            <button
              onClick={() => router.push(`/?q=${encodeURIComponent(search)}`)}
              style={{
                padding: '10px 24px',
                background: 'linear-gradient(135deg, #8B1A1A, #6b2737)',
                color: '#fff', border: 'none', borderRadius: 12,
                fontFamily: 'inherit', fontSize: 13, fontWeight: 700,
                cursor: 'pointer', boxShadow: '0 2px 8px rgba(139,26,26,0.25)',
                transition: 'transform 0.14s, box-shadow 0.14s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(139,26,26,0.35)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(139,26,26,0.25)' }}
            >
              {lang === 'ar' ? 'اسأل دليلك' : 'Ask Dalilak'}
            </button>
          </div>

        ) : (
          /* ── Procedure cards grid ─────────────────────────────────────── */
          <div className="proc-grid srv-animate" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
            gap: 14,
          }}>
            {procedures.map(proc => (
              <button
                key={proc.id}
                onClick={() => setSelectedProc(proc)}
                className="proc-card"
                style={{
                  display: 'block', background: '#fff', borderRadius: 16,
                  padding: '18px', border: '1.5px solid #EAE4D9',
                  textDecoration: 'none', textAlign: 'right',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                  fontFamily: 'inherit', cursor: 'pointer', width: '100%',
                }}
              >
                {/* Card top: category badge + status dot */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{
                    fontSize: 10, padding: '3px 9px', borderRadius: 20,
                    background: '#FEF2F2', color: '#8B1A1A', fontWeight: 700,
                    border: '1px solid rgba(139,26,26,0.15)',
                  }}>
                    {CATEGORIES.find(c => c.id === proc.category)?.[lang === 'ar' ? 'label_ar' : 'label_en'] || proc.category}
                  </span>
                  {proc.status === 'active' && (
                    <span style={{
                      width: 7, height: 7, borderRadius: '50%',
                      background: '#22C55E',
                      boxShadow: '0 0 5px rgba(34,197,94,0.5)',
                      display: 'inline-block', flexShrink: 0,
                    }} />
                  )}
                </div>

                {/* Title */}
                <h3 style={{
                  fontSize: 13.5, fontWeight: 800, color: '#1A1208',
                  margin: '0 0 8px', lineHeight: 1.45,
                  display: '-webkit-box', WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                  {lang === 'ar' ? proc.title_ar : (proc.title_en || proc.title_ar)}
                </h3>

                {/* Summary */}
                {proc.summary_ar && (
                  <p style={{
                    fontSize: 11.5, color: '#5C4A3A', margin: '0 0 12px',
                    lineHeight: 1.55,
                    display: '-webkit-box', WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>
                    {proc.summary_ar}
                  </p>
                )}

                {/* Authority + arrow */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {proc.authority ? (
                    <span style={{
                      fontSize: 10, color: '#9C8E80', fontWeight: 500,
                      display: 'flex', alignItems: 'center', gap: 4,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
                    }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9C8E80" strokeWidth="2" style={{ flexShrink: 0 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5"/>
                      </svg>
                      {proc.authority}
                    </span>
                  ) : <span />}
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C5BAB0" strokeWidth="2.2" style={{ flexShrink: 0 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
                  </svg>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Procedure Sheet ──────────────────────────────────────────────────── */}
      {selectedProc && (
        <ProcedureSheet
          proc={selectedProc}
          lang={lang}
          onClose={() => setSelectedProc(null)}
          onAsk={handleAsk}
        />
      )}

      {/* ── Bottom Nav ───────────────────────────────────────────────────────── */}
      <div className="bottom-nav-wrapper">
        <BottomNav isAr={lang === 'ar'} activeTab="services" />
      </div>
    </div>
  )
}
