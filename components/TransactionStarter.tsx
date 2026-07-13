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

const USER_TYPES: { id: StarterUserType; ar: string; en: string; icon: string }[] = [
  { id: 'citizen',        ar: 'مواطن',        en: 'Citizen',       icon: '👤' },
  { id: 'expat',          ar: 'مغترب',        en: 'Expat',         icon: '✈️' },
  { id: 'lawyer',         ar: 'محامٍ',         en: 'Lawyer',        icon: '⚖️' },
  { id: 'company',        ar: 'شركة',         en: 'Company',       icon: '🏭' },
  { id: 'service_office', ar: 'مكتب خدمات',  en: 'Service Office', icon: '🏢' },
]

const TX_TYPES: { id: StarterTxType; ar: string; en: string; icon: string }[] = [
  { id: 'property',  ar: 'عقار',               en: 'Property',      icon: '🏛️' },
  { id: 'contract',  ar: 'عقد',                en: 'Contract',      icon: '📝' },
  { id: 'civil',     ar: 'أحوال شخصية',        en: 'Civil Records', icon: '👨‍👩‍👦' },
  { id: 'business',  ar: 'شركة / أعمال',       en: 'Business',      icon: '🏭' },
  { id: 'form_doc',  ar: 'نموذج / مستند',      en: 'Form / Doc',    icon: '📄' },
  { id: 'unsure',    ar: 'غير متأكد',           en: 'Not sure',      icon: '🤔' },
]

const GOALS: { id: StarterGoal; ar: string; en: string; icon: string; desc_ar: string; desc_en: string }[] = [
  { id: 'documents',    ar: 'معرفة المستندات المطلوبة', en: 'Know required documents', icon: '📋', desc_ar: 'ما الأوراق التي أحتاجها؟', desc_en: 'What documents do I need?' },
  { id: 'analyze',      ar: 'تحليل مستند',               en: 'Analyze a document',      icon: '🔍', desc_ar: 'رفع ملف للتحليل والمراجعة', desc_en: 'Upload a file for review' },
  { id: 'checklist',    ar: 'إنشاء Checklist',            en: 'Create a checklist',      icon: '✅', desc_ar: 'قائمة مرجعية لأتابع تقدّمي', desc_en: 'Track my progress step by step' },
  { id: 'authority',    ar: 'معرفة الجهة المختصة',        en: 'Find the authority',      icon: '🏛️', desc_ar: 'أين أراجع وكيف أتصل؟', desc_en: 'Where to go and how to contact' },
  { id: 'human_review', ar: 'طلب مراجعة بشرية',          en: 'Request human review',    icon: '👨‍💼', desc_ar: 'أحتاج مراجعة من مختص', desc_en: 'I need review from a specialist' },
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
            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', color: '#fff', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >✕</button>
        </div>

        {/* Progress bar */}
        <div style={{ height: 3, background: '#F3F4F6', flexShrink: 0 }}>
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
                    background: userType === ut.id ? '#FEF2F2' : '#FAFAFA',
                    border: `1.5px solid ${userType === ut.id ? '#8B1A1A' : '#E5E7EB'}`,
                    cursor: 'pointer', fontFamily: 'inherit',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#8B1A1A'; e.currentTarget.style.background = '#FEF2F2' }}
                  onMouseLeave={e => { if (userType !== ut.id) { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.background = '#FAFAFA' } }}
                >
                  <span style={{ fontSize: 26 }}>{ut.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{isAr ? ut.ar : ut.en}</span>
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
                    background: txType === tt.id ? '#FEF2F2' : '#FAFAFA',
                    border: `1.5px solid ${txType === tt.id ? '#8B1A1A' : '#E5E7EB'}`,
                    cursor: 'pointer', fontFamily: 'inherit',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#8B1A1A'; e.currentTarget.style.background = '#FEF2F2' }}
                  onMouseLeave={e => { if (txType !== tt.id) { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.background = '#FAFAFA' } }}
                >
                  <span style={{ fontSize: 24 }}>{tt.icon}</span>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: '#111827', textAlign: 'center' }}>{isAr ? tt.ar : tt.en}</span>
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
                    background: '#FAFAFA',
                    border: '1.5px solid #E5E7EB',
                    cursor: 'pointer', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', gap: 12,
                    textAlign: isAr ? 'right' : 'left',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#8B1A1A'; e.currentTarget.style.background = '#FEF2F2' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.background = '#FAFAFA' }}
                >
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{g.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{isAr ? g.ar : g.en}</div>
                    <div style={{ fontSize: 10.5, color: '#6B7280' }}>{isAr ? g.desc_ar : g.desc_en}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {step > 1 && (
          <div style={{ padding: '10px 16px 14px', borderTop: '1px solid #F3F4F6', flexShrink: 0 }}>
            <button
              onClick={() => setStep(s => (s - 1) as Step)}
              style={{
                background: 'none', border: '1.5px solid #E5E7EB',
                borderRadius: 10, padding: '8px 18px',
                fontSize: 12, fontWeight: 600, color: '#6B7280',
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              {isAr ? '← رجوع' : '← Back'}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
