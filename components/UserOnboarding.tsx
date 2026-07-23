'use client'

/**
 * UserOnboarding — first-time user setup wizard.
 * Shows on first visit (localStorage key `dalilak_onboarded` not set).
 * 4 steps: Welcome → Language → User type → Get started
 * Stores: dalilak_onboarded, dalilak_user_type
 */

import React, { useState, useEffect } from 'react'
import { useLanguage } from '@/lib/LanguageContext'

const LS_KEY = 'dalilak_onboarded'
const LS_TYPE = 'dalilak_user_type'

type UserType = 'personal' | 'business' | 'expat' | 'property'

interface Props {
  onComplete: (userType: UserType | null) => void
}

const USER_TYPES: {
  id: UserType
  emojiAr: string
  emojiEn: string
  labelAr: string
  labelEn: string
  hintAr: string
  hintEn: string
  color: string
}[] = [
  {
    id: 'personal',
    emojiAr: '🪪', emojiEn: '🪪',
    labelAr: 'معاملات شخصية',
    labelEn: 'Personal Procedures',
    hintAr: 'جواز سفر، هوية، سجل مدني',
    hintEn: 'Passport, ID, civil registry',
    color: '#1a56db',
  },
  {
    id: 'business',
    emojiAr: '🏢', emojiEn: '🏢',
    labelAr: 'أعمال وشركات',
    labelEn: 'Business & Companies',
    hintAr: 'تأسيس شركة، رخص، ضرائب',
    hintEn: 'Company setup, licenses, taxes',
    color: '#0e9f6e',
  },
  {
    id: 'expat',
    emojiAr: '✈️', emojiEn: '✈️',
    labelAr: 'مغترب / وكيل',
    labelEn: 'Expat / Proxy',
    hintAr: 'توكيل، معاملات بالنيابة',
    hintEn: 'Power of attorney, proxy tasks',
    color: '#e3a008',
  },
  {
    id: 'property',
    emojiAr: '🏠', emojiEn: '🏠',
    labelAr: 'عقارات وملكية',
    labelEn: 'Property & Real Estate',
    hintAr: 'نقل ملكية، رهن، تسجيل',
    hintEn: 'Transfer, mortgage, registration',
    color: '#d03801',
  },
]

const QUICK_STARTS: Record<UserType, { ar: string; en: string }[]> = {
  personal: [
    { ar: 'كيف أستخرج جواز سفر لبناني؟', en: 'How do I get a Lebanese passport?' },
    { ar: 'كيف أجدد بطاقة الهوية؟', en: 'How do I renew my national ID?' },
    { ar: 'كيف أستخرج شهادة ميلاد؟', en: 'How do I get a birth certificate?' },
  ],
  business: [
    { ar: 'كيف أسجّل شركة في لبنان؟', en: 'How do I register a company in Lebanon?' },
    { ar: 'كيف أحصل على رخصة تجارية؟', en: 'How do I get a commercial license?' },
    { ar: 'كيف أقدّم إقرار ضريبي؟', en: 'How do I file an income tax return?' },
  ],
  expat: [
    { ar: 'كيف أوثّق توكيلاً رسمياً؟', en: 'How do I notarize a power of attorney?' },
    { ar: 'كيف أجدد جواز سفري من الخارج؟', en: 'How do I renew my passport from abroad?' },
    { ar: 'ما المستندات لنقل ملكية بالوكالة؟', en: 'What documents for property transfer by proxy?' },
  ],
  property: [
    { ar: 'كيف أنقل ملكية عقار؟', en: 'How do I transfer property ownership?' },
    { ar: 'كيف أسجّل عقاراً جديداً؟', en: 'How do I register a new property?' },
    { ar: 'ما رسوم تسجيل العقار؟', en: 'What are property registration fees?' },
  ],
}

export default function UserOnboarding({ onComplete }: Props) {
  const { isAr, toggleLang } = useLanguage()
  const [show, setShow] = useState(false)
  const [step, setStep] = useState(0) // 0=welcome, 1=language, 2=type, 3=done
  const [selectedType, setSelectedType] = useState<UserType | null>(null)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    // Only show if not onboarded yet
    try {
      if (!localStorage.getItem(LS_KEY)) {
        setShow(true)
      }
    } catch {
      // localStorage not available
    }
  }, [])

  const goNext = () => {
    if (animating) return
    setAnimating(true)
    setTimeout(() => {
      setStep(s => s + 1)
      setAnimating(false)
    }, 180)
  }

  const handleSkip = () => {
    try { localStorage.setItem(LS_KEY, '1') } catch {}
    setShow(false)
    onComplete(null)
  }

  const handleFinish = (type: UserType) => {
    try {
      localStorage.setItem(LS_KEY, '1')
      localStorage.setItem(LS_TYPE, type)
    } catch {}
    setShow(false)
    onComplete(type)
  }

  const handleLangSelect = (wantAr: boolean) => {
    // Toggle if current lang doesn't match
    if (isAr !== wantAr) toggleLang()
    goNext()
  }

  if (!show) return null

  const totalSteps = 3
  const progress = Math.round((step / totalSteps) * 100)

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: 'rgba(15, 10, 5, 0.65)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        style={{
          background: 'var(--bg)',
          borderRadius: 24,
          border: '1px solid var(--border)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.22)',
          width: '100%', maxWidth: 440,
          overflow: 'hidden',
          opacity: animating ? 0 : 1,
          transform: animating ? 'translateY(8px)' : 'translateY(0)',
          transition: 'opacity 0.18s ease, transform 0.18s ease',
        }}
      >
        {/* Progress bar */}
        {step > 0 && (
          <div style={{ height: 3, background: 'var(--border)', position: 'relative' }}>
            <div style={{
              position: 'absolute', top: 0, [isAr ? 'right' : 'left']: 0,
              height: '100%', width: `${progress}%`,
              background: 'var(--brand)',
              transition: 'width 0.3s ease',
              borderRadius: 2,
            }} />
          </div>
        )}

        {/* ── Step 0: Welcome ── */}
        {step === 0 && (
          <div style={{ padding: '32px 28px 24px' }}>
            {/* Logo / hero */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{
                width: 72, height: 72, borderRadius: 20,
                background: 'linear-gradient(135deg, #8F1D2C 0%, #C0392B 100%)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 34, marginBottom: 14,
                boxShadow: '0 8px 24px rgba(143,29,44,0.28)',
              }}>
                🏛️
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-1)', marginBottom: 6 }}>
                {isAr ? 'أهلاً بك في دليلك' : 'Welcome to Dalilak'}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.7, maxWidth: 320, margin: '0 auto' }}>
                {isAr
                  ? 'مساعدك الذكي لكل المعاملات الحكومية اللبنانية — خطوات، مستندات، رسوم، وأكثر.'
                  : 'Your AI guide for Lebanese government procedures — steps, documents, fees, and more.'}
              </div>
            </div>

            {/* Feature pills */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {[
                { icon: '📋', ar: 'أكثر من 400 معاملة حكومية', en: 'Over 400 government procedures' },
                { icon: '🔔', ar: 'تتبع مواعيدك ووثائقك', en: 'Track appointments & documents' },
                { icon: '💬', ar: 'مساعد AI يجيبك فوراً', en: 'AI assistant for instant answers' },
              ].map((f, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px',
                  background: 'var(--surface)',
                  borderRadius: 12,
                  border: '1px solid var(--border)',
                }}>
                  <span style={{ fontSize: 18 }}>{f.icon}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 500 }}>
                    {isAr ? f.ar : f.en}
                  </span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={goNext}
              style={{
                width: '100%', padding: '13px 0',
                background: 'linear-gradient(135deg, #8F1D2C 0%, #C0392B 100%)',
                color: '#fff', fontSize: 15, fontWeight: 800,
                border: 'none', borderRadius: 12,
                cursor: 'pointer', letterSpacing: '0.02em',
              }}
            >
              {isAr ? 'ابدأ الإعداد →' : 'Get Started →'}
            </button>

            <button
              type="button"
              onClick={handleSkip}
              style={{
                width: '100%', marginTop: 10, padding: '9px 0',
                background: 'none', border: 'none',
                color: 'var(--text-4)', fontSize: 12.5, cursor: 'pointer',
              }}
            >
              {isAr ? 'تخطي الإعداد' : 'Skip setup'}
            </button>
          </div>
        )}

        {/* ── Step 1: Language ── */}
        {step === 1 && (
          <div style={{ padding: '28px 28px 24px' }}>
            <div style={{ marginBottom: 6, fontSize: 11, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {isAr ? 'الخطوة 1 من 3' : 'Step 1 of 3'}
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-1)', marginBottom: 6 }}>
              {isAr ? 'اختر لغتك المفضّلة' : 'Choose your language'}
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginBottom: 20 }}>
              {isAr ? 'يمكنك التغيير في أي وقت من الشريط العلوي.' : 'You can change this anytime from the top bar.'}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { wantAr: true, emoji: '🇱🇧', label: 'العربية', sub: 'اللغة الافتراضية' },
                { wantAr: false, emoji: '🇬🇧', label: 'English', sub: 'Switch to English' },
              ].map(opt => (
                <button
                  key={String(opt.wantAr)}
                  type="button"
                  onClick={() => handleLangSelect(opt.wantAr)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 18px',
                    background: isAr === opt.wantAr ? 'rgba(143,29,44,0.06)' : 'var(--surface)',
                    border: `2px solid ${isAr === opt.wantAr ? 'var(--brand)' : 'var(--border)'}`,
                    borderRadius: 14, cursor: 'pointer', textAlign: 'start', width: '100%',
                    transition: 'border-color 0.15s, background 0.15s',
                  }}
                >
                  <span style={{ fontSize: 28 }}>{opt.emoji}</span>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)' }}>{opt.label}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 2 }}>{opt.sub}</div>
                  </div>
                  {isAr === opt.wantAr && (
                    <span style={{ marginInlineStart: 'auto', color: 'var(--brand)', fontSize: 16 }}>✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 2: User type ── */}
        {step === 2 && (
          <div style={{ padding: '28px 28px 24px' }}>
            <div style={{ marginBottom: 6, fontSize: 11, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {isAr ? 'الخطوة 2 من 3' : 'Step 2 of 3'}
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-1)', marginBottom: 6 }}>
              {isAr ? 'ما الذي تبحث عنه؟' : 'What are you looking for?'}
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginBottom: 20 }}>
              {isAr ? 'سنخصّص اقتراحاتنا لك.' : 'We\'ll personalize suggestions for you.'}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              {USER_TYPES.map(ut => (
                <button
                  key={ut.id}
                  type="button"
                  onClick={() => setSelectedType(t => t === ut.id ? null : ut.id)}
                  style={{
                    padding: '14px 12px',
                    background: selectedType === ut.id ? `${ut.color}12` : 'var(--surface)',
                    border: `2px solid ${selectedType === ut.id ? ut.color : 'var(--border)'}`,
                    borderRadius: 14, cursor: 'pointer', textAlign: 'center',
                    transition: 'border-color 0.15s, background 0.15s',
                  }}
                >
                  <div style={{ fontSize: 26, marginBottom: 6 }}>{ut.emojiAr}</div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-1)', marginBottom: 3 }}>
                    {isAr ? ut.labelAr : ut.labelEn}
                  </div>
                  <div style={{ fontSize: 10.5, color: 'var(--text-3)', lineHeight: 1.4 }}>
                    {isAr ? ut.hintAr : ut.hintEn}
                  </div>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => selectedType ? goNext() : handleSkip()}
              style={{
                width: '100%', padding: '13px 0',
                background: selectedType
                  ? 'linear-gradient(135deg, #8F1D2C 0%, #C0392B 100%)'
                  : 'var(--surface)',
                color: selectedType ? '#fff' : 'var(--text-3)',
                fontSize: 14, fontWeight: 800,
                border: `2px solid ${selectedType ? 'transparent' : 'var(--border)'}`,
                borderRadius: 12, cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {selectedType
                ? (isAr ? 'التالي →' : 'Next →')
                : (isAr ? 'تخطي' : 'Skip')}
            </button>
          </div>
        )}

        {/* ── Step 3: Get started ── */}
        {step === 3 && selectedType && (
          <div style={{ padding: '28px 28px 24px' }}>
            <div style={{ marginBottom: 6, fontSize: 11, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {isAr ? 'الخطوة 3 من 3' : 'Step 3 of 3'}
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-1)', marginBottom: 4 }}>
              {isAr ? 'جاهز! ابدأ بسؤال سريع' : 'All set! Start with a quick question'}
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginBottom: 20 }}>
              {isAr
                ? `بناءً على اهتمامك بـ «${USER_TYPES.find(t => t.id === selectedType)?.labelAr}»`
                : `Based on your interest in «${USER_TYPES.find(t => t.id === selectedType)?.labelEn}»`}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 20 }}>
              {QUICK_STARTS[selectedType].map((q, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleFinish(selectedType)}
                  data-question={isAr ? q.ar : q.en}
                  style={{
                    padding: '11px 14px',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 12, cursor: 'pointer', textAlign: 'start',
                    fontSize: 13, color: 'var(--text-1)', fontWeight: 500,
                    transition: 'border-color 0.12s, background 0.12s',
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--brand)'
                    e.currentTarget.style.background = 'rgba(143,29,44,0.04)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border)'
                    e.currentTarget.style.background = 'var(--surface)'
                  }}
                  onClickCapture={e => {
                    // Fire custom event so page.tsx can pick up the question
                    const q = e.currentTarget.getAttribute('data-question') || ''
                    window.dispatchEvent(new CustomEvent('dalilak_onboarding_question', { detail: { q } }))
                  }}
                >
                  <span style={{ color: 'var(--brand)', flexShrink: 0 }}>›</span>
                  {isAr ? q.ar : q.en}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => handleFinish(selectedType)}
              style={{
                width: '100%', padding: '13px 0',
                background: 'linear-gradient(135deg, #8F1D2C 0%, #C0392B 100%)',
                color: '#fff', fontSize: 14, fontWeight: 800,
                border: 'none', borderRadius: 12, cursor: 'pointer',
              }}
            >
              {isAr ? 'ابدأ بنفسي' : 'Start on my own'}
            </button>
          </div>
        )}

        {/* Step 3 fallback if no type selected */}
        {step === 3 && !selectedType && (() => { handleSkip(); return null })()}
      </div>
    </div>
  )
}
