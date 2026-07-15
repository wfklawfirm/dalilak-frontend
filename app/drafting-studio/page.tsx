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
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => router.push('/')}
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

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '20px 14px 100px' }}>

        {/* Intro card */}
        <div style={{ background: '#FEF2F2', border: '1.5px solid rgba(139,26,26,0.15)', borderRadius: 16, padding: '16px', marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: '#1A1208', margin: '0 0 8px' }}>
            ما هو استوديو الصياغة؟
          </h2>
          <p style={{ fontSize: 12.5, color: '#5C4A3A', margin: '0 0 10px', lineHeight: 1.6 }}>
            استوديو الصياغة يساعدك على إنشاء مسودات أولية للوثائق القانونية اللبنانية. اختر نوع الوثيقة، أدخل البيانات، وسيولّد دليلك مسودة منسقة.
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['إنذارات الإخلاء', 'عقود التمديد', 'رسائل الاعتراض', 'الوكالات القانونية', 'الطلبات الإدارية'].map(tag => (
              <span key={tag} style={{ fontSize: 10, color: '#8B1A1A', background: '#FEF2F2', border: '1px solid rgba(139,26,26,0.2)', borderRadius: 20, padding: '3px 10px', fontWeight: 600 }}>{tag}</span>
            ))}
          </div>
        </div>

        {/* Disclaimer banner */}
        <div style={{ background: '#FFFBEB', border: '1px solid #FEF08A', borderRadius: 12, padding: '10px 14px', marginBottom: 20, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <span style={{ display: 'flex', flexShrink: 0 }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#854D0E" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg></span>
          <p style={{ fontSize: 11.5, color: '#854D0E', margin: 0, lineHeight: 1.6 }}>
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