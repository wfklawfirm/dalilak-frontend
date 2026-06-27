'use client'

import React, { useState } from 'react'

interface GuidedFlowProps {
  isAr: boolean
  onSend: (message: string) => void
  onClose: () => void
}

const PROCEDURES = [
  { icon: '📘', ar: 'جواز سفر', en: 'Passport' },
  { icon: '📋', ar: 'سجل عدلي', en: 'Criminal Record' },
  { icon: '👨‍👩‍👦', ar: 'إخراج قيد', en: 'Civil Registry Extract' },
  { icon: '⚖️', ar: 'حصر إرث', en: 'Inheritance Certificate' },
  { icon: '🏭', ar: 'تأسيس شركة', en: 'Company Registration' },
  { icon: '🏗️', ar: 'رخصة بناء', en: 'Building Permit' },
  { icon: '📜', ar: 'تصديق مستند', en: 'Document Attestation' },
  { icon: '🏠', ar: 'بيع / شراء عقار', en: 'Real Estate Sale/Buy' },
  { icon: '✈️', ar: 'معاملات المغتربين', en: 'Expat Procedures' },
  { icon: '🚗', ar: 'تسجيل سيارة', en: 'Vehicle Registration' },
  { icon: '🪪', ar: 'بطاقة هوية', en: 'National ID Card' },
  { icon: '💍', ar: 'تسجيل زواج', en: 'Marriage Registration' },
  { icon: '👶', ar: 'تسجيل مولود', en: 'Birth Registration' },
  { icon: '🎓', ar: 'تصديق شهادة', en: 'Degree Attestation' },
  { icon: '🏥', ar: 'الضمان الاجتماعي', en: 'Social Security' },
  { icon: '🪪', ar: 'رخصة قيادة', en: "Driver's License" },
]

const INTENTS = [
  {
    icon: '📋',
    ar: 'المستندات المطلوبة',
    en: 'Required Documents',
    desc_ar: 'ما هي الأوراق التي أحتاجها؟',
    desc_en: "What documents do I need?",
    prefix_ar: 'ما هي كل المستندات والأوراق المطلوبة لإجراء معاملة',
    prefix_en: 'What are all the required documents for',
    suffix_ar: '؟ اعطني قائمة شاملة ومفصّلة.',
    suffix_en: '? Give me a comprehensive detailed list.',
  },
  {
    icon: '📝',
    ar: 'الخطوات كاملة',
    en: 'Step-by-Step Guide',
    desc_ar: 'كيف أنجز المعاملة خطوة بخطوة؟',
    desc_en: 'How do I complete it step by step?',
    prefix_ar: 'اشرح لي خطوات إتمام معاملة',
    prefix_en: 'Explain the steps to complete',
    suffix_ar: ' بالتفصيل من البداية للنهاية مع الجهات والأوقات.',
    suffix_en: ' in detail from start to finish including offices and timing.',
  },
  {
    icon: '🏛️',
    ar: 'الجهة المختصة',
    en: 'Responsible Authority',
    desc_ar: 'أين أراجع وكيف أتصل بهم؟',
    desc_en: 'Where to go and how to contact them?',
    prefix_ar: 'ما هي الجهة الرسمية المختصة بمعاملة',
    prefix_en: 'What is the official authority responsible for',
    suffix_ar: '؟ أعطني العنوان وأوقات العمل وأرقام الاتصال.',
    suffix_en: '? Give me the address, working hours, and contact numbers.',
  },
  {
    icon: '📄',
    ar: 'النموذج الرسمي',
    en: 'Official Form',
    desc_ar: 'ما هو النموذج وكيف أملأه؟',
    desc_en: 'What form do I need and how to fill it?',
    prefix_ar: 'ما هو النموذج الرسمي المطلوب لمعاملة',
    prefix_en: 'What is the official form needed for',
    suffix_ar: '؟ وكيف أملأه بشكل صحيح؟',
    suffix_en: '? And how do I fill it correctly?',
  },
  {
    icon: '💰',
    ar: 'الرسوم والتكاليف',
    en: 'Fees & Costs',
    desc_ar: 'كم ستكلفني هذه المعاملة؟',
    desc_en: 'How much will this procedure cost me?',
    prefix_ar: 'ما هي الرسوم والتكاليف الكاملة لمعاملة',
    prefix_en: 'What are the complete fees and costs for',
    suffix_ar: '؟ ضع قائمة بكل المبالغ المطلوبة.',
    suffix_en: '? List all amounts required.',
  },
  {
    icon: '✅',
    ar: 'Checklist جاهز',
    en: 'Ready Checklist',
    desc_ar: 'قائمة مرجعية لأتابع تقدّمي',
    desc_en: 'A reference list to track my progress',
    prefix_ar: 'أعطني checklist شامل ومنظّم لإتمام معاملة',
    prefix_en: 'Give me a comprehensive organized checklist to complete',
    suffix_ar: ' يشمل المستندات والخطوات والجهات.',
    suffix_en: ' including documents, steps, and authorities.',
  },
  {
    icon: '✈️',
    ar: 'للمغتربين في الخارج',
    en: 'For Expats Abroad',
    desc_ar: 'كيف أنجزها من خارج لبنان؟',
    desc_en: 'How to complete it from outside Lebanon?',
    prefix_ar: 'كيف يستطيع المغترب اللبناني في الخارج إجراء معاملة',
    prefix_en: 'How can a Lebanese expat abroad complete',
    suffix_ar: '؟ ما الخيارات المتاحة عبر السفارات أو التوكيل؟',
    suffix_en: '? What options are available through embassies or power of attorney?',
  },
  {
    icon: '🔄',
    ar: 'متابعة معاملة',
    en: 'Track a Procedure',
    desc_ar: 'معاملتي جارية، ماذا أفعل بعد؟',
    desc_en: 'My procedure is ongoing, what next?',
    prefix_ar: 'معاملتي الخاصة بـ',
    prefix_en: 'My procedure for',
    suffix_ar: ' جارية حالياً، كيف أتابعها وما الخطوات التالية؟',
    suffix_en: ' is currently in progress, how do I track it and what are the next steps?',
  },
]

export default function GuidedFlow({ isAr, onSend, onClose }: GuidedFlowProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [selectedProc, setSelectedProc] = useState<typeof PROCEDURES[0] | null>(null)
  const [search, setSearch] = useState('')

  const filtered = search.trim()
    ? PROCEDURES.filter(p =>
        p.ar.includes(search) || p.en.toLowerCase().includes(search.toLowerCase())
      )
    : PROCEDURES

  const handleSelectProc = (p: typeof PROCEDURES[0]) => {
    setSelectedProc(p)
    setStep(2)
  }

  const handleIntent = (intent: typeof INTENTS[0]) => {
    if (!selectedProc) return
    const proc = isAr ? selectedProc.ar : selectedProc.en
    const msg = isAr
      ? `[أجب بتنسيق منظّم مع عناوين واضحة: ## الخلاصة | ## المستندات المطلوبة | ## الخطوات | ## الجهة المختصة | ## الرسوم | ## تنبيه مهم]\n${intent.prefix_ar} "${proc}"${intent.suffix_ar}`
      : `[Answer in organized format with clear headings: ## Summary | ## Required Documents | ## Steps | ## Responsible Authority | ## Fees | ## Important Note]\n${intent.prefix_en} "${proc}"${intent.suffix_en}`
    onSend(msg)
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
          zIndex: 200, backdropFilter: 'blur(2px)',
        }}
      />

      {/* Panel */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 201,
        background: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
        boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
        maxHeight: '88vh', display: 'flex', flexDirection: 'column',
        animation: 'slideUp 0.25s cubic-bezier(0.34,1.2,0.64,1)',
      }}>
        <style>{`
          @keyframes slideUp { from { transform: translateY(100%); opacity:0 } to { transform: translateY(0); opacity:1 } }
        `}</style>

        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#E5E7EB' }} />
        </div>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', padding: '0 18px 12px',
          borderBottom: '1px solid #F0EBE0',
        }}>
          {step === 2 && (
            <button onClick={() => setStep(1)} style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px 4px 0',
              color: '#9C8E80', display: 'flex', alignItems: 'center',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d={isAr ? 'M9 18l6-6-6-6' : 'M15 18l-6-6 6-6'} />
              </svg>
            </button>
          )}
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: '#1A1208', margin: 0 }}>
              {step === 1
                ? (isAr ? '🗂️ ما هي معاملتك؟' : '🗂️ What is your procedure?')
                : (isAr ? `${selectedProc?.icon} ${selectedProc?.ar} — ماذا تريد؟` : `${selectedProc?.icon} ${selectedProc?.en} — What do you need?`)}
            </h2>
            {step === 1 && (
              <p style={{ fontSize: 11, color: '#9C8E80', margin: '2px 0 0' }}>
                {isAr ? 'اختر المعاملة وسيرشدك الأيجنت خطوة بخطوة' : 'Choose your procedure and the agent will guide you step by step'}
              </p>
            )}
          </div>
          <button onClick={onClose} style={{
            background: '#F5F5F5', border: 'none', cursor: 'pointer',
            width: 30, height: 30, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, color: '#6B7280', fontWeight: 700,
          }}>×</button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 24px' }}>

          {step === 1 && (
            <>
              {/* Search */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: '#F9FAFB', border: '1.5px solid #E5E7EB', borderRadius: 12,
                padding: '8px 12px', marginBottom: 14,
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9C8E80" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/>
                </svg>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={isAr ? 'ابحث عن معاملتك...' : 'Search your procedure...'}
                  dir={isAr ? 'rtl' : 'ltr'}
                  style={{
                    border: 'none', background: 'none', outline: 'none',
                    flex: 1, fontSize: 13.5, color: '#1A1208', fontFamily: 'inherit',
                  }}
                />
              </div>

              {/* Procedure grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
                {filtered.map((p, i) => (
                  <button key={i} onClick={() => handleSelectProc(p)} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '12px 14px', borderRadius: 14,
                    background: '#fff', border: '1.5px solid #EAE4D9',
                    cursor: 'pointer', fontFamily: 'inherit',
                    textAlign: isAr ? 'right' : 'left',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#8B1A1A'; e.currentTarget.style.background = '#FEF9F9' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#EAE4D9'; e.currentTarget.style.background = '#fff' }}
                  onTouchStart={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.transform = 'scale(0.97)' }}
                  onTouchEnd={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'scale(1)' }}>
                    <span style={{ fontSize: 22, flexShrink: 0 }}>{p.icon}</span>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: '#1A1208', lineHeight: 1.3 }}>
                      {isAr ? p.ar : p.en}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {INTENTS.map((intent, i) => (
                <button key={i} onClick={() => handleIntent(intent)} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '13px 16px', borderRadius: 14,
                  background: '#fff', border: '1.5px solid #EAE4D9',
                  cursor: 'pointer', fontFamily: 'inherit',
                  textAlign: isAr ? 'right' : 'left',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#8B1A1A'; e.currentTarget.style.background = '#FEF9F9' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#EAE4D9'; e.currentTarget.style.background = '#fff' }}
                onTouchStart={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.transform = 'scale(0.98)' }}
                onTouchEnd={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'scale(1)' }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                    background: 'linear-gradient(135deg, #FEF2F2 0%, #FDE8E8 100%)',
                    border: '1px solid rgba(139,26,26,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20,
                  }}>{intent.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: '#1A1208' }}>
                      {isAr ? intent.ar : intent.en}
                    </div>
                    <div style={{ fontSize: 11, color: '#9C8E80', marginTop: 2 }}>
                      {isAr ? intent.desc_ar : intent.desc_en}
                    </div>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C4B8A8" strokeWidth="2"
                    style={{ flexShrink: 0, transform: isAr ? 'rotate(180deg)' : 'none' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6"/>
                  </svg>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
