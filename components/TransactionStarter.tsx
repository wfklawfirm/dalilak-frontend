'use client'

// ── TransactionStarter — 3-step wizard before entering GuidedFlow ────────────
// Phase 5: Clean user onboarding for any transaction.
// Questions: Who are you? / What type? / What do you need?

import React, { useState } from 'react'

export type StarterUserType = 'citizen' | 'expat' | 'lawyer' | 'company' | 'service_office'
export type StarterTxType = 'property' | 'contract' | 'civil' | 'business' | 'form_doc' | 'unsure'
export type StarterGoal = 'documents' | 'analyze' | 'checklist' | 'authority' | 'human_review'

export interface StarterResult {
  userType: StarterUserType
  txType: StarterTxType
  goal: StarterGoal
}

interface TransactionStarterProps {
  isAr: boolean
  onClose: () => void
  onResult: (result: StarterResult) => void
}

type Step = 1 | 2 | 3

const USER_TYPES: { id: StarterUserType; ar: string; en: string; icon: React.ReactNode }[] = [
  { id: 'citizen',        ar: 'مواطن',       en: 'Citizen',       icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8B1A1A" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg> },
  { id: 'expat',          ar: 'مغترب',       en: 'Expat',         icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8B1A1A" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> },
  { id: 'lawyer',         ar: 'محامٍ',        en: 'Lawyer',        icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8B1A1A" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"/></svg> },
  { id: 'company',        ar: 'شركة',        en: 'Company',       icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8B1A1A" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg> },
  { id: 'service_office', ar: 'مكتب خدمات', en: 'Service Office', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8B1A1A" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 7v1a3 3 0 006 0V7m0 1a3 3 0 006 0V7m0 1a3 3 0 006 0V7H3l2-4h14l2 4M5 21V11.5M19 21V11.5"/></svg> },
]

const TX_TYPES: { id: StarterTxType; ar: string; en: string; icon: React.ReactNode }[] = [
  { id: 'property',  ar: 'عقار',          en: 'Property',      icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#8B1A1A" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 10v11M12 10v11M16 10v11"/></svg> },
  { id: 'contract',  ar: 'عقد',           en: 'Contract',      icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#8B1A1A" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg> },
  { id: 'civil',     ar: 'أحوال شخصية', en: 'Civil Records', icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#8B1A1A" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg> },
  { id: 'business',  ar: 'شركة / أعمال', en: 'Business',      icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#8B1A1A" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg> },
  { id: 'form_doc',  ar: 'نموذج / مستند', en: 'Form / Doc',   icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#8B1A1A" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg> },
  { id: 'unsure',    ar: 'غير متأكد',     en: 'Not sure',      icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#8B1A1A" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> },
]

const GOALS: { id: StarterGoal; ar: string; en: string; icon: React.ReactNode; desc_ar: string; desc_en: string }[] = [
  { id: 'documents',    ar: 'معرفة المستندات المطلوبة', en: 'Know required documents', icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#8B1A1A" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>, desc_ar: 'ما الأوراق التي أحتاجها؟', desc_en: 'What documents do I need?' },
  { id: 'analyze',      ar: 'تحليل مستند',               en: 'Analyze a document',      icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#8B1A1A" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>, desc_ar: 'رفع ملف للتحليل والمراجعة', desc_en: 'Upload a file for review' },
  { id: 'checklist',    ar: 'إنشاء Checklist',            en: 'Create a checklist',      icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#8B1A1A" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>, desc_ar: 'قائمة مرجعية لأتابع تقدّمي', desc_en: 'Track my progress step by step' },
  { id: 'authority',    ar: 'معرفة الجهة المختصة',        en: 'Find the authority',      icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#8B1A1A" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 10v11M12 10v11M16 10v11"/></svg>, desc_ar: 'أين أراجع وكيف أتصل؟', desc_en: 'Where to go and how to contact' },
  { id: 'human_review', ar: 'طلب مراجعة بشرية',          en: 'Request human review',    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#8B1A1A" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>, desc_ar: 'أحتاج مراجعة من مختص', desc_en: 'I need review from a specialist' },
]

export default function TransactionStarter({ isAr, onClose, onResult }: TransactionStarterProps) {
  const [step, setStep] = useState<Step>(1)
  const [userType, setUserType] = useState<StarterUserType | null>(null)
  const [txType, setTxType] = useState<StarterTxType | null>(null)
  const [goal, setGoal] = useState<StarterGoal | null>(null)

  const dir = isAr ? 'rtl' : 'ltr'

  const T = {
    title1: isAr ? 'من أنت؟' : 'Who are you?',
    title2: isAr ? 'ما نوع المعاملة؟' : 'What type of transaction?',
    title3: isAr ? 'ماذا تريد الآن؟' : 'What do you need?',
    back: isAr ? 'رجوع' : 'Back',
    start: isAr ? 'ابدأ المسار' : 'Start Path',
    step: isAr ? 'خطوة' : 'Step',
    of: isAr ? 'من' : 'of',
  }

  const handleGoalSelect = (g: StarterGoal) => {
    setGoal(g)
    if (userType && txType) {
      onResult({ userType, txType, goal: g })
    }
  }

  const stepTitle = step === 1 ? T.title1 : step === 2 ? T.title2 : T.title3

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 300, backdropFilter: 'blur(3px)' }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed',
        left: '50%', top: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 301,
        background: '#fff',
        borderRadius: 22,
        boxShadow: '0 24px 80px rgba(0,0,0,0.22)',
        width: 'min(420px, calc(100vw - 28px))',
        maxHeight: 'min(640px, 90vh)',
        display: 'flex', flexDirection: 'column',
        fontFamily: "'Cairo','Inter',sans-serif",
        direction: dir,
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #6b2737 0%, #8B1A1A 100%)',
          padding: '16px 18px 14px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>
              {isAr ? 'ابدأ معاملة' : 'Start a Transaction'}
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)', marginTop: 1 }}>
              {T.step} {step} {T.of} 3 — {stepTitle}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          ><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12"/></svg></button>
        </div>

        {/* Progress bar */}
        <div style={{ height: 3, background: '#EAE4D9', flexShrink: 0 }}>
          <div style={{ height: '100%', background: '#8B1A1A', width: `${(step / 3) * 100}%`, transition: 'width 0.3s ease' }} />
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>

          {/* Step 1 — User type */}
          {step === 1 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {USER_TYPES.map(ut => (
                <button
                  key={ut.id}
                  onClick={() => { setUserType(ut.id); setStep(2) }}
                  style={{
                    padding: '16px 12px', borderRadius: 14,
                    background: userType === ut.id ? '#FEF2F2' : '#FAFAF8',
                    border: `1.5px solid ${userType === ut.id ? '#8B1A1A' : '#EAE4D9'}`,
                    cursor: 'pointer', fontFamily: 'inherit',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#8B1A1A'; e.currentTarget.style.background = '#FEF2F2' }}
                  onMouseLeave={e => { if (userType !== ut.id) { e.currentTarget.style.borderColor = '#EAE4D9'; e.currentTarget.style.background = '#FAFAF8' } }}
                >
                  <span style={{ display: 'flex' }}>{ut.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1208' }}>{isAr ? ut.ar : ut.en}</span>
                </button>
              ))}
            </div>
          )}

          {/* Step 2 — Transaction type */}
          {step === 2 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {TX_TYPES.map(tt => (
                <button
                  key={tt.id}
                  onClick={() => { setTxType(tt.id); setStep(3) }}
                  style={{
                    padding: '14px 12px', borderRadius: 14,
                    background: txType === tt.id ? '#FEF2F2' : '#FAFAF8',
                    border: `1.5px solid ${txType === tt.id ? '#8B1A1A' : '#EAE4D9'}`,
                    cursor: 'pointer', fontFamily: 'inherit',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#8B1A1A'; e.currentTarget.style.background = '#FEF2F2' }}
                  onMouseLeave={e => { if (txType !== tt.id) { e.currentTarget.style.borderColor = '#EAE4D9'; e.currentTarget.style.background = '#FAFAF8' } }}
                >
                  <span style={{ display: 'flex' }}>{tt.icon}</span>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: '#1A1208', textAlign: 'center' }}>{isAr ? tt.ar : tt.en}</span>
                </button>
              ))}
            </div>
          )}

          {/* Step 3 — Goal */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {GOALS.map(g => (
                <button
                  key={g.id}
                  onClick={() => handleGoalSelect(g.id)}
                  style={{
                    padding: '12px 14px', borderRadius: 14,
                    background: '#FAFAF8',
                    border: '1.5px solid #EAE4D9',
                    cursor: 'pointer', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', gap: 12,
                    textAlign: isAr ? 'right' : 'left',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#8B1A1A'; e.currentTarget.style.background = '#FEF2F2' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#EAE4D9'; e.currentTarget.style.background = '#FAFAF8' }}
                >
                  <span style={{ flexShrink: 0, display: 'flex' }}>{g.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1208' }}>{isAr ? g.ar : g.en}</div>
                    <div style={{ fontSize: 10.5, color: '#5C4A3A' }}>{isAr ? g.desc_ar : g.desc_en}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {step > 1 && (
          <div style={{ padding: '10px 16px 14px', borderTop: '1px solid #EAE4D9', flexShrink: 0 }}>
            <button
              onClick={() => setStep(s => (s - 1) as Step)}
              style={{
                background: 'none', border: '1.5px solid #EAE4D9',
                borderRadius: 10, padding: '8px 18px',
                fontSize: 12, fontWeight: 600, color: '#5C4A3A',
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              <span style={{ display:'inline-flex', alignItems:'center', gap:4 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
                {isAr ? 'رجوع' : 'Back'}
              </span>
            </button>
          </div>
        )}
      </div>
    </>
  )
}
