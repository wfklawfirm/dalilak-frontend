'use client'

/**
 * ChatWelcomeMessage — warm bilingual greeting shown in the empty chat.
 *
 * Displayed when messages array is empty and no input is being typed.
 * Shows a short greeting, 3 suggested starter questions the user can tap,
 * and a small Dalilak identity line.
 *
 * Props:
 *   onSelect  — called when user taps a suggestion chip
 *   isAr      — current language
 *   userName  — optional first name from user profile
 */

import React from 'react'

const STARTERS = [
  {
    ar: 'كيف أجدد جواز سفري اللبناني؟',
    en: 'How do I renew my Lebanese passport?',
    icon: '🛂',
  },
  {
    ar: 'ما الوثائق المطلوبة لاستخراج هوية الأحوال المدنية؟',
    en: 'What documents do I need for a civil ID card?',
    icon: '🪪',
  },
  {
    ar: 'كيف أسجل شركة في لبنان؟',
    en: 'How do I register a company in Lebanon?',
    icon: '🏢',
  },
  {
    ar: 'ما إجراءات الحصول على رخصة قيادة؟',
    en: 'How do I get a driving license?',
    icon: '🚗',
  },
]

interface Props {
  onSelect: (text: string) => void
  isAr: boolean
  userName?: string
}

export default function ChatWelcomeMessage({ onSelect, isAr, userName }: Props) {
  const greetingAr = userName ? `أهلاً ${userName} 👋` : 'أهلاً بك في دليلك 👋'
  const greetingEn = userName ? `Hello ${userName} 👋` : 'Welcome to Dalilak 👋'

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '28px 16px 12px',
        animation: 'fadeUp 0.25s ease both',
        textAlign: 'center',
      }}
    >
      {/* Logo mark */}
      <div style={{
        width: 54, height: 54, borderRadius: 16,
        background: 'linear-gradient(135deg, #F8EDEF, #FDE4E4)',
        border: '2px solid rgba(143,29,44,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 14, boxShadow: '0 4px 16px rgba(143,29,44,0.12)',
        overflow: 'hidden',
      }}>
        <img src="/logo-icon.png" alt="دليلك" style={{ width: 38, height: 38, objectFit: 'contain' }} />
      </div>

      {/* Greeting */}
      <h2 style={{ fontSize: 17, fontWeight: 800, color: '#191713', margin: '0 0 6px' }}>
        {isAr ? greetingAr : greetingEn}
      </h2>
      <p style={{ fontSize: 12.5, color: '#69645C', margin: '0 0 20px', maxWidth: 280, lineHeight: 1.6 }}>
        {isAr
          ? 'اسألني عن أي معاملة حكومية لبنانية — سأرشدك خطوة بخطوة'
          : 'Ask me about any Lebanese government procedure — I\'ll guide you step by step'}
      </p>

      {/* Starter chips */}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: 7,
        width: '100%', maxWidth: 340,
      }}>
        {STARTERS.slice(0, 3).map((s, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onSelect(isAr ? s.ar : s.en)}
            style={{
              display: 'flex', alignItems: 'center', gap: 9,
              padding: '10px 14px', borderRadius: 12,
              background: '#fff', border: '1.5px solid #E6E2DC',
              cursor: 'pointer', fontFamily: 'inherit',
              fontSize: 12, fontWeight: 500, color: '#191713',
              textAlign: isAr ? 'right' : 'left',
              transition: 'all 0.12s',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#8F1D2C'
              e.currentTarget.style.background = '#FEF5F5'
              e.currentTarget.style.color = '#8F1D2C'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#E6E2DC'
              e.currentTarget.style.background = '#fff'
              e.currentTarget.style.color = '#191713'
            }}
          >
            <span style={{ fontSize: 16, flexShrink: 0 }}>{s.icon}</span>
            <span style={{ flex: 1, lineHeight: 1.4 }}>
              {isAr ? s.ar : s.en}
            </span>
            <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0, opacity: 0.4, transform: isAr ? 'rotate(180deg)' : 'none' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        ))}
      </div>

      {/* Footer hint */}
      <p style={{ fontSize: 10, color: '#B0AA9E', marginTop: 16 }}>
        {isAr ? '⌨️ أو اكتب سؤالك مباشرة أدناه' : '⌨️ Or type your question below'}
      </p>
    </div>
  )
}
