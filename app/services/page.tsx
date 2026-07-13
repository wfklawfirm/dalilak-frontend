'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dalilak-backend-bvb9.onrender.com'

const CATEGORIES = [
  { id: 'civil_status', icon: '👤', label_ar: 'الأحوال الشخصية', label_en: 'Civil Status', color: 'bg-blue-50 border-blue-200' },
  { id: 'vehicles', icon: '🚗', label_ar: 'المركبات والسير', label_en: 'Vehicles & Traffic', color: 'bg-green-50 border-green-200' },
  { id: 'business', icon: '🏢', label_ar: 'الأعمال والتجارة', label_en: 'Business', color: 'bg-purple-50 border-purple-200' },
  { id: 'real_estate', icon: '🏠', label_ar: 'العقارات', label_en: 'Real Estate', color: 'bg-yellow-50 border-yellow-200' },
  { id: 'education', icon: '🎓', label_ar: 'التعليم والعمل', label_en: 'Education & Work', color: 'bg-red-50 border-red-200' },
  { id: 'health', icon: '🏥', label_ar: 'الصحة', label_en: 'Health', color: 'bg-pink-50 border-pink-200' },
]

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
      if (q) params.set('q', q)
      params.set('limit', '50')
      const res = await fetch(`${API_URL}/procedures?${params}`)
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
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <style>{`* { box-sizing: border-box; }`}</style>

      {/* Header */}
      <header style={{ background: 'linear-gradient(135deg, #6b2737 0%, #8B1A1A 100%)', padding: '12px 16px', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => router.push('/')}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', padding: 4, display: 'flex', flexShrink: 0 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', fontFamily: "'Cairo','Inter',sans-serif" }}>
              {lang === 'ar' ? 'دليل المعاملات الحكومية اللبنانية' : 'Lebanese Government Services Guide'}
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)', fontFamily: "'Cairo','Inter',sans-serif" }}>
              {lang === 'ar' ? 'ابحث عن أي معاملة' : 'Find any procedure'}
            </div>
          </div>
          <button
            onClick={() => setLang(l => l === 'ar' ? 'en' : 'ar')}
            style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 8, padding: '5px 10px', color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: "'Cairo','Inter',sans-serif" }}
          >
            {lang === 'ar' ? 'EN' : 'AR'}
          </button>
        </div>
      </header>

      {/* Search bar */}
      <div style={{ background: 'linear-gradient(to bottom, #7a1a1a, #6b2737)', padding: '16px 16px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative' }}>
          <input
            type="text"
            placeholder={lang === 'ar' ? 'ابحث: جواز سفر، تسجيل سيارة، ولادة...' : 'Search: passport, car registration...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '14px 48px 14px 16px', borderRadius: 16,
              fontSize: 14, border: 'none', outline: 'none', fontFamily: "'Cairo','Inter',sans-serif",
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            }}
          />
          <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', fontSize: 18 }}>🔍</span>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '20px 14px 100px', fontFamily: "'Cairo','Inter',sans-serif" }}>

        {/* Categories */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10, marginBottom: 24 }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
              style={{
                padding: '10px 6px', borderRadius: 14,
                border: selectedCategory === cat.id ? '2px solid #3B82F6' : '1.5px solid #E5E7EB',
                background: selectedCategory === cat.id ? '#EFF6FF' : '#fff',
                cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s',
                boxShadow: selectedCategory === cat.id ? '0 2px 8px rgba(59,130,246,0.2)' : 'none',
              }}
            >
              <div style={{ fontSize: 22, marginBottom: 4 }}>{cat.icon}</div>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#374151', lineHeight: 1.3, fontFamily: "'Cairo','Inter',sans-serif" }}>
                {lang === 'ar' ? cat.label_ar : cat.label_en}
              </div>
            </button>
          ))}
        </div>

        {/* Results count */}
        {!loading && procedures.length > 0 && (
          <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 14 }}>
            {procedures.length} {lang === 'ar' ? 'معاملة' : 'procedures'}
            {selectedCategory && ` · ${CATEGORIES.find(c => c.id === selectedCategory)?.[lang === 'ar' ? 'label_ar' : 'label_en']}`}
          </p>
        )}

        {/* Procedures Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '64px 0', color: '#9CA3AF', fontSize: 14 }}>
            جارٍ التحميل...
          </div>
        ) : procedures.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <p style={{ color: '#9CA3AF', fontSize: 14 }}>
              {lang === 'ar' ? 'لم يُعثر على نتائج. جرّب مصطلحاً آخر.' : 'No results. Try a different search term.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
            {procedures.map(proc => (
              <Link
                key={proc.id}
                href={`/procedures/${proc.slug || proc.id}`}
                style={{
                  display: 'block', background: '#fff', borderRadius: 18, padding: '18px',
                  border: '1.5px solid #F0F0F0', textDecoration: 'none',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.05)', transition: 'all 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{
                    fontSize: 10, padding: '3px 8px', borderRadius: 20,
                    background: '#EFF6FF', color: '#1D4ED8', fontWeight: 700,
                  }}>
                    {CATEGORIES.find(c => c.id === proc.category)?.[lang === 'ar' ? 'label_ar' : 'label_en'] || proc.category}
                  </span>
                  {proc.status === 'verified' && (
                    <span style={{ fontSize: 10, color: '#16A34A', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <span>✓</span> {lang === 'ar' ? 'محقق' : 'Verified'}
                    </span>
                  )}
                </div>
                <h3 style={{ fontSize: 13.5, fontWeight: 800, color: '#111827', margin: '0 0 8px', lineHeight: 1.4 }}>
                  {proc.title_ar}
                </h3>
                <p style={{ fontSize: 11.5, color: '#6B7280', margin: '0 0 14px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {proc.summary_ar}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 10.5, color: '#9CA3AF' }}>{proc.authority}</span>
                  <span style={{ fontSize: 11, color: '#1D4ED8', fontWeight: 600 }}>{lang === 'ar' ? 'التفاصيل ←' : 'Details →'}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* CTA for logged in */}
        <div style={{
          marginTop: 48, background: 'linear-gradient(135deg, #1E3A5F, #1E40AF)',
          borderRadius: 20, padding: '28px 24px', textAlign: 'center', color: '#fff',
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 8px' }}>
            {lang === 'ar' ? 'ابدأ متابعة معاملتك' : 'Start tracking your procedure'}
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', margin: '0 0 16px' }}>
            {lang === 'ar' ? 'سجّل دخولك لإنشاء ملف معاملة وتتبع تقدّمك' : 'Log in to create a procedure file and track your progress'}
          </p>
          <Link
            href="/login"
            style={{
              display: 'inline-block', background: '#fff', color: '#1D4ED8',
              fontWeight: 800, padding: '12px 32px', borderRadius: 14,
              textDecoration: 'none', fontSize: 14,
            }}
          >
            {lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
          </Link>
        </div>
      </div>
    </div>
  )
}
