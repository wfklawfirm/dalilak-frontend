'use client'

import React, { useState } from 'react'

interface GuidedFlowProps {
  isAr: boolean
  onSend: (message: string) => void
  onClose: () => void
}

// ── Procedure List ────────────────────────────────────────────
const PROCEDURES = [
  { icon: '📘', ar: 'جواز سفر', en: 'Passport', slug: 'passport' },
  { icon: '📋', ar: 'سجل عدلي', en: 'Criminal Record', slug: 'criminal-record' },
  { icon: '👨‍👩‍👦', ar: 'إخراج قيد', en: 'Civil Registry Extract', slug: 'civil-registry-extract' },
  { icon: '⚖️', ar: 'حصر إرث', en: 'Inheritance Certificate', slug: 'inheritance-certificate' },
  { icon: '🏭', ar: 'تأسيس شركة', en: 'Company Registration', slug: 'company-registration' },
  { icon: '🏗️', ar: 'رخصة بناء', en: 'Building Permit', slug: 'building-permit' },
  { icon: '📜', ar: 'تصديق مستند', en: 'Document Attestation', slug: 'document-attestation' },
  { icon: '🏠', ar: 'بيع / شراء عقار', en: 'Real Estate Sale/Buy', slug: 'property-transfer' },
  { icon: '✈️', ar: 'معاملات المغتربين', en: 'Expat Procedures', slug: 'expat' },
  { icon: '🚗', ar: 'تسجيل سيارة', en: 'Vehicle Registration', slug: 'vehicle-registration' },
  { icon: '🪪', ar: 'بطاقة هوية', en: 'National ID Card', slug: 'national-id' },
  { icon: '💍', ar: 'تسجيل زواج', en: 'Marriage Registration', slug: 'marriage-registration' },
  { icon: '👶', ar: 'تسجيل مولود', en: 'Birth Registration', slug: 'birth-certificate' },
  { icon: '🎓', ar: 'تصديق شهادة', en: 'Degree Attestation', slug: 'degree-attestation' },
  { icon: '🏥', ar: 'الضمان الاجتماعي', en: 'Social Security', slug: 'social-security' },
  { icon: '🚘', ar: 'رخصة قيادة', en: "Driver's License", slug: 'driver-license' },
]

// ── Procedure-specific questions ──────────────────────────────
interface ProcedureQuestion {
  id: string
  q_ar: string
  q_en: string
  options_ar: string[]
  options_en: string[]
}

const PROCEDURE_QUESTIONS: Record<string, ProcedureQuestion[]> = {
  passport: [
    {
      id: 'location',
      q_ar: 'أين أنت حالياً؟',
      q_en: 'Where are you currently?',
      options_ar: ['داخل لبنان', 'خارج لبنان (مغترب)'],
      options_en: ['Inside Lebanon', 'Outside Lebanon (expat)'],
    },
    {
      id: 'type',
      q_ar: 'ما نوع الطلب؟',
      q_en: 'What type of request?',
      options_ar: ['استخراج جواز جديد', 'تجديد جواز منتهي'],
      options_en: ['New passport', 'Renew expired passport'],
    },
    {
      id: 'applicant',
      q_ar: 'لمن الجواز؟',
      q_en: 'The passport is for?',
      options_ar: ['بالغ (18+)', 'قاصر (أقل من 18)'],
      options_en: ['Adult (18+)', 'Minor (under 18)'],
    },
  ],
  'civil-registry-extract': [
    {
      id: 'type',
      q_ar: 'ما نوع إخراج القيد المطلوب؟',
      q_en: 'What type of extract do you need?',
      options_ar: ['إخراج قيد فردي', 'إخراج قيد عائلي'],
      options_en: ['Individual extract', 'Family extract'],
    },
    {
      id: 'purpose',
      q_ar: 'لأي غرض تحتاجه؟',
      q_en: 'What is it for?',
      options_ar: ['معاملة رسمية داخلية', 'سفر / سفارة', 'غرض قانوني أو قضائي'],
      options_en: ['Official local procedure', 'Travel / Embassy', 'Legal / Court purpose'],
    },
  ],
  'company-registration': [
    {
      id: 'type',
      q_ar: 'ما نوع الشركة التي تريد تأسيسها؟',
      q_en: 'What type of company?',
      options_ar: ['شركة مساهمة (SAL)', 'شركة ذ.م.م (SARL)', 'مؤسسة فردية', 'لم أحدد بعد'],
      options_en: ['Joint-stock company (SAL)', 'LLC (SARL)', 'Sole proprietorship', 'Not sure yet'],
    },
    {
      id: 'sector',
      q_ar: 'ما قطاع النشاط؟',
      q_en: 'What sector?',
      options_ar: ['تجاري', 'خدمي', 'صناعي', 'تقني / رقمي'],
      options_en: ['Trade', 'Services', 'Industrial', 'Tech / Digital'],
    },
  ],
  'birth-certificate': [
    {
      id: 'timing',
      q_ar: 'متى وُلد الطفل؟',
      q_en: 'When was the child born?',
      options_ar: ['حديثاً (أقل من شهر)', 'منذ أشهر', 'منذ سنوات (تأخر في التسجيل)'],
      options_en: ['Recently (under 1 month)', 'A few months ago', 'Years ago (late registration)'],
    },
  ],
  'property-transfer': [
    {
      id: 'role',
      q_ar: 'ما دورك في المعاملة؟',
      q_en: 'What is your role?',
      options_ar: ['أنا البائع', 'أنا المشتري', 'وسيط / مفوّض'],
      options_en: ['I am the seller', 'I am the buyer', 'Agent / Proxy'],
    },
    {
      id: 'type',
      q_ar: 'ما نوع العقار؟',
      q_en: 'Property type?',
      options_ar: ['شقة سكنية', 'أرض', 'عقار تجاري', 'مبنى كامل'],
      options_en: ['Apartment', 'Land', 'Commercial property', 'Full building'],
    },
  ],
  expat: [
    {
      id: 'location',
      q_ar: 'في أي دولة أنت؟',
      q_en: 'Which country are you in?',
      options_ar: ['دولة الخليج', 'أوروبا / أمريكا', 'أفريقيا', 'دولة أخرى'],
      options_en: ['Gulf countries', 'Europe / America', 'Africa', 'Other country'],
    },
    {
      id: 'procedure',
      q_ar: 'ما المعاملة التي تريد إنجازها من الخارج؟',
      q_en: 'What procedure from abroad?',
      options_ar: ['توكيل رسمي', 'استخراج وثيقة', 'معاملة عقارية', 'أحوال شخصية'],
      options_en: ['Power of attorney', 'Get a document', 'Real estate transaction', 'Civil status'],
    },
  ],
}

// ── Intent options ────────────────────────────────────────────
const INTENTS = [
  { icon: '📋', ar: 'المستندات المطلوبة', en: 'Required Documents', desc_ar: 'ما هي الأوراق التي أحتاجها؟', desc_en: "What documents do I need?", prefix_ar: 'ما هي كل المستندات والأوراق المطلوبة لإجراء معاملة', prefix_en: 'What are all the required documents for', suffix_ar: '؟ اعطني قائمة شاملة ومفصّلة.', suffix_en: '? Give me a comprehensive detailed list.' },
  { icon: '📝', ar: 'الخطوات كاملة', en: 'Step-by-Step Guide', desc_ar: 'كيف أنجز المعاملة خطوة بخطوة؟', desc_en: 'How do I complete it step by step?', prefix_ar: 'اشرح لي خطوات إتمام معاملة', prefix_en: 'Explain the steps to complete', suffix_ar: ' بالتفصيل من البداية للنهاية مع الجهات والأوقات.', suffix_en: ' in detail from start to finish including offices and timing.' },
  { icon: '🏛️', ar: 'الجهة المختصة', en: 'Responsible Authority', desc_ar: 'أين أراجع وكيف أتصل بهم؟', desc_en: 'Where to go and how to contact them?', prefix_ar: 'ما هي الجهة الرسمية المختصة بمعاملة', prefix_en: 'What is the official authority for', suffix_ar: '؟ أعطني العنوان وأوقات العمل وأرقام الاتصال.', suffix_en: '? Give me the address, working hours, and contact.' },
  { icon: '📄', ar: 'النموذج الرسمي', en: 'Official Form', desc_ar: 'ما هو النموذج وكيف أملأه؟', desc_en: 'What form do I need and how to fill it?', prefix_ar: 'ما هو النموذج الرسمي المطلوب لمعاملة', prefix_en: 'What is the official form needed for', suffix_ar: '؟ وكيف أملأه بشكل صحيح؟', suffix_en: '? And how do I fill it correctly?' },
  { icon: '💰', ar: 'الرسوم والتكاليف', en: 'Fees & Costs', desc_ar: 'كم ستكلفني هذه المعاملة؟', desc_en: 'How much will this cost?', prefix_ar: 'ما هي الرسوم والتكاليف الكاملة لمعاملة', prefix_en: 'What are the complete fees for', suffix_ar: '؟ ضع قائمة بكل المبالغ المطلوبة.', suffix_en: '? List all amounts required.' },
  { icon: '✅', ar: 'Checklist جاهز', en: 'Ready Checklist', desc_ar: 'قائمة مرجعية لأتابع تقدّمي', desc_en: 'A reference list to track my progress', prefix_ar: 'أعطني checklist شامل ومنظّم لإتمام معاملة', prefix_en: 'Give me a checklist to complete', suffix_ar: ' يشمل المستندات والخطوات والجهات.', suffix_en: ' including documents, steps, and authorities.' },
  { icon: '✈️', ar: 'للمغتربين في الخارج', en: 'For Expats Abroad', desc_ar: 'كيف أنجزها من خارج لبنان؟', desc_en: 'How to complete from outside Lebanon?', prefix_ar: 'كيف يستطيع المغترب اللبناني إجراء معاملة', prefix_en: 'How can a Lebanese expat complete', suffix_ar: '؟ ما الخيارات عبر السفارات أو التوكيل؟', suffix_en: '? Options via embassies or power of attorney?' },
  { icon: '🔄', ar: 'متابعة معاملة', en: 'Track a Procedure', desc_ar: 'معاملتي جارية، ماذا أفعل بعد؟', desc_en: 'My procedure is ongoing, what next?', prefix_ar: 'معاملتي الخاصة بـ', prefix_en: 'My procedure for', suffix_ar: ' جارية حالياً، كيف أتابعها وما الخطوات التالية؟', suffix_en: ' is ongoing, how do I track it and what are the next steps?' },
]

type Step = 1 | 2 | 3

export default function GuidedFlow({ isAr, onSend, onClose }: GuidedFlowProps) {
  const [step, setStep] = useState<Step>(1)
  const [selectedProc, setSelectedProc] = useState<typeof PROCEDURES[0] | null>(null)
  const [search, setSearch] = useState('')
  // Contextual answers for procedure-specific questions
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [currentQIndex, setCurrentQIndex] = useState(0)

  const procQuestions = selectedProc ? (PROCEDURE_QUESTIONS[selectedProc.slug] || []) : []
  const hasQuestions = procQuestions.length > 0
  const totalSteps = hasQuestions ? 3 : 2
  // Step 2 = procedure questions (if any), Step 3 = intent
  // If no questions: Step 2 = intent

  const filtered = search.trim()
    ? PROCEDURES.filter(p => p.ar.includes(search) || p.en.toLowerCase().includes(search.toLowerCase()))
    : PROCEDURES

  const handleSelectProc = (p: typeof PROCEDURES[0]) => {
    setSelectedProc(p)
    setAnswers({})
    setCurrentQIndex(0)
    setStep(hasQuestions || (PROCEDURE_QUESTIONS[p.slug]?.length ?? 0) > 0 ? 2 : (2 as Step))
  }

  const handleAnswer = (qId: string, answer: string) => {
    const newAnswers = { ...answers, [qId]: answer }
    setAnswers(newAnswers)
    if (currentQIndex < procQuestions.length - 1) {
      setCurrentQIndex(i => i + 1)
    } else {
      setStep(3)
    }
  }

  const handleIntent = (intent: typeof INTENTS[0]) => {
    if (!selectedProc) return
    const proc = isAr ? selectedProc.ar : selectedProc.en

    // Build context from procedure-specific answers
    let contextDetails = ''
    if (Object.keys(answers).length > 0) {
      const details = Object.entries(answers).map(([, v]) => v).join('، ')
      contextDetails = isAr ? ` (التفاصيل: ${details})` : ` (Details: ${details})`
    }

    const msg = isAr
      ? `[أجب بتنسيق منظّم مع عناوين ## واضحة: ## الخلاصة | ## المستندات المطلوبة | ## الخطوات | ## الجهة المختصة | ## الرسوم | ## تنبيه مهم]\n${intent.prefix_ar} "${proc}"${contextDetails}${intent.suffix_ar}`
      : `[Answer in organized format: ## Summary | ## Required Documents | ## Steps | ## Responsible Authority | ## Fees | ## Important Note]\n${intent.prefix_en} "${proc}"${contextDetails}${intent.suffix_en}`
    onSend(msg)
    onClose()
  }

  const goBack = () => {
    if (step === 3 && hasQuestions) {
      setCurrentQIndex(procQuestions.length - 1)
      setStep(2)
    } else {
      setStep(1)
      setSelectedProc(null)
      setAnswers({})
      setCurrentQIndex(0)
    }
  }

  const stepLabel = () => {
    if (step === 1) return isAr ? 'اختر المعاملة' : 'Choose Procedure'
    if (step === 2 && hasQuestions) return isAr ? 'سؤال توضيحي' : 'Context question'
    return isAr ? 'اختر ما تريد' : 'What do you need?'
  }

  const currentQ = procQuestions[currentQIndex]

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, backdropFilter: 'blur(2px)' }} />

      {/* Panel */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 201,
        background: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
        boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
        maxHeight: '88vh', display: 'flex', flexDirection: 'column',
        animation: 'slideUp 0.25s cubic-bezier(0.34,1.2,0.64,1)',
      }}>
        <style>{`@keyframes slideUp { from { transform: translateY(100%); opacity:0 } to { transform: translateY(0); opacity:1 } }`}</style>

        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#E5E7EB' }} />
        </div>

        {/* Header with progress */}
        <div style={{ padding: '0 18px 12px', borderBottom: '1px solid #F0EBE0' }}>
          {/* Progress bar */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} style={{
                flex: 1, height: 3, borderRadius: 2,
                background: i < step ? '#8B1A1A' : '#E5E7EB',
                transition: 'background 0.3s',
              }} />
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {step > 1 && (
              <button onClick={goBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px 4px 0', color: '#9C8E80', display: 'flex', alignItems: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d={isAr ? 'M9 18l6-6-6-6' : 'M15 18l-6-6 6-6'} />
                </svg>
              </button>
            )}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <h2 style={{ fontSize: 15, fontWeight: 800, color: '#1A1208', margin: 0 }}>
                  {step === 1
                    ? (isAr ? '🗂️ ما هي معاملتك؟' : '🗂️ What is your procedure?')
                    : step === 2 && hasQuestions
                    ? (isAr ? `${selectedProc?.icon} ${selectedProc?.ar} — سؤال ${currentQIndex + 1}/${procQuestions.length}` : `${selectedProc?.icon} ${selectedProc?.en} — Q${currentQIndex + 1}/${procQuestions.length}`)
                    : (isAr ? `${selectedProc?.icon} ${selectedProc?.ar} — ماذا تريد؟` : `${selectedProc?.icon} ${selectedProc?.en} — What do you need?`)}
                </h2>
                <span style={{ fontSize: 10, color: '#9C8E80', fontWeight: 600, background: '#F5F5F5', borderRadius: 8, padding: '2px 7px' }}>
                  {isAr ? `${step} / ${totalSteps}` : `${step} / ${totalSteps}`}
                </span>
              </div>
              {step === 1 && (
                <p style={{ fontSize: 11, color: '#9C8E80', margin: '2px 0 0' }}>
                  {isAr ? 'اختر المعاملة وسيرشدك دليلك خطوة بخطوة' : 'Choose your procedure and Dalilak will guide you step by step'}
                </p>
              )}
            </div>
            <button onClick={onClose} style={{ background: '#F5F5F5', border: 'none', cursor: 'pointer', width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#6B7280', fontWeight: 700 }}>×</button>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 24px' }}>

          {/* Step 1 — Procedure selection */}
          {step === 1 && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F9FAFB', border: '1.5px solid #E5E7EB', borderRadius: 12, padding: '8px 12px', marginBottom: 14 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9C8E80" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/></svg>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder={isAr ? 'ابحث عن معاملتك...' : 'Search your procedure...'} dir={isAr ? 'rtl' : 'ltr'}
                  style={{ border: 'none', background: 'none', outline: 'none', flex: 1, fontSize: 13.5, color: '#1A1208', fontFamily: 'inherit' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
                {filtered.map((p, i) => (
                  <button key={i} onClick={() => handleSelectProc(p)} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 14,
                    background: '#fff', border: '1.5px solid #EAE4D9', cursor: 'pointer', fontFamily: 'inherit',
                    textAlign: isAr ? 'right' : 'left', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#8B1A1A'; e.currentTarget.style.background = '#FEF9F9' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#EAE4D9'; e.currentTarget.style.background = '#fff' }}
                  onTouchStart={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.transform = 'scale(0.97)' }}
                  onTouchEnd={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'scale(1)' }}>
                    <span style={{ fontSize: 22, flexShrink: 0 }}>{p.icon}</span>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: '#1A1208', lineHeight: 1.3 }}>{isAr ? p.ar : p.en}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Step 2 — Procedure-specific questions */}
          {step === 2 && hasQuestions && currentQ && (
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#1A1208', marginBottom: 16 }}>
                {isAr ? currentQ.q_ar : currentQ.q_en}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {(isAr ? currentQ.options_ar : currentQ.options_en).map((opt, i) => (
                  <button key={i} onClick={() => handleAnswer(currentQ.id, opt)} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 14,
                    background: '#fff', border: '1.5px solid #EAE4D9', cursor: 'pointer', fontFamily: 'inherit',
                    textAlign: isAr ? 'right' : 'left', fontSize: 13.5, fontWeight: 600, color: '#1A1208',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#8B1A1A'; e.currentTarget.style.background = '#FEF9F9' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#EAE4D9'; e.currentTarget.style.background = '#fff' }}
                  onTouchStart={e => { e.currentTarget.style.background = '#FEF2F2' }}
                  onTouchEnd={e => { e.currentTarget.style.background = '#fff' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#8B1A1A', flexShrink: 0 }} />
                    {opt}
                  </button>
                ))}
                <button onClick={() => setStep(3)} style={{
                  padding: '12px 16px', borderRadius: 14, border: '1.5px dashed #E5E7EB',
                  background: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  fontSize: 12, color: '#9C8E80',
                }}>
                  {isAr ? 'تخطي هذا السؤال →' : 'Skip this question →'}
                </button>
              </div>
            </div>
          )}

          {/* Step 2 (no questions) or Step 3 — Intent selection */}
          {(step === 3 || (step === 2 && !hasQuestions)) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {/* Context summary if we have answers */}
              {Object.keys(answers).length > 0 && (
                <div style={{ padding: '10px 14px', background: '#FEF9F9', border: '1px solid rgba(139,26,26,0.15)', borderRadius: 12, marginBottom: 4 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#8B1A1A', margin: '0 0 4px' }}>
                    {isAr ? '📌 ملخص اختياراتك:' : '📌 Your context:'}
                  </p>
                  <p style={{ fontSize: 11, color: '#5C3A1A', margin: 0 }}>
                    {Object.values(answers).join(' • ')}
                  </p>
                </div>
              )}
              {INTENTS.map((intent, i) => (
                <button key={i} onClick={() => handleIntent(intent)} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderRadius: 14,
                  background: '#fff', border: '1.5px solid #EAE4D9', cursor: 'pointer', fontFamily: 'inherit',
                  textAlign: isAr ? 'right' : 'left', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#8B1A1A'; e.currentTarget.style.background = '#FEF9F9' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#EAE4D9'; e.currentTarget.style.background = '#fff' }}
                onTouchStart={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.transform = 'scale(0.98)' }}
                onTouchEnd={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'scale(1)' }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                    background: 'linear-gradient(135deg, #FEF2F2 0%, #FDE8E8 100%)',
                    border: '1px solid rgba(139,26,26,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                  }}>{intent.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: '#1A1208' }}>{isAr ? intent.ar : intent.en}</div>
                    <div style={{ fontSize: 11, color: '#9C8E80', marginTop: 2 }}>{isAr ? intent.desc_ar : intent.desc_en}</div>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C4B8A8" strokeWidth="2" style={{ flexShrink: 0, transform: isAr ? 'rotate(180deg)' : 'none' }}>
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
