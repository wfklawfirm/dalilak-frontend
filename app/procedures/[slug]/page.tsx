'use client'
import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getToken } from '@/lib/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dalilak-backend-bvb9.onrender.com'

interface Step {
  order: number
  title_ar: string
  desc_ar: string
}

interface Document {
  name_ar: string
  required: boolean
}

interface Procedure {
  id: string
  slug: string
  title_ar: string
  title_en: string
  category: string
  country: string
  authority: string
  authority_en: string
  authority_url?: string
  summary_ar: string
  duration_ar: string
  fee_ar: string
  documents: Document[]
  steps: Step[]
  source_tier: number
  last_verified: string
  review_expiry: string
  status: string
  tags: string[]
}

export default function ProcedurePage() {
  const { slug } = useParams() as { slug: string }
  const router = useRouter()
  const [procedure, setProcedure] = useState<Procedure | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [starting, setStarting] = useState(false)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    if (!slug) return
    fetch(`${API_URL}/procedures/${slug}`)
      .then(r => {
        if (!r.ok) throw new Error('not found')
        return r.json()
      })
      .then(data => {
        setProcedure(data)
        setLoading(false)
      })
      .catch(() => {
        setError('الإجراء غير موجود')
        setLoading(false)
      })
  }, [slug])

  const startProcedure = async () => {
    const token = getToken()
    if (!token) {
      router.push('/login')
      return
    }
    setStarting(true)
    try {
      const res = await fetch(`${API_URL}/my-procedures`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ procedure_id: procedure!.id }),
      })
      if (res.ok) {
        setStarted(true)
        setTimeout(() => router.push('/my-files'), 1500)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setStarting(false)
    }
  }

  const tierLabel = ['', 'قانون رسمي', 'جهة حكومية', 'تعميم رسمي', 'مصدر مهني', 'معلومة تشغيلية']

  if (loading) return (
    <div
      style={{ minHeight: '100vh', background: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cairo','Inter',sans-serif" }}
      dir="rtl"
    >
      <div style={{ color: '#9CA3AF', fontSize: 15 }}>جارٍ التحميل...</div>
    </div>
  )

  if (error || !procedure) return (
    <div
      style={{ minHeight: '100vh', background: '#F9FAFB', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cairo','Inter',sans-serif" }}
      dir="rtl"
    >
      <div style={{ fontSize: 48, marginBottom: 16 }}>😕</div>
      <p style={{ color: '#6B7280', marginBottom: 12 }}>{error || 'الإجراء غير موجود'}</p>
      <Link href="/services" style={{ color: '#2563EB', textDecoration: 'underline' }}>← العودة للخدمات</Link>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', fontFamily: "'Cairo','Inter',sans-serif" }} dir="rtl">
      <style>{`* { box-sizing: border-box; }`}</style>

      {/* Header */}
      <header style={{ background: 'linear-gradient(135deg, #6b2737 0%, #8B1A1A 100%)', padding: '12px 16px', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => router.push('/services')}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.85)', cursor: 'pointer', padding: 4, display: 'flex', flexShrink: 0 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
          <div style={{ flex: 1, fontSize: 14, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {procedure.title_ar}
          </div>
          {procedure.status === 'verified' && (
            <span style={{ fontSize: 10, background: 'rgba(34,197,94,0.2)', color: '#86EFAC', borderRadius: 20, padding: '3px 10px', fontWeight: 700, flexShrink: 0 }}>
              ✓ محقق
            </span>
          )}
        </div>
      </header>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '16px 14px 80px' }}>

        {/* Breadcrumb */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#9CA3AF', marginBottom: 16 }}>
          <Link href="/services" style={{ color: '#2563EB', textDecoration: 'none' }}>الخدمات</Link>
          <span>›</span>
          <span style={{ color: '#374151' }}>{procedure.title_ar}</span>
        </nav>

        {/* Main card */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '20px', border: '1.5px solid #F0F0F0', marginBottom: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>{procedure.title_ar}</h1>
          <p style={{ fontSize: 12, color: '#9CA3AF', margin: '0 0 14px' }}>{procedure.title_en}</p>
          <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, margin: '0 0 18px' }}>{procedure.summary_ar}</p>

          {/* Quick stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 18 }}>
            {[
              { icon: '⏱️', label: 'المدة', value: procedure.duration_ar, bg: '#EFF6FF' },
              { icon: '💰', label: 'الرسوم', value: procedure.fee_ar, bg: '#F0FDF4' },
              { icon: '🏛️', label: 'الجهة', value: procedure.authority, bg: '#FAF5FF' },
            ].map((stat, i) => (
              <div key={i} style={{ background: stat.bg, borderRadius: 14, padding: '12px 10px', textAlign: 'center' }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{stat.icon}</div>
                <div style={{ fontSize: 10, color: '#6B7280', marginBottom: 3 }}>{stat.label}</div>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: '#111827', lineHeight: 1.3 }}>{stat.value}</div>
              </div>
            ))}
          </div>

          {/* CTA */}
          {started ? (
            <div style={{ width: '100%', background: '#16A34A', color: '#fff', padding: '16px', borderRadius: 14, textAlign: 'center', fontWeight: 800, fontSize: 16 }}>
              ✓ تم إنشاء الملف — جارٍ التحويل...
            </div>
          ) : (
            <button
              onClick={startProcedure}
              disabled={starting}
              style={{
                width: '100%', background: starting ? '#93C5FD' : '#1D4ED8', color: '#fff',
                padding: '16px', borderRadius: 14, border: 'none', cursor: starting ? 'not-allowed' : 'pointer',
                fontWeight: 800, fontSize: 16, fontFamily: "'Cairo','Inter',sans-serif", transition: 'background 0.15s',
              }}
            >
              {starting ? 'جارٍ الإنشاء...' : '📁 ابدأ متابعة هذه المعاملة'}
            </button>
          )}
        </div>

        {/* Documents */}
        {procedure.documents && procedure.documents.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 20, padding: '20px', border: '1.5px solid #F0F0F0', marginBottom: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#111827', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>📋</span> المستندات المطلوبة
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {procedure.documents.map((doc, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: '#F9FAFB' }}>
                  <span style={{ fontSize: 14, color: doc.required ? '#EF4444' : '#9CA3AF', flexShrink: 0 }}>
                    {doc.required ? '●' : '○'}
                  </span>
                  <span style={{ flex: 1, fontSize: 13, color: '#1F2937' }}>{doc.name_ar}</span>
                  {!doc.required && (
                    <span style={{ fontSize: 10, color: '#9CA3AF' }}>اختياري</span>
                  )}
                </div>
              ))}
            </div>
            <p style={{ fontSize: 10.5, color: '#9CA3AF', margin: '10px 0 0' }}>● مطلوب ○ اختياري</p>
          </div>
        )}

        {/* Steps */}
        {procedure.steps && procedure.steps.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 20, padding: '20px', border: '1.5px solid #F0F0F0', marginBottom: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#111827', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🗺️</span> الخطوات
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {procedure.steps.map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: 14 }}>
                  <div style={{
                    flexShrink: 0, width: 32, height: 32, background: '#1D4ED8', color: '#fff',
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 800,
                  }}>
                    {step.order}
                  </div>
                  <div style={{ flex: 1, paddingBottom: i < procedure.steps.length - 1 ? 14 : 0, borderBottom: i < procedure.steps.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>{step.title_ar}</h3>
                    <p style={{ fontSize: 12.5, color: '#6B7280', margin: 0, lineHeight: 1.5 }}>{step.desc_ar}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Source info */}
        <div style={{ background: '#F9FAFB', borderRadius: 16, padding: '14px 16px', border: '1.5px solid #E5E7EB', marginBottom: 14 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <span style={{ fontSize: 11, color: '#6B7280' }}>
              📌 الجهة:{' '}
              {procedure.authority_url ? (
                <a href={procedure.authority_url} target="_blank" rel="noreferrer" style={{ color: '#2563EB' }}>{procedure.authority}</a>
              ) : procedure.authority}
            </span>
            <span style={{ fontSize: 11, color: '#6B7280' }}>
              🔒 مستوى المصدر: {tierLabel[procedure.source_tier] || 'غير محدد'}
            </span>
            <span style={{ fontSize: 11, color: '#6B7280' }}>
              📅 آخر تحقق: {procedure.last_verified}
            </span>
            {procedure.review_expiry && (
              <span style={{ fontSize: 11, color: new Date(procedure.review_expiry) < new Date() ? '#DC2626' : '#6B7280' }}>
                ⚠️ مراجعة قبل: {procedure.review_expiry}
              </span>
            )}
          </div>
        </div>

        {/* AI assistant link */}
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link
            href={`/?q=${encodeURIComponent(procedure.title_ar)}`}
            style={{ color: '#2563EB', fontSize: 13, textDecoration: 'underline' }}
          >
            💬 اسأل المساعد عن هذه المعاملة
          </Link>
        </div>
      </div>
    </div>
  )
}
