'use client'
import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getToken } from '@/lib/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dalilak-backend-bvb9.onrender.com'

interface Step     { order: number; title_ar: string; desc_ar: string }
interface Document { name_ar: string; required: boolean }

interface Procedure {
  id: string; slug: string
  title_ar: string; title_en: string
  category: string; country: string
  authority: string; authority_en: string; authority_url?: string
  summary_ar: string
  duration_ar: string; fee_ar: string
  documents: Document[]; steps: Step[]
  source_tier: number; last_verified: string; review_expiry: string
  status: string; tags: string[]
}

export default function ProcedurePage() {
  const { slug }  = useParams() as { slug: string }
  const router    = useRouter()
  const [procedure, setProcedure] = useState<Procedure | null>(null)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')
  const [starting,  setStarting]  = useState(false)
  const [started,   setStarted]   = useState(false)

  useEffect(() => {
    if (!slug) return
    fetch(`${API_URL}/procedures/${slug}`)
      .then(r => { if (!r.ok) throw new Error('not found'); return r.json() })
      .then(data => { setProcedure(data); setLoading(false) })
      .catch(() => { setError('الإجراء غير موجود'); setLoading(false) })
  }, [slug])

  const startProcedure = async () => {
    const token = getToken()
    if (!token) { router.push('/login'); return }
    setStarting(true)
    try {
      const res = await fetch(`${API_URL}/my-procedures`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ procedure_id: procedure!.id }),
      })
      if (res.ok) { setStarted(true); setTimeout(() => router.push('/my-files'), 1500) }
    } catch (e) { console.error(e) }
    finally { setStarting(false) }
  }

  const tierLabel = ['', 'قانون رسمي', 'جهة حكومية', 'تعميم رسمي', 'مصدر مهني', 'معلومة تشغيلية']

  /* ── Loading ─────────────────────────────────────────────────────────── */
  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#FAFAF8', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Cairo','Inter',sans-serif" }} dir="rtl">
      <div style={{ textAlign:'center' }}>
        <div style={{ width:36, height:36, border:'3px solid #EAE4D9', borderTopColor:'#8B1A1A', borderRadius:'50%', margin:'0 auto 14px', animation:'pr-spin 0.8s linear infinite' }} />
        <style>{`@keyframes pr-spin { to { transform:rotate(360deg) } }`}</style>
        <p style={{ color:'#9C8E80', fontSize:13, margin:0 }}>جارٍ التحميل...</p>
      </div>
    </div>
  )

  /* ── Error ───────────────────────────────────────────────────────────── */
  if (error || !procedure) return (
    <div style={{ minHeight:'100vh', background:'#FAFAF8', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', fontFamily:"'Cairo','Inter',sans-serif", gap:12 }} dir="rtl">
      <div style={{ fontSize:52 }}>😕</div>
      <p style={{ color:'#6B7280', fontSize:14, margin:0 }}>{error || 'الإجراء غير موجود'}</p>
      <Link href="/services" style={{ color:'#8B1A1A', textDecoration:'none', fontWeight:700, fontSize:13 }}>← العودة للخدمات</Link>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'#FAFAF8', fontFamily:"'Cairo','Inter',sans-serif" }} dir="rtl">
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:#EAE4D9; border-radius:4px; }
        .start-btn:hover:not(:disabled) { background: #6E1515 !important; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(139,26,26,0.35) !important; }
        .start-btn { transition: all 0.15s ease; }
      `}</style>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header style={{
        background:'linear-gradient(135deg, #6b2737 0%, #8B1A1A 60%, #7a1818 100%)',
        boxShadow:'0 1px 0 rgba(255,255,255,0.06), 0 4px 24px rgba(80,10,10,0.3)',
        padding:'14px 16px', position:'sticky', top:0, zIndex:50,
      }}>
        <div style={{ maxWidth:820, margin:'0 auto', display:'flex', alignItems:'center', gap:10 }}>
          <button
            onClick={() => router.push('/services')}
            style={{ background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:9, color:'#fff', cursor:'pointer', padding:'6px 8px', display:'flex', flexShrink:0 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
          <div style={{ flex:1, fontSize:14, fontWeight:700, color:'#fff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {procedure.title_ar}
          </div>
          {procedure.status === 'verified' && (
            <span style={{ fontSize:10, background:'rgba(34,197,94,0.2)', color:'#86EFAC', borderRadius:20, padding:'3px 10px', fontWeight:700, flexShrink:0 }}>
              ✓ محقق
            </span>
          )}
        </div>
      </header>

      <div style={{ maxWidth:820, margin:'0 auto', padding:'16px 14px 80px' }}>

        {/* ── Breadcrumb ───────────────────────────────────────────────── */}
        <nav style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'#9C8E80', marginBottom:16 }}>
          <Link href="/services" style={{ color:'#8B1A1A', textDecoration:'none', fontWeight:600 }}>الخدمات</Link>
          <span>›</span>
          <span style={{ color:'#374151' }}>{procedure.title_ar}</span>
        </nav>

        {/* ── Main card ────────────────────────────────────────────────── */}
        <div style={{ background:'#fff', borderRadius:20, padding:'22px', border:'1.5px solid #EAE4D9', marginBottom:14, boxShadow:'0 2px 8px rgba(0,0,0,0.05)' }}>
          <h1 style={{ fontSize:21, fontWeight:900, color:'#1A1208', margin:'0 0 3px', lineHeight:1.3 }}>{procedure.title_ar}</h1>
          <p style={{ fontSize:12, color:'#9C8E80', margin:'0 0 14px' }}>{procedure.title_en}</p>
          <p style={{ fontSize:13.5, color:'#374151', lineHeight:1.75, margin:'0 0 20px' }}>{procedure.summary_ar}</p>

          {/* Quick stats */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:10, marginBottom:20 }}>
            {[
              { icon:'⏱️', label:'المدة',  value:procedure.duration_ar, bg:'#FEF2F2', border:'rgba(139,26,26,0.1)' },
              { icon:'💰', label:'الرسوم', value:procedure.fee_ar,      bg:'#F0FDF4', border:'#BBF7D0' },
              { icon:'🏛️', label:'الجهة',  value:procedure.authority,   bg:'#FEF9EC', border:'#FDE68A' },
            ].map((stat, i) => (
              <div key={i} style={{ background:stat.bg, border:`1px solid ${stat.border}`, borderRadius:14, padding:'13px 10px', textAlign:'center' }}>
                <div style={{ fontSize:20, marginBottom:5 }}>{stat.icon}</div>
                <div style={{ fontSize:10, color:'#9C8E80', marginBottom:3 }}>{stat.label}</div>
                <div style={{ fontSize:11.5, fontWeight:700, color:'#1A1208', lineHeight:1.3 }}>{stat.value || '—'}</div>
              </div>
            ))}
          </div>

          {/* Tags */}
          {procedure.tags && procedure.tags.length > 0 && (
            <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:18 }}>
              {procedure.tags.map((tag, i) => (
                <span key={i} style={{ fontSize:10.5, background:'#FEF2F2', color:'#8B1A1A', borderRadius:20, padding:'3px 10px', border:'1px solid rgba(139,26,26,0.12)', fontWeight:600 }}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* CTA button */}
          {started ? (
            <div style={{ width:'100%', background:'linear-gradient(135deg,#15803D,#16A34A)', color:'#fff', padding:'16px', borderRadius:14, textAlign:'center', fontWeight:800, fontSize:16, boxShadow:'0 4px 16px rgba(22,163,74,0.3)' }}>
              ✓ تم إنشاء الملف — جارٍ التحويل...
            </div>
          ) : (
            <button
              onClick={startProcedure}
              disabled={starting}
              className="start-btn"
              style={{
                width:'100%', padding:'15px',
                background: starting ? '#C53030' : 'linear-gradient(135deg, #7a1a1a, #8B1A1A)',
                color:'#fff', border:'none', borderRadius:14,
                cursor: starting ? 'not-allowed' : 'pointer',
                fontWeight:800, fontSize:15,
                fontFamily:"'Cairo','Inter',sans-serif",
                boxShadow:'0 4px 16px rgba(139,26,26,0.3)',
                opacity: starting ? 0.8 : 1,
              }}
            >
              {starting ? '⏳ جارٍ الإنشاء...' : '📁 ابدأ متابعة هذه المعاملة'}
            </button>
          )}
        </div>

        {/* ── Documents ────────────────────────────────────────────────── */}
        {procedure.documents && procedure.documents.length > 0 && (
          <div style={{ background:'#fff', borderRadius:20, padding:'20px 22px', border:'1.5px solid #EAE4D9', marginBottom:14, boxShadow:'0 2px 8px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize:15, fontWeight:800, color:'#1A1208', margin:'0 0 14px', display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ width:32, height:32, borderRadius:9, background:'#FEF2F2', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>📋</span>
              المستندات المطلوبة
            </h2>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {procedure.documents.map((doc, i) => (
                <div key={i} style={{
                  display:'flex', alignItems:'center', gap:10, padding:'10px 13px', borderRadius:11,
                  background: doc.required ? '#FAFAF8' : '#F9FAFB',
                  border: doc.required ? '1.5px solid #EAE4D9' : '1px solid #F0F0F0',
                }}>
                  <span style={{ fontSize:13, color: doc.required ? '#8B1A1A' : '#9C8E80', flexShrink:0 }}>
                    {doc.required ? '●' : '○'}
                  </span>
                  <span style={{ flex:1, fontSize:13, color:'#1A1208', fontWeight: doc.required ? 600 : 400 }}>{doc.name_ar}</span>
                  {!doc.required && (
                    <span style={{ fontSize:10, color:'#9C8E80', background:'#F0EBE0', borderRadius:20, padding:'1px 8px' }}>اختياري</span>
                  )}
                </div>
              ))}
            </div>
            <p style={{ fontSize:10.5, color:'#9C8E80', margin:'10px 0 0' }}>● إلزامي &nbsp;○ اختياري</p>
          </div>
        )}

        {/* ── Steps ────────────────────────────────────────────────────── */}
        {procedure.steps && procedure.steps.length > 0 && (
          <div style={{ background:'#fff', borderRadius:20, padding:'20px 22px', border:'1.5px solid #EAE4D9', marginBottom:14, boxShadow:'0 2px 8px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize:15, fontWeight:800, color:'#1A1208', margin:'0 0 16px', display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ width:32, height:32, borderRadius:9, background:'#FEF2F2', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>🗺️</span>
              الخطوات
            </h2>
            <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
              {procedure.steps.map((step, i) => (
                <div key={i} style={{ display:'flex', gap:14, paddingBottom: i < procedure.steps.length - 1 ? 18 : 0 }}>
                  {/* Step number + connector line */}
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flexShrink:0 }}>
                    <div style={{
                      width:34, height:34,
                      background:'linear-gradient(135deg, #7a1a1a, #8B1A1A)',
                      color:'#fff', borderRadius:'50%',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:13, fontWeight:800, flexShrink:0,
                      boxShadow:'0 2px 8px rgba(139,26,26,0.3)',
                    }}>
                      {step.order}
                    </div>
                    {i < procedure.steps.length - 1 && (
                      <div style={{ width:2, flex:1, background:'linear-gradient(180deg, rgba(139,26,26,0.3), transparent)', marginTop:4, minHeight:16 }} />
                    )}
                  </div>
                  <div style={{ flex:1, paddingBottom: i < procedure.steps.length - 1 ? 4 : 0 }}>
                    <h3 style={{ fontSize:14, fontWeight:700, color:'#1A1208', margin:'5px 0 5px', lineHeight:1.3 }}>{step.title_ar}</h3>
                    <p style={{ fontSize:12.5, color:'#6B7280', margin:0, lineHeight:1.6 }}>{step.desc_ar}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Source meta ──────────────────────────────────────────────── */}
        <div style={{ background:'#FAFAF8', borderRadius:14, padding:'14px 16px', border:'1.5px solid #EAE4D9', marginBottom:16 }}>
          <div style={{ display:'flex', flexWrap:'wrap', gap:12 }}>
            <span style={{ fontSize:11, color:'#6B7280' }}>
              🏛️ الجهة:{' '}
              {procedure.authority_url ? (
                <a href={procedure.authority_url} target="_blank" rel="noreferrer" style={{ color:'#8B1A1A', fontWeight:600, textDecoration:'none' }}>{procedure.authority} ↗</a>
              ) : procedure.authority}
            </span>
            <span style={{ fontSize:11, color:'#6B7280' }}>
              🔒 مستوى المصدر: {tierLabel[procedure.source_tier] || 'غير محدد'}
            </span>
            <span style={{ fontSize:11, color:'#6B7280' }}>
              📅 آخر تحقق: {procedure.last_verified}
            </span>
            {procedure.review_expiry && (
              <span style={{ fontSize:11, color: new Date(procedure.review_expiry) < new Date() ? '#DC2626' : '#9C8E80' }}>
                ⚠️ مراجعة قبل: {procedure.review_expiry}
              </span>
            )}
          </div>
        </div>

        {/* ── AI assistant link ────────────────────────────────────────── */}
        <div style={{ textAlign:'center' }}>
          <Link
            href={`/?q=${encodeURIComponent(procedure.title_ar)}`}
            style={{
              display:'inline-flex', alignItems:'center', gap:8,
              background:'linear-gradient(135deg, #7a1a1a, #8B1A1A)',
              color:'#fff', textDecoration:'none', fontWeight:700, fontSize:13,
              padding:'11px 24px', borderRadius:12,
              boxShadow:'0 3px 12px rgba(139,26,26,0.25)',
            }}
          >
            <span>🤖</span> اسأل المساعد عن هذه المعاملة
          </Link>
        </div>

      </div>
    </div>
  )
}
