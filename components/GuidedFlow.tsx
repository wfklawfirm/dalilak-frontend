'use client'

import React, { useState, useMemo } from 'react'
import { getFlow, buildFlowPrompt } from '@/lib/flows'
import type { FlowAnswers } from '@/lib/flows'
import { ALL_SERVICES, SERVICE_CATEGORIES } from '@/lib/allServices'

interface GuidedFlowProps {
  isAr: boolean
  onSend: (message: string) => void
  onClose: () => void
  /** optional: pre-select a procedure slug */
  initialSlug?: string
}

// ── Build procedure list from ALL_SERVICES (no duplicates) ────────────────────
const ALL_PROCEDURES = ALL_SERVICES.map(s => ({
  ar: s.name_ar,
  en: s.name_ar,
  slug: s.slug,
  categorySlug: s.categorySlug,
  category: s.category,
  authority: s.authority_ar,
}))

// ── Intent SVG icons ───────────────────────────────────────────────────────────
const INTENT_ICONS: Record<string, JSX.Element> = {
  docs: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>,
  steps: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>,
  authority: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>,
  form: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>,
  checklist: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>,
  expat: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
}

// ── Intent options (shown after selecting a procedure) ─────────────────────────
const INTENTS = [
  { iconKey: 'docs',      ar: 'المستندات المطلوبة', en: 'Required Documents', desc_ar: 'ما الأوراق التي أحتاجها؟', desc_en: "What documents do I need?", prefix_ar: 'ما هي كل المستندات والأوراق المطلوبة لإجراء معاملة', prefix_en: 'What are all the required documents for', suffix_ar: '؟ اعطني قائمة شاملة ومفصّلة.', suffix_en: '? Give me a comprehensive detailed list.' },
  { iconKey: 'steps',     ar: 'الخطوات كاملة', en: 'Step-by-Step Guide', desc_ar: 'كيف أنجز المعاملة خطوة بخطوة؟', desc_en: 'How do I complete it step by step?', prefix_ar: 'اشرح لي خطوات إتمام معاملة', prefix_en: 'Explain the steps to complete', suffix_ar: ' بالتفصيل من البداية للنهاية مع الجهات والأوقات.', suffix_en: ' in detail from start to finish.' },
  { iconKey: 'authority', ar: 'الجهة المختصة', en: 'Responsible Authority', desc_ar: 'أين أراجع وكيف أتصل بهم؟', desc_en: 'Where to go and how to contact them?', prefix_ar: 'ما هي الجهة الرسمية المختصة بمعاملة', prefix_en: 'What is the official authority for', suffix_ar: '؟ أعطني العنوان وأوقات العمل وأرقام الاتصال.', suffix_en: '? Give me the address, working hours, and contact.' },
  { iconKey: 'form',      ar: 'النموذج الرسمي', en: 'Official Form', desc_ar: 'ما هو النموذج وكيف أملأه؟', desc_en: 'What form do I need?', prefix_ar: 'ما هو النموذج الرسمي المطلوب لمعاملة', prefix_en: 'What is the official form needed for', suffix_ar: '؟ وكيف أملأه بشكل صحيح؟', suffix_en: '? And how do I fill it correctly?' },
  { iconKey: 'checklist', ar: 'Checklist جاهز', en: 'Ready Checklist', desc_ar: 'قائمة مرجعية لأتابع تقدّمي', desc_en: 'A reference list to track progress', prefix_ar: 'أعطني checklist شامل لإتمام معاملة', prefix_en: 'Give me a checklist to complete', suffix_ar: ' يشمل المستندات والخطوات والجهات.', suffix_en: ' including documents, steps, and authorities.' },
  { iconKey: 'expat',     ar: 'للمغتربين', en: 'For Expats Abroad', desc_ar: 'كيف أنجزها من خارج لبنان؟', desc_en: 'How to complete from outside Lebanon?', prefix_ar: 'كيف يستطيع المغترب إجراء معاملة', prefix_en: 'How can an expat complete', suffix_ar: '؟ ما الخيارات عبر السفارات أو التوكيل؟', suffix_en: '? Options via embassies or power of attorney?' },
]

// ── Wizard states ──────────────────────────────────────────────────────────────
type WizardPhase = 'pick_category' | 'pick_procedure' | 'flow_questions' | 'legacy_intent'

export default function GuidedFlow({ isAr, onSend, onClose, initialSlug }: GuidedFlowProps) {
  const initProc = initialSlug ? ALL_PROCEDURES.find(p => p.slug === initialSlug) ?? null : null

  const [phase, setPhase] = useState<WizardPhase>(
    initProc ? (getFlow(initProc.slug) ? 'flow_questions' : 'legacy_intent') : 'pick_category'
  )
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedProc, setSelectedProc] = useState<typeof ALL_PROCEDURES[0] | null>(initProc)
  const [search, setSearch] = useState('')
  const [answers, setAnswers] = useState<FlowAnswers>({})
  const [stepIndex, setStepIndex] = useState(0)

  // Active flow definition
  const activeFlow = selectedProc ? getFlow(selectedProc.slug) : undefined
  const flowSteps = activeFlow?.steps ?? []
  const totalFlowSteps = flowSteps.length
  const currentFlowStep = flowSteps[stepIndex]

  // Progress bar
  const progressNumerator = phase === 'pick_category' ? 0 : phase === 'pick_procedure' ? 1 : phase === 'flow_questions' ? stepIndex + 2 : totalFlowSteps + 1
  const progressDenominator = Math.max(totalFlowSteps + 2, 3)

  // ── Filtered procedures ──────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = ALL_PROCEDURES
    if (selectedCategory && !search.trim()) {
      list = list.filter(p => p.categorySlug === selectedCategory)
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(p =>
        p.ar.includes(search.trim()) ||
        p.ar.toLowerCase().includes(q) ||
        (p.authority && p.authority.includes(search.trim()))
      )
    }
    return list
  }, [search, selectedCategory])

  // ── Select a category ────────────────────────────────────────────────────────
  const handleSelectCategory = (slug: string) => {
    setSelectedCategory(slug)
    setSearch('')
    setPhase('pick_procedure')
  }

  // ── Select a procedure ───────────────────────────────────────────────────────
  const handleSelectProc = (p: typeof ALL_PROCEDURES[0]) => {
    setSelectedProc(p)
    setAnswers({})
    setStepIndex(0)
    const flow = getFlow(p.slug)
    setPhase(flow ? 'flow_questions' : 'legacy_intent')
  }

  // ── Answer a flow step ───────────────────────────────────────────────────────
  const handleFlowAnswer = (value: string) => {
    if (!currentFlowStep) return
    const newAnswers: FlowAnswers = { ...answers, [currentFlowStep.id]: value }
    setAnswers(newAnswers)
    if (stepIndex < totalFlowSteps - 1) {
      setStepIndex(i => i + 1)
    } else {
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

  // ── Skip step ────────────────────────────────────────────────────────────────
  const handleSkipStep = () => {
    if (stepIndex < totalFlowSteps - 1) {
      setStepIndex(i => i + 1)
    } else {
      setPhase('legacy_intent')
    }
  }

  // ── Legacy intent ─────────────────────────────────────────────────────────────
  const handleLegacyIntent = (intent: typeof INTENTS[0]) => {
    if (!selectedProc) return
    const proc = selectedProc.ar
    const contextDetails = Object.values(answers).length > 0
      ? (isAr ? ` (التفاصيل: ${Object.values(answers).join('، ')})` : ` (Details: ${Object.values(answers).join(', ')})`)
      : ''
    const msg = isAr
      ? `[أجب بتنسيق منظّم مع عناوين ## واضحة: ## الخلاصة | ## المستندات المطلوبة | ## الخطوات | ## الجهة المختصة | ## الرسوم | ## تنبيه مهم]\n${intent.prefix_ar} "${proc}"${contextDetails}${intent.suffix_ar}`
      : `[Answer in organized format: ## Summary | ## Required Documents | ## Steps | ## Authority | ## Fees | ## Warning]\n${intent.prefix_en} "${proc}"${contextDetails}${intent.suffix_en}`
    onSend(msg)
    onClose()
  }

  // ── Back button ───────────────────────────────────────────────────────────────
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
    } else if (phase === 'pick_procedure') {
      setPhase('pick_category')
      setSelectedCategory(null)
      setSearch('')
    }
  }

  // ── Header label ──────────────────────────────────────────────────────────────
  const headerLabel = () => {
    if (phase === 'pick_category') return isAr ? 'ما هي معاملتك؟' : 'What is your procedure?'
    if (phase === 'pick_procedure') {
      const cat = SERVICE_CATEGORIES.find(c => c.slug === selectedCategory)
      return cat ? cat.label_ar : (isAr ? 'اختر الخدمة' : 'Select Service')
    }
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
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, backdropFilter: 'blur(2px)', animation: 'gfFadeIn 0.2s cubic-bezier(0.22,1,0.36,1) both' }} />

      {/* Panel */}
      <div role="dialog" aria-modal="true" aria-label={isAr ? 'اختيار الخدمة' : 'Select Service'} style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 201,
        background: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
        boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
        maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        animation: 'slideUp 0.25s cubic-bezier(0.34,1.2,0.64,1)',
      }}>
        <style>{`@keyframes slideUp { from { transform: translateY(100%); opacity:0 } to { transform: translateY(0); opacity:1 } } @keyframes gfFadeIn { from { opacity:0; } to { opacity:1; } } @keyframes gfIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } } @keyframes gfItem { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }`}</style>

        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#D5CEC4' }} />
        </div>

        {/* Header */}
        <div style={{ padding: '0 18px 12px', borderBottom: '1px solid #EAE4D9', flexShrink: 0 }}>
          {/* Progress bar */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
            {[0, 1, 2, 3].map(i => (
              <div key={i} style={{
                flex: 1, height: 3, borderRadius: 2,
                background: i < progressNumerator / (progressDenominator / 4) ? '#8B1A1A' : '#EAE4D9',
                transition: 'background 0.3s',
              }} />
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {phase !== 'pick_category' && (
              <button type="button" onClick={goBack}
                onTouchStart={e => { e.currentTarget.style.color = '#8B1A1A' }}
                onTouchEnd={e => { e.currentTarget.style.color = '#9C8E80' }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px 4px 0', color: '#9C8E80', display: 'flex', alignItems: 'center', transition: 'color 0.12s' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d={isAr ? 'M9 18l6-6-6-6' : 'M15 18l-6-6 6-6'} />
                </svg>
              </button>
            )}
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: '#1A1208', margin: 0 }}>
                {headerLabel()}
              </h2>
              {phase === 'pick_category' && (
                <p style={{ fontSize: 11, color: '#9C8E80', margin: '2px 0 0' }}>
                  {isAr ? `اختر القسم أو ابحث من ${ALL_PROCEDURES.length} خدمة` : `Choose a category or search ${ALL_PROCEDURES.length} services`}
                </p>
              )}
              {phase === 'pick_procedure' && (
                <p style={{ fontSize: 11, color: '#9C8E80', margin: '2px 0 0' }}>
                  {isAr ? `${filtered.length} خدمة — اختر ما تريد` : `${filtered.length} services — choose one`}
                </p>
              )}
              {phase === 'flow_questions' && currentFlowStep?.hintAr && (
                <p style={{ fontSize: 11, color: '#9C8E80', margin: '2px 0 0' }}>
                  {isAr ? currentFlowStep.hintAr : currentFlowStep.hintEn}
                </p>
              )}
            </div>
            <button type="button" onClick={onClose} aria-label={isAr ? 'إغلاق' : 'Close'}
              onTouchStart={e => { e.currentTarget.style.background = '#D5CEC4' }}
              onTouchEnd={e => { e.currentTarget.style.background = '#EAE4D9' }}
              style={{ background: '#EAE4D9', border: 'none', cursor: 'pointer', width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5C4A3A', flexShrink: 0, transition: 'background 0.12s' }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div key={phase + '-' + stepIndex} style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 24px', animation: 'gfIn 0.18s cubic-bezier(0.22,1,0.36,1) both' }}>

          {/* ── Phase 0: Pick category ── */}
          {phase === 'pick_category' && (
            <>
              {/* Global search */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FAFAF8', border: '1.5px solid #EAE4D9', borderRadius: 12, padding: '8px 12px', marginBottom: 14 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9C8E80" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/></svg>
                <input
                  value={search}
                  onChange={e => {
                    setSearch(e.target.value)
                    if (e.target.value.trim()) setPhase('pick_procedure')
                  }}
                  placeholder={isAr ? 'ابحث في كل الخدمات...' : 'Search all services...'}
                  dir={isAr ? 'rtl' : 'ltr'}
                  style={{ border: 'none', background: 'none', outline: 'none', flex: 1, fontSize: 13.5, color: '#1A1208', fontFamily: 'inherit' }}
                />
              </div>

              {/* Category grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
                {SERVICE_CATEGORIES.map((cat, i) => (
                  <button key={i} type="button" onClick={() => handleSelectCategory(cat.slug)} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '11px 13px', borderRadius: 14,
                    background: '#fff', border: '1.5px solid #EAE4D9', cursor: 'pointer', fontFamily: 'inherit',
                    textAlign: isAr ? 'right' : 'left', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', transition: 'border-color 0.15s, background 0.15s',
                    animation: 'gfItem 0.22s cubic-bezier(0.22,1,0.36,1) both', animationDelay: `${Math.min(i, 10) * 0.04}s`,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#8B1A1A'; e.currentTarget.style.background = '#FEF9F9' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#EAE4D9'; e.currentTarget.style.background = '#fff' }}
                  onTouchStart={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.transform = 'scale(0.97)' }}
                  onTouchEnd={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'scale(1)' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#1A1208', lineHeight: 1.3, flex: 1, textAlign: isAr ? 'right' : 'left' }}>{cat.label_ar}</span>
                    <span style={{
                      fontSize: 10, fontWeight: 700, color: '#8B1A1A',
                      background: 'rgba(139,26,26,0.08)', borderRadius: 6,
                      padding: '2px 6px', flexShrink: 0,
                      marginRight: isAr ? 0 : 0, marginLeft: isAr ? 6 : 0,
                    }}>{cat.count}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* ── Phase 1: Pick procedure ── */}
          {phase === 'pick_procedure' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FAFAF8', border: '1.5px solid #EAE4D9', borderRadius: 12, padding: '8px 12px', marginBottom: 14 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9C8E80" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/></svg>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  aria-label={isAr ? 'ابحث عن الخدمة' : 'Search service'}
                  placeholder={isAr ? 'ابحث عن الخدمة...' : 'Search service...'}
                  dir={isAr ? 'rtl' : 'ltr'}
                  autoFocus
                  style={{ border: 'none', background: 'none', outline: 'none', flex: 1, fontSize: 13.5, color: '#1A1208', fontFamily: 'inherit' }}
                />
                {search && (
                  <button type="button" onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9C8E80', padding: 0, display: 'flex' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                )}
              </div>

              {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 16px', color: '#9C8E80' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: 8, opacity: 0.5 }}><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/></svg>
                  <p style={{ fontSize: 13, margin: 0 }}>{isAr ? 'لا توجد نتائج' : 'No results found'}</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
                  {filtered.map((p, i) => (
                    <button key={i} type="button" onClick={() => handleSelectProc(p)} style={{
                      display: 'flex', flexDirection: 'column', gap: 4, padding: '11px 13px', borderRadius: 14,
                      background: '#fff', border: '1.5px solid #EAE4D9', cursor: 'pointer', fontFamily: 'inherit',
                      textAlign: isAr ? 'right' : 'left', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', transition: 'border-color 0.15s, background 0.15s',
                      animation: 'gfItem 0.22s cubic-bezier(0.22,1,0.36,1) both', animationDelay: `${Math.min(i, 12) * 0.03}s`,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#8B1A1A'; e.currentTarget.style.background = '#FEF9F9' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#EAE4D9'; e.currentTarget.style.background = '#fff' }}
                    onTouchStart={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.transform = 'scale(0.97)' }}
                    onTouchEnd={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'scale(1)' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7 }}>
                        <span style={{ display: 'flex', flexShrink: 0, color: '#8B1A1A', marginTop: 1 }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                        </span>
                        <span style={{ fontSize: 11.5, fontWeight: 600, color: '#1A1208', lineHeight: 1.35 }}>{p.ar}</span>
                      </div>
                      {search.trim() && p.category && (
                        <span style={{ fontSize: 9.5, color: '#9C8E80', paddingRight: 20 }}>{p.category}</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── Phase 2: Flow questions ── */}
          {phase === 'f