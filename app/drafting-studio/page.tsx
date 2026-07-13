'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import DraftingStudio from '@/components/DraftingStudio'

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
      <header style={{ background: 'linear-gradient(135deg, #7a1a1a 0%, #8B1A1A 60%, #7a1a1a 100%)', padding: '14px 16px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', padding: 4 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
            </button>
            <div>
              <h1 style={{ color: '#fff', fontSize: 15, fontWeight: 800, margin: 0 }}>✏️ استوديو الصياغة</h1>
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
          <p style={{ fontSize: 12.5, color: '#6B7280', margin: '0 0 10px', lineHeight: 1.6 }}>
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
          <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
          <p style={{ fontSize: 11.5, color: '#854D0E', margin: 0, lineHeight: 1.5 }}>
            <strong>تنبيه:</strong> جميع المسودات الصادرة للإرشاد فقط وليست وثائق رسمية. يُنصح بمراجعة محامٍ مرخّص قبل استخدام أي وثيقة قانونية.
          </p>
        </div>

        {/* Drafting Studio Component */}
        <DraftingStudio
          isAr={isAr}
          onSend={handleSend}
          onClose={() => router.push('/')}
        />
      </div>
    </div>
  )
}
