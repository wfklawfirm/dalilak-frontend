'use client'
import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getToken } from '@/lib/auth'
import BottomNav from '@/components/BottomNav'

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
      <div style={{ display:'flex', justifyContent:'center', marginBottom:8 }}><svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#D4C5B0" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M8 15s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/></svg></div>
      <p style={{ color:'#5C4A3A', fontSize:14, margin:0 }}>{error || 'الإجراء غير موجود'}</p>
      <Link href="/services" style={{ color:'#8B1A1A', textDecoration:'none', fontWeight:700, fontSize:13, display:'inline-flex', alignItems:'center', gap:4 }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B1A1A" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>العودة للخدمات</Link>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'#FAFAF8', fontFamily:"'Cairo','Inter',sans-serif" }} dir="rtl">
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:#EAE4D9; border-radius:4px; }
        .start-btn:hover:not(:disabled) { background: #6b2737 !important; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(139,26,26,0.35) !important; }
        .start-btn { transition: all 0.15s ease; }
      `}</style>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header style={{
        background:'linear-gradient(135deg, #6b2737 0%, #8B1A1A 60%, #7a1818 100%)',
        boxShadow:'0 4px 24px rgba(80,10,10,0.3)',
        padding:'13px 16px', position:'sticky', top:0, zIndex:50,
      }}>
        <div style={{ maxWidth:820, margin:'0 auto', display:'flex', alignItems:'center', gap:10 }}>
          <button
            onClick={() => router.push('/procedures')}
            style={{ background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:9, color:'#fff', cursor:'pointer', padding:'6px 8px', display:'flex', flexShrink:0 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
          <div style={{ display:'flex', alignItems:'center', gap:9, flex:1, minWidth:0 }}>
            <div style={{ width:32, height:32, borderRadius:9, background:'rgba(255,255,255,0.15)', border:'1.5px solid rgba(255,255,255,0.25)', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', flexShrink:0 }}>
              <img src="/logo.PNG" alt="دليلك" style={{ width:24, height:24, objectFit:'contain', display:'block' }} />
            </div>
            <div style={{ minWidth:0 }}>
              <h1 style={{ color:'#fff', fontSize:14, fontWeight:800, margin:0, lineHeight:1.2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {procedure.title_ar}
              </h1>
              <p style={{ color:'rgba(255,255,255,0.6)', fontSize:9.5, margin:0, marginTop:1 }}>
                {procedure.category} · {procedure.authority}
              </p>
            </div>
          </div>
          {procedure.status === 'verified' && (
            <span style={{ fontSize:10, background:'rgba(34,197,94,0.2)', color:'#86EFAC', borderRadius:20, padding:'3px 10px', fontWeight:700, flexShrink:0, display:'inline-flex', alignItems:'center', gap:4 }}>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
              محقق
            </span>
          )}
        </div>
      </header>

      <div className="proc-page-content" style={{ maxWidth:820, margin:'0 auto', padding:'16px 14px 80px' }}>

        {/* ── Breadcrumb ───────────────────────────────────────────────── */}
        <nav style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'#9C8E80', marginBottom:16 }}>
          <Link href="/procedures" style={{ color:'#8B1A1A', textDecoration:'none', fontWeight:600 }}>المعاملات</Link>
          <span>›</span>
          <span style={{ color:'#2D1B0E', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:200 }}>{procedure.title_ar}</span>
        </nav>

        {/* ── Main card ────────────────────────────────────────────────── */}
        <div style={{ background:'#fff', borderRadius:20, padding:'22px', border:'1.5px solid #EAE4D9', marginBottom:14, boxShadow:'0 2px 8px rgba(0,0,0,0.05)' }}>
          <h1 style={{ fontSize:21, fontWeight:900, color:'#1A1208', margin:'0 0 3px', lineHeight:1.3 }}>{procedure.title_ar}</h1>
          <p style={{ fontSize:12, color:'#9C8E80', margin:'0 0 14px' }}>{procedure.title_en}</p>
          <p style={{ fontSize:13.5, color:'#2D1B0E', lineHeight:1.75, margin:'0 0 20px' }}>{procedure.summary_ar}</p>

          {/* Quick stats */}
          <div style={{ display:'grid', gridTemplateColumns: procedure.fee_ar ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)', gap:10, marginBottom:procedure.fee_ar ? 8 : 20 }}>
            {[
              { svgPath: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B1A1A" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2"/></svg>, label:'المدة',  value:procedure.duration_ar, bg:'#FEF2F2', border:'rgba(139,26,26,0.1)' },
              ...(procedure.fee_ar ? [{ svgPath: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#065F46" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>, label:'الرسوم', value:procedure.fee_ar, bg:'#F0FDF4', border:'#BBF7D0' }] : []),
              { svgPath: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#92400E" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>, label:'الجهة',  value:procedure.authority,   bg:'#FEF9EC', border:'#FDE68A' },
            ].map((stat, i) => (
              <div key={i} style={{ background:stat.bg, border:`1px solid ${stat.border}`, borderRadius:14, padding:'13px 10px', textAlign:'center' }}>
                <div style={{ display:'flex', justifyContent:'center', marginBottom:5 }}>{stat.svgPath}</div>
                <div style={{ fontSize:10, color:'#9C8E80', marginBottom:3 }}>{stat.label}</div>
                <div style={{ fontSize:11.5, fontWeight:700, color:'#1A1208', lineHeight:1.3 }}>{stat.value || '—'}</div>
              </div>
            ))}
          </div>

          {/* Fee disclaimer — always shown */}
          <div style={{
            display:'flex', alignItems:'flex-start', gap:8,
            background:'#FFFBEB', border:'1px solid #FDE68A', borderRadius:11,
            padding:'9px 13px', marginBottom:16,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#92400E" strokeWidth="2" style={{ flexShrink:0, marginTop:1 }}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            <p style={{ margin:0, fontSize:11, color:'#92400E', lineHeight:1.55 }}>
              {procedure.fee_ar
                ? 'الرسوم المذكورة تقديرية وقابلة للتغيير. يُرجى التأكد من الجهة المختصة قبل التقديم.'
                : 'الرسوم تتفاوت وتتغير بشكل متكرر — يُرجى مراجعة الجهة المختصة مباشرةً للاطلاع على الرسوم الحالية.'}
            </p>
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
              <span style={{display:'inline-flex',alignItems:'center',justifyContent:'center',gap:6}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>تم إنشاء الملف — جارٍ التحويل...</span>
            </div>
          ) : (
            <button
              onClick={startProcedure}
              disabled={starting}
              className="start-btn"
              style={{
                width:'100%', padding:'15px',
                background: starting ? '#C53030' : 'linear-gradient(135deg, #8B1A1A, #6b2737)',
                color:'#fff', border:'none', borderRadius:14,
                cursor: starting ? 'not-allowed' : 'pointer',
                fontWeight:800, fontSize:15,
                fontFamily:"'Cairo','Inter',sans-serif",
                boxShadow:'0 4px 16px rgba(139,26,26,0.3)',
                opacity: starting ? 0.8 : 1,
              }}
            >
              <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                {starting
                  ? <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3"/></svg>جارٍ الإنشاء...</>
                  : <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h7a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/></svg>ابدأ متابعة هذه المعاملة</>
                }
              </span>
            </button>
          )}
        </div>

        {/* ── Documents ────────────────────────────────────────────────── */}
        {procedure.documents && procedure.documents.length > 0 && (
          <div style={{ background:'#fff', borderRadius:20, padding:'20px 22px', border:'1.5px solid #EAE4D9', marginBottom:14, boxShadow:'0 2px 8px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize:15, fontWeight:800, color:'#1A1208', margin:'0 0 14px', display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ width:32, height:32, borderRadius:9, background:'#FEF2F2', display:'inline-flex', alignItems:'center', justifyContent:'center', color:'#8B1A1A' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg></span>
              المستندات المطلوبة
            </h2>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {procedure.documents.map((doc, i) => (
                <div key={i} style={{
                  display:'flex', alignItems:'center', gap:10, padding:'10px 13px', borderRadius:11,
                  background: doc.required ? '#FAFAF8' : '#FAFAF8',
                  border: doc.required ? '1.5px solid #EAE4D9' : '1px solid #EAE4D9',
                }}>
                  <span style={{ flexShrink:0, display:'inline-flex', alignItems:'center' }}>
                    {doc.required
                      ? <svg width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4.5" fill="#8B1A1A"/></svg>
                      : <svg width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="none" stroke="#9C8E80" strokeWidth="1.5"/></svg>
                    }
                  </span>
                  <span style={{ flex:1, fontSize:13, color:'#1A1208', fontWeight: doc.required ? 600 : 400 }}>{doc.name_ar}</span>
                  {!doc.required && (
                    <span style={{ fontSize:10, color:'#9C8E80', background:'#EAE4D9', borderRadius:20, padding:'1px 8px' }}>اختياري</span>
                  )}
                </div>
              ))}
            </div>
            <p style={{ fontSize:10.5, color:'#9C8E80', margin:'10px 0 0', display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
              <span style={{ display:'inline-flex', alignItems:'center', gap:3 }}>
                <svg width="9" height="9" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4.5" fill="#8B1A1A"/></svg>
                إلزامي
              </span>
              <span style={{ display:'inline-flex', alignItems:'center', gap:3 }}>
                <svg width="9" height="9" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="none" stroke="#9C8E80" strokeWidth="1.5"/></svg>
                اختياري
              </span>
            </p>
          </div>
        )}

        {/* ── Steps ────────────────────────────────────────────────────────── */}
        {procedure.steps && procedure.steps.length > 0 && (
          <div style={{ background:'#fff', borderRadius:20, padding:'20px 22px', border:'1.5px solid #EAE4D9', marginBottom:14, boxShadow:'0 2px 8px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize:15, fontWeight:800, color:'#1A1208', margin:'0 0 14px', display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ width:32, height:32, borderRadius:9, background:'#FEF2F2', display:'inline-flex', alignItems:'center', justifyContent:'center', color:'#8B1A1A' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
              </span>
              خطوات الإجراء
            </h2>
            <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
              {procedure.steps.map((step, i) => {
                const isLast = i === procedure.steps.length - 1
                return (
                  <div key={i} style={{ display:'flex', gap:14, alignItems:'stretch', paddingBottom: isLast ? 0 : 16 }}>
                    {/* Number + connector */}
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flexShrink:0 }}>
                      <div style={{
                        width:30, height:30, borderRadius:'50%', flexShrink:0,
                        background:'linear-gradient(135deg, #8B1A1A, #6b2737)', color:'#fff',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:11, fontWeight:800,
                        boxShadow:'0 2px 8px rgba(139,26,26,0.25)',
                      }}>{step.order}</div>
                      {!isLast && (
                        <div style={{ width:2, flex:1, background:'linear-gradient(to bottom, rgba(139,26,26,0.25), rgba(139,26,26,0.06))', marginTop:6, borderRadius:1 }} />
                      )}
                    </div>
                    {/* Content */}
                    <div style={{ flex:1, paddingTop:4, paddingBottom: isLast ? 0 : 0 }}>
                      <p style={{ fontSize:13, fontWeight:700, color:'#1A1208', margin:'0 0 3px' }}>{step.title_ar}</p>
                      {step.desc_ar && <p style={{ fontSize:12, color:'#5C4A3A', margin:0, lineHeight:1.6 }}>{step.desc_ar}</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Source + Playbook ─────────────────────────────────────────────── */}
        <div style={{ background:'#fff', borderRadius:20, padding:'16px 22px', border:'1.5px solid #EAE4D9', marginBottom:14, boxShadow:'0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
            <div>
              <p style={{ fontSize:11, color:'#9C8E80', margin:'0 0 3px' }}>
                {tierLabel[procedure.source_tier] || 'مصدر موثّق'} · آخر تحقق: {procedure.last_verified ? new Date(procedure.last_verified).toLocaleDateString('ar-LB') : '—'}
              </p>
              {procedure.authority_url && (
                <a href={procedure.authority_url} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize:11, color:'#8B1A1A', fontWeight:700, textDecoration:'none', display:'inline-flex', alignItems:'center', gap:4 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                  الموقع الرسمي
                </a>
              )}
            </div>
            <button
              onClick={() => router.push(`/procedures/${procedure.slug}/playbook`)}
              style={{
                padding:'9px 18px', borderRadius:12,
                background:'linear-gradient(135deg, #8B1A1A, #6b2737)', color:'#fff',
                border:'none', cursor:'pointer', fontFamily:"'Cairo','Inter',sans-serif",
                fontSize:12, fontWeight:700, display:'flex', alignItems:'center', gap:6,
                boxShadow:'0 3px 10px rgba(139,26,26,0.25)',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>
              دليل التنفيذ التفصيلي
            </button>
          </div>
        </div>

        <p style={{ fontSize:11, color:'#9C8E80', textAlign:'center', margin:'0 0 20px', lineHeight:1.55 }}>
          المعلومات إرشادية ولا تُغني عن مراجعة الجهة المختصة أو استشارة متخصص قانوني.
        </p>

      </div>

      <BottomNav isAr={true} activeTab="procedures" />
    </div>
  )
}
