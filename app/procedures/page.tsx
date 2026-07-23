'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { PROCEDURES_DATA, getComplexityColor, getComplexityBg, getComplexityLabel } from '@/lib/procedures'
import { ALL_SERVICES, SERVICE_CATEGORIES } from '@/lib/allServices'
import { ENRICHED_PROCEDURES, searchEnrichedProcedures, type EnrichedProcedure } from '@/lib/enrichedProcedures'
import BottomNav from '@/components/BottomNav'
import { TX_MINISTRIES } from '@/lib/allTransactions'
import { useLanguage } from '@/lib/LanguageContext'
import ReadinessChecker from '@/components/ReadinessChecker'
import SaveButton from '@/components/SaveButton'
import CostEstimator from '@/components/CostEstimator'
import { trackView } from '@/lib/savedItems'
import ProcedureTimeline from '@/components/ProcedureTimeline'
import ProcedureCopyableSteps from '@/components/ProcedureCopyableSteps'
import ProcedureCopySummaryLine from '@/components/ProcedureCopySummaryLine'
import ProcedureStepsAudio from '@/components/ProcedureStepsAudio'
import ProcedureStepHighlight from '@/components/ProcedureStepHighlight'
import ProcedureNeedHelpToggle from '@/components/ProcedureNeedHelpToggle'
import PrintProcedureModal from '@/components/PrintProcedureModal'
import ProcedureSearchModal from '@/components/ProcedureSearchModal'
import ProcedureRelatedSuggestions from '@/components/ProcedureRelatedSuggestions'
import ProcedureProgressBadge from '@/components/ProcedureProgressBadge'
import ProcedureFilterDrawer, { type ProcFilters, DEFAULT_FILTERS, hasActiveFilters } from '@/components/ProcedureFilterDrawer'
import ProcedureDeadlineAlert, { setDeadline, clearDeadline } from '@/components/ProcedureDeadlineAlert'
import ProcedureNotesPanel from '@/components/ProcedureNotesPanel'
import GovHolidayAlert from '@/components/GovHolidayAlert'
import ProcedureStartButton from '@/components/ProcedureStartButton'
import ProcedureCompletionBadge from '@/components/ProcedureCompletionBadge'
import ProcedureEstimatedCompletion from '@/components/ProcedureEstimatedCompletion'
import ProcedureShareViaEmail from '@/components/ProcedureShareViaEmail'
import ProcedureCopyDeepLink from '@/components/ProcedureCopyDeepLink'
import ProcedureHelpRequest from '@/components/ProcedureHelpRequest'
import ProcedureQRShare from '@/components/ProcedureQRShare'
import ProcedureQuickAskChips from '@/components/ProcedureQuickAskChips'
import ProcedureExternalLinks from '@/components/ProcedureExternalLinks'
import ProcedureRelatedMinistries from '@/components/ProcedureRelatedMinistries'
import ProcedureMinistryMap from '@/components/ProcedureMinistryMap'
import ProcedurePrintableCard from '@/components/ProcedurePrintableCard'
import ProcedureHistoryLog from '@/components/ProcedureHistoryLog'
import ProcedureTagSearch from '@/components/ProcedureTagSearch'
import ProcedureDocumentChecklist from '@/components/ProcedureDocumentChecklist'
import ProcedureCostBreakdown from '@/components/ProcedureCostBreakdown'
import ProcedureAIAssistButton from '@/components/ProcedureAIAssistButton'
import ProcedureRemindMeLater from '@/components/ProcedureRemindMeLater'
import ProcedureDocumentShare from '@/components/ProcedureDocumentShare'
import ProcedureDocumentStatus from '@/components/ProcedureDocumentStatus'
import ProcedureChecklistExport from '@/components/ProcedureChecklistExport'
import ProcedureDocumentPhotoTips from '@/components/ProcedureDocumentPhotoTips'
import ProcedureBackToTopButton from '@/components/ProcedureBackToTopButton'
import ProcedureFeeHistory from '@/components/ProcedureFeeHistory'
import ProcedureDifficultyBadge from '@/components/ProcedureDifficultyBadge'
import ProcedureViewCount from '@/components/ProcedureViewCount'
import ProcedureLastUpdatedBadge from '@/components/ProcedureLastUpdatedBadge'
import ProcedureLanguageToggleHint from '@/components/ProcedureLanguageToggleHint'
import ProcedureCountdownTimer from '@/components/ProcedureCountdownTimer'
import ProcedureAlternativeOffices from '@/components/ProcedureAlternativeOffices'
import ProcedureOfficeMap from '@/components/ProcedureOfficeMap'
import ProcedurePriorityTag from '@/components/ProcedurePriorityTag'
import ProcedureStepProgress from '@/components/ProcedureStepProgress'
import ProcedureDocReadinessBar from '@/components/ProcedureDocReadinessBar'
import ProcedurePrintSummary from '@/components/ProcedurePrintSummary'
import ProcedureMiniMap from '@/components/ProcedureMiniMap'
import ProcedureVersionTag from '@/components/ProcedureVersionTag'
import ProcedureHashtagChips from '@/components/ProcedureHashtagChips'
import ProcedureApprovalTracker from '@/components/ProcedureApprovalTracker'
import ProcedureFAQChips from '@/components/ProcedureFAQChips'
import ProcedureReminderBell from '@/components/ProcedureReminderBell'
import ProcedureEstimatedFeeChip from '@/components/ProcedureEstimatedFeeChip'
import ProcedureStepTimer from '@/components/ProcedureStepTimer'

const GUIDED_ACTIVE_COUNT = PROCEDURES_DATA.filter(p => p.status === 'active').length
const PROCEDURES_TOTAL = GUIDED_ACTIVE_COUNT + ENRICHED_PROCEDURES.length

// Ministry filter data
const MINISTRY_CHIPS = [
  { slug: 'all',              ar: 'الكل',              en: 'All' },
  { slug: 'interior',         ar: 'الداخلية',          en: 'Interior' },
  { slug: 'general-security', ar: 'الأمن العام',       en: 'Gen. Security' },
  { slug: 'economy',          ar: 'الاقتصاد',          en: 'Economy' },
  { slug: 'labor',            ar: 'العمل',             en: 'Labor' },
  { slug: 'customs',          ar: 'الجمارك',           en: 'Customs' },
  { slug: 'health',           ar: 'الصحة',             en: 'Health' },
  { slug: 'agriculture',      ar: 'الزراعة',           en: 'Agriculture' },
  { slug: 'social',           ar: 'الشؤون الاجتماعية', en: 'Social Affairs' },
  { slug: 'education',        ar: 'التربية',           en: 'Education' },
  { slug: 'justice',          ar: 'العدل',             en: 'Justice' },
  { slug: 'finance',          ar: 'المالية',           en: 'Finance' },
  { slug: 'public-works',     ar: 'الأشغال العامة',    en: 'Public Works' },
]

// Map guided procedure categorySlug → ministry filter slug
const CAT_TO_MINISTRY: Record<string, string> = {
  'travel': 'general-security',
  'civil-status': 'interior',
  'business': 'economy',
  'real-estate': 'interior',
  'vehicles': 'interior',
  'work-social': 'labor',
  'attestation': 'interior',
  'official-docs': 'interior',
  'legal-docs': 'interior',
  'construction': 'interior',
  'expat': 'general-security',
  'transport': 'interior',
  'associations': 'interior',
  'industry': 'economy',
}

// Ministry icon SVGs (inline, brand-color strokes)
function MinistryIcon({ slug, size = 18 }: { slug: string; size?: number }) {
  const s = { width: size, height: size, 'aria-hidden': true as const }
  if (slug === 'interior') return <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
  if (slug === 'general-security') return <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
  if (slug === 'economy') return <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
  if (slug === 'labor') return <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
  if (slug === 'customs') return <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
  if (slug === 'health') return <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
  if (slug === 'agriculture') return <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 004 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
  if (slug === 'social') return <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
  if (slug === 'education') return <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>
  if (slug === 'justice') return <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"/></svg>
  if (slug === 'finance') return <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
  if (slug === 'public-works') return <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
  return <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
}

/** Small inline copy-to-clipboard button with checkmark flash */
function CopyBtn({ text, isAr }: { text: string; isAr: boolean }) {
  const [copied, setCopied] = React.useState(false)
  const copy = (e: React.MouseEvent) => {
    e.stopPropagation()
    try { navigator.clipboard.writeText(text) } catch {}
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button
      type="button"
      title={isAr ? 'نسخ' : 'Copy'}
      onClick={copy}
      style={{
        background: 'none', border: 'none', cursor: 'pointer', padding: '0 3px',
        color: copied ? '#10b981' : '#9ca3af',
        fontSize: 11, lineHeight: 1, flexShrink: 0, display: 'inline-flex',
        alignItems: 'center',
      }}
    >
      {copied ? '✓' : '⎘'}
    </button>
  )
}

export default function ProceduresPage() {
  const router = useRouter()
  const { isAr, toggleLang } = useLanguage()
  const [search, setSearch] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [expandedProc, setExpandedProc] = useState<string | null>(null)
  const [ministryFilter, setMinistryFilter] = useState('all')
  const [enrichedMinistryLabel, setEnrichedMinistryLabel] = useState('')
  const [printProc, setPrintProc] = useState<EnrichedProcedure | null>(null)
  const [searchModalOpen, setSearchModalOpen] = useState(false)
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)
  const [advFilters, setAdvFilters] = useState<ProcFilters>(DEFAULT_FILTERS)
  // Deadline date input state — tracks the typed value in the deadline date picker per procedure
  const [deadlineInput, setDeadlineInput] = useState<string>('')

  const filteredGuided = useMemo(() => {
    let list = PROCEDURES_DATA.filter(p => p.status === 'active')
    if (ministryFilter !== 'all') {
      list = list.filter(p => (CAT_TO_MINISTRY[p.categorySlug] || 'interior') === ministryFilter)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(p =>
        p.title_ar.includes(search) || p.title_en.toLowerCase().includes(q) ||
        p.description_ar.includes(search) || p.tags.some(t => t.toLowerCase().includes(q))
      )
    }
    return list
  }, [search, ministryFilter])

  const filteredEnriched = useMemo(() => {
    let list = searchEnrichedProcedures(search)
    if (ministryFilter !== 'all') {
      list = list.filter(p => p.ministrySlug === ministryFilter)
    }
    if (enrichedMinistryLabel) {
      list = list.filter(p =>
        p.ministry === enrichedMinistryLabel ||
        p.ministry_en === enrichedMinistryLabel
      )
    }
    // Advanced filters
    if (advFilters.hasForm !== 'any') {
      list = list.filter(p => advFilters.hasForm === 'yes' ? !!p.hasForm : !p.hasForm)
    }
    if (advFilters.feeType !== 'any') {
      list = list.filter(p => {
        const fees = p.fees || ''
        const isFree = fees.includes('مجان') || fees.toLowerCase().includes('free') || fees === '0'
        return advFilters.feeType === 'free' ? isFree : !isFree
      })
    }
    if (advFilters.speed !== 'any') {
      list = list.filter(p => {
        const pt = (p.processingTime || '').toLowerCase()
        if (advFilters.speed === 'fast')   return pt.includes('يوم') || pt.includes('day') || pt.includes('ساعة') || pt.includes('hour')
        if (advFilters.speed === 'normal') return pt.includes('أسبوع') || pt.includes('week') || pt.includes('أسبوعين')
        if (advFilters.speed === 'slow')   return pt.includes('شهر') || pt.includes('month') || pt.includes('سنة') || pt.includes('year')
        return true
      })
    }
    if (advFilters.started === 'yes') {
      try {
        list = list.filter(p => localStorage.getItem(`dalilak_checklist_${p.code}`) !== null)
      } catch { /* skip in SSR */ }
    }
    return list
  }, [search, ministryFilter, enrichedMinistryLabel, advFilters])

  const handleAsk = useCallback((prompt: string) => {
    router.push(`/?q=${encodeURIComponent(prompt)}`)
  }, [router])

  const totalResults = filteredGuided.length + filteredEnriched.length

  return (
    <div style={{ minHeight: '100vh', background: '#F8F8F6', fontFamily: "'Cairo', 'Inter', sans-serif", overflowX: 'hidden' }} dir={isAr ? 'rtl' : 'ltr'}>
      <ProcedureBackToTopButton isAr={isAr} />
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 3px; height: 3px; }
        ::-webkit-scrollbar-thumb { background: #E6E2DC; border-radius: 2px; }
        .proc-card:hover { border-color: rgba(143,29,44,0.4) !important; box-shadow: 0 2px 12px rgba(143,29,44,0.08) !important; }
        .proc-chip-row { -ms-overflow-style: none; scrollbar-width: none; }
        .proc-chip-row::-webkit-scrollbar { display: none; }
        .proc-chip { transition: border-color 0.14s, background 0.14s; }
        .proc-chip:hover { border-color: #8F1D2C !important; }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes procEnter { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #741622 0%, #8F1D2C 60%, #7a1818 100%)',
        padding: '13px 16px', position: 'sticky', top: 0, zIndex: 50,
        boxShadow: '0 4px 24px rgba(80,10,10,0.3)',
        animation: 'slideDown 0.3s cubic-bezier(0.22,1,0.36,1) both',
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <button type="button" aria-label={isAr ? 'الرئيسية' : 'Home'} onClick={() => router.push('/')}
            onTouchStart={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.22)' }}
            onTouchEnd={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 9, color: '#fff', cursor: 'pointer', padding: '6px 8px', display: 'flex', flexShrink: 0 }}>
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: isAr ? 'scaleX(-1)' : 'none', display: 'block' }}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, flex: 1 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
              <img src="/logo-icon.png" alt="دليلك" style={{ width: 24, height: 24, objectFit: 'contain', display: 'block' }} />
            </div>
            <div>
              <h1 style={{ color: '#fff', fontSize: 15, fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
                {isAr ? 'المعاملات الحكومية' : 'Government Procedures'}
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, margin: 0 }}>
                {isAr ? `${PROCEDURES_TOTAL} إجراء موثّق بالخطوات والوثائق` : `${PROCEDURES_TOTAL} documented step-by-step`}
              </p>
            </div>
          </div>
          <button type="button" onClick={toggleLang} aria-label={isAr ? 'تغيير اللغة' : 'Switch language'} style={{ background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.25)', color: '#fff', borderRadius: 9, padding: '5px 12px', cursor: 'pointer', fontSize: 11, fontFamily: 'inherit', fontWeight: 700, flexShrink: 0 }}>
            {isAr ? 'EN' : 'AR'}
          </button>
        </div>
      </header>

      <div id="main-content" style={{ maxWidth: 720, margin: '0 auto', padding: '16px 14px 100px' }}>

        {/* Holiday alert — when tomorrow is a public holiday or weekend */}
        <GovHolidayAlert />

        {/* Deadline alerts — shown when any procedure has a deadline within 7 days */}
        <ProcedureDeadlineAlert
          onGoTo={code => {
            setExpandedProc(code)
            setTimeout(() => {
              document.getElementById(`proc-${code}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }, 120)
          }}
        />

        {/* Stats strip — premium individual cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
          {[
            { value: String(PROCEDURES_TOTAL), label: isAr ? 'إجراء موثّق' : 'Procedures', featured: true },
            { value: String(ALL_SERVICES.length), label: isAr ? 'خدمة متاحة' : 'Services', featured: false },
            { value: String(TX_MINISTRIES.length) + '+', label: isAr ? 'جهة مختصة' : 'Authorities', featured: false },
          ].map((stat, i) => (
            <div key={stat.label} style={{
              padding: '14px 8px 16px', textAlign: 'center',
              background: stat.featured ? 'linear-gradient(135deg, #F8EDEF 0%, #FDE4E4 100%)' : '#fff',
              border: stat.featured ? '1.5px solid rgba(143,29,44,0.18)' : '1.5px solid #E6E2DC',
              borderRadius: 12,
              boxShadow: stat.featured ? '0 2px 10px rgba(143,29,44,0.09)' : '0 1px 5px rgba(0,0,0,0.05)',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              animation: 'procEnter 0.28s cubic-bezier(0.22,1,0.36,1) both',
              animationDelay: `${0.06 + i * 0.07}s`,
            }}>
              <div style={{ fontSize: 'clamp(18px,5vw,22px)', fontWeight: 900, color: '#8F1D2C', lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: 9.5, color: '#918B82', marginTop: 4, fontWeight: 500 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Ministry filter chips */}
        <div style={{ marginBottom: 12, marginRight: -14, marginLeft: -14 }}>
          <div className="proc-chip-row" style={{ display: 'flex', flexWrap: 'nowrap', overflowX: 'auto', gap: 6, paddingRight: 14, paddingLeft: 14, paddingBottom: 2 }}>
            {MINISTRY_CHIPS.map(chip => {
              const active = ministryFilter === chip.slug
              return (
                <button
                  type="button"
                  key={chip.slug}
                  className="proc-chip"
                  onClick={() => { setMinistryFilter(chip.slug); setExpandedProc(null) }}
                  aria-pressed={active}
                  onTouchStart={e => { e.currentTarget.style.background = active ? '#FDE8E8' : '#FEF9F9'; e.currentTarget.style.borderColor = '#8F1D2C' }}
                  onTouchEnd={e => { e.currentTarget.style.background = active ? '#F8EDEF' : '#fff'; e.currentTarget.style.borderColor = active ? '#8F1D2C' : '#E6E2DC' }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '5px 12px', borderRadius: 20, cursor: 'pointer',
                    fontFamily: 'inherit', fontSize: 11.5, fontWeight: active ? 700 : 600,
                    border: active ? '2px solid #8F1D2C' : '1.5px solid #E6E2DC',
                    background: active ? '#F8EDEF' : '#fff',
                    color: active ? '#8F1D2C' : '#69645C',
                    boxShadow: active ? '0 2px 8px rgba(143,29,44,0.12)' : 'none',
                    whiteSpace: 'nowrap', flexShrink: 0,
                  }}
                >
                  {chip.slug !== 'all' && (
                    <span style={{ color: active ? '#8F1D2C' : '#918B82', display: 'flex' }}>
                      <MinistryIcon slug={chip.slug} size={13} />
                    </span>
                  )}
                  {isAr ? chip.ar : chip.en}
                </button>
              )
            })}
          </div>
        </div>

        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: `1.5px solid ${searchFocused ? '#8F1D2C' : '#E6E2DC'}`, borderRadius: 14, padding: '10px 14px', marginBottom: 10, boxShadow: searchFocused ? '0 0 0 3px rgba(143,29,44,0.08), 0 2px 12px rgba(143,29,44,0.06)' : '0 1px 6px rgba(0,0,0,0.05)', transition: 'border-color 0.18s, box-shadow 0.18s' }}>
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#918B82" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/></svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            aria-label={isAr ? 'ابحث في الإجراءات' : 'Search procedures'}
            placeholder={isAr ? `ابحث في ${PROCEDURES_TOTAL} إجراء...` : `Search ${PROCEDURES_TOTAL} procedures...`}
            dir={isAr ? 'rtl' : 'ltr'}
            style={{ border: 'none', background: 'none', outline: 'none', flex: 1, fontSize: 13.5, color: '#191713', fontFamily: 'inherit' }}
          />
          {search && (
            <button type="button" aria-label={isAr ? 'مسح البحث' : 'Clear search'} onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#918B82', display: 'flex', alignItems: 'center' }}>
              <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          )}
          {/* Fullscreen search modal button */}
          <button
            type="button"
            title={isAr ? 'البحث المتقدم' : 'Advanced search'}
            onClick={() => setSearchModalOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 30, height: 30, borderRadius: 8, flexShrink: 0,
              background: '#F8EDEF', border: '1px solid rgba(143,29,44,0.2)',
              cursor: 'pointer', color: '#8F1D2C',
            }}
          >
            <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h10M4 18h4"/>
            </svg>
          </button>
          {/* Advanced filter button */}
          <button
            type="button"
            title={isAr ? 'فلترة متقدمة' : 'Advanced filters'}
            onClick={() => setFilterDrawerOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 30, height: 30, borderRadius: 8, flexShrink: 0,
              background: hasActiveFilters(advFilters) ? '#8F1D2C' : '#F8EDEF',
              border: `1px solid ${hasActiveFilters(advFilters) ? '#8F1D2C' : 'rgba(143,29,44,0.2)'}`,
              cursor: 'pointer', color: hasActiveFilters(advFilters) ? '#fff' : '#8F1D2C',
              position: 'relative',
            }}
          >
            <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
            </svg>
            {hasActiveFilters(advFilters) && (
              <span style={{
                position: 'absolute', top: -4, [isAr ? 'left' : 'right']: -4,
                width: 12, height: 12, borderRadius: '50%',
                background: '#ef4444', border: '2px solid #fff',
                fontSize: 7, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {Object.values(advFilters).filter(v => v !== 'any').length}
              </span>
            )}
          </button>
        </div>

        {/* Count + active filter badge */}
        <div aria-live="polite" aria-atomic="true" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 3.5, height: 16, borderRadius: 2, background: 'linear-gradient(180deg, #8F1D2C, #741622)', flexShrink: 0 }} />
            <span style={{ fontSize: 12.5, fontWeight: 800, color: '#191713', letterSpacing: '-0.2px' }}>
              {totalResults === PROCEDURES_TOTAL
                ? (isAr ? 'جميع الإجراءات' : 'All Procedures')
                : `${totalResults} ${isAr ? 'إجراء' : 'procedures'}`}
            </span>
          </div>
          {search && (
            <span style={{ fontSize: 11, color: '#8F1D2C', fontWeight: 600 }}>— &quot;{search}&quot;</span>
          )}
          {ministryFilter !== 'all' && (
            <>
              <span style={{ color: '#D4C5B0', fontSize: 11 }}>·</span>
              <button
                type="button"
                onClick={() => setMinistryFilter('all')}
                style={{
                  fontSize: 10.5, color: '#8F1D2C', fontWeight: 700,
                  background: '#F8EDEF', border: '1px solid rgba(143,29,44,0.2)',
                  borderRadius: 20, padding: '2px 10px', cursor: 'pointer',
                  fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 4,
                }}
              >
                {isAr
                  ? (MINISTRY_CHIPS.find(c => c.slug === ministryFilter)?.ar || ministryFilter)
                  : (MINISTRY_CHIPS.find(c => c.slug === ministryFilter)?.en || ministryFilter)}
                <svg aria-hidden="true" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </>
          )}
        </div>

        {/* Results */}
        {totalResults === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: '#918B82' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
              <svg aria-hidden="true" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D4C5B0" strokeWidth="1.4"><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/></svg>
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
              {isAr ? 'لم نجد إجراءات مطابقة' : 'No matching procedures'}
            </p>
            <button type="button" onClick={() => handleAsk(search)}
              onTouchStart={e => { e.currentTarget.style.opacity = '0.82'; e.currentTarget.style.transform = 'scale(0.97)' }}
              onTouchEnd={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)' }}
              style={{
              padding: '10px 22px', borderRadius: 12,
              background: 'linear-gradient(135deg, #8F1D2C, #741622)',
              border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 2px 8px rgba(143,29,44,0.25)',
              transition: 'opacity 0.12s, transform 0.12s',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
              {isAr ? (search ? `اسأل دليلك عن: ${search}` : 'اسأل دليلك') : (search ? `Ask about: ${search}` : 'Ask Dalilak')}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

            {/* Guided procedures */}
            {filteredGuided.map((proc, idx) => {
              const isExpanded = expandedProc === proc.slug
              return (
                <div key={proc.slug} className="proc-card" style={{
                  background: '#fff',
                  border: `1.5px solid ${isExpanded ? '#8F1D2C' : '#E6E2DC'}`,
                  borderRadius: 14, overflow: 'hidden',
                  boxShadow: isExpanded ? '0 4px 16px rgba(143,29,44,0.1)' : '0 1px 4px rgba(0,0,0,0.04)',
                  transition: 'all 0.18s',
                }}>
                  <button
                    type="button"
                    onClick={() => setExpandedProc(isExpanded ? null : proc.slug)}
                    aria-expanded={isExpanded}
                    aria-label={isAr ? proc.title_ar : proc.title_en}
                    style={{ width: '100%', padding: '13px 14px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'right', display: 'flex', alignItems: 'center', gap: 10 }}
                    onTouchStart={e => { e.currentTarget.style.background = '#FEF5F5' }}
                    onTouchEnd={e => { e.currentTarget.style.background = 'none' }}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: isExpanded ? 'rgba(143,29,44,0.1)' : '#F8EDEF', border: '1px solid rgba(143,29,44,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8F1D2C', flexShrink: 0 }}>
                      <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
                    </div>
                    <div style={{ flex: 1, textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 9.5, fontWeight: 700, color: '#8F1D2C', background: 'rgba(143,29,44,0.08)', borderRadius: 6, padding: '1px 7px', border: '1px solid rgba(143,29,44,0.15)' }}>
                          {isAr ? 'مُرشدة' : 'Guided'}
                        </span>
                        <span style={{ fontSize: 9.5, borderRadius: 6, padding: '1px 7px', fontWeight: 600, background: getComplexityBg(proc.complexity), color: getComplexityColor(proc.complexity) }}>
                          {getComplexityLabel(proc.complexity, isAr)}
                        </span>
                        {proc.estimatedDuration_ar && (
                          <span style={{ fontSize: 9.5, color: '#69645C', background: '#E6E2DC', borderRadius: 6, padding: '1px 7px' }}>
                            {isAr ? proc.estimatedDuration_ar : proc.estimatedDuration_en}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: isExpanded ? '#8F1D2C' : '#191713', lineHeight: 1.4 }}>
                        {isAr ? proc.title_ar : proc.title_en}
                      </div>
                    </div>
                    <span style={{ color: isExpanded ? '#8F1D2C' : '#918B82', transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0, display: 'inline-flex' }}>
                      <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6"/></svg>
                    </span>
                  </button>

                  {isExpanded && (
                    <div style={{ padding: '0 14px 16px', borderTop: '1px solid #E6E2DC', animation: 'slideDown 0.2s cubic-bezier(0.22,1,0.36,1)' }}>
                      <p style={{ margin: '12px 0 12px', fontSize: 12.5, color: '#2D1B0E', lineHeight: 1.75, background: '#FAFAF8', borderRadius: 9, padding: '9px 12px', border: '1px solid #E6E2DC' }}>
                        {isAr ? proc.description_ar : proc.description_en}
                      </p>
                      {proc.requiredDocuments.length > 0 && (
                        <div style={{ marginBottom: 12 }}>
                          <ReadinessChecker
                            storageKey={`proc-${proc.slug}`}
                            documentsAr={proc.requiredDocuments.map((d: {name_ar: string}) => d.name_ar)}
                            documentsEn={proc.requiredDocuments.map((d: {name_en?: string; name_ar: string}) => d.name_en || d.name_ar)}
                            titleAr={proc.title_ar}
                            titleEn={proc.title_en}
                            onAsk={handleAsk}
                          />
                        </div>
                      )}
                      {proc.steps.length > 0 && (
                        <div style={{ marginBottom: 14 }}>
                          <div style={{ fontSize: 11, fontWeight: 800, color: '#191713', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                            <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8F1D2C" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                            {isAr ? 'خطوات الإجراء' : 'Steps'}
                            <span style={{ fontWeight: 600, color: '#918B82', fontSize: 10 }}>({proc.steps.length} {isAr ? 'خطوات' : 'steps'})</span>
                          </div>
                          {proc.steps.map((s, i) => {
                            const isLastStep = i === proc.steps.length - 1
                            return (
                              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'stretch', paddingBottom: isLastStep ? 0 : 10 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg, #8F1D2C, #741622)', color: '#fff', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 1px 4px rgba(143,29,44,0.25)' }}>{i + 1}</span>
                                  {!isLastStep && <div style={{ width: 1.5, flex: 1, background: 'rgba(143,29,44,0.15)', marginTop: 3, borderRadius: 1 }} />}
                                </div>
                                <div style={{ paddingTop: 3, paddingBottom: isLastStep ? 0 : 4 }}>
                                  <div style={{ fontSize: 12, fontWeight: 700, color: '#191713', lineHeight: 1.45 }}>{isAr ? s.title_ar : s.title_en}</div>
                                  {s.description_ar && (
                                    <div style={{ fontSize: 11.5, color: '#69645C', marginTop: 2, lineHeight: 1.55 }}>
                                      {isAr ? s.description_ar : ((s as unknown as { description_en?: string }).description_en || s.description_ar)}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                      <button type="button" onClick={() => handleAsk(isAr ? proc.chatPrompt_ar : proc.chatPrompt_en)}
                        onTouchStart={e => { e.currentTarget.style.opacity = '0.82'; e.currentTarget.style.transform = 'scale(0.97)' }}
                        onTouchEnd={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)' }}
                        style={{
                        width: '100%', padding: '11px 18px', borderRadius: 11,
                        background: 'linear-gradient(135deg, #8F1D2C, #741622)',
                        border: 'none', color: '#fff', fontSize: 12.5, fontWeight: 700,
                        cursor: 'pointer', fontFamily: 'inherit',
                        boxShadow: '0 2px 8px rgba(143,29,44,0.25)',
                        transition: 'opacity 0.12s, transform 0.12s',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                      }}>
                        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
                        {isAr ? 'اسأل دليلك عن هذا الإجراء' : 'Ask about this procedure'}
                      </button>
                    </div>
                  )}
                </div>
              )
            })}

            {/* Section divider — only when both groups are present */}
            {filteredGuided.length > 0 && filteredEnriched.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0 2px' }}>
                <div style={{ flex: 1, height: 1, background: '#E6E2DC' }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: '#918B82', whiteSpace: 'nowrap', padding: '3px 10px', background: '#F5F0EB', borderRadius: 20, border: '1px solid #E6E2DC' }}>
                  {isAr ? 'إجراءات موثّقة' : 'Documented procedures'}
                </span>
                <div style={{ flex: 1, height: 1, background: '#E6E2DC' }} />
              </div>
            )}

            {/* Enriched ministry tag search */}
            {filteredEnriched.length > 0 && (
              <div style={{ marginBottom: 6 }}>
                <ProcedureTagSearch
                  onSelect={setEnrichedMinistryLabel}
                  selectedMinistry={enrichedMinistryLabel}
                  isAr={isAr}
                />
              </div>
            )}

            {/* Enriched procedures */}
            {filteredEnriched.map((proc: EnrichedProcedure, idx) => {
              const displayTitle = isAr ? proc.title : (proc.title_en || proc.title)
              const displayMinistry = isAr ? proc.ministry : (proc.ministry_en || proc.ministry)
              const displayDescription = isAr ? proc.description : (proc.description_en || proc.description)
              const displayDocs = isAr ? proc.requiredDocuments : (proc.requiredDocuments_en?.length ? proc.requiredDocuments_en : proc.requiredDocuments)
              const displaySteps = isAr ? proc.steps : (proc.steps_en?.length ? proc.steps_en : proc.steps)
              const displayFees = isAr ? proc.fees : (proc.fees_en || proc.fees)
              const displayProcessingTime = isAr ? proc.processingTime : (proc.processingTime_en || proc.processingTime)
              const displayWhereToApply = isAr ? proc.whereToApply : (proc.whereToApply_en || proc.whereToApply)
              return (
              <div key={proc.code} id={`proc-${proc.code}`} className="proc-card" style={{
                background: '#fff', border: `1.5px solid ${expandedProc === proc.code ? '#8F1D2C' : '#E6E2DC'}`,
                borderRadius: 14, overflow: 'hidden',
                transition: 'border-color 0.18s, box-shadow 0.18s cubic-bezier(0.22,1,0.36,1)',
                animation: 'procEnter 0.22s cubic-bezier(0.22,1,0.36,1) both',
                animationDelay: `${Math.min(filteredGuided.length + idx, 16) * 0.04}s`,
                boxShadow: expandedProc === proc.code ? '0 4px 16px rgba(143,29,44,0.1)' : '0 1px 4px rgba(0,0,0,0.04)',
              }}>
                <button
                  type="button"
                  onClick={() => {
                    const next = expandedProc === proc.code ? null : proc.code
                    setExpandedProc(next)
                    if (next) trackView({
                      id: `enr-${proc.code}`,
                      type: 'enriched',
                      icon: proc.icon || '📄',
                      titleAr: proc.title,
                      titleEn: proc.title_en || proc.title,
                      subtitleAr: proc.ministry,
                      subtitleEn: proc.ministry_en || proc.ministry,
                      aiPrompt: `أخبرني بكل التفاصيل عن: ${proc.title} — الإجراءات والوثائق والرسوم`,
                      href: '/procedures',
                    })
                  }}
                  aria-expanded={expandedProc === proc.code}
                  style={{ width: '100%', padding: '13px 14px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'right', display: 'flex', alignItems: 'center', gap: 10 }}
                  onTouchStart={e => { e.currentTarget.style.background = '#FEF5F5' }}
                  onTouchEnd={e => { e.currentTarget.style.background = 'none' }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: expandedProc === proc.code ? 'rgba(143,29,44,0.1)' : '#F8EDEF', border: '1px solid rgba(143,29,44,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8F1D2C', flexShrink: 0 }}>
                    <MinistryIcon slug={proc.ministrySlug} size={18} />
                  </div>
                  <div style={{ flex: 1, textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 9.5, fontWeight: 700, color: '#8F1D2C', background: 'rgba(143,29,44,0.07)', borderRadius: 6, padding: '1px 7px', border: '1px solid rgba(143,29,44,0.12)' }}>
                        {isAr
                          ? (MINISTRY_CHIPS.find(c => c.slug === proc.ministrySlug)?.ar || proc.ministry)
                          : (MINISTRY_CHIPS.find(c => c.slug === proc.ministrySlug)?.en || proc.ministry_en || proc.ministry)}
                      </span>
                      {displayDocs.length > 0 && <span style={{ fontSize: 9.5, background: '#F8EDEF', color: '#8F1D2C', borderRadius: 6, padding: '1px 7px', border: '1px solid rgba(143,29,44,0.2)' }}>{displayDocs.length} {isAr ? 'وثيقة' : 'doc'}</span>}
                      {displaySteps.length > 0 && <span style={{ fontSize: 9.5, background: '#F8EDEF', color: '#8F1D2C', borderRadius: 6, padding: '1px 7px', border: '1px solid rgba(143,29,44,0.2)' }}>{displaySteps.length} {isAr ? 'خطوة' : 'step'}</span>}
                      <ProcedureDifficultyBadge stepCount={proc.steps.length} docCount={proc.requiredDocuments.length} isAr={isAr} />
                      <ProcedurePriorityTag code={proc.code} isAr={isAr} />
                      <ProcedureViewCount code={proc.code} isAr={isAr} />
                      {proc.hasForm && <span style={{ fontSize: 9.5, background: '#FFFBEB', color: '#854D0E', borderRadius: 6, padding: '1px 7px', border: '1px solid #FDE68A' }}>{isAr ? 'نموذج' : 'Form'}</span>}
                      {displayFees && (() => {
                        const isFree = displayFees.includes('مجان') || displayFees.toLowerCase().includes('free') || displayFees === '0'
                        return (
                          <span style={{
                            fontSize: 9.5, borderRadius: 6, padding: '1px 7px',
                            background: isFree ? '#D1FAE5' : '#F0FDF4',
                            color: isFree ? '#065F46' : '#166534',
                            border: `1px solid ${isFree ? '#A7F3D0' : '#BBF7D0'}`,
                            fontWeight: 700,
                          }}>
                            💰 {isFree
                              ? (isAr ? 'مجاني' : 'Free')
                              : (displayFees.length > 14 ? displayFees.slice(0, 14) + '…' : displayFees)
                            }
                          </span>
                        )
                      })()}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: expandedProc === proc.code ? '#8F1D2C' : '#191713', lineHeight: 1.4 }}>{displayTitle}</div>
                      <ProcedureVersionTag code={proc.code} isAr={isAr} compact />
                      <ProcedureReminderBell code={proc.code} titleAr={proc.title} titleEn={proc.title_en} isAr={isAr} />
                      <ProcedureProgressBadge code={proc.code} total={proc.requiredDocuments.length} compact />
                    </div>
                    <div style={{ fontSize: 10, color: '#8F1D2C', fontWeight: 600, marginTop: 2 }}>{displayMinistry}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap', marginTop: 3 }}>
                      <ProcedureEstimatedFeeChip fees={proc.fees} fees_en={proc.fees_en} isAr={isAr} />
                    </div>
                    <ProcedureHashtagChips
                      code={proc.code}
                      ministry={proc.ministry}
                      ministry_en={proc.ministry_en}
                      isAr={isAr}
                    />
                    {displayDescription && expandedProc !== proc.code && (
                      <div style={{ fontSize: 10.5, color: '#6B5A4A', marginTop: 3, lineHeight: 1.5, opacity: 0.85 }}>
                        {displayDescription.length > 90 ? displayDescription.slice(0, 90) + '…' : displayDescription}
                      </div>
                    )}
                  </div>
                  <span style={{ color: expandedProc === proc.code ? '#8F1D2C' : '#918B82', transform: expandedProc === proc.code ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0, display: 'inline-flex' }}>
                    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6"/></svg>
                  </span>
                </button>

                {expandedProc === proc.code && (
                  <div style={{ padding: '0 14px 18px', borderTop: '1px solid #E6E2DC', animation: 'slideDown 0.2s cubic-bezier(0.22,1,0.36,1)' }}>

                    {/* Description */}
                    {displayDescription && (
                      <p style={{ margin: '12px 0 12px', fontSize: 12.5, color: '#2D1B0E', lineHeight: 1.75, background: '#FAFAF8', borderRadius: 9, padding: '9px 12px', border: '1px solid #E6E2DC' }}>
                        {displayDescription}
                      </p>
                    )}

                    {/* Meta strip: processing time + where to apply */}
                    {(displayProcessingTime || displayWhereToApply) && (
                      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                        {displayProcessingTime && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 9, padding: '6px 12px', flex: '1 1 auto', minWidth: 0 }}>
                            <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#92400E" strokeWidth="2" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: 9, fontWeight: 700, color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{isAr ? 'مدة الإنجاز' : 'Processing time'}</div>
                              <div style={{ fontSize: 11, color: '#78350F', fontWeight: 600, lineHeight: 1.3, display: 'flex', alignItems: 'center', gap: 4 }}>
                                {displayProcessingTime}
                                <CopyBtn text={displayProcessingTime} isAr={isAr} />
                              </div>
                            </div>
                          </div>
                        )}
                        {displayWhereToApply && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F8EDEF', border: '1px solid rgba(143,29,44,0.15)', borderRadius: 9, padding: '6px 12px', flex: '1 1 auto', minWidth: 0 }}>
                            <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8F1D2C" strokeWidth="2" style={{ flexShrink: 0 }}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: 9, fontWeight: 700, color: '#8F1D2C', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{isAr ? 'مكان التقديم' : 'Where to apply'}</div>
                              <div style={{ fontSize: 11, color: '#5C1A1A', fontWeight: 600, lineHeight: 1.3, display: 'flex', alignItems: 'center', gap: 4 }}>
                                {displayWhereToApply}
                                <CopyBtn text={displayWhereToApply} isAr={isAr} />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Ministry contact strip */}
                    <ProcedureRelatedMinistries ministrySlug={proc.ministrySlug} isAr={isAr} />
                    {/* Alternative submission offices */}
                    <ProcedureAlternativeOffices ministrySlug={proc.ministrySlug} isAr={isAr} />
                    <ProcedureOfficeMap ministrySlug={proc.ministrySlug} isAr={isAr} />

                    {/* Ministry map placeholder */}
                    <div style={{ marginBottom: 8 }}>
                      <ProcedureMinistryMap ministry={proc.ministry} ministry_en={proc.ministry_en} isAr={isAr} />
                    </div>

                    {/* Official portal links */}
                    <ProcedureExternalLinks ministrySlug={proc.ministrySlug} isAr={isAr} />

                    {/* Cost estimator */}
                    {displayFees && (
                      <div style={{ marginBottom: 12 }}>
                        <CostEstimator
                          feesRaw={displayFees}
                          docCount={proc.requiredDocuments.length}
                          titleAr={proc.title}
                          titleEn={proc.title_en}
                          onAsk={handleAsk}
                        />
                      </div>
                    )}

                    {/* Required documents — interactive readiness checker */}
                    {proc.requiredDocuments.length > 0 && (
                      <div style={{ marginBottom: 12 }}>
                        <ReadinessChecker
                          storageKey={`enr-${proc.code}`}
                          documentsAr={proc.requiredDocuments}
                          documentsEn={proc.requiredDocuments_en}
                          titleAr={proc.title}
                          titleEn={proc.title_en}
                          onAsk={handleAsk}
                        />
                      </div>
                    )}

                    {/* Doc readiness chip bar */}
                    {proc.requiredDocuments.length > 0 && (
                      <div id={`proc-${proc.code}-docs`}>
                        <ProcedureDocReadinessBar
                          code={proc.code}
                          docs={isAr ? proc.requiredDocuments : (proc.requiredDocuments_en ?? proc.requiredDocuments)}
                          isAr={isAr}
                        />
                      </div>
                    )}

                    {/* Document checklist with progress */}
                    {proc.requiredDocuments.length > 0 && (
                      <>
                        <ProcedureDocumentChecklist
                          code={proc.code}
                          docs={isAr ? proc.requiredDocuments : (proc.requiredDocuments_en?.length ? proc.requiredDocuments_en : proc.requiredDocuments)}
                          isAr={isAr}
                        />
                        <ProcedureDocumentShare
                          code={proc.code}
                          docs={isAr ? proc.requiredDocuments : (proc.requiredDocuments_en?.length ? proc.requiredDocuments_en : proc.requiredDocuments)}
                          titleAr={proc.title}
                          titleEn={proc.title_en}
                          isAr={isAr}
                        />
                        <ProcedureDocumentStatus
                          code={proc.code}
                          docs={isAr ? proc.requiredDocuments : (proc.requiredDocuments_en?.length ? proc.requiredDocuments_en : proc.requiredDocuments)}
                          isAr={isAr}
                        />
                        <ProcedureChecklistExport
                          code={proc.code}
                          docs={isAr ? proc.requiredDocuments : (proc.requiredDocuments_en?.length ? proc.requiredDocuments_en : proc.requiredDocuments)}
                          titleAr={proc.title}
                          titleEn={proc.title_en}
                          isAr={isAr}
                        />
                        <ProcedureDocumentPhotoTips isAr={isAr} />
                        <ProcedureFeeHistory code={proc.code} fees={isAr ? proc.fees : proc.fees_en} isAr={isAr} />
                      </>
                    )}

                    {/* Steps — interactive timeline */}
                    {proc.steps.length > 0 && (
                      <div style={{ marginBottom: 12 }}>
                        <ProcedureTimeline
                          storageKey={`enr-${proc.code}`}
                          stepsAr={proc.steps}
                          stepsEn={proc.steps_en}
                          titleAr={proc.title}
                          titleEn={proc.title_en}
                          onAsk={handleAsk}
                        />
                        <ProcedureCopyableSteps
                          steps={isAr ? proc.steps : (proc.steps_en ?? proc.steps)}
                          titleAr={proc.title}
                          titleEn={proc.title_en}
                          isAr={isAr}
                        />
                        <ProcedureCopySummaryLine
                          title={displayTitle}
                          ministry={displayMinistry}
                          fees={displayFees}
                          isAr={isAr}
                        />
                        <div style={{ marginTop: 8, marginBottom: 8 }}>
                          <ProcedureStepsAudio
                            steps={isAr ? proc.steps : (proc.steps_en ?? proc.steps)}
                            isAr={isAr}
                          />
                        </div>
                        <ProcedureStepHighlight
                          code={proc.code}
                          steps={isAr ? proc.steps : (proc.steps_en ?? proc.steps)}
                          isAr={isAr}
                        />
                        <div style={{ marginTop: 8 }}>
                          <ProcedureNeedHelpToggle code={proc.code} isAr={isAr} />
                        </div>
                      </div>
                    )}

                    {/* Mini map — section navigation */}
                    <ProcedureMiniMap anchorPrefix={`proc-${proc.code}`} isAr={isAr} />

                    {/* Interactive step checklist */}
                    {proc.steps.length > 0 && (
                      <div id={`proc-${proc.code}-steps`}>
                        <ProcedureStepProgress
                          code={proc.code}
                          steps={isAr ? proc.steps : (proc.steps_en ?? proc.steps)}
                          isAr={isAr}
                        />
                      </div>
                    )}

                    {/* Per-step countdown timers */}
                    {proc.steps.length > 0 && (
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 10, fontWeight: 800, color: '#918B82', marginBottom: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
                          ⏱ {isAr ? 'مؤقّت الخطوات' : 'Step timers'}
                        </div>
                        <ProcedureStepTimer
                          code={proc.code}
                          steps={isAr ? proc.steps : (proc.steps_en ?? proc.steps)}
                          isAr={isAr}
                        />
                      </div>
                    )}

                    {/* Fees — detailed breakdown */}
                    {displayFees && (
                      <div id={`proc-${proc.code}-fees`}>
                        <ProcedureCostBreakdown
                          fees={proc.fees}
                          fees_en={proc.fees_en}
                          isAr={isAr}
                        />
                      </div>
                    )}

                    {/* PDF download links */}
                    {proc.pdfUrls && proc.pdfUrls.length > 0 && (
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                        {proc.pdfUrls.map((url, pi) => (
                          <a key={pi} href={url} target="_blank" rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 5,
                              padding: '7px 14px', borderRadius: 9,
                              background: '#fff', border: '1.5px solid #E6E2DC',
                              color: '#69645C', fontSize: 11, fontWeight: 700,
                              textDecoration: 'none',
                            }}
                          >
                            <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8F1D2C" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                            {isAr ? `تنزيل النموذج${proc.pdfUrls.length > 1 ? ` ${pi + 1}` : ''}` : `Download Form${proc.pdfUrls.length > 1 ? ` ${pi + 1}` : ''}`}
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Last reviewed date */}
                    <div style={{ marginBottom: 8 }}>
                      <ProcedureLastUpdatedBadge code={proc.code} isAr={isAr} />
                      <ProcedureLanguageToggleHint isAr={isAr} />
                    </div>

                    {/* Global procedure deadline countdown */}
                    <ProcedureCountdownTimer code={proc.code} titleAr={proc.title} isAr={isAr} />

                    {/* Started / completed markers */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                      <ProcedureStartButton code={proc.code} isAr={isAr} />
                      <ProcedureCompletionBadge code={proc.code} isAr={isAr} />
                    </div>

                    {/* Estimated completion based on start date + processingTime */}
                    <ProcedureEstimatedCompletion
                      code={proc.code}
                      processingTime={proc.processingTime}
                      processingTimeEn={proc.processingTime_en}
                    />

                    {/* Application stage tracker */}
                    <ProcedureApprovalTracker code={proc.code} isAr={isAr} />

                    {/* Activity history log */}
                    <ProcedureHistoryLog code={proc.code} isAr={isAr} />

                    {/* Personal notes */}
                    <ProcedureNotesPanel code={proc.code} isAr={isAr} />

                    {/* Quick remind-me-later chip */}
                    <ProcedureRemindMeLater
                      code={proc.code}
                      titleAr={proc.title}
                      titleEn={proc.title_en}
                      isAr={isAr}
                    />

                    {/* Set deadline — personal deadline reminder for this procedure */}
                    {(() => {
                      let savedDeadline = ''
                      try { savedDeadline = localStorage.getItem(`dalilak_proc_deadline_${proc.code}`) || '' } catch {}
                      return (
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
                          marginBottom: 12, padding: '9px 12px',
                          background: '#F8F9FF', border: '1px solid #DBEAFE', borderRadius: 10,
                        }}>
                          <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" style={{ flexShrink: 0 }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#1D4ED8', flex: 1 }}>
                            {isAr ? 'حدّد موعداً نهائياً لهذه المعاملة' : 'Set a deadline for this procedure'}
                          </span>
                          <input
                            type="date"
                            defaultValue={savedDeadline}
                            min={new Date().toISOString().slice(0, 10)}
                            onChange={e => {
                              const val = e.target.value
                              if (val) {
                                setDeadline(proc.code, val)
                              } else {
                                clearDeadline(proc.code)
                              }
                            }}
                            style={{
                              fontSize: 11, fontFamily: 'inherit', padding: '4px 8px',
                              border: '1px solid #BFDBFE', borderRadius: 7,
                              background: '#fff', color: '#1D4ED8', outline: 'none',
                              cursor: 'pointer',
                            }}
                          />
                          {savedDeadline && (
                            <button
                              type="button"
                              onClick={() => clearDeadline(proc.code)}
                              title={isAr ? 'حذف الموعد' : 'Remove deadline'}
                              style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: '#93C5FD', fontSize: 13, padding: 2,
                                display: 'flex', alignItems: 'center',
                              }}
                            >✕</button>
                          )}
                        </div>
                      )
                    })()}

                    {/* Related FAQ chips */}
                    <ProcedureFAQChips
                      ministry={proc.ministry}
                      title={proc.title}
                      isAr={isAr}
                      onAsk={handleAsk}
                    />

                    {/* Quick-ask chips */}
                    <ProcedureQuickAskChips
                      code={proc.code}
                      titleAr={proc.title}
                      titleEn={proc.title_en}
                      isAr={isAr}
                      onAsk={handleAsk}
                    />

                    {/* AI Assist Button with preset questions */}
                    <ProcedureAIAssistButton
                      title={proc.title}
                      title_en={proc.title_en}
                      code={proc.code}
                      isAr={isAr}
                      onAsk={handleAsk}
                    />

                    {/* CTA row: Ask + Save */}
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <button type="button" onClick={() => handleAsk(displayTitle)}
                        onTouchStart={e => { e.currentTarget.style.opacity = '0.82'; e.currentTarget.style.transform = 'scale(0.97)' }}
                        onTouchEnd={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)' }}
                        style={{
                          flex: 1, padding: '11px 18px', borderRadius: 11,
                          background: 'linear-gradient(135deg, #8F1D2C, #741622)',
                          border: 'none', color: '#fff', fontSize: 12.5, fontWeight: 700,
                          cursor: 'pointer', fontFamily: 'inherit',
                          transition: 'opacity 0.12s, transform 0.12s',
                          boxShadow: '0 2px 8px rgba(143,29,44,0.25)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                        }}>
                        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
                        {isAr ? 'اسأل دليلك عن هذا الإجراء' : 'Ask about this procedure'}
                      </button>
                      <SaveButton
                        variant="pill"
                        size="md"
                        item={{
                          id: `enr-${proc.code}`,
                          type: 'enriched',
                          icon: proc.icon || '📄',
                          titleAr: proc.title,
                          titleEn: proc.title_en || proc.title,
                          subtitleAr: proc.ministry,
                          subtitleEn: proc.ministry_en || proc.ministry,
                          aiPrompt: `أخبرني بكل التفاصيل عن: ${proc.title} — الإجراءات والوثائق والرسوم`,
                          href: '/procedures',
                        }}
                      />
                      {/* Share via WhatsApp */}
                      <button
                        type="button"
                        onClick={() => {
                          const title = isAr ? proc.title : (proc.title_en || proc.title)
                          const ministry = isAr ? proc.ministry : (proc.ministry_en || proc.ministry)
                          const steps = (isAr ? proc.steps : (proc.steps_en?.length ? proc.steps_en : proc.steps)).slice(0, 4)
                          const docs = proc.requiredDocuments.slice(0, 4)
                          const lines = [
                            `📋 *${title}*`,
                            `🏛️ ${ministry}`,
                            '',
                            isAr ? '📌 الخطوات:' : '📌 Steps:',
                            ...steps.map((s, i) => `${i + 1}. ${s}`),
                            '',
                            isAr ? '📁 الوثائق:' : '📁 Documents:',
                            ...docs.map(d => `• ${d}`),
                            '',
                            `🔗 dalilak.vercel.app`,
                          ]
                          const text = lines.join('\n')
                          window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer')
                        }}
                        title={isAr ? 'مشاركة عبر واتساب' : 'Share via WhatsApp'}
                        style={{
                          height: 36, padding: '0 12px', borderRadius: 9,
                          background: '#25D366', border: 'none',
                          color: '#fff', fontSize: 11.5, fontWeight: 700,
                          cursor: 'pointer', fontFamily: 'inherit',
                          display: 'flex', alignItems: 'center', gap: 5,
                          flexShrink: 0,
                        }}
                      >
                        <svg aria-hidden="true" viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.561 4.14 1.535 5.876L.057 23.882l6.187-1.473A11.948 11.948 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.894a9.875 9.875 0 01-5.031-1.378l-.361-.214-3.741.981.999-3.648-.235-.374A9.86 9.86 0 012.106 12c0-5.459 4.435-9.894 9.894-9.894 5.46 0 9.894 4.435 9.894 9.894 0 5.46-4.434 9.894-9.894 9.894z"/>
                        </svg>
                        {isAr ? 'شارك' : 'Share'}
                      </button>
                      {/* Share via Email */}
                      <ProcedureShareViaEmail proc={proc} isAr={isAr} />
                      <ProcedureCopyDeepLink code={proc.code} isAr={isAr} />
                      {/* Human help via WhatsApp */}
                      <ProcedureHelpRequest code={proc.code} titleAr={proc.title} titleEn={proc.title_en} isAr={isAr} />
                      {/* QR Share */}
                      <ProcedureQRShare code={proc.code} titleAr={proc.title} titleEn={proc.title_en} />
                      {/* Printable card */}
                      <ProcedurePrintableCard proc={proc} isAr={isAr} />
                      {/* Print summary */}
                      <ProcedurePrintSummary
                        code={proc.code}
                        title={proc.title}
                        title_en={proc.title_en}
                        ministry={proc.ministry}
                        ministry_en={proc.ministry_en}
                        steps={proc.steps}
                        steps_en={proc.steps_en}
                        requiredDocuments={proc.requiredDocuments}
                        requiredDocuments_en={proc.requiredDocuments_en}
                        fees={proc.fees}
                        fees_en={proc.fees_en}
                        processingTime={proc.processingTime}
                        processingTime_en={proc.processingTime_en}
                        isAr={isAr}
                      />
                      {/* Print button */}
                      <button
                        type="button"
                        title={isAr ? 'طباعة هذا الإجراء' : 'Print this procedure'}
                        onClick={() => setPrintProc(proc)}
                        style={{
                          height: 36, width: 36, borderRadius: 9, flexShrink: 0,
                          background: 'var(--surface)', border: '1px solid var(--border)',
                          color: 'var(--text-3)', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 15,
                        }}
                      >🖨️</button>
                    </div>
                  </div>
                )}
              </div>
              )
            })}
          </div>
        )}

        {/* Related procedures */}
        {expandedProc && (() => {
          const activeProcObj = ENRICHED_PROCEDURES.find(p => p.code === expandedProc)
          if (!activeProcObj) return null
          return (
            <div style={{ padding: '0 16px 4px' }}>
              <ProcedureRelatedSuggestions
                proc={activeProcObj}
                onSelect={code => {
                  setExpandedProc(code)
                  setTimeout(() => {
                    const el = document.getElementById(`proc-${code}`)
                    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }, 100)
                }}
                onAsk={q => handleAsk(q)}
              />
            </div>
          )
        })()}

        {/* Link to full services directory */}
        <div style={{ marginTop: 28, borderTop: '1px solid #E6E2DC', paddingTop: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', border: '1.5px solid #E6E2DC', borderRadius: 14, padding: '14px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#191713', marginBottom: 3 }}>
                {isAr ? 'دليل الخدمات الحكومية' : 'Government Services Directory'}
              </div>
              <div style={{ fontSize: 11, color: '#918B82' }}>
                {isAr ? `${ALL_SERVICES.length} خدمة · ${SERVICE_CATEGORIES.length} فئة` : `${ALL_SERVICES.length} services · ${SERVICE_CATEGORIES.length} categories`}
              </div>
            </div>
            <button
              type="button"
              onClick={() => router.push('/services')}
              style={{
                padding: '9px 16px', borderRadius: 10,
                background: 'linear-gradient(135deg, #8F1D2C, #741622)',
                border: 'none', color: '#fff', fontSize: 12, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6,
                boxShadow: '0 2px 8px rgba(143,29,44,0.25)', whiteSpace: 'nowrap',
              }}
            >
              {isAr ? 'استعرض الكل' : 'Browse all'}
              <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
          </div>
        </div>

      </div>

      <div className="bottom-nav-wrapper"><BottomNav isAr={isAr} activeTab="procedures" /></div>

      {/* Print procedure modal */}
      {printProc && (
        <PrintProcedureModal
          procedure={printProc}
          onClose={() => setPrintProc(null)}
        />
      )}

      {/* Fullscreen procedure search modal */}
      {searchModalOpen && (
        <ProcedureSearchModal
          onClose={() => setSearchModalOpen(false)}
          onSelect={proc => {
            setExpandedProc(proc.code)
            setSearchModalOpen(false)
            setTimeout(() => {
              document.getElementById(`proc-${proc.code}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }, 100)
          }}
          onAsk={q => router.push(`/?q=${encodeURIComponent(q)}`)}
        />
      )}

      {/* Advanced filter drawer */}
      {filterDrawerOpen && (
        <ProcedureFilterDrawer
          filters={advFilters}
          onChange={f => setAdvFilters(f)}
          onClose={() => setFilterDrawerOpen(false)}
          totalResults={filteredEnriched.length + filteredGuided.length}
        />
      )}
    </div>
  )
}
