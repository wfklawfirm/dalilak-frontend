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
      <header style={{ background: 'linear-gradient(135deg, #6b2737 0%, #8B1A1A 60%, #7a1818 100%)', padding: '14px 16px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', padding: 4 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
            </button>
            <div>
              <h1 style={{ color: '#fff', fontSize: 15, fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>استوديو الصياغة</h1>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10.5, margin: 0 }}>أنشئ مسودات قانونية أولية</p>
            </div>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '20px 14px 100px' }}>

        {/* Intro card */}
        <div style={{ background: 'linear-gradient(135deg, #FEF2F2, #FFF7F7)', border: '1.5px solid rgba(139,26,26,0.15)', borderRadius: 16, padding: '16px', marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: '#1A1208', margin: '0 0 8px' }}>
            ما هو استوديو الصياغة؟
          </h2>
          <p style={{ fontSize: 12.5, color: '#5C4A3A', margin: '0 0 10px', lineHeight: 1.6 }}>
            استوديو الصياغة يساعدك على إنشاء مسودات أولية للوثائق القانونية اللبنانية. اختر نوع الوثيقة، أدخل البيانات، وسيولّد الذكاء الاصطناعي مسودة منسقة.
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
        <BottomNav isAr={isAr} activeTab="drafting" />
      </div>
    </div>
  )
}