'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import DraftingStudio from '@/components/DraftingStudio'
import BottomNav from '@/components/BottomNav'

export default function DraftingStudioPage() {
  const router = useRouter()
  const [lang] = useState<'ar' | 'en'>('ar')
  const isAr = lang === 'ar'

  const handleSend = (prompt: string) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('dalilak_draft_prompt', prompt)
    }
    router.push('/?draft=true')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: "'Cairo','Inter',sans-serif" }} dir={isAr ? 'rtl' : 'ltr'}>
      <style>{`* { box-sizing: border-box; } ::-webkit-scrollbar { width: 3px; } ::-webkit-scrollbar-thumb { background: #EAE4D9; }`}</style>

      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #6b2737 0%, #8B1A1A 60%, #7a1818 100%)',
        padding: '13px 16px', position: 'sticky', top: 0, zIndex: 50,
        boxShadow: '0 4px 24px rgba(80,10,10,0.3)',
        animation: 'dsHeaderIn 0.3s cubic-bezier(0.22,1,0.36,1) both',
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <button type="button" aria-label="الرئيسية" onClick={() => router.push('/')}
            onTouchStart={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.22)' }}
            onTouchEnd={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 9, color: '#fff', cursor: 'pointer', padding: '6px 8px', display: 'flex', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, flex: 1 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
              <img src="/logo.PNG" alt="دليلك" style={{ width: 24, height: 24, objectFit: 'contain', display: 'block' }} />
            </div>
            <div>
              <h1 style={{ color: '#fff', fontSize: 15, fontWeight: 800, margin: 0, lineHeight: 1.2 }}>استوديو الصياغة</h1>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, margin: 0 }}>أنشئ مسودات قانونية أولية</p>
            </div>
          </div>
        </div>
      </header>

      <style>{`
        @keyframes dsHeaderIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes dsIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .ds-tag { transition: background 0.14s, border-color 0.14s; cursor: default; }
        .ds-tag:hover { background: rgba(139,26,26,0.12) !important; border-color: rgba(139,26,26,0.35) !important; }
      `}</style>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '20px 14px 100px' }}>

        {/* Intro card */}
        <div style={{ background: '#FEF2F2', border: '1.5px solid rgba(139,26,26,0.15)', borderRadius: 16, padding: '16px', marginBottom: 18, animation: 'dsIn 0.3s cubic-bezier(0.22,1,0.36,1) both', animationDelay: '0.05s' }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, color: '#1A1208', margin: '0 0 7px', display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #8B1A1A, #6b2737)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            </span>
            ما هو استوديو الصياغة؟
          </h2>
          <p style={{ fontSize: 12.5, color: '#5C4A3A', margin: '0 0 12px', lineHeight: 1.65 }}>
            استوديو الصياغة يساعدك على إنشاء مسودات أولية للوثائق القانونية اللبنانية. اختر نوع الوثيقة، أدخل البيانات، وسيولّد دليلك مسودة منسقة.
          </p>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {['إنذارات الإخلاء', 'عقود التمديد', 'رسائل الاعتراض', 'الوكالات القانونية', 'الطلبات الإدارية'].map((tag, i) => (
              <span key={tag} className="ds-tag" style={{ fontSize: 10.5, color: '#8B1A1A', background: 'rgba(139,26,26,0.07)', border: '1px solid rgba(139,26,26,0.18)', borderRadius: 20, padding: '3px 11px', fontWeight: 700, animation: 'dsIn 0.22s cubic-bezier(0.22,1,0.36,1) both', animationDelay: `${0.12 + i * 0.05}s` }}>{tag}</span>
            ))}
          </div>
        </div>

        {/* Disclaimer banner */}
        <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 12, padding: '10px 14px', marginBottom: 20, display: 'flex', gap: 8, alignItems: 'flex-start', animation: 'dsIn 0.28s cubic-bezier(0.22,1,0.36,1) both', animationDelay: '0.38s' }}>
          <span style={{ display: 'flex', flexShrink: 0, marginTop: 1 }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#B45309" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg></span>
          <p style={{ fontSize: 11.5, color: '#92400E', margin: 0, lineHeight: 1.65 }}>
            هذه المسودات للأغراض التوجيهية فقط وليست وثائق قانونية معتمدة. يُنصح بمراجعة محامٍ قبل استخدامها رسمياً.
          </p>
        </div>

        <DraftingStudio isAr={isAr} onSend={handleSend} />

      </div>

      <div className="bottom-nav-wrapper">
        <BottomNav isAr={isAr} activeTab="services" />
      </div>
    </div>
  )
}