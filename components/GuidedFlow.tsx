'use client'

import React, { useState } from 'react'
import { getFlow, buildFlowPrompt } from '@/lib/flows'
import type { FlowAnswers } from '@/lib/flows'

interface GuidedFlowProps {
  isAr: boolean
  onSend: (message: string) => void
  onClose: () => void
  /** optional: pre-select a procedure slug */
  initialSlug?: string
}

// ── Procedure list (for picker step) ──────────────────────────
const PROCEDURES = [
  { ar: 'جواز سفر', en: 'Passport', slug: 'passport' },
  { ar: 'سجل عدلي', en: 'Criminal Record', slug: 'criminal-record' },
  { ar: 'إخراج قيد', en: 'Civil Registry Extract', slug: 'civil-registry-extract' },
  { ar: 'حصر إرث', en: 'Inheritance Certificate', slug: 'inheritance-certificate' },
  { ar: 'تأسيس شركة', en: 'Company Registration', slug: 'company-registration' },
  { ar: 'رخصة بناء', en: 'Building Permit', slug: 'building-permit' },
  { ar: 'تصديق مستند', en: 'Document Attestation', slug: 'document-attestation' },
  { ar: 'بيع / شراء عقار', en: 'Real Estate Sale/Buy', slug: 'property-transfer' },
  { ar: 'معاملات المغتربين', en: 'Expat Procedures', slug: 'expat-services' },
  { ar: 'تسجيل سيارة', en: 'Vehicle Registration', slug: 'vehicle-registration' },
  { ar: 'بطاقة هوية', en: 'National ID Card', slug: 'national-id' },
  { ar: 'تسجيل زواج', en: 'Marriage Registration', slug: 'marriage-registration' },
  { ar: 'تسجيل مولود', en: 'Birth Registration', slug: 'birth-certificate' },
  { ar: 'تصديق شهادة', en: 'Degree Attestation', slug: 'degree-attestation' },
  { ar: 'الضمان الاجتماعي', en: 'Social Security', slug: 'social-security' },
  { ar: 'رخصة قيادة', en: "Driver's License", slug: 'driver-license' },
  { ar: 'توكيل رسمي', en: 'Power of Attorney', slug: 'power-of-attorney' },
]

// ── Intent SVG icons ───────────────────────────────────────────
const INTENT_ICONS: Record<string, JSX.Element> = {
  docs: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>,
  steps: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>,
  authority: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>,
  form: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>,
  checklist: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>,
  expat: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
}

// ── Fallback legacy intents (for slugs without a defined flow) ─
const INTENTS = [
  { iconKey: 'docs',      ar: 'المستندات المطلوبة', en: 'Required Documents', desc_ar: 'ما الأوراق التي أحتاجها؟', desc_en: "What documents do I need?", prefix_ar: 'ما هي كل المستندات والأوراق المطلوبة لإجراء معاملة', prefix_en: 'What are all the required documents for', suffix_ar: '؟ اعطني قائمة شاملة ومفصّلة.', suffix_en: '? Give me a comprehensive detailed list.' },
  { iconKey: 'steps',     ar: 'الخطوات كاملة', en: 'Step-by-Step Guide', desc_ar: 'كيف أنجز المعاملة خطوة بخطوة؟', desc_en: 'How do I complete it step by step?', prefix_ar: 'اشرح لي خطوات إتمام معاملة', prefix_en: 'Explain the steps to complete', suffix_ar: ' بالتفصيل من البداية للنهاية مع الجهات والأوقات.', suffix_en: ' in detail from start to finish.' },
  { iconKey: 'authority', ar: 'الجهة المختصة', en: 'Responsible Authority', desc_ar: 'أين أراجع وكيف أتصل بهم؟', desc_en: 'Where to go and how to contact them?', prefix_ar: 'ما هي الجهة الرسمية المختصة بمعاملة', prefix_en: 'What is the official authority for', suffix_ar: '؟ أعطني العنوان وأوقات العمل وأرقام الاتصال.', suffix_en: '? Give me the address, working hours, and contact.' },
  { iconKey: 'form',      ar: 'النموذج الرسمي', en: 'Official Form', desc_ar: 'ما هو النموذج وكيف أملأه؟', desc_en: 'What form do I need?', prefix_ar: 'ما هو النموذج الرسمي المطلوب لمعاملة', prefix_en: 'What is the official form needed for', suffix_ar: '؟ وكيف أملأه بشكل صحيح؟', suffix_en: '? And how do I fill it correctly?' },
  { iconKey: 'checklist', ar: 'Checklist جاهز', en: 'Ready Checklist', desc_ar: 'قائمة مرجعية لأتابع تقدّمي', desc_en: 'A reference list to track progress', prefix_ar: 'أعطني checklist شامل لإتمام معاملة', prefix_en: 'Give me a checklist to complete', suffix_ar: ' يشمل المستندات والخطوات والجهات.', suffix_en: ' including documents, steps, and authorities.' },
  { iconKey: 'expat',     ar: 'للمغتربين', en: 'For Expats Abroad', desc_ar: 'كيف أنجزها من خارج لبنان؟', desc_en: 'How to complete from outside Lebanon?', prefix_ar: 'كيف يستطيع المغترب إجراء معاملة', prefix_en: 'How can an expat complete', suffix_ar: '؟ ما الخيارات عبر السفارات أو التوكيل؟', suffix_en: '? Options via embassies or power of attorney?' },
]

// ── Wizard states ──────────────────────────────────────────────
type WizardPhase = 'pick_procedure' | 'flow_questions' | 'legacy_intent'

export default function GuidedFlow({ isAr, onSend, onClose, initialSlug }: GuidedFlowProps) {
  const initProc = initialSlug ? PROCEDURES.find(p => p.slug === initialSlug) ?? null : null

  const [phase, setPhase] = useState<WizardPhase>(initProc ? (getFlow(initProc.slug) ? 'flow_questions' : 'legacy_intent') : 'pick_procedure')
  const [selectedProc, setSelectedProc] = useState<typeof PROCEDURES[0] | null>(initProc)
  const [search, setSearch] = useState('')
  const [answers, setAnswers] = useState<FlowAnswers>({})
  const [stepIndex, setStepIndex] = useState(0)

  // Active flow definition (if available)
  const activeFlow = selectedProc ? getFlow(selectedProc.slug) : undefined
  const flowSteps = activeFlow?.steps ?? []
  const totalFlowSteps = flowSteps.length
  const currentFlowStep = flowSteps[stepIndex]

  // Progress display
  const progressNumerator = phase === 'pick_procedure' ? 0 : phase === 'flow_questions' ? stepIndex + 1 : totalFlowSteps
  const progressDenominator = phase === 'pick_procedure' ? 1 : (totalFlowSteps || 1)

  const filtered = search.trim()
    ? PROCEDURES.filter(p => p.ar.includes(search) || p.en.toLowerCase().includes(search.toLowerCase()))
    : PROCEDURES

  // ── Select procedure ───────────────────────────────────────
  const handleSelectProc = (p: typeof PROCEDURES[0]) => {
    setSelectedProc(p)
    setAnswers({})
    setStepIndex(0)
    const flow = getFlow(p.slug)
    setPhase(flow ? 'flow_questions' : 'legacy_intent')
  }

  // ── Answer a flow step ─────────────────────────────────────
  const handleFlowAnswer = (value: string) => {
    if (!currentFlowStep) return
    const newAnswers: FlowAnswers = { ...answers, [currentFlowStep.id]: value }
    setAnswers(newAnswers)

    if (stepIndex < totalFlowSteps - 1) {
      setStepIndex(i => i + 1)
    } else {
      // All flow steps answered — build prompt and send
      const desiredOutput = (newAnswers['desired_output'] as string) || 'full_guidance'
      const req = {
        procedureSlug: selectedProc!.slug,
        country: activeFlow!.country,
        userType: 'citizen',
        answers: newAnswers,
        desiredOutput: desiredOutput as 'checklist' | 'steps' | 'forms' | 'full_guidance',
        language: isAr ? 'ar' as const : 'en' as const,
      }
      onSend(buildFlowPrompt(req, isAr))
      onClose()
    }
  }

  // ── Skip current non-required step ────────────────────────
  const handleSkipStep = () => {
    if (stepIndex < totalFlowSteps - 1) {
      setStepIndex(i => i + 1)
    } else {
      setPhase('legacy_intent')
    }
  }

  // ── Legacy intent (for slugs without a defined flow) ───────
  const handleLegacyIntent = (intent: typeof INTENTS[0]) => {
    if (!selectedProc) return
    const proc = isAr ? selectedProc.ar : selectedProc.en
    const contextDetails = Object.values(answers).length > 0
      ? (isAr ? ` (التفاصيل: ${Object.values(answers).join('، ')})` : ` (Details: ${Object.values(answers).join(', ')})`)
      : ''
    const msg = isAr
      ? `[أجب بتنسيق منظّم مع عناوين ## واضحة: ## الخلاصة | ## المستندات المطلوبة | ## الخطوات | ## الجهة المختصة | ## الرسوم | ## تنبيه مهم]\n${intent.prefix_ar} "${proc}"${contextDetails}${intent.suffix_ar}`
      : `[Answer in organized format: ## Summary | ## Required Documents | ## Steps | ## Authority | ## Fees | ## Warning]\n${intent.prefix_en} "${proc}"${contextDetails}${intent.suffix_en}`
    onSend(msg)
    onClose()
  }

  // ── Back button ────────────────────────────────────────────
  const goBack = () => {
    if (phase === 'flow_questions' && stepIndex > 0) {
      setStepIndex(i => i - 1)
    } else if (phase === 'flow_questions' && stepIndex === 0) {
      setPhase('pick_procedure')
      setSelectedProc(null)
      setAnswers({})
    } else if (phase === 'legacy_intent') {
      setPhase('pick_procedure')
      setSelectedProc(null)
      setAnswers({})
    }
  }

  // ── Header label ──────────────────────────────────────────
  const headerLabel = () => {
    if (phase === 'pick_procedure') return isAr ? 'ما هي معاملتك؟' : 'What is your procedure?'
    if (phase === 'flow_questions') {
      return isAr
        ? `${selectedProc?.ar} — سؤال ${stepIndex + 1}/${totalFlowSteps}`
        : `${selectedProc?.en} — Q${stepIndex + 1}/${totalFlowSteps}`
    }
    return isAr ? `${selectedProc?.ar} — ماذا تريد؟` : `${selectedProc?.en} — What do you need?`
  }

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
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#D5CEC4' }} />
        </div>

        {/* Header */}
        <div style={{ padding: '0 18px 12px', borderBottom: '1px solid #F0EBE0' }}>
          {/* Progress bar */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
            {Array.from({ length: Math.max(progressDenominator, 1) }).map((_, i) => (
              <div key={i} style={{
                flex: 1, height: 3, borderRadius: 2,
                background: i < progressNumerator ? '#8B1A1A' : '#EAE4D9',
                transition: 'background 0.3s',
              }} />
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {phase !== 'pick_procedure' && (
              <button onClick={goBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px 4px 0', color: '#9C8E80', display: 'flex', alignItems: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d={isAr ? 'M9 18l6-6-6-6' : 'M15 18l-6-6 6-6'} />
                </svg>
              </button>
            )}
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: '#1A1208', margin: 0 }}>
                {headerLabel()}
              </h2>
              {phase === 'pick_procedure' && (
                <p style={{ fontSize: 11, color: '#9C8E80', margin: '2px 0 0' }}>
                  {isAr ? 'اختر المعاملة وسيرشدك دليلك خطوة بخطوة' : 'Choose your procedure and Dalilak will guide you'}
                </p>
              )}
              {phase === 'flow_questions' && currentFlowStep?.hintAr && (
                <p style={{ fontSize: 11, color: '#9C8E80', margin: '2px 0 0' }}>
                  {isAr ? currentFlowStep.hintAr : currentFlowStep.hintEn}
                </p>
              )}
            </div>
            <button onClick={onClose} style={{ background: '#EAE4D9', border: 'none', cursor: 'pointer', width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5C4A3A' }}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12"/></svg></button>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 24px' }}>

          {/* ── Phase 1: Pick procedure ── */}
          {phase === 'pick_procedure' && (
            <>
              <div className="search-wrap" style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FAFAF8', border: '1.5px solid #EAE4D9', borderRadius: 12, padding: '8px 12px', marginBottom: 14, transition: 'border-color 0.18s, box-shadow 0.18s' }}>
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
                    <span style={{ display: 'flex', flexShrink: 0, color: '#8B1A1A' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg></span>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: '#1A1208', lineHeight: 1.3 }}>{isAr ? p.ar : p.en}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* ── Phase 2: Flow questions ── */}
          {phase === 'flow_questions' && currentFlowStep && (
            <div>
              <p style={{ fontSize: 14.5, fontWeight: 700, color: '#1A1208', marginBottom: 16, lineHeight: 1.5 }}>
                {isAr ? currentFlowStep.questionAr : currentFlowStep.questionEn}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {currentFlowStep.options?.map((opt, i) => (
                  <button key={i} onClick={() => handleFlowAnswer(opt.value)} style={{
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
                    {isAr ? opt.labelAr : opt.labelEn}
                  </button>
                ))}
                {!currentFlowStep.required && (
                  <button onClick={handleSkipStep} style={{
                    padding: '12px 16px', borderRadius: 14, border: '1.5px dashed #D5CEC4',
                    background: 'none', cursor: 'pointer', fontFamily: 'inherit',
                    fontSize: 12, color: '#9C8E80',
                  }}>
                    <span style={{ display:'inline-flex', alignItems:'center', gap:4 }}>
                      {isAr ? 'تخطي هذا السؤال' : 'Skip this question'}
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d={isAr ? "M15 19l-7-7 7-7" : "M9 18l6-6-6-6"}/></svg>
                    </span>
                  </button>
                )}
              </div>
              {/* Context summary */}
              {Object.keys(answers).length > 0 && (
                <div style={{ marginTop: 14, padding: '8px 12px', background: '#FEF9F9', border: '1px solid rgba(139,26,26,0.12)', borderRadius: 10 }}>
                  <p style={{ fontSize: 10.5, color: '#8B1A1A', margin: 0, fontWeight: 600 }}>
                    {isAr ? Object.values(answers).join(' • ') : Object.values(answers).join(' • ')}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── Phase 3: Legacy intent (fallback for slugs without flow) ── */}
          {phase === 'legacy_intent' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {Object.keys(answers).length > 0 && (
                <div style={{ padding: '10px 14px', background: '#FEF9F9', border: '1px solid rgba(139,26,26,0.15)', borderRadius: 12, marginBottom: 4 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#8B1A1A', margin: '0 0 4px' }}>
                    {isAr ? 'ملخص اختياراتك:' : 'Your context:'}
                  </p>
                  <p style={{ fontSize: 11, color: '#5C3A1A', margin: 0 }}>
                    {Object.values(answers).join(' • ')}
                  </p>
                </div>
              )}
              {INTENTS.map((intent, i) => (
                <button key={i} onClick={() => handleLegacyIntent(intent)} style={{
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
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#8B1A1A',
                  }}>{INTENT_ICONS[intent.iconKey]}</div>
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
