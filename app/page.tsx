'use client'

import React, { useState, useRef, useEffect, FormEvent, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import ChatMessage, { Message } from '@/components/ChatMessage'
import BottomNav from '@/components/BottomNav'
import AppLogo from '@/components/AppLogo'
import SectionHeader from '@/components/SectionHeader'
// batch #357 perf fix: GuidedFlow/TransactionStarter/ServiceGroupSheet are modal
// overlays only mounted after a user action (start-guide, transaction-starter,
// service-group tap) — they were being eager-imported into the main bundle on
// every homepage load even though most visits never open them. Lazy-loaded via
// next/dynamic with ssr:false (pure client-side modals, no SEO/content impact).
const GuidedFlow = dynamic(() => import('@/components/GuidedFlow'), { ssr: false })
import MobileMenu from '@/components/MobileMenu'
import KeyboardShortcutsHelp from '@/components/KeyboardShortcutsHelp'
// batch #363 perf fix: UserOnboarding (433 lines) only ever renders its
// wizard for genuinely first-time visitors (internally gated by `show`
// state derived from localStorage — returns null for everyone else) yet
// was eager-imported into every homepage load. Lazy-loaded via
// next/dynamic, ssr:false (pure client-side, no SEO content).
const UserOnboarding = dynamic(() => import('@/components/UserOnboarding'), { ssr: false })
import ChatSummaryCard from '@/components/ChatSummaryCard'
import AppointmentReminder from '@/components/AppointmentReminder'
import FeedbackWidget from '@/components/FeedbackWidget'
import ChatTypingIndicator from '@/components/ChatTypingIndicator'
import ChatMessageActions from '@/components/ChatMessageActions'
import ChatPinButton, { ChatPinnedBanner } from '@/components/ChatPinnedMessage'
import ChatVoicePlayback from '@/components/ChatVoicePlayback'
import ChatEmojiReactions from '@/components/ChatEmojiReactions'
import ChatSaveToNotes from '@/components/ChatSaveToNotes'
import ChatAIBadge from '@/components/ChatAIBadge'
import ChatScrollToBottomButton from '@/components/ChatScrollToBottomButton'
import ChatHistoryPanel, { saveChatSession } from '@/components/ChatHistoryPanel'
import { useFocusTrap } from '@/lib/useFocusTrap'
import ProcedureCompletionCelebration from '@/components/ProcedureCompletionCelebration'
import ChatSessionTimer from '@/components/ChatSessionTimer'
import ChatVoiceInputBtn from '@/components/ChatVoiceInputBtn'
import ChatSessionSummaryChip from '@/components/ChatSessionSummaryChip'
import ChatLanguageToggleChip from '@/components/ChatLanguageToggleChip'
import HomepageChatSuggestionsBar from '@/components/HomepageChatSuggestionsBar'
import SmartInputSuggestions, { useSmartSuggestionsKeyDown } from '@/components/SmartInputSuggestions'
import ChatQuickReplies from '@/components/ChatQuickReplies'
import ChatInputCharCounter from '@/components/ChatInputCharCounter'
import ChatKeyboardSendHint from '@/components/ChatKeyboardSendHint'
import ChatDraftAutosave from '@/components/ChatDraftAutosave'
import ChatMessageSearchInThread from '@/components/ChatMessageSearchInThread'
import ChatContextBar from '@/components/ChatContextBar'
import ChatResponseLength, { useResponseLength } from '@/components/ChatResponseLength'
import ModeSelector from '@/components/MobileModeSheet'
import TopNav from '@/components/TopNav'
import { getToken, getUser, setUser, clearToken, authHeaders, isAdmin, type User } from '@/lib/auth'
import { sanitizeInput } from '@/lib/sanitize'
import type { StarterResult } from '@/components/TransactionStarter'
const TransactionStarter = dynamic(() => import('@/components/TransactionStarter'), { ssr: false })
const ServiceGroupSheet = dynamic(() => import('@/components/ServiceGroupSheet'), { ssr: false })
import { SERVICE_GROUPS, type ServiceGroup, type ServiceItem } from '@/lib/serviceGroups'
import { useLanguage } from '@/lib/LanguageContext'
// batch #354 perf fix: TX_ALL/TX_WITH_FORMS/TX_MINISTRIES (lib/allTransactions.ts, ~400KB
// source), ENRICHED_PROCEDURES (lib/enrichedProcedures.ts, ~256KB), and ALL_SERVICES
// (lib/allServices.ts, ~1MB) were imported here but never referenced anywhere else in this
// file (verified: each identifier appeared exactly once — the import line itself). That's
// ~1.7MB of unused data source being bundled into the homepage's JS for zero reason. Removed
// the dead imports; the pages that actually use this data (/procedures, /services, /forms
// etc.) import it directly and are unaffected.
import { LIFE_JOURNEYS, getJourneyBySlug, type LifeJourney, type JourneyStep } from '@/lib/lifeJourneys'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dalilak-backend-bvb9.onrender.com'

interface AttachedFile {
  name: string
  type: string
  base64: string
  preview?: string
  size: number
}

type ResponseMode = 'quick' | 'detailed' | 'research'
type Lang = 'ar' | 'en'

const MODES: { id: ResponseMode; label_ar: string; label_en: string; hint_ar: string; hint_en: string; prefix: string; prefix_en: string }[] = [
  {
    id: 'quick',
    label_ar: 'سريع', label_en: 'Quick',
    hint_ar: 'إجابة مختصرة في ثوانٍ', hint_en: 'Short answer in seconds',
    prefix: '[أجب بإيجاز واضح في 4-6 أسطر فقط دون تفاصيل زائدة] ',
    prefix_en: '[Answer concisely in 4-6 lines only, no extra details.] ',
  },
  {
    id: 'detailed',
    label_ar: 'مفصّل', label_en: 'Detailed',
    hint_ar: 'خطوات وتفاصيل كاملة', hint_en: 'Full steps and details',
    prefix: '[أجب بتنسيق منظّم مع عناوين ## واضحة: ## الخلاصة | ## المستندات المطلوبة | ## الخطوات | ## الجهة المختصة | ## الرسوم | ## تنبيه مهم] ',
    prefix_en: '[Answer with clear ## headings: ## Summary | ## Required Documents | ## Steps | ## Authority | ## Fees | ## Important Note] ',
  },
  {
    id: 'research',
    label_ar: 'بحث وافٍ', label_en: 'Research',
    hint_ar: 'تقرير شامل مع أدلة ونماذج', hint_en: 'Full report with evidence',
    prefix: '[أجب بتقرير شامل: تحليل كامل، جميع الخيارات المتاحة، الأدلة الرسمية، المراجع القانونية، نموذج جاهز للاستخدام إن وجد، وتنبيهات العطل الرسمية] ',
    prefix_en: '[Answer with a full report: complete analysis, all available options, official sources, legal references, a ready-to-use template if applicable, and any public holiday warnings.] ',
  },
]


function ServiceGroupIcon({ slug }: { slug: string }) {
  if (slug === 'expat') return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 004 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
  )
  if (slug === 'property') return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
    </svg>
  )
  if (slug === 'contracts') return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
    </svg>
  )
  if (slug === 'civil-records') return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
    </svg>
  )
  if (slug === 'business') return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
    </svg>
  )
  if (slug === 'industry') return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 10l6-7v7l6-7v7l6-7v11H3V10z"/>
    </svg>
  )
  if (slug === 'labor') return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
    </svg>
  )
  // forms-docs
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
    </svg>
  )
}

const QUESTION_POOL_AR = [
  'كيف أستخرج جواز سفر لبناني؟',
  'ما هي إجراءات تسجيل سيارة جديدة؟',
  'كيف أستخرج شهادة ميلاد؟',
  'كيف أسجل شركة في لبنان؟',
  'ما إجراءات استخراج تصريح بناء؟',
  'كيف أجدد رخصة القيادة؟',
  'ما وثائق تسجيل الزواج الرسمي؟',
  'كيف أستخرج بطاقة هوية لبنانية؟',
  'ما هي إجراءات نقل ملكية العقار؟',
  'كيف أستخرج شهادة عدم محكومية؟',
  'ما الوثائق اللازمة لتسجيل مولود؟',
  'كيف أحصل على إجازة مزاولة المهنة؟',
  'ما هي رسوم التسجيل في الضمان الاجتماعي؟',
  'كيف أطعن في قرار إداري؟',
  'ما خطوات تجديد إقامة الأجانب في لبنان؟',
  'كيف أحصل على إجازة عمل لموظف أجنبي؟',
  'كيف أحسب تعويض نهاية الخدمة في لبنان؟',
  'كيف أحصل على ترخيص إنشاء منشأة صناعية؟',
  'كيف أستورد سيارة إلى لبنان وما هي الرسوم؟',
  'كيف أقدم الإقرار الضريبي على الدخل في لبنان؟',
  'كيف أحصل على ترخيص صيدلية في لبنان؟',
  'كيف أستخرج وكالة قانونية من الكاتب العدل؟',
  'ما إجراءات تغيير الاسم في السجل المدني؟',
  'كيف أحصل على تعويض الأمومة من الضمان الاجتماعي؟',
]

const QUESTION_POOL_EN = [
  'How do I get a Lebanese passport?',
  'How do I import a car to Lebanon and what are the customs fees?',
  'How do I file an income tax return in Lebanon?',
  'How do I get a pharmacy license in Lebanon?',
  'How do I get a power of attorney from a notary in Lebanon?',
  'What are the procedures for changing a name in the civil registry?',
  'How do I claim maternity benefits from social security?',
  'How do I register a new car in Lebanon?',
  'How do I get a birth certificate?',
  'How do I register a company in Lebanon?',
  'How do I get a building permit?',
  'How do I renew my driver\'s license?',
  'What are the civil marriage registration requirements?',
  'How do I get a Lebanese national ID card?',
  'What are the real estate transfer procedures?',
  'How do I get a certificate of good conduct?',
  'What documents are needed to register a newborn?',
  'How do I obtain a work permit for a foreign employee?',
  'How is end-of-service gratuity calculated in Lebanon?',
  'How do I get an industrial facility license in Lebanon?',
  'How do I get a professional practice license?',
  'What are the social security registration fees?',
  'How do I appeal an administrative decision?',
  'What are the steps to renew a foreigner\'s residency?',
]

// ── localStorage Q&A cache ─────────────────────────────────────
const LS_KEY = 'dalilak_qa_cache'
const LS_MAX = 30

// ── localStorage chat history ───────────────────────────────────
const CHAT_HISTORY_KEY = 'dalilak:chat:history'
const CHAT_HISTORY_MAX = 50

interface QAEntry { q: string; a: string; ts: number }

function lsNormalize(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, ' ')
}

function lsGet(question: string): string | null {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return null
    const entries: QAEntry[] = JSON.parse(raw)
    const norm = lsNormalize(question)
    const hit = entries.find(e => lsNormalize(e.q) === norm)
    return hit ? hit.a : null
  } catch { return null }
}

function lsSet(question: string, answer: string) {
  try {
    const raw = localStorage.getItem(LS_KEY)
    let entries: QAEntry[] = raw ? JSON.parse(raw) : []
    const norm = lsNormalize(question)
    entries = entries.filter(e => lsNormalize(e.q) !== norm)
    entries.unshift({ q: question, a: answer, ts: Date.now() })
    if (entries.length > LS_MAX) entries = entries.slice(0, LS_MAX)
    localStorage.setItem(LS_KEY, JSON.stringify(entries))
  } catch {}
}

function shufflePick<T>(arr: T[], n: number): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, n)
}


const HERO_CARDS = [
  { titleAr:'استخراج جواز السفر', titleEn:'Passport Application',
    authAr:'الأمن العام', authEn:'General Security',
    cntAr:'4 خطوات', cntEn:'4 Steps', icon:'passport',
    steps:[
      {ar:'تجهيز المستندات المطلوبة',en:'Prepare required documents',s:'done'},
      {ar:'تقديم الطلب في الأمن العام',en:'Submit at General Security',s:'done'},
      {ar:'دفع الرسوم',en:'Pay the fees',s:'active'},
      {ar:'استلام جواز السفر',en:'Receive passport',s:'pending'},
    ],
    pAr:'كيف أستخرج أو أجدد جواز سفري اللبناني؟',
    pEn:'How do I get or renew my Lebanese passport?',
  },
  { titleAr:'إخراج قيد عائلي', titleEn:'Family Registry Extract',
    authAr:'السجل المدني', authEn:'Civil Registry',
    cntAr:'3 خطوات', cntEn:'3 Steps', icon:'document',
    steps:[
      {ar:'تحديد مركز السجل المدني',en:'Locate Civil Registry center',s:'done'},
      {ar:'تقديم الطلب مع الهوية',en:'Submit request with ID',s:'done'},
      {ar:'استلام الوثيقة',en:'Receive document',s:'active'},
    ],
    pAr:'كيف أستخرج إخراج قيد من السجل المدني؟',
    pEn:'How do I get a civil registry extract?',
  },
  { titleAr:'تسجيل شركة', titleEn:'Company Registration',
    authAr:'وزارة الاقتصاد', authEn:'Ministry of Economy',
    cntAr:'7 خطوات', cntEn:'7 Steps', icon:'company',
    steps:[
      {ar:'تحديد نوع الشركة',en:'Choose company type',s:'done'},
      {ar:'إعداد عقد التأسيس',en:'Prepare founding contract',s:'done'},
      {ar:'التوثيق لدى الكاتب العدل',en:'Notarize the contract',s:'active'},
      {ar:'التسجيل في الوزارة',en:'Register with Ministry',s:'pending'},
    ],
    pAr:'كيف أسجّل شركة في لبنان؟',
    pEn:'How do I register a company in Lebanon?',
  },
  { titleAr:'تجديد رخصة القيادة', titleEn:"Driver's License Renewal",
    authAr:'مصلحة تسجيل السيارات', authEn:'Vehicle Registration',
    cntAr:'4 خطوات', cntEn:'4 Steps', icon:'license',
    steps:[
      {ar:'فحص طبي للرؤية',en:'Eye exam at clinic',s:'done'},
      {ar:'دفع الرسوم في المالية',en:'Pay fees at Treasury',s:'done'},
      {ar:'تقديم طلب التجديد',en:'Submit renewal request',s:'active'},
      {ar:'استلام الرخصة',en:'Receive license',s:'pending'},
    ],
    pAr:'كيف أجدد رخصة القيادة اللبنانية؟',
    pEn:"How do I renew my Lebanese driver's license?",
  },
  { titleAr:'تجديد إقامة أجنبي', titleEn:'Residency Renewal',
    authAr:'الأمن العام', authEn:'General Security',
    cntAr:'5 خطوات', cntEn:'5 Steps', icon:'residency',
    steps:[
      {ar:'جمع المستندات المطلوبة',en:'Gather required documents',s:'done'},
      {ar:'دفع الرسوم',en:'Pay the fees',s:'done'},
      {ar:'تقديم الطلب في الأمن العام',en:'Submit at General Security',s:'active'},
      {ar:'انتظار الموافقة',en:'Await approval',s:'pending'},
    ],
    pAr:'كيف أجدد إقامة أجنبي في لبنان؟',
    pEn:"How do I renew a foreigner's residency permit?",
  },
] as const
type HeroCard = (typeof HERO_CARDS)[number]

// ── Journey Sheet ─────────────────────────────────────────────────────────────
function JourneySheet({
  journey, onClose, onAsk,
}: { journey: LifeJourney; onClose: () => void; onAsk: (q: string) => void }) {
  const { isAr } = useLanguage()
  // batch #465: this dialog was missing from batch #360's app-wide Tab-trap
  // sweep (it lives inline in app/page.tsx rather than its own component
  // file, so a component-name-based audit skipped it) — Tab/Shift+Tab could
  // leak focus out of the open sheet into the hidden page behind the
  // overlay. Same fix already applied to every other role="dialog" in the
  // app (see lib/useFocusTrap.ts's doc comment for the original 13).
  const dialogRef = useRef<HTMLDivElement>(null)
  useFocusTrap(dialogRef, true)

  return (
    <div
      role="presentation"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      onKeyDown={e => { if (e.key === 'Escape') onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={isAr ? journey.titleAr : journey.titleEn}
        dir={isAr ? 'rtl' : 'ltr'}
        style={{
          background: '#fff', borderRadius: '24px 24px 0 0',
          width: '100%', maxWidth: 680,
          maxHeight: '88vh', overflowY: 'auto',
          display: 'flex', flexDirection: 'column',
          animation: 'slideUp 0.28s cubic-bezier(0.22,1,0.36,1) both',
        }}
      >
        <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)}}`}</style>

        {/* Header */}
        <div style={{
          padding: '20px 20px 18px',
          borderBottom: '1px solid var(--border)',
          position: 'sticky', top: 0, background: '#fff', zIndex: 2,
          display: 'flex', alignItems: 'flex-start', gap: 14,
        }}>
          <div style={{
            fontSize: 34, lineHeight: 1, flexShrink: 0,
            width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--brand-soft)', borderRadius: 14,
          }}>
            {journey.emoji}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-1)', margin: '0 0 3px' }}>
              {isAr ? journey.titleAr : journey.titleEn}
            </h2>
            <p style={{ fontSize: 12.5, color: 'var(--text-3)', margin: '0 0 8px' }}>
              {isAr ? journey.subtitleAr : journey.subtitleEn}
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span style={{
                fontSize: 11, padding: '3px 10px', borderRadius: 99,
                background: 'var(--brand-soft)', color: 'var(--brand)',
                fontWeight: 700, border: '1px solid var(--brand-ring)',
              }}>
                ⏱ {isAr ? journey.totalEstAr : journey.totalEstEn}
              </span>
              <span style={{
                fontSize: 11, padding: '3px 10px', borderRadius: 99,
                background: 'var(--surface-2)', color: 'var(--text-2)',
                fontWeight: 600, border: '1px solid var(--border)',
              }}>
                💰 {isAr ? journey.totalFeesAr : journey.totalFeesEn}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={isAr ? 'إغلاق' : 'Close'}
            style={{
              width: 34, height: 34, borderRadius: 9, flexShrink: 0,
              border: '1.5px solid var(--border)', background: 'transparent',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-3)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Description */}
        <div style={{ padding: '16px 20px 0' }}>
          <p style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.7, margin: 0 }}>
            {isAr ? journey.descAr : journey.descEn}
          </p>
        </div>

        {/* Steps timeline */}
        <div style={{ padding: '20px 20px' }}>
          <div style={{
            fontSize: 10.5, fontWeight: 700, color: 'var(--text-3)',
            letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 16,
          }}>
            {isAr ? 'الخطوات بالترتيب' : 'Steps in Order'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {journey.steps.map((step: JourneyStep, i: number) => (
              <div key={i} style={{ display: 'flex', gap: 14, position: 'relative', paddingBottom: i < journey.steps.length - 1 ? 20 : 0 }}>
                {/* Connector line */}
                {i < journey.steps.length - 1 && (
                  <div style={{
                    position: 'absolute',
                    [isAr ? 'right' : 'left']: 16,
                    top: 34, bottom: 0, width: 2,
                    background: step.optional ? 'var(--border-light)' : 'var(--border)',
                    borderRadius: 2,
                  }} />
                )}
                {/* Step number */}
                <div style={{
                  width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: step.optional ? 'var(--surface-2)' : 'var(--brand)',
                  color: step.optional ? 'var(--text-3)' : '#fff',
                  fontSize: 13, fontWeight: 800, zIndex: 1,
                  border: step.parallel ? '2.5px dashed var(--brand)' : 'none',
                }}>
                  {i + 1}
                </div>
                {/* Content */}
                <div style={{
                  flex: 1, background: 'var(--surface-muted)',
                  border: '1px solid var(--border)',
                  borderRadius: 12, padding: '12px 14px',
                  opacity: step.optional ? 0.75 : 1,
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-1)', lineHeight: 1.3 }}>
                      {isAr ? step.titleAr : step.titleEn}
                      {step.optional && (
                        <span style={{
                          marginInlineStart: 8, fontSize: 10, fontWeight: 700,
                          background: 'var(--surface-3)', color: 'var(--text-3)',
                          borderRadius: 6, padding: '2px 7px',
                        }}>
                          {isAr ? 'اختياري' : 'Optional'}
                        </span>
                      )}
                      {step.parallel && (
                        <span style={{
                          marginInlineStart: 8, fontSize: 10, fontWeight: 700,
                          background: '#eff6ff', color: '#1d4ed8',
                          borderRadius: 6, padding: '2px 7px',
                        }}>
                          {isAr ? 'متوازٍ' : 'Parallel'}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => { onAsk(isAr ? step.promptAr : step.promptEn); onClose() }}
                      style={{
                        flexShrink: 0, height: 28, padding: '0 10px', borderRadius: 7,
                        border: 'none', background: step.optional ? 'var(--surface-3)' : 'var(--brand)',
                        color: step.optional ? 'var(--text-2)' : '#fff',
                        fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                        display: 'flex', alignItems: 'center', gap: 4,
                      }}
                    >
                      <svg aria-hidden="true" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                      </svg>
                      {isAr ? 'اسأل' : 'Ask'}
                    </button>
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-3)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <span>🏛 {isAr ? step.authorityAr : step.authorityEn}</span>
                    <span>⏱ {isAr ? step.estAr : step.estEn}</span>
                    <span>💰 {isAr ? step.feesAr : step.feesEn}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        {journey.tipsAr.length > 0 && (
          <div style={{ margin: '0 20px 20px', padding: '14px 16px', background: 'var(--accent-light)', borderRadius: 12, border: '1px solid var(--warning-border)' }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--accent)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              {isAr ? 'نصائح مهمة' : 'Important Tips'}
            </div>
            <ul style={{ margin: 0, padding: isAr ? '0 16px 0 0' : '0 0 0 16px', display: 'flex', flexDirection: 'column', gap: 5 }}>
              {(isAr ? journey.tipsAr : journey.tipsEn).map((tip, i) => (
                <li key={i} style={{ fontSize: 12.5, color: 'var(--warning-fg)', lineHeight: 1.6 }}>{tip}</li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA */}
        <div style={{ padding: '0 20px 24px' }}>
          <button
            type="button"
            onClick={() => {
              onAsk(isAr
                ? `أريد البدء بـ "${journey.titleAr}" — أرشدني من البداية خطوة بخطوة`
                : `I want to start "${journey.titleEn}" — guide me step by step from the beginning`)
              onClose()
            }}
            style={{
              width: '100%', height: 48, borderRadius: 12, border: 'none',
              background: 'var(--brand)', color: '#fff',
              fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: 'var(--shadow-brand)',
              transition: 'background 0.14s, transform 0.14s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--brand-hover)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--brand)' }}
          >
            <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 3l14 9-14 9V3z"/>
            </svg>
            {isAr ? 'ابدأ رحلتي الآن' : 'Start My Journey'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const router = useRouter()
  const { lang, isAr, toggleLang } = useLanguage()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  // batch #353: per-message "more actions" expand state (chat-interface declutter pass —
  // see the render block near ChatMessageActions for context on why this exists).
  const [expandedMsgActions, setExpandedMsgActions] = useState<Set<number>>(new Set())
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [recording, setRecording] = useState(false)
  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null)
  const [mode, setMode] = useState<ResponseMode>('detailed')
  const [footerBottom, setFooterBottom] = useState(0)
  const [inputFocused, setInputFocused] = useState(false)
  const [visibleQ, setVisibleQ] = useState<string[]>([])
  const [showGuide, setShowGuide] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showTransactionStarter, setShowTransactionStarter] = useState(false)
  const [activeServiceGroup, setActiveServiceGroup] = useState<ServiceGroup | null>(null)
  // Active document context — persists across follow-up questions (Phase 9)
  const [activeDocumentName, setActiveDocumentName] = useState<string | null>(null)
  // Follow-up question suggestions — shown after each assistant answer
  const [followupQuestions, setFollowupQuestions] = useState<string[]>([])
  // Remaining daily quota — null = unknown, -1 = unlimited (admin)
  const [quotaRemaining, setQuotaRemaining] = useState<number | null>(null)
  // Last failed message — shown as retry chip on error
  const [retryMsg, setRetryMsg] = useState<string | null>(null)
  // Hero search input — separate from the bottom chat bar
  const [heroInput, setHeroInput] = useState('')
  // Inline error for voice/file (replaces browser alert)
  const [voiceError, setVoiceError] = useState<string | null>(null)
  const [activeCard, setActiveCard] = useState(0)
  const [displayCard, setDisplayCard] = useState(0)
  const [cardVisible, setCardVisible] = useState(true)
  const [enhancing, setEnhancing] = useState(false)
  const [heroEnhancing, setHeroEnhancing] = useState(false)
  // Voice enhance suggestion — shows improved text before replacing
  const [enhanceSuggestion, setEnhanceSuggestion] = useState<string | null>(null)
  // True for 4s after voice ends with text — shows auto-enhance hint
  const [voiceJustEnded, setVoiceJustEnded] = useState(false)
  // Life Event Journey sheet
  const [activeJourney, setActiveJourney] = useState<LifeJourney | null>(null)
  // Session restore — number of messages reloaded from localStorage
  const [restoredCount, setRestoredCount] = useState(0)

  // ── Smart input suggestions autocomplete ──────────────────────────────────
  const { getPrefix: getLengthPrefix } = useResponseLength()

  const { suggestions: smartSuggestions, activeIdx: smartActiveIdx, setActiveIdx: setSmartActiveIdx, handleKeyDown: smartKeyDown, setDismissed: setSmartDismissed } = useSmartSuggestionsKeyDown(
    input, isAr, (s) => { setInput(s); textareaRef.current?.focus() }
  )

  // ── Enhance prompt via AI — reads /chat/stream, updates chips after ──
  const enhancePrompt = useCallback(async (
    text: string,
    setter: (v: string) => void,
    setLoadingFlag: (v: boolean) => void,
    showSuggestion = false,
  ) => {
    if (!text.trim() || text.trim().length < 4) return
    setLoadingFlag(true)
    if (showSuggestion) setEnhanceSuggestion(null)
    try {
      // Language-agnostic prompt — AI detects language from the text itself
      const enhanceMsg = `You are a bilingual government-services assistant for Lebanon.
Detect the language of the question below (Arabic or English) and rewrite it in the SAME language as a clearer, more specific, professional question about Lebanese government procedures.
Rules:
- Keep the SAME language as the input (Arabic stays Arabic, English stays English)
- Name the specific procedure if it can be inferred
- Remove filler words and dialect expressions while preserving the meaning
- Output ONLY the improved question — no explanation, no preamble, no quotes
Question: ${text}`

      const res = await fetch(`${API_URL}/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ message: enhanceMsg, history: [] }),
      })
      if (!res.ok || !res.body) return

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      outer: while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue
          const payload = line.slice(6)
          if (payload === '[DONE]') break outer
          try {
            const json = JSON.parse(payload)
            const tok = json.text ?? json.token ?? ''
            if (tok && json.type !== 'meta' && json.type !== 'error') accumulated += tok
            if (json.done) break outer
          } catch { /* skip malformed */ }
        }
      }

      // Clean: strip quotes, bold, markdown, take first non-empty line
      const improved = accumulated
        .split('\n')
        .map(l => l.trim().replace(/^[\*\#"«»""'`]+|[\*\#"«»""'`]+$/g, '').trim())
        .find(l => l.length > 5) || ''

      if (improved && improved.length < 400 && improved !== text.trim()) {
        if (showSuggestion) {
          // Show as suggestion chip — user accepts/dismisses
          setEnhanceSuggestion(improved)
          setVoiceJustEnded(false)
        } else {
          setter(improved)
          // Fetch contextual chips
          fetch(`${API_URL}/suggest_followup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeaders() },
            body: JSON.stringify({ question: improved, answer: '', lang: isAr ? 'ar' : 'en' }),
          })
            .then(r => r.ok ? r.json() : null)
            .then(d => { if (d?.questions?.length >= 2) { chipsLockedRef.current = true; setVisibleQ(d.questions.slice(0, 4)) } })
            .catch(() => {})
        }
      }
    } catch { /* silent */ } finally {
      setLoadingFlag(false)
    }
  }, [isAr]) // eslint-disable-line react-hooks/exhaustive-deps

  // Cross-fade hero card on switch
  useEffect(() => {
    if (activeCard === displayCard) return
    setCardVisible(false)
    const t = setTimeout(() => {
      setDisplayCard(activeCard)
      setCardVisible(true)
    }, 220)
    return () => clearTimeout(t)
  }, [activeCard]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-rotate hero preview card
  useEffect(() => {
    if (messages.length > 0) return
    const t = setInterval(() => setActiveCard(c => (c + 1) % HERO_CARDS.length), 4000)
    return () => clearInterval(t)
  }, [messages.length])
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)
  const mainRef = useRef<HTMLDivElement>(null)
  const historyLoaded = useRef(false)
  // Prevents 8-second auto-rotate from overwriting enhance-generated chips
  const chipsLockedRef = useRef(false)
  // Always-fresh handle to sendMessage (defined below, redefined every
  // render) for the mount-only onboarding-question listener — see the
  // comment on that useEffect for why a direct reference would go stale.
  const sendMessageRef = useRef<(text: string, file?: AttachedFile | null, overrideMode?: ResponseMode) => void>(() => {})
  // Bumped at the start of every sendMessage call. The fire-and-forget
  // /suggest_followup fetch (no AbortController, no server-side ordering
  // guarantee) captures the value at request time and only applies its
  // result if it's still the latest request — otherwise a slow response to
  // an older question could land after a newer question's own (possibly
  // faster) follow-up chips and silently replace them with stale, unrelated
  // suggestions. Frontend-only race-condition guard.
  const sendSeqRef = useRef(0)

  const pool = lang === 'ar' ? QUESTION_POOL_AR : QUESTION_POOL_EN

  // ── Handle ?q= param + ?draft=true from other pages ─────────
  useEffect(() => {
    if (!authChecked) return
    const params = new URLSearchParams(window.location.search)
    const q = params.get('q')
    if (q) {
      window.history.replaceState({}, '', '/')
      sendMessageRef.current(q)
      return
    }
    // DraftingStudio sends ?draft=true + stores prompt in sessionStorage
    const isDraft = params.get('draft') === 'true'
    if (isDraft) {
      window.history.replaceState({}, '', '/')
      const draft = sessionStorage.getItem('dalilak_draft_prompt')
      if (draft) {
        sessionStorage.removeItem('dalilak_draft_prompt')
        sendMessageRef.current(draft)
      }
      return
    }
    // GlobalSearch stores query in sessionStorage when used from non-home pages
    const pending = sessionStorage.getItem('dalilak_pending_query')
    if (pending) {
      sessionStorage.removeItem('dalilak_pending_query')
      sendMessageRef.current(pending)
    }
    // sendMessage itself is intentionally omitted from deps — called via the
    // always-fresh sendMessageRef (see its declaration above) instead of a
    // direct reference, so this effect only needs to re-run when authChecked
    // changes, not on every render (sendMessage is redefined each render).
  }, [authChecked])

  // ── Auth guard ────────────────────────────────────────────
  // batch #506: this used to `router.push('/login')` immediately whenever
  // there was no token — which meant the public root URL forced every
  // anonymous visitor straight to the login form before they ever saw the
  // product (reported issue: "root URL redirects visitors directly to
  // /login, hiding the platform's value"). "/" must work as a public
  // landing/discovery screen; only the actual protected action (sending a
  // message to the AI, which the backend genuinely requires a Bearer token
  // for — see sendMessage's own guard below) should ask an anonymous user
  // to sign in. Strategy now: anonymous visitors skip the network round
  // trip entirely and see the home screen instantly (authChecked=true,
  // currentUser=null — every consumer of currentUser in this file/TopNav/
  // MobileMenu already renders correctly for null, verified by inspection).
  // Logged-in users keep the original "show cached user instantly, validate
  // in background" behavior, hiding the Render cold-start delay (up to 30s
  // on the free tier) — plus a bounded timeout (batch #506) so a slow/failed
  // backend can never leave a first-time login stuck on the splash screen
  // forever (reported issue: "splash screen can remain visible for too
  // long, making the application appear frozen").
  useEffect(() => {
    const token = getToken()
    if (!token) { setAuthChecked(true); return }

    // Wake the backend early (fire-and-forget — don't await)
    fetch(`${API_URL}/ping`).catch(() => {})

    // Instant render: use cached user if available
    const cached = getUser()
    if (cached) {
      setCurrentUser(cached)
      setAuthChecked(true)
    }

    // Bounded fallback: never block the splash indefinitely. If neither the
    // success nor error branch below has resolved within 6s (e.g. backend
    // cold-start taking longer than usual, or a silently hanging request),
    // show the app anyway rather than freeze it. Cleared as soon as either
    // branch actually settles.
    let settled = false
    const timeoutId = !cached ? window.setTimeout(() => {
      if (!settled) setAuthChecked(true)
    }, 6000) : null

    // Background validation — update user data silently
    fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(async res => {
      settled = true
      if (timeoutId) clearTimeout(timeoutId)
      if (!res.ok) { clearToken(); localStorage.removeItem(CHAT_HISTORY_KEY); setCurrentUser(null); setAuthChecked(true); return }
      const data = await res.json()
      setUser(data)          // refresh localStorage cache
      setCurrentUser(data)
      setAuthChecked(true)
    }).catch(() => {
      settled = true
      if (timeoutId) clearTimeout(timeoutId)
      // Network error — keep showing cached user if we had one, otherwise
      // fall back to the anonymous home view instead of hanging.
      setAuthChecked(true)
    })

    return () => { if (timeoutId) clearTimeout(timeoutId) }
  }, [])

  // ── Handle onboarding quick-start question ───────────────
  // Registered once on mount (empty deps), so it must not call sendMessage
  // directly — sendMessage is redefined every render and closes over
  // lang/isAr/messages, so a direct reference here would freeze on the
  // mount-time values. UserOnboarding lets a user switch language (step 1)
  // and then tap a suggested question (step 3) seconds later; without the
  // ref indirection below, that question would be sent using the pre-switch
  // language, reintroducing the exact bug batch #334 fixed elsewhere.
  useEffect(() => {
    const handler = (e: Event) => {
      const q = (e as CustomEvent<{ q: string }>).detail?.q
      if (q) sendMessageRef.current(q)
    }
    window.addEventListener('dalilak_onboarding_question', handler)
    return () => window.removeEventListener('dalilak_onboarding_question', handler)
  }, [])

  // ── Load chat history from localStorage (after auth) ─────
  useEffect(() => {
    if (!authChecked || historyLoaded.current) return
    historyLoaded.current = true
    try {
      const raw = localStorage.getItem(CHAT_HISTORY_KEY)
      if (raw) {
        const msgs = JSON.parse(raw) as Message[]
        const clean = msgs
          .filter(m => !m.streaming)
          .slice(-CHAT_HISTORY_MAX)
        if (clean.length > 0) { setMessages(clean); setRestoredCount(clean.length) }
      }
    } catch {}
  }, [authChecked])

  // ── Save chat history on every change ────────────────────
  useEffect(() => {
    if (!historyLoaded.current) return   // don't save before first load
    try {
      const toSave = messages
        .filter(m => !m.streaming)
        .slice(-CHAT_HISTORY_MAX)
        // Drop heavy documentAnalysis objects before serialising
        .map(({ documentAnalysis: _da, ...rest }) => rest)
      if (toSave.length > 0) {
        localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(toSave))
      } else {
        localStorage.removeItem(CHAT_HISTORY_KEY)
      }
    } catch {}
  }, [messages])

  // ── Auto-rotate quick questions in hero ──────────────────
  useEffect(() => {
    chipsLockedRef.current = false  // unlock on lang change
    const refresh = () => { if (!chipsLockedRef.current) setVisibleQ(shufflePick(pool, 3)) }
    refresh()
    const interval = setInterval(refresh, 8000)
    return () => clearInterval(interval)
    // `pool` is derived from `lang` (module-level constant arrays, stable
    // reference per language) — listed alongside `lang` to satisfy
    // exhaustive-deps without changing behavior (pool's identity only
    // changes when lang does).
  }, [lang, pool])

  // ── Keyboard / visualViewport fix ────────────────────────
  useEffect(() => {
    const vv = (window as any).visualViewport
    if (!vv) return
    const onViewport = () => {
      const offset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
      setFooterBottom(offset)
      if (offset > 50) {
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
      }
    }
    vv.addEventListener('resize', onViewport)
    vv.addEventListener('scroll', onViewport)
    return () => { vv.removeEventListener('resize', onViewport); vv.removeEventListener('scroll', onViewport) }
  }, [])

  useEffect(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80)
  }, [messages])

  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px'
  }, [input])

  // ── Voice ─────────────────────────────────────────────────
  const startRecording = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) { setVoiceError(isAr ? 'التعرف على الصوت غير مدعوم في هذا المتصفح. استخدم Chrome أو Edge.' : 'Voice input not supported. Use Chrome or Edge.'); return }
    const recognition = new SR()
    // ar-SA has the broadest Arabic browser support (covers Lebanese dialect input too)
    recognition.lang = lang === 'ar' ? 'ar-SA' : 'en-US'
    recognition.continuous = false
    recognition.interimResults = true
    recognition.maxAlternatives = 1
    recognition.onresult = (e: Event & { results: SpeechRecognitionResultList }) => {
      const results = Array.from(e.results)
      const transcript = results.map(r => r[0].transcript).join('')
      setInput(transcript)
    }
    recognition.onerror = (e: Event & { error: string }) => {
      setRecording(false)
      if ((e as any).error === 'no-speech') {
        setVoiceError(isAr ? 'لم يُكتشف صوت. حاول مرة أخرى.' : 'No speech detected. Please try again.')
        setTimeout(() => setVoiceError(null), 3000)
      }
    }
    recognition.onend = () => {
      setRecording(false)
      // If we captured text, offer auto-enhance for 5 seconds
      setInput(prev => {
        if (prev.trim().length > 4) {
          setVoiceJustEnded(true)
          setTimeout(() => setVoiceJustEnded(false), 5000)
        }
        return prev
      })
    }
    recognition.start()
    recognitionRef.current = recognition
    setVoiceJustEnded(false)
    setEnhanceSuggestion(null)
    setRecording(true)
  }, [lang, isAr])

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop()
    setRecording(false)
  }, [])

  // ── File ──────────────────────────────────────────────────
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { setVoiceError(isAr ? 'حجم الملف يتجاوز الحد الأقصى (10MB).' : 'File exceeds the 10MB limit.'); return }
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result as string
      setAttachedFile({
        name: file.name, type: file.type, size: file.size,
        base64: result.split(',')[1],
        preview: file.type.startsWith('image/') ? result : undefined,
      })
    }
    reader.readAsDataURL(file)
    e.target.value = ''
    // `isAr` was missing from deps — meant the 10MB-limit error message could
    // stay frozen in whichever language was active when this callback was
    // last memoized, instead of the language active at the moment the user
    // picks an oversized file. Adding it is a genuine fix, not just lint
    // hygiene (isAr is a plain boolean, so this never over-recreates when it
    // hasn't actually changed).
  }, [isAr])

  const formatSize = (b: number) => b < 1048576 ? Math.round(b / 1024) + ' KB' : (b / 1048576).toFixed(1) + ' MB'

  /** Export conversation as a formatted printable HTML page */
  const exportChat = () => {
    if (messages.length === 0) return
    const stripMd = (s: string) => s
      .replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1')
      .replace(/#{1,6}\s?(.+)/g, '$1').replace(/\[(.+?)\]\(.+?\)/g, '$1')
      .replace(/`{1,3}([\s\S]+?)`{1,3}/g, '$1')
    const rows = messages
      .filter(m => m.content)
      .map(m => {
        const isUser = m.role === 'user'
        const bg = isUser ? '#8F1D2C' : '#F9F7F5'
        const fg = isUser ? '#fff' : '#1a1a1a'
        const align = isAr ? (isUser ? 'right' : 'left') : (isUser ? 'right' : 'left')
        const label = isUser ? (isAr ? 'أنت' : 'You') : 'دليلك AI'
        return `<div style="margin-bottom:16px;text-align:${align}">
          <div style="display:inline-block;max-width:80%;padding:12px 16px;border-radius:14px;background:${bg};color:${fg};font-size:14px;line-height:1.6;text-align:start">
            <div style="font-size:10px;opacity:0.65;margin-bottom:4px;font-weight:700">${label}</div>
            ${stripMd(m.content).replace(/\n/g, '<br>')}
          </div>
        </div>`
      }).join('')
    const dateStr = new Date().toLocaleDateString(isAr ? 'ar-LB' : 'en-LB', { year: 'numeric', month: 'long', day: 'numeric' })
    const win = window.open('', '_blank', 'width=700,height=900')
    if (!win) return
    win.document.write(`<!DOCTYPE html><html dir="${isAr ? 'rtl' : 'ltr'}"><head>
      <meta charset="utf-8"><title>${isAr ? 'محادثة دليلك' : 'Dalilak Chat'} — ${dateStr}</title>
      <style>
        body{font-family:Arial,sans-serif;margin:0;background:#F2EDE6;color:#1a1a1a}
        .header{background:#8F1D2C;color:#fff;padding:20px 30px}
        .header h1{margin:0 0 4px;font-size:20px}
        .header p{margin:0;font-size:12px;opacity:0.75}
        .chat{max-width:680px;margin:24px auto;padding:0 20px}
        .footer{text-align:center;font-size:11px;color:#999;padding:20px;border-top:1px solid #ddd;margin-top:24px}
        @media print{body{background:#fff}.header{-webkit-print-color-adjust:exact;print-color-adjust:exact}button{display:none}}
      </style></head><body>
      <div class="header">
        <h1>🏛️ ${isAr ? 'محادثة دليلك AI' : 'Dalilak AI Conversation'}</h1>
        <p>${dateStr} &nbsp;·&nbsp; ${messages.filter(m => m.role === 'user').length} ${isAr ? 'سؤال' : 'questions'} &nbsp;·&nbsp; dalilak.vercel.app</p>
      </div>
      <div class="chat">${rows}</div>
      <div class="footer">
        ${isAr ? 'دليلك AI — مساعد المعاملات الحكومية اللبنانية' : 'Dalilak AI — Lebanese Government Procedures Assistant'}<br>
        <em style="font-size:10px">${isAr ? 'هذا المحتوى للمساعدة فقط وليس استشارة قانونية.' : 'This content is for guidance only and is not legal advice.'}</em>
        <br><br>
        <button onclick="window.print()" style="padding:8px 20px;background:#8F1D2C;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:13px">
          ${isAr ? 'طباعة / PDF' : 'Print / Save PDF'}
        </button>
      </div>
    </body></html>`)
    win.document.close()
  }
  const getFileIcon = (t: string) => t.startsWith('image/') ? 'IMG' : t === 'application/pdf' ? 'PDF' : t.includes('word') ? 'DOC' : 'FILE'

  // ── Send ──────────────────────────────────────────────────
  const sendMessage = async (text: string, file?: AttachedFile | null, overrideMode?: ResponseMode) => {
    const hasContent = text.trim() || file
    if (!hasContent || loading) return

    // batch #506: the page-level redirect that used to gate the entire "/"
    // route is gone (see the auth-guard useEffect above) — anonymous
    // visitors can now browse the home screen freely. The backend's
    // /chat/stream genuinely requires a Bearer token (standing constraint:
    // no backend/auth-logic changes), so the ONLY point that still needs to
    // gate on login is the actual send action. Reuses the existing
    // `dalilak_pending_query` sessionStorage key (already read by the ?q=
    // mount effect above, and already used the same way by GlobalSearch) so
    // the question is asked automatically once the user signs in — this is
    // the "preserve intended destination after login" behavior for the
    // single most common case (asking a question), without needing a new
    // `next=` redirect-param system. File attachments aren't preserved this
    // way (no safe/simple place to stash a base64 payload across a redirect
    // for an anonymous user) — an anonymous user attaching a file is simply
    // sent to sign in and can re-attach after.
    if (!getToken()) {
      if (text.trim()) {
        try { sessionStorage.setItem('dalilak_pending_query', text) } catch {}
      }
      router.push('/login')
      return
    }

    const mySeq = ++sendSeqRef.current
    setFollowupQuestions([])
    setRetryMsg(null)
    setEnhanceSuggestion(null)
    setVoiceJustEnded(false)

    // ── Sanitize input ────────────────────────────────────────
    const lengthPrefix = getLengthPrefix(isAr)
    const { clean: cleanText, flagged } = sanitizeInput(lengthPrefix + text)
    if (flagged) {
      setMessages(prev => [...prev,
        { role: 'user', content: cleanText },
        { role: 'assistant', content: isAr ? 'تعذّر معالجة هذا الطلب. يرجى إعادة صياغة السؤال.' : 'This request could not be processed. Please rephrase your question.', streaming: false },
      ])
      return
    }

    const activeMode = MODES.find(m => m.id === (overrideMode || mode))!
    const modePrefix = lang === 'en' ? activeMode.prefix_en : activeMode.prefix
    // The backend always replies in "the same language as the question"
    // (see system_prompt.txt), detected purely from the raw message text —
    // it has no visibility into the UI's language toggle. A user who types
    // in Arabic while the toggle is set to English (very common, since the
    // toggle doesn't translate what they type) was getting Arabic replies
    // regardless of the toggle. Prepend an explicit, unambiguous language
    // directive so the toggle's intent reaches the model no matter what
    // script the user actually typed in. Frontend-only fix — no backend
    // API change.
    const langDirective = lang === 'en'
      ? '[IMPORTANT: Respond only in English, regardless of the language used in this message.] '
      : '[مهم جداً: أجب باللغة العربية فقط، بغض النظر عن لغة هذه الرسالة.] '
    const prefixedMessage = file
      ? langDirective + (cleanText || (lang === 'en' ? 'Analyze this document and suggest relevant procedures' : 'حلل هذه الوثيقة واقترح الإجراءات المناسبة'))
      : langDirective + modePrefix + cleanText

    const displayText = file
      ? (cleanText ? `${getFileIcon(file.type)} **${file.name}**\n${cleanText}` : `${getFileIcon(file.type)} **${file.name}** — ${isAr ? 'طلب تحليل الوثيقة' : 'Document analysis request'}`)
      : cleanText

    // ── Check localStorage cache (text-only, no file) ─────
    if (!file) {
      const cached = lsGet(prefixedMessage)
      if (cached) {
        setMessages(prev => [
          ...prev,
          { role: 'user', content: displayText },
          { role: 'assistant', content: cached, streaming: false },
        ])
        setInput('')
        return
      }
    }

    // Filter out empty-content messages (e.g. documentAnalysis placeholders) and cap at 18
    const history = messages
      .filter(m => m.content && m.content.trim().length > 0)
      .slice(-18)
      .map(m => ({ role: m.role, content: m.content }))
    setMessages(prev => [...prev, { role: 'user', content: displayText }])
    setInput('')
    // Persist document name for follow-up context chip
    if (attachedFile) setActiveDocumentName(attachedFile.name)
    setAttachedFile(null)
    setLoading(true)
    setMessages(prev => [...prev, { role: 'assistant', content: '', streaming: true }])

    // ── Cold-start notice (Render free tier ~30-60 s wakeup) ───────────────
    const coldStartTimer = setTimeout(() => {
      setMessages(prev => {
        const u = [...prev]
        const last = u[u.length - 1]
        if (last?.role === 'assistant' && last.streaming && !last.content) {
          u[u.length - 1] = {
            ...last,
            content: isAr
              ? '**النظام في وضع السكون، جاري التنشيط...**\n\nقد يستغرق الرد 30-60 ثانية في أول طلب. يُرجى الانتظار.'
              : '**System is waking up...**\n\nThe first response may take 30-60 seconds. Please wait.',
          }
        }
        return u
      })
    }, 12000)

    try {
      // ── Universal Document Analysis (parallel with stream) ──
      if (file) {
        // Fire-and-forget: extract text then analyze in background
        ;(async () => {
          try {
            // Re-use the analyze/stream endpoint to also get document text
            // We send a special extraction request
            const extractRes = await fetch(API_URL + '/documents/universal-analysis', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', ...authHeaders() },
              body: JSON.stringify({
                document_text: `[File: ${file.name}, Type: ${file.type}] — ${isAr ? 'تحليل المستند المرفوع' : 'Uploaded document analysis'}`,
                filename: file.name,
                document_id: Date.now().toString(36),
              }),
            })
            if (extractRes.ok) {
              const analysis = await extractRes.json()
              // If the user has already sent another message while this
              // extraction was in flight, sendSeqRef.current will have moved
              // past mySeq — bail out so the stale analysis card doesn't get
              // spliced into (or appended after) a newer, unrelated exchange.
              if (analysis?.kind === 'universal_document_analysis' && sendSeqRef.current === mySeq) {
                // Insert analysis message right after the user message (index = prev length)
                setMessages(prev => {
                  // Find insertion point: right before the last assistant message (streaming)
                  const analysisMsg = {
                    role: 'assistant' as const,
                    content: '',
                    streaming: false,
                    documentAnalysis: analysis,
                  }
                  // Insert at position 1 after user message (before the streaming reply)
                  const updated = [...prev]
                  const streamIdx = updated.findIndex(m => m.role === 'assistant' && m.streaming)
                  if (streamIdx > 0) {
                    updated.splice(streamIdx, 0, analysisMsg)
                  } else {
                    updated.push(analysisMsg)
                  }
                  return updated
                })
              }
            }
          } catch {
            // Silent fail — main chat stream continues unaffected
          }
        })()
      }

      const endpoint = file ? '/analyze/stream' : '/chat/stream'
      const body = file
        ? JSON.stringify({ file_base64: file.base64, file_type: file.type, file_name: file.name, message: prefixedMessage, history })
        : JSON.stringify({ message: prefixedMessage, history })

      const res = await fetch(API_URL + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body,
      })
      if (res.status === 401) { clearToken(); localStorage.removeItem(CHAT_HISTORY_KEY); router.push('/login'); return }
      if (res.status === 402) {
        setMessages(prev => prev.slice(0, -1).concat({
          role: 'assistant',
          content: isAr
            ? '**انتهت فترتك التجريبية.**\n\nللاستمرار في استخدام دليلك، يرجى الترقية إلى الاشتراك المدفوع. تواصل معنا عبر البريد أو واتساب.'
            : '**Your trial period has ended.**\n\nTo continue using Dalilak, please upgrade to a paid subscription. Contact us via email or WhatsApp.',
          streaming: false,
        }))
        setLoading(false)
        return
      }
      if (res.status === 429) {
        const data = await res.json().catch(() => ({}))
        const detail: string = data?.detail || (isAr ? 'استنفذت حصتك اليومية' : 'Daily quota exhausted')
        setMessages(prev => prev.slice(0, -1).concat({
          role: 'assistant',
          content: isAr
            ? `**${detail}**\n\nللحصول على المزيد من الأسئلة، يمكنك الترقية إلى الاشتراك المدفوع (200 سؤال/يوم). تواصل معنا عبر البريد أو واتساب.`
            : `**${detail}**\n\nTo get more questions, upgrade to a paid subscription (200 questions/day). Contact us via email or WhatsApp.`,
          streaming: false,
        }))
        setLoading(false)
        return
      }
      if (!res.ok) throw new Error('HTTP ' + res.status)

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''
      let buffer = ''
      let metaSources: import('@/lib/types').AgentSource[] = []
      let metaConfidence: import('@/lib/types').ConfidenceLevel = 'unknown'
      let metaRemaining: number | null = null

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        for (const line of lines) {
          const t = line.trim()
          if (!t.startsWith('data: ')) continue
          const d = t.slice(6).trim()
          if (d === '[DONE]') continue
          try {
            const p = JSON.parse(d)
            if (p.type === 'meta') {
              if (Array.isArray(p.sources)) {
                const seen = new Set<string>()
                metaSources = p.sources
                  .map((s: { title?: string; ministry?: string; law?: string; snippet?: string; url?: string; score?: number }) => ({
                    title: s.title || s.ministry || (isAr ? 'مصدر' : 'Source'),
                    type: 'official' as const,
                    ministry: s.ministry,
                    score: s.score,
                    snippet: s.snippet,
                  }))
                  .filter((s: { title: string }) => {
                    if (seen.has(s.title)) return false
                    seen.add(s.title)
                    return true
                  })
              }
              if (p.confidence) metaConfidence = p.confidence
              if (typeof p.remaining === 'number') metaRemaining = p.remaining
            }
            const tok = p.type === 'token' ? p.text : p.choices?.[0]?.delta?.content
            if (tok) {
              accumulated += tok
              setMessages(prev => {
                const u = [...prev]
                u[u.length - 1] = { role: 'assistant', content: accumulated, streaming: true }
                return u
              })
            }
          } catch {}
        }
      }
      const finalAnswer = accumulated || (isAr ? 'عذراً، لم أتلقَّ ردّاً.' : 'Sorry, no response received.')

      // إذا كان أحد المصادر المُعادة يطابق وثيقة حقيقية في أرشيف الوثائق
      // الرسمية، نضيف رابط تحميلها الحقيقي (src.url) — تُعرض تلقائياً في
      // بطاقة "المصادر المستخدمة" الموجودة أصلاً (TrustBadge)، بلا أي زر
      // أو مكوّن جديد. lib/archiveDocuments.ts حجمه ~4MB خاماً بسبب حجم
      // الأرشيف، فنستورده ديناميكياً هنا فقط (لا في أعلى الملف) حتى لا
      // يُحمَّل ضمن حزمة الصفحة الرئيسية إلا عند وجود مصادر فعلية للفحص.
      if (metaSources.length > 0) {
        try {
          const { findArchiveDocByTitle } = await import('@/lib/archiveDocuments')
          metaSources = metaSources.map(s => {
            if (s.url) return s
            const doc = findArchiveDocByTitle(s.title)
            return doc ? { ...s, url: doc.pdfUrl } : s
          })
        } catch { /* الأرشيف اختياري — لا نكسر الرد إن فشل الاستيراد */ }
      }

      setMessages(prev => {
        const u = [...prev]
        u[u.length - 1] = {
          role: 'assistant',
          content: finalAnswer,
          streaming: false,
          sources: metaSources.length > 0 ? metaSources : undefined,
          confidence: metaConfidence !== 'unknown' ? metaConfidence : undefined,
        }
        return u
      })
      // Save to localStorage cache (text questions only)
      if (!file && accumulated) {
        lsSet(prefixedMessage, accumulated)
      }
      // Update remaining quota display
      if (metaRemaining !== null) setQuotaRemaining(metaRemaining)
      // Fetch follow-up question suggestions (fire-and-forget, no latency impact)
      if (!file && accumulated && accumulated.length > 100) {
        fetch(API_URL + '/suggest_followup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders() },
          body: JSON.stringify({ question: prefixedMessage.slice(0, 300), answer: accumulated.slice(0, 600), lang: isAr ? 'ar' : 'en' }),
        })
          .then(r => r.ok ? r.json() : null)
          .then(d => { if (d?.questions?.length && sendSeqRef.current === mySeq) setFollowupQuestions(d.questions.slice(0, 3)) })
          .catch(() => {})
      }
    } catch {
      setMessages(prev => {
        const u = [...prev]
        u[u.length - 1] = { role: 'assistant', content: isAr ? 'عذراً، حدث خطأ في الاتصال. تحقق من اتصالك وأعد المحاولة.' : 'Sorry, a connection error occurred. Check your connection and try again.', streaming: false }
        return u
      })
      if (!file) setRetryMsg(text)   // offer retry chip for text-only queries
    } finally {
      clearTimeout(coldStartTimer)
      setLoading(false)
    }
  }
  sendMessageRef.current = sendMessage

  const handleSubmit = (e: FormEvent) => { e.preventDefault(); sendMessage(input, attachedFile) }
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input, attachedFile) }
  }

  const canSend = Boolean((input.trim() || attachedFile) && !loading)
  const MAX_INPUT = 4000

  if (!authChecked) return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#F8F8F6', gap:20 }}>
      <style>{`@keyframes auth-dot { 0%,80%,100%{transform:translateY(0);opacity:0.3} 40%{transform:translateY(-6px);opacity:1} }`}</style>
      <AppLogo
        isAr={isAr}
        layout="stacked"
        size={64}
        radius={18}
        iconSize={42}
        badgeShadow
        titleSize={18}
        titleWeight={900}
        customTagline={{ ar: 'الدليل الحكومي الذكي', en: 'Smart Government Guide' }}
      />
      <div style={{ display:'flex', gap:7 }}>
        {[0,1,2].map(i => <span key={i} style={{ width:7, height:7, borderRadius:'50%', background:'#8F1D2C', display:'inline-block', animation:`auth-dot 1.2s ease-in-out ${i*0.2}s infinite` }} />)}
      </div>
    </div>
  )

  return (
    <>
      <style>{`
        html, body { margin: 0; padding: 0; height: 100%; overflow: hidden; background: #F8F8F6; }
        * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
        textarea { font-family: inherit; }
        :root {
          --safe-top: env(safe-area-inset-top, 0px);
          --safe-bottom: env(safe-area-inset-bottom, 0px);
          /* Legacy aliases used in the chat composer — batch #369: these were
             still hard-pinned to the pre-v4.0 maroon (#8F1D2C/#741622), so the
             send button, active-mic state, recording indicator, file-preview
             accents, and focused-input ring were all rendering in the old
             color even after every other page moved to the v4.0 brand tokens.
             Pointing them at the real tokens fixes that in one place instead
             of editing every individual usage site below. */
          --red: var(--brand);
          --red-dark: var(--brand-hover);
          --red-light: var(--brand-soft);
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }
        @keyframes typing-dot {
          0%,80%,100% { transform: translateY(0); opacity: 0.35; }
          40% { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes slideQ {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .msg-in { animation: fadeUp 0.25s cubic-bezier(0.22,1,0.36,1) both; }
        .quick-btn { animation: slideQ 0.28s cubic-bezier(0.22,1,0.36,1) both; }
        .quick-btn:hover { transform: translateY(-1px) !important; border-color: rgba(143,29,44,0.25) !important; box-shadow: 0 2px 8px rgba(0,0,0,0.08) !important; }
        .followup-chip { animation: slideQ 0.22s cubic-bezier(0.22,1,0.36,1) both; }
        .mode-btn { transition: background 0.15s, color 0.15s, box-shadow 0.18s cubic-bezier(0.22,1,0.36,1); }
        .mode-btn:hover { background: rgba(255,255,255,0.22) !important; }
        .send-btn:hover:not(:disabled) { background: var(--red-dark) !important; transform: scale(1.05); }
        .icon-btn:hover:not(:disabled) { background: var(--red-light) !important; color: var(--red) !important; }
        .lang-btn:hover { background: rgba(255,255,255,0.22) !important; }
        .input-focused { border-color: var(--red) !important; }
      `}</style>

      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        bottom: footerBottom,
        display: 'flex', flexDirection: 'column',
        backgroundColor: '#F8F8F6',
        paddingTop: 'var(--safe-top)',
      }}>

        {/* ══════════════ HEADER ══════════════ */}
        <TopNav
          isAr={isAr}
          currentUser={currentUser}
          messages={messages}
          onLangToggle={toggleLang}
          onNewChat={() => { saveChatSession(messages); setMessages([]); setFollowupQuestions([]); setRetryMsg(null) }}
          onMenuOpen={() => setMobileMenuOpen(true)}
          onStartGuide={() => setShowGuide(true)}
          showGuideBtn={messages.length === 0}
          onAsk={q => sendMessage(q)}
          onJourneySelect={slug => {
            const j = getJourneyBySlug(slug)
            if (j) setActiveJourney(j)
          }}
        />


        {/* ══════════════ MAIN ══════════════ */}
        <main id="main-content" ref={mainRef} style={{
          flex: 1, overflowY: 'auto',
          overscrollBehavior: 'contain',
          WebkitOverflowScrolling: 'touch' as any,
        }}>
          {messages.length > 0 && (
            <ChatScrollToBottomButton containerId="main-content" isAr={isAr} />
          )}
          {messages.length === 0 ? (

            /* ══ Welcome Screen v3 ══ */
            <div style={{ minHeight:'100%', background:'var(--bg-page)', direction: isAr ? 'rtl' : 'ltr' }}>

              {/* ══ HERO ══ */}
              {/* batch #355: mobile-density fix — clamp() floors below were tuned for desktop
                  (48-88px) and never actually shrank on real phones since the vw term stays
                  tiny at narrow widths, so every section rendered at its full desktop-sized
                  padding on mobile too. Lowered floors only (max/desktop value unchanged) so
                  small screens get noticeably less dead vertical space per section — verified
                  the vw term still exceeds the new floor at typical desktop widths, so this is
                  mobile-only in practice. */}
              <section style={{ background:'var(--bg)', padding:'20px 0 28px' }}>
                <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 16px' }}>
                  <div className="hl">

                    {/* ── Left Column — v4.0 "Calm Government Digital Service" ──
                        batch #366 full rebuild, replacing the marketing-style hero
                        (badge + big two-tone headline + long description + two
                        competing CTA buttons) with the minimal, task-first block
                        the spec requires: a short question-framed title, one line
                        of helper text, and the search field as the primary,
                        unmissable action. Total height of title+subtitle+search
                        stays well under ~260px at 390px width — verified by the
                        fixed line counts and font sizes below (no clamp() ranges
                        that could grow unpredictably tall on a small screen). */}
                    <div>
                      <h1 style={{
                        fontSize:'clamp(24px,6vw,28px)', fontWeight:700, color:'var(--text-1)',
                        margin:'0 0 8px', lineHeight:1.35, letterSpacing:0,
                      }}>
                        {isAr ? 'ما المعاملة التي تبحث عنها؟' : 'Which procedure are you looking for?'}
                      </h1>
                      <p style={{ fontSize:15, color:'var(--text-2)', margin:'0 0 20px', lineHeight:1.6 }}>
                        {isAr
                          ? 'ابحث بالاسم أو تصفح الخدمات حسب الفئة.'
                          : 'Search by name or browse services by category.'}
                      </p>

                      {/* Search — the single primary action on this screen.
                          One field, no separate "بحث" button (Enter/suggestion
                          submits), mic + clear live inside the field. */}
                      <form
                        className="hsearch"
                        onSubmit={e => { e.preventDefault(); if (heroInput.trim()) { sendMessage(heroInput); setHeroInput('') } }}
                        style={{ display:'flex', alignItems:'center', height:56, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, overflow:'hidden', transition:'border-color 0.15s', marginBottom:12, maxWidth:540 }}
                      >
                        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2" style={{ flexShrink:0, marginInlineStart:16, marginInlineEnd:10 }}>
                          <circle cx="11" cy="11" r="7"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/>
                        </svg>
                        <input
                          type="text"
                          value={heroInput}
                          onChange={e => { setHeroInput(e.target.value); if (!e.target.value.trim()) chipsLockedRef.current = false }}
                          placeholder={isAr ? 'مثال: تجديد جواز السفر' : 'e.g. Renew my passport'}
                          aria-label={isAr ? 'ابحث عن معاملة' : 'Search for a procedure'}
                          dir={isAr ? 'rtl' : 'ltr'}
                          style={{ flex:1, minWidth:0, height:'100%', border:'none', outline:'none', background:'transparent', fontSize:16, fontFamily:'inherit', fontWeight:400, color:'var(--text-1)' }}
                        />
                        {/* Clear — only while typing */}
                        {heroInput.trim().length > 0 && (
                          <button type="button"
                            onClick={() => { setHeroInput(''); chipsLockedRef.current = false }}
                            aria-label={isAr ? 'مسح' : 'Clear'}
                            className="tap-hit-8"
                            style={{ position:'relative', flexShrink:0, width:28, height:28, borderRadius:'50%', border:'none', background:'var(--surface-2)', color:'var(--text-3)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', marginInlineEnd:4 }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12"/></svg>
                          </button>
                        )}
                        {/* AI-enhance — real, existing feature (not new). Kept
                            icon-only and unobtrusive so it doesn't compete with
                            search as the primary action, only appears once the
                            user is actively typing a real query. */}
                        {heroInput.trim().length > 3 && (
                          <button type="button"
                            className="tap-hit-8"
                            disabled={heroEnhancing}
                            onClick={() => enhancePrompt(heroInput, setHeroInput, setHeroEnhancing)}
                            aria-label={isAr ? 'تحسين السؤال بالذكاء الاصطناعي' : 'AI-enhance your question'}
                            title={isAr ? 'تحسين السؤال بالذكاء الاصطناعي' : 'AI-enhance your question'}
                            style={{ position:'relative', flexShrink:0, width:28, height:28, borderRadius:'50%', border:'none', background:'transparent', color:'var(--text-3)', cursor: heroEnhancing ? 'default' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center', marginInlineEnd:2 }}>
                            {heroEnhancing
                              ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation:'spin 0.8s linear infinite' }}><circle cx="12" cy="12" r="10" strokeOpacity="0.2"/><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                              : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M5 3l1.5 4.5L11 9l-4.5 1.5L5 15l-1.5-4.5L-1 9l4.5-1.5zM19 3l1 3 3 1-3 1-1 3-1-3-3-1 3-1z"/></svg>
                            }
                          </button>
                        )}
                        {/* Mic — inside the field, per spec */}
                        <span style={{ display:'flex', alignItems:'center', marginInlineEnd:8 }}>
                          <ChatVoiceInputBtn
                            onTranscript={t => setHeroInput(v => v ? v + ' ' + t : t)}
                            isAr={isAr}
                            lang={lang}
                          />
                        </span>
                      </form>

                      {/* Quick actions — exactly 2, per spec. "اسأل دليلك" is the
                          only element on this screen carrying the primary brand
                          color; "تصفح كل المعاملات" is a quiet ghost link. No
                          shadows, no large icons. */}
                      <div style={{ display:'flex', gap:12, marginBottom:4 }}>
                        <button type="button"
                          onClick={() => router.push('/procedures')}
                          style={{ flex:1, height:52, borderRadius:12, border:'1px solid var(--border)', background:'var(--surface)', color:'var(--text-1)', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:7 }}
                        >
                          {isAr ? 'تصفح كل المعاملات' : 'Browse Procedures'}
                        </button>
                        <button type="button"
                          onClick={() => sendMessage(isAr ? 'مرحباً، أريد مساعدة في معاملة حكومية' : 'Hello, I need help with a government procedure')}
                          style={{ flex:1, height:52, borderRadius:12, border:'none', background:'var(--brand)', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:7 }}
                        >
                          {isAr ? 'اسأل دليلك' : 'Ask Dalilak'}
                        </button>
                      </div>

                      {/* batch #462: ChatDraftAutosave was already mounted on the
                          in-conversation composer (below, bound to `input`), but a
                          reload/tab-reopen always resets `messages` to [] (never
                          persisted), so the welcome screen — bound to the SEPARATE
                          `heroInput` state — is what actually renders after any
                          refresh. The autosave/restore effect never ran for that
                          input, so a typed-but-unsent question was silently lost on
                          the exact refresh/reopen scenario this component's own doc
                          comment describes. Reusing the same, unmodified component
                          bound to heroInput/setHeroInput here fixes it — both screens
                          share the same dalilak_chat_input_draft key, and only one of
                          the two ever renders at a time (see the ternary below). */}
                      <ChatDraftAutosave input={heroInput} setInput={setHeroInput} />

                      {/* batch #461: ChatHistoryPanel's saveChatSession() was already
                          called live (onNewChat/onHomeClick/onHome below), building up
                          real localStorage history, but the component that lets a user
                          browse/restore/delete those saved sessions was never mounted
                          anywhere — a pure one-way data sink. It self-guards (renders
                          null with no saved sessions), so this is a no-op for anyone
                          who hasn't started 3+ messages and left/reset a chat before. */}
                      <ChatHistoryPanel onRestore={msgs => { setMessages(msgs); setFollowupQuestions([]); setRetryMsg(null) }} />
                    </div>

                    {/* ── Right Column — Rotating Procedure Preview (desktop only) ── */}
                    <div className="hp" style={{ display:'none' }}>
                      <style>{`
                        .hp-icon-passport path { stroke-linecap:round; stroke-linejoin:round; }
                      `}</style>
                      {(() => {
                        const card = HERO_CARDS[displayCard] as HeroCard
                        const getIcon = (id: string) => {
                          const p = { fill:'none', stroke:'#fff', strokeWidth:2, width:18, height:18 }
                          if (id==='passport') return <svg aria-hidden="true" viewBox="0 0 24 24" {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0"/></svg>
                          if (id==='document') return <svg aria-hidden="true" viewBox="0 0 24 24" {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                          if (id==='company') return <svg aria-hidden="true" viewBox="0 0 24 24" {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                          if (id==='license') return <svg aria-hidden="true" viewBox="0 0 24 24" {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>
                          return <svg aria-hidden="true" viewBox="0 0 24 24" {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 004 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        }
                        return (
                          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:20, overflow:'hidden', boxShadow:'var(--shadow-lg)' }}>
                            {/* Card body — cross-fade via opacity transition */}
                            <div style={{ opacity: cardVisible ? 1 : 0, transform: cardVisible ? 'translateY(0)' : 'translateY(6px)', transition: 'opacity 0.22s ease, transform 0.22s ease' }}>
                              {/* Card header */}
                              <div style={{ background:'var(--brand)', padding:'14px 18px', display:'flex', alignItems:'center', gap:10 }}>
                                <div style={{ width:36, height:36, borderRadius:9, background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                  {getIcon(card.icon)}
                                </div>
                                <div>
                                  <div style={{ fontSize:13.5, fontWeight:800, color:'#fff', lineHeight:1.2 }}>{isAr ? card.titleAr : card.titleEn}</div>
                                  <div style={{ fontSize:10.5, color:'rgba(255,255,255,0.65)', marginTop:2 }}>
                                    {isAr ? `${card.authAr} — ${card.cntAr}` : `${card.authEn} — ${card.cntEn}`}
                                  </div>
                                </div>
                              </div>
                              {/* Steps timeline */}
                              <div style={{ padding:'16px 18px', display:'flex', flexDirection:'column', gap:0 }}>
                                {(card.steps as readonly {ar:string;en:string;s:string}[]).map((step, i, arr) => (
                                  <div key={i} style={{ display:'flex', gap:12, paddingBottom: i < arr.length-1 ? 16 : 0, position:'relative' }}>
                                    {i < arr.length-1 && <div style={{ position:'absolute', [isAr ? 'right' : 'left']:11, top:24, bottom:0, width:1.5, background: step.s==='done' ? 'var(--brand)' : 'var(--border)', borderRadius:2 }} />}
                                    <div style={{ width:24, height:24, borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', background: step.s==='done' ? 'var(--brand)' : step.s==='active' ? 'var(--brand-soft)' : 'var(--surface-2)', border: step.s==='active' ? '2px solid var(--brand)' : 'none', zIndex:1 }}>
                                      {step.s==='done'
                                        ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                                        : <span style={{ width:7, height:7, borderRadius:'50%', background: step.s==='active' ? 'var(--brand)' : 'var(--border)', display:'block' }} />
                                      }
                                    </div>
                                    <div style={{ flex:1, paddingTop:3 }}>
                                      <div style={{ fontSize:12.5, fontWeight: step.s==='active' ? 700 : 500, color: step.s==='done' ? 'var(--text-3)' : step.s==='active' ? 'var(--text-1)' : 'var(--text-2)', textDecoration: step.s==='done' ? 'line-through' : 'none' }}>
                                        {isAr ? step.ar : step.en}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              {/* Card footer */}
                              <div style={{ padding:'12px 18px', borderTop:'1px solid var(--border)', background:'var(--surface-muted)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                                <span style={{ fontSize:11, color:'var(--text-3)', display:'flex', alignItems:'center', gap:4 }}>
                                  <svg aria-hidden="true" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                                  {isAr ? 'مصادر رسمية' : 'Official sources'}
                                </span>
                                <button type="button" onClick={() => sendMessage(isAr ? card.pAr : card.pEn)}
                                  style={{ fontSize:11.5, fontWeight:700, color:'var(--brand)', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit' }}>
                                  {isAr ? 'ابدأ الآن ←' : '→ Start Now'}
                                </button>
                              </div>
                            </div>
                            {/* Navigation dots */}
                            <div style={{ padding:'10px 18px', display:'flex', alignItems:'center', justifyContent:'center', gap:6, borderTop:'1px solid var(--border)' }}>
                              {HERO_CARDS.map((_, idx) => (
                                <button key={idx} type="button"
                                  aria-label={`Procedure ${idx + 1}`}
                                  onClick={() => setActiveCard(idx)}
                                  style={{ width: idx===displayCard ? 20 : 6, height:6, borderRadius:3, border:'none', cursor:'pointer', padding:0, transition:'all 0.2s cubic-bezier(0.22,1,0.36,1)', background: idx===displayCard ? 'var(--brand)' : 'var(--border)', flexShrink:0 }}
                                />
                              ))}
                            </div>
                          </div>
                        )
                      })()}
                    </div>

                  </div>{/* .hl */}
                </div>
              </section>

              {/* ══ الأكثر بحثاً — v4.0: uniform full-width list rows instead
                  of a card grid, per spec ("كل عنصر يكون صفاً كاملاً"). Same
                  4 real procedures/prompts as before — only the presentation
                  changed (icon + name + arrow, 56px rows, one containing
                  card, consistent alignment). ══ */}
              <section style={{ padding:'8px 0 32px', background:'var(--bg)' }}>
                <div style={{ maxWidth:720, margin:'0 auto', padding:'0 16px' }}>
                  <h2 style={{ fontSize:20, fontWeight:700, color:'var(--text-1)', margin:'0 0 12px' }}>
                    {isAr ? 'الأكثر بحثاً' : 'Most Searched'}
                  </h2>
                  <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, overflow:'hidden' }}>
                    {([
                      { ar:'استخراج جواز السفر', en:'Passport Application', pAr:'كيف أستخرج أو أجدد جواز سفري اللبناني؟', pEn:'How do I get or renew my Lebanese passport?', icon:<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0"/></svg> },
                      { ar:'إخراج قيد فردي', en:'Civil Registry Extract', pAr:'كيف أستخرج إخراج قيد فردي من السجل المدني؟', pEn:'How do I get a civil registry extract?', icon:<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg> },
                      { ar:'تسجيل شركة', en:'Company Registration', pAr:'كيف أسجّل شركة في لبنان وما هي الخطوات؟', pEn:'How do I register a company in Lebanon?', icon:<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg> },
                      { ar:'تسجيل سيارة جديدة', en:'Vehicle Registration', pAr:'كيف أسجّل سيارة جديدة في لبنان؟', pEn:'How do I register a new vehicle in Lebanon?', icon:<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg> },
                    ] as {ar:string;en:string;pAr:string;pEn:string;icon:React.ReactNode}[]).map((p, i, arr) => (
                      <button type="button" key={p.en}
                        onClick={() => sendMessage(isAr ? p.pAr : p.pEn)}
                        style={{
                          width:'100%', minHeight:56, padding:'8px 16px',
                          display:'flex', alignItems:'center', gap:12,
                          border:'none', borderBottom: i < arr.length - 1 ? '1px solid var(--border-light)' : 'none',
                          background:'transparent', cursor:'pointer', fontFamily:'inherit',
                          textAlign: isAr ? 'right' : 'left',
                        }}
                      >
                        <span style={{ color:'var(--text-2)', flexShrink:0 }}>{p.icon}</span>
                        <span style={{ flex:1, fontSize:16, fontWeight:600, color:'var(--text-1)' }}>
                          {isAr ? p.ar : p.en}
                        </span>
                        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2" style={{ flexShrink:0 }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d={isAr ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'}/>
                        </svg>
                      </button>
                    ))}
                  </div>
                  <button type="button" onClick={() => router.push('/procedures')}
                    style={{ marginTop:12, fontSize:14, fontWeight:600, color:'var(--brand)', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:4 }}>
                    {isAr ? 'عرض جميع المعاملات' : 'View all procedures'}
                    <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d={isAr ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'}/></svg>
                  </button>
                </div>
              </section>

              {/* ══ تصفّح حسب الفئة — v4.0: 2-column grid of fixed-height
                  cards instead of a wrapped pill row, per spec. Same 6 real
                  categories/prompts as before (batch #350 already trimmed
                  this list from 10 to 6 for the homepage; the full catalog
                  stays one tap away via "كل الفئات" → /services). ══ */}
              <section style={{ background:'var(--bg)', padding:'8px 0 32px' }}>
                <div style={{ maxWidth:720, margin:'0 auto', padding:'0 16px' }}>
                  <SectionHeader
                    title={isAr ? 'تصفّح حسب الفئة' : 'Browse by Category'}
                    align="baseline"
                    trailingLabel={isAr ? 'كل الفئات' : 'All categories'}
                    onTrailingClick={() => router.push('/services')}
                    trailingIcon={
                      <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d={isAr ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'}/></svg>
                    }
                  />
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:12 }}>
                    {([
                      { ar:'الأحوال الشخصية',    en:'Personal Status',      q_ar:'ما هي معاملات الأحوال الشخصية في لبنان؟',        q_en:'What are personal status procedures in Lebanon?',
                        icon:<svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="12" r="2"/><path strokeLinecap="round" d="M14 10h4M14 14h4"/></svg> },
                      { ar:'السفر والإقامة',      en:'Travel & Residency',   q_ar:'ما هي إجراءات السفر والإقامة في لبنان؟',          q_en:'What are travel and residency procedures in Lebanon?',
                        icon:<svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0"/></svg> },
                      { ar:'الشركات والأعمال',    en:'Business',             q_ar:'كيف أسجّل شركة أو أبدأ عمل تجاري في لبنان؟',     q_en:'How do I register a business in Lebanon?',
                        icon:<svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1"/></svg> },
                      { ar:'السيارات والنقل',     en:'Vehicles & Transport', q_ar:'ما هي إجراءات السيارات والنقل في لبنان؟',         q_en:'What are vehicle and transport procedures in Lebanon?',
                        icon:<svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg> },
                      { ar:'العقارات',            en:'Real Estate',          q_ar:'ما هي إجراءات العقارات وتسجيل الملكية في لبنان؟', q_en:'What are real estate procedures in Lebanon?',
                        icon:<svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3v-6h6v6h3a1 1 0 001-1V10"/></svg> },
                      { ar:'البلديات',            en:'Municipalities',       q_ar:'ما هي خدمات البلديات في لبنان؟',                   q_en:'What are municipality services in Lebanon?',
                        icon:<svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1"/></svg> },
                    ] as {ar:string;en:string;q_ar:string;q_en:string;icon:React.ReactNode}[]).map(cat => (
                      <button type="button" key={cat.en}
                        onClick={() => sendMessage(isAr ? cat.q_ar : cat.q_en)}
                        style={{
                          height:100, padding:'14px', borderRadius:14,
                          background:'var(--surface)', border:'1px solid var(--border)',
                          color:'var(--text-1)', cursor:'pointer', fontFamily:'inherit',
                          display:'flex', flexDirection:'column', alignItems:'flex-start', justifyContent:'space-between',
                          textAlign: isAr ? 'right' : 'left',
                        }}
                      >
                        <span style={{ color:'var(--text-2)' }}>{cat.icon}</span>
                        <span style={{ fontSize:15, fontWeight:600, lineHeight:1.3 }}>{isAr ? cat.ar : cat.en}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              {/* v4.0 (batch #366): the homepage's exact required section
                  order per spec is Header → title → helper text → search →
                  quick actions → popular → categories → one small trust
                  line → simple footer → bottom nav — explicitly no hero
                  banner, no "how it works" explainer, no life-journey grid,
                  no multi-card trust section on this screen. The removed
                  sections below are NOT deleted features: LIFE_JOURNEYS data
                  and the JourneySheet modal (setActiveJourney) are untouched
                  and still reachable via GlobalSearch/MobileMenu's journey
                  results (onJourneySelect, already wired) — only the
                  homepage grid that browsed them inline was removed, per the
                  explicit "no more than 2 sections before first scroll" /
                  literal 10-item homepage spec. The 3-step "how it works"
                  explainer and the 4-card trust grid are replaced below by
                  the single small trust line the spec asks for. */}

              {/* ══ رسالة ثقة صغيرة ══ */}
              <section style={{ background:'var(--bg)', padding:'4px 0 24px' }}>
                <div style={{ maxWidth:720, margin:'0 auto', padding:'0 16px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:'var(--text-3)' }}>
                    <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink:0 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                    </svg>
                    <span>
                      {isAr
                        ? 'المعلومات مرتبطة بمصادر رسمية ويظهر تاريخ آخر تحديث.'
                        : 'Information is linked to official sources, and the last-updated date is shown.'}
                    </span>
                  </div>
                </div>
              </section>

              {/* ══ Footer — v4.0: simplified per "Footer بسيط عند الحاجة".
                  The previous 3-column dark footer (brand blurb + 8 links +
                  language toggle) was landing-page styling, not a government
                  app pattern. Kept only what's genuinely useful at the very
                  bottom of the page — brand mark, copyright, the one legal
                  disclaimer line, and links to About/Privacy (both real
                  pages, see MobileMenu). All the quick-links it used to
                  duplicate (Services/Procedures/Authorities/Forms/FAQ/My
                  Files/Drafting Studio) remain reachable from the hamburger
                  menu — nothing deleted, just no longer repeated here. ══ */}
              <footer aria-label={isAr ? 'تذييل الصفحة' : 'Page footer'} style={{ background:'var(--surface)', borderTop:'1px solid var(--border)', padding:'20px 0' }}>
                <div style={{ maxWidth:720, margin:'0 auto', padding:'0 16px', display:'flex', flexDirection:'column', gap:10 }}>
                  <AppLogo isAr={isAr} badge={false} iconSize={18} titleTag="span" titleSize={13} titleWeight={700} style={{ gap: 8 }} />
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'6px 16px', fontSize:12, color:'var(--text-3)' }}>
                    <span>{isAr ? '© ٢٠٢٦ دليلك' : '© 2026 Dalilak'}</span>
                    <button type="button" onClick={() => router.push('/settings')} style={{ background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', fontFamily:'inherit', fontSize:12, padding:0 }}>{isAr ? 'حول دليلك' : 'About'}</button>
                    <button type="button" onClick={() => router.push('/privacy')} style={{ background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', fontFamily:'inherit', fontSize:12, padding:0 }}>{isAr ? 'سياسة الخصوصية' : 'Privacy'}</button>
                    <span>{isAr ? 'ليس بديلاً عن الاستشارة القانونية الرسمية' : 'Not a substitute for official legal advice'}</span>
                  </div>
                </div>
              </footer>

            </div>

          ) : (

            /* ── Chat Messages ── */
            <div aria-live="polite" aria-label={isAr ? 'محادثة المساعد القانوني' : 'Legal assistant conversation'} style={{ maxWidth: 'var(--container-md)', margin: '0 auto', padding: '12px 14px' }}>
              {/* WCAG 2.2 AA fix (UX_AUDIT.md heading-hierarchy audit): the
                  page's only <h1> lives in the welcome-screen branch above,
                  which unmounts entirely once a chat starts — leaving zero
                  headings anywhere on the page for the rest of the session.
                  Visually-hidden h1 restores a landmark for screen-reader
                  users navigating by heading without changing anything
                  visible. */}
              <h1 className="sr-only">{isAr ? 'محادثة دليلك' : 'Dalilak conversation'}</h1>
              {/* Home button — visible on mobile inside chat */}
              <div style={{ display: 'flex', justifyContent: isAr ? 'flex-end' : 'flex-start', gap: 8, marginBottom: 8 }}>
                <button
                  type="button"
                  aria-label={isAr ? 'العودة للصفحة الرئيسية' : 'Return to home'}
                  onClick={() => { setMessages([]); setFollowupQuestions([]); setRetryMsg(null) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 14px', borderRadius: 20,
                    background: '#fff', border: '1.5px solid #E6E2DC',
                    fontSize: 12, color: '#918B82', fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'inherit',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                    transition: 'border-color 0.15s, color 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#8F1D2C'; e.currentTarget.style.color = '#8F1D2C' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#E6E2DC'; e.currentTarget.style.color = '#918B82' }}
                  onTouchStart={e => { e.currentTarget.style.background = '#F8EDEF'; e.currentTarget.style.color = '#8F1D2C' }}
                  onTouchEnd={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#918B82' }}>
                  <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 21V12h6v9"/>
                  </svg>
                  {isAr ? 'الرئيسية' : 'Home'}
                </button>

                {/* Export chat button */}
                <button
                  type="button"
                  aria-label={isAr ? 'تصدير المحادثة' : 'Export chat'}
                  onClick={exportChat}
                  title={isAr ? 'تصدير / طباعة المحادثة' : 'Export / Print conversation'}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '6px 12px', borderRadius: 20,
                    background: '#fff', border: '1.5px solid #E6E2DC',
                    fontSize: 11.5, color: '#918B82', fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'inherit',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                    transition: 'border-color 0.15s, color 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#8F1D2C'; e.currentTarget.style.color = '#8F1D2C' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#E6E2DC'; e.currentTarget.style.color = '#918B82' }}
                >
                  <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 6 2 18 2 18 9"/><path strokeLinecap="round" d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
                  </svg>
                  {isAr ? 'تصدير' : 'Export'}
                </button>
              </div>

              {/* ── Session restore banner ── */}
              {restoredCount > 0 && (
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '7px 12px', marginBottom: 8, borderRadius: 10,
                  background: '#FFFBEB', border: '1px solid #FDE68A',
                  animation: 'fadeUp 0.25s cubic-bezier(0.22,1,0.36,1) both',
                  direction: isAr ? 'rtl' : 'ltr',
                }}>
                  <span style={{ fontSize: 11.5, color: '#78350F', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#B45309" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    {isAr
                      ? `استُعيدت محادثة سابقة (${Math.floor(restoredCount / 2)} سؤال)`
                      : `Previous session restored (${Math.floor(restoredCount / 2)} questions)`}
                  </span>
                  <button
                    type="button"
                    onClick={() => setRestoredCount(0)}
                    aria-label={isAr ? 'إخفاء' : 'Dismiss'}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#B45309', padding: 2, display: 'flex', alignItems: 'center' }}
                  >
                    <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              )}

              {/* NOTE (UX_AUDIT.md, batch #346): a ~110-line block of ~30 "homepage
                  widget" components used to sit here, gated by `messages.length===0`.
                  That guard was always false at this point in the code — this whole
                  branch only renders when `messages.length > 0` (see the outer
                  ternary above). The block was therefore 100% dead/unreachable code:
                  it never rendered for any user, ever. Verified by tracing the
                  ternary's brackets before removal. Removed entirely (along with the
                  ~30 now-orphaned imports/lazy-chunk definitions it was the sole user
                  of) — this is a pure bundle-size/performance win with zero visible
                  change, since nothing here was ever visible to begin with. */}

              {/* Chat summary card — appears after 5+ messages */}
              {messages.length >= 5 && (
                <ChatSummaryCard
                  messages={messages}
                  onAsk={q => sendMessage(q)}
                />
              )}

              {/* Site feedback card — inline, not floating (UX_AUDIT.md: "one
                  floating button app-wide" now has zero exceptions app-wide).
                  Same appear-after-real-usage trigger as before (3+ messages
                  or 5+ min session), just rendered in the message flow like
                  ChatSummaryCard instead of as a fixed-position corner FAB. */}
              <FeedbackWidget messageCount={messages.length} />

              {/* Session timer — shown above message list */}
              {messages.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, paddingBottom: 6 }}>
                  <ChatSessionTimer messageCount={messages.length} isAr={isAr} />
                  <ChatMessageSearchInThread messages={messages} isAr={isAr} />
                </div>
              )}

              {/* Quick suggestion chips — disappears after first message */}
              <HomepageChatSuggestionsBar
                messageCount={messages.length}
                isAr={isAr}
                onAsk={q => sendMessage(q)}
              />

              {/* Session summary chip — appears at 10+ messages */}
              <ChatSessionSummaryChip
                messageCount={messages.length}
                isAr={isAr}
                onAsk={q => sendMessage(q)}
              />

              {/* Pinned message banner */}
              <ChatPinnedBanner isAr={isAr} />

              {/* Language toggle chip — one-time prompt to switch AI reply language */}
              <ChatLanguageToggleChip
                messageCount={messages.length}
                isAr={isAr}
                onAsk={q => sendMessage(q)}
              />

              {messages.map((msg, i) => {
                /* ── Typing indicator: empty streaming assistant message ── */
                if (msg.role === 'assistant' && msg.content === '' && msg.streaming) {
                  return (
                    <div key={i} className="msg-in" style={{
                      display: 'flex',
                      justifyContent: isAr ? 'flex-end' : 'flex-start',
                      marginBottom: 12,
                    }}>
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        background: 'var(--surface)', border: '1px solid var(--border)',
                        borderRadius: isAr ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        padding: '10px 16px',
                      }}>
                        {[0, 1, 2].map(j => (
                          <span key={j} style={{
                            width: 7, height: 7, borderRadius: '50%',
                            background: 'var(--brand)', display: 'inline-block',
                            animation: `typing-dot 1.2s ease-in-out ${j * 0.2}s infinite`,
                          }} />
                        ))}
                      </div>
                    </div>
                  )
                }
                return (
                  <div key={i} id={`msg-${i}`} className="msg-in">
                    <ChatMessage
                      msg={msg}
                      isAr={isAr}
                      index={i}
                      onFollowUp={(q) => { setInput(q); textareaRef.current?.focus() }}
                      onSendMessage={(q) => sendMessage(q)}
                      onUploadFile={() => fileInputRef.current?.click()}
                      onStartFlow={() => setShowGuide(true)}
                      question={msg.role === 'assistant' && i > 0 && messages[i - 1]?.role === 'user'
                        ? messages[i - 1].content.replace(/^\[.*?\]\n?/, '').slice(0, 300)
                        : undefined}
                    />
                    {/* batch #353 chat-declutter: this row used to render 10 separate clickable
                        controls (Copy/Share/Save from ChatMessageActions + Pin + Voice-playback +
                        4 emoji-reaction buttons + Save-to-notes) inline on EVERY assistant message
                        — the single highest-frequency clutter spot in the app, since it repeats
                        per message rather than once per page. Kept ChatMessageActions (Copy/Share/
                        Save — the 3 most fundamental "do something with this text" actions) always
                        visible, and folded the remaining 7 controls behind one "More" toggle per
                        message. Nothing was removed — same components, same props, same behavior,
                        just one extra click to reach the secondary actions. */}
                    {msg.role === 'assistant' && !msg.streaming && msg.content.length > 10 && (
                      <div style={{ paddingInlineStart: isAr ? 0 : 10, paddingInlineEnd: isAr ? 10 : 0, display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                        <ChatMessageActions text={msg.content} isAr={isAr} />
                        <button
                          type="button"
                          onClick={() => setExpandedMsgActions(prev => {
                            const next = new Set(prev)
                            next.has(i) ? next.delete(i) : next.add(i)
                            return next
                          })}
                          aria-expanded={expandedMsgActions.has(i)}
                          aria-label={isAr ? 'المزيد من الإجراءات' : 'More actions'}
                          title={isAr ? 'المزيد' : 'More'}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            padding: '3px 8px', borderRadius: 12,
                            background: expandedMsgActions.has(i) ? 'var(--brand-soft)' : 'transparent',
                            border: `1px solid ${expandedMsgActions.has(i) ? 'var(--border-brand)' : 'transparent'}`,
                            color: expandedMsgActions.has(i) ? 'var(--brand)' : 'var(--text-3)',
                            fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                          }}
                        >
                          •••
                        </button>
                        {expandedMsgActions.has(i) && (
                          <>
                            <ChatPinButton text={msg.content} isAr={isAr} />
                            <ChatVoicePlayback text={msg.content} isAr={isAr} />
                            <ChatEmojiReactions msgId={String(i)} isAr={isAr} />
                            <ChatSaveToNotes text={msg.content} isAr={isAr} />
                          </>
                        )}
                        <ChatAIBadge isAr={isAr} messageIndex={i} />
                      </div>
                    )}
                  </div>
                )
              })}
              {/* Pre-stream typing indicator — shown while waiting for first token */}
              {loading && messages.length > 0 && messages[messages.length - 1]?.role === 'user' && (
                <ChatTypingIndicator isAr={isAr} />
              )}

              <div ref={bottomRef} style={{ height: 8 }} />
            </div>
          )}
        </main>

        {/* ══ Follow-up question chips ══ */}
        {followupQuestions.length > 0 && !loading && (
          <div style={{
            maxWidth: 'var(--container-md)', margin: '0 auto', padding: '4px 12px 2px',
            display: 'flex', flexWrap: 'wrap', gap: 8, direction: isAr ? 'rtl' : 'ltr',
          }}>
            {followupQuestions.map((q, i) => (
              <button
                type="button"
                key={i}
                className="followup-chip"
                aria-label={q}
                onClick={() => { setInput(q); sendMessage(q) }}
                style={{
                  background: '#FFF5F5', border: '1px solid rgba(143,29,44,0.18)',
                  borderRadius: 20, padding: '6px 14px', fontSize: 12.5,
                  color: '#8F1D2C', cursor: 'pointer', fontFamily: 'inherit',
                  lineHeight: 1.4, textAlign: 'right', transition: 'background 0.15s, transform 0.15s',
                  display: 'flex', alignItems: 'center', gap: 5,
                  animationDelay: `${i * 0.07}s`,
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#FEE2E2' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#FFF5F5' }}
                onTouchStart={e => { (e.currentTarget as HTMLButtonElement).style.background = '#FEE2E2'; (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.97)' }}
                onTouchEnd={e => { (e.currentTarget as HTMLButtonElement).style.background = '#FFF5F5'; (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)' }}
              >
                <svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.6, flexShrink: 0 }}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg> {q}
              </button>
            ))}
          </div>
        )}

        {/* ── Inline voice/file error — replaces alert() ── */}
        {voiceError && (
          <div role="alert" style={{
            maxWidth: 'var(--container-md)', margin: '0 auto 6px', padding: '8px 14px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: '#F8EDEF', border: '1.5px solid #FECACA',
            borderRadius: 10, direction: isAr ? 'rtl' : 'ltr',
            animation: 'fadeUp 0.2s cubic-bezier(0.22,1,0.36,1) both',
          }}>
            <span style={{ fontSize: 12.5, color: '#8F1D2C', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01"/></svg>
              {voiceError}
            </span>
            <button type="button" onClick={() => setVoiceError(null)} aria-label={isAr ? 'إغلاق' : 'Dismiss'}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#B45309', padding: 2, display: 'flex', alignItems: 'center' }}>
              <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
        )}

        {/* ══ Retry chip on connection error ══ */}
        {retryMsg && !loading && (
          <div style={{ maxWidth: 'var(--container-md)', margin: '0 auto', padding: '0 12px 4px', direction: isAr ? 'rtl' : 'ltr' }}>
            <button
              type="button"
              onClick={() => sendMessage(retryMsg!)}
              style={{
                background: '#fff5f5', border: '1px solid rgba(143,29,44,0.25)',
                borderRadius: 20, padding: '6px 16px', fontSize: 12.5,
                color: '#8F1D2C', cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', gap: 4,
                animation: 'slideQ 0.22s cubic-bezier(0.22,1,0.36,1) both',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#FEE2E2' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#fff5f5' }}
              onTouchStart={e => { (e.currentTarget as HTMLButtonElement).style.background = '#FEE2E2'; (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.97)' }}
              onTouchEnd={e => { (e.currentTarget as HTMLButtonElement).style.background = '#fff5f5'; (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)' }}
            >
              <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: 5 }}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg> {isAr ? 'إعادة المحاولة' : 'Retry'}
            </button>
          </div>
        )}

        {/* ══ Quota remaining warning ══ */}
        {quotaRemaining !== null && quotaRemaining >= 0 && quotaRemaining <= 10 && (
          <div style={{
            maxWidth: 'var(--container-md)', margin: '0 auto', padding: '0 12px 2px',
            direction: isAr ? 'rtl' : 'ltr', textAlign: isAr ? 'right' : 'left',
          }}>
            <span style={{
              display: 'inline-block', fontSize: 11.5, color: quotaRemaining <= 3 ? '#8F1D2C' : '#92400e',
              background: quotaRemaining <= 3 ? '#fef2f2' : '#fffbeb',
              border: `1px solid ${quotaRemaining <= 3 ? '#fecaca' : '#fde68a'}`,
              borderRadius: 20, padding: '2px 10px', fontFamily: 'inherit',
              animation: 'fadeUp 0.2s cubic-bezier(0.22,1,0.36,1) both',
            }}>
              {quotaRemaining <= 3
                ? <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: 4, verticalAlign: 'middle' }}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                : <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: 4, verticalAlign: 'middle' }}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              } {quotaRemaining === 0
                ? (isAr ? 'استنفذت حصتك اليومية' : 'Daily quota exhausted')
                : (isAr ? `${quotaRemaining} سؤال متبقٍ اليوم` : `${quotaRemaining} questions left today`)}
            </span>
          </div>
        )}

        {/* ══════════════ FOOTER / INPUT ══════════════ */}
        <footer aria-label={isAr ? 'شريط إدخال الرسالة' : 'Message input bar'} className={footerBottom > 0 ? '' : 'bottom-nav-padding'} style={{
          flexShrink: 0,
          background: messages.length > 0 ? 'linear-gradient(to top, rgba(248,248,246,1) 0%, rgba(248,248,246,0.96) 70%, rgba(248,248,246,0) 100%)' : 'transparent',
          paddingTop: messages.length > 0 ? 8 : 0,
          paddingBottom: messages.length > 0 && footerBottom > 0 ? 'env(safe-area-inset-bottom, 4px)' : undefined,
        }}>
          {messages.length > 0 && <div style={{ maxWidth: 'var(--container-md)', margin: '0 auto', padding: '0 12px 10px' }}>

            {/* ── Active Document Context Chip (Phase 9) ── */}
            {activeDocumentName && messages.length > 0 && !attachedFile && (
              <div style={{
                marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 10px', background: '#F8EDEF',
                borderRadius: 10, border: '1px solid rgba(143,29,44,0.2)',
                animation: 'slideQ 0.2s cubic-bezier(0.22,1,0.36,1) both',
              }}>
                <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8F1D2C" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                <span style={{ fontSize: 10.5, color: '#8F1D2C', fontWeight: 600, flex: 1 }}>
                  {isAr ? 'يتم تحليل: ' : 'Analyzing: '}{activeDocumentName}
                </span>
                <button
                  type="button"
                  onClick={() => { setActiveDocumentName(null) }}
                  aria-label={isAr ? 'مسح المستند النشط' : 'Clear active document'}
                  style={{ background: 'none', border: 'none', color: '#918B82', cursor: 'pointer', padding: 8, display: 'flex', alignItems: 'center', flexShrink: 0 }}
                ><svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12"/></svg></button>
              </div>
            )}

            {/* File preview */}
            {attachedFile && (
              <div style={{
                marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', backgroundColor: 'var(--red-light)',
                borderRadius: 12, border: '1.5px solid rgba(143,29,44,0.15)',
                animation: 'slideQ 0.2s cubic-bezier(0.22,1,0.36,1) both',
              }}>
                {attachedFile.preview ? (
                  <img src={attachedFile.preview} alt={isAr ? `معاينة الملف المرفق: ${attachedFile.name}` : `Attached file preview: ${attachedFile.name}`} loading="lazy"
                    style={{ width: 42, height: 42, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                ) : (
                  <div style={{
                    width: 42, height: 42, borderRadius: 10, background: '#fff',
                    border: '1.5px solid rgba(143,29,44,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, flexShrink: 0,
                  }}>
                    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8F1D2C" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0, textAlign: isAr ? 'right' : 'left' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {attachedFile.name}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 1 }}>{formatSize(attachedFile.size)}</div>
                  <div style={{ fontSize: 10, color: 'var(--red)', fontWeight: 600, marginTop: 1 }}>
                    {isAr ? 'جاهز للتحليل' : 'Ready to analyze'}
                  </div>
                </div>
                <button type="button" onClick={() => setAttachedFile(null)} aria-label={isAr ? 'حذف الملف' : 'Remove file'} style={{
                  width: 24, height: 24, borderRadius: '50%',
                  backgroundColor: 'rgba(143,29,44,0.1)', border: 'none',
                  cursor: 'pointer', color: 'var(--red)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  transition: 'background 0.12s',
                }}><svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12"/></svg></button>
              </div>
            )}

            {/* Recording indicator */}
            {recording && (
              <div style={{
                marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 10, padding: '9px 16px',
                background: 'var(--brand-soft)',
                borderRadius: 14, border: '1px solid var(--border-brand)',
                animation: 'slideQ 0.2s cubic-bezier(0.22,1,0.36,1) both',
              }}>
                <span style={{ display: 'flex', gap: 3, alignItems: 'flex-end' }}>
                  {[7, 13, 9, 15, 10, 13, 8].map((h, n) => (
                    <span key={n} style={{
                      width: 3, height: h, backgroundColor: 'var(--brand)', borderRadius: 2,
                      animation: `pulse 0.75s ease-in-out infinite`, animationDelay: `${n * 0.07}s`,
                      display: 'inline-block',
                    }} />
                  ))}
                </span>
                <span style={{ fontSize: 12.5, color: 'var(--brand)', fontWeight: 600 }}>
                  {isAr ? '🎙 جاري الاستماع... تكلّم الآن' : '🎙 Listening... speak now'}
                </span>
                <span style={{ display: 'flex', gap: 3, alignItems: 'flex-end' }}>
                  {[8, 13, 10, 15, 9, 13, 7].map((h, n) => (
                    <span key={n} style={{
                      width: 3, height: h, backgroundColor: 'var(--brand)', borderRadius: 2,
                      animation: `pulse 0.75s ease-in-out infinite`, animationDelay: `${n * 0.09}s`,
                      display: 'inline-block',
                    }} />
                  ))}
                </span>
                <button type="button" onClick={stopRecording}
                  aria-label={isAr ? 'إيقاف التسجيل' : 'Stop recording'}
                  style={{
                    marginInlineStart: 6, padding: '3px 10px', fontSize: 11, fontWeight: 600,
                    background: 'var(--brand)', color: '#fff', border: 'none', borderRadius: 8,
                    cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
                  }}>
                  {isAr ? 'إيقاف' : 'Stop'}
                </button>
              </div>
            )}

            {/* Enhance suggestion chip — appears after enhance or voice */}
            {enhanceSuggestion && !recording && (
              <div style={{
                marginBottom: 8, padding: '10px 14px',
                background: '#EAF2FE',
                borderRadius: 14, border: '1px solid #BAD7F8',
                animation: 'slideQ 0.22s cubic-bezier(0.22,1,0.36,1) both',
              }}>
                <div style={{ fontSize: 10.5, color: '#2563EB', fontWeight: 700, marginBottom: 5, letterSpacing: 0.3 }}>
                  ✨ {isAr ? 'اقتراح التحسين' : 'Enhancement suggestion'}
                </div>
                <div style={{ fontSize: 12.5, color: '#1e3a5f', lineHeight: 1.6, direction: isAr ? 'rtl' : 'ltr', marginBottom: 8 }}>
                  {enhanceSuggestion}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button type="button"
                    onClick={() => {
                      setInput(enhanceSuggestion)
                      setEnhanceSuggestion(null)
                      fetch(`${API_URL}/suggest_followup`, {
                        method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() },
                        body: JSON.stringify({ question: enhanceSuggestion, answer: '', lang: isAr ? 'ar' : 'en' }),
                      }).then(r => r.ok ? r.json() : null)
                        .then(d => { if (d?.questions?.length >= 2) { chipsLockedRef.current = true; setVisibleQ(d.questions.slice(0, 4)) } })
                        .catch(() => {})
                    }}
                    style={{
                      padding: '5px 14px', fontSize: 12, fontWeight: 700,
                      background: '#2563EB', color: '#fff', border: 'none', borderRadius: 9,
                      cursor: 'pointer', fontFamily: 'inherit',
                    }}>
                    {isAr ? '✓ قبول' : '✓ Accept'}
                  </button>
                  <button type="button" onClick={() => setEnhanceSuggestion(null)}
                    style={{
                      padding: '5px 12px', fontSize: 12, fontWeight: 600,
                      background: 'rgba(37,99,235,0.08)', color: '#2563EB',
                      border: '1px solid rgba(37,99,235,0.2)', borderRadius: 9,
                      cursor: 'pointer', fontFamily: 'inherit',
                    }}>
                    {isAr ? 'تجاهل' : 'Dismiss'}
                  </button>
                </div>
              </div>
            )}

            {/* Voice just-ended → offer enhance */}
            {voiceJustEnded && !recording && !enhanceSuggestion && !enhancing && input.trim().length > 4 && (
              <div style={{
                marginBottom: 8, padding: '8px 14px',
                background: '#FFF8E6',
                borderRadius: 12, border: '1px solid #FDE68A',
                display: 'flex', alignItems: 'center', gap: 10,
                animation: 'slideQ 0.2s cubic-bezier(0.22,1,0.36,1) both',
              }}>
                <span style={{ fontSize: 14 }}>✨</span>
                <span style={{ fontSize: 12, color: '#92400E', fontWeight: 600, flex: 1 }}>
                  {isAr ? 'هل تريد تحسين السؤال المُسجَّل؟' : 'Want to enhance your voice input?'}
                </span>
                <button type="button"
                  onClick={() => { setVoiceJustEnded(false); enhancePrompt(input, setInput, setEnhancing, true) }}
                  style={{
                    padding: '4px 12px', fontSize: 11.5, fontWeight: 700,
                    background: '#F59E0B', color: '#fff', border: 'none', borderRadius: 8,
                    cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
                  }}>
                  {isAr ? 'حسّن' : 'Enhance'}
                </button>
                <button type="button" onClick={() => setVoiceJustEnded(false)}
                  aria-label={isAr ? 'إغلاق' : 'Dismiss'}
                  style={{
                    width: 36, height: 36, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.06)',
                    cursor: 'pointer', color: '#92400E', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
            )}

            {/* ── Mode + response-length controls — grouped on one row ── */}
            <div style={{
              display: 'flex', alignItems: 'center', flexWrap: 'wrap',
              justifyContent: 'space-between', gap: 8, marginBottom: 6,
            }}>
              <ModeSelector mode={mode} onSelect={setMode} isAr={isAr} />
              <ChatResponseLength isAr={isAr} />
            </div>

            {/* ── Active context bar (procedure / ministry / journey) — hidden when empty ── */}
            <ChatContextBar
              mode={mode !== 'quick' ? mode : undefined}
              modeAr={mode === 'detailed' ? 'وضع مفصّل' : mode === 'research' ? 'وضع بحثي' : undefined}
              modeEn={mode === 'detailed' ? 'Detailed mode' : mode === 'research' ? 'Research mode' : undefined}
            />

            {/* ── Char counter + keyboard hint — one slim utility row ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <ChatKeyboardSendHint isAr={isAr} />
              {/* batch #498 declutter: this was previously a SECOND, separate
                  char counter alongside an inline one inside the textarea
                  (removed above) — that inline copy also hardcoded a "very
                  long" warning at 600 chars while the real hard limit
                  (MAX_INPUT) is 4000, so it was misleadingly telling users
                  they'd hit the limit 3400 characters early. One counter,
                  correct threshold. */}
              <ChatInputCharCounter text={input} isAr={isAr} maxLength={MAX_INPUT} />
            </div>
            <ChatDraftAutosave input={input} setInput={setInput} />

            {/* ── Quick reply chips (after assistant message, when input is empty) ── */}
            {messages.length > 0 && !input.trim() && !loading && (() => {
              const last = messages[messages.length - 1]
              if (last.role !== 'assistant') return null
              return (
                <ChatQuickReplies
                  lastMessageContent={typeof last.content === 'string' ? last.content : ''}
                  lastMessageRole="assistant"
                  onSelect={text => { sendMessage(text) }}
                  isAr={isAr}
                />
              )
            })()}

            {/* ── Smart input autocomplete suggestions ── */}
            {smartSuggestions.length > 0 && (
              <SmartInputSuggestions
                input={input}
                onSelect={s => { setInput(s); textareaRef.current?.focus(); setSmartDismissed(true) }}
                isAr={isAr}
                activeIdx={smartActiveIdx}
                onHover={setSmartActiveIdx}
              />
            )}

            {/* ── Input box ── */}
            <form onSubmit={handleSubmit}>
              <div className={inputFocused ? 'input-focused' : ''}
                style={{
                  display: 'flex', alignItems: 'flex-end', gap: 4,
                  backgroundColor: 'var(--surface)',
                  border: recording ? '1.5px solid #FCA5A5' : '1px solid var(--border)',
                  borderRadius: 20, padding: '7px 8px',
                  transition: 'border-color 0.15s',
                }}>

                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, flex: 1 }}>

                {/* Attach */}
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={loading}
                  className="icon-btn"
                  aria-label={isAr ? 'إرفاق ملف أو صورة' : 'Attach file or image'}
                  title={isAr ? 'إرفاق ملف أو صورة' : 'Attach file or image'}
                  style={{
                    flexShrink: 0, width: 38, height: 38, borderRadius: 12,
                    border: 'none', background: 'none', cursor: loading ? 'default' : 'pointer',
                    color: 'var(--text-3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: loading ? 0.4 : 1, transition: 'opacity 0.15s, background 0.15s',
                  }}
                  onTouchStart={e => !loading && (e.currentTarget.style.background = 'var(--red-light)')}
                  onTouchEnd={e => (e.currentTarget.style.background = 'none')}>
                  <svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>
                <input ref={fileInputRef} type="file" accept="image/*,.pdf,.doc,.docx,.txt"
                  aria-label={isAr ? 'رفع ملف' : 'Upload file'} style={{ display: 'none' }} onChange={handleFileChange} />

                {/* Textarea */}
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={e => { setInput(e.target.value.slice(0, MAX_INPUT)); setEnhanceSuggestion(null); setVoiceJustEnded(false) }}
                  onKeyDown={e => { smartKeyDown(e); if (!e.defaultPrevented) handleKeyDown(e) }}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  aria-label={isAr ? 'اكتب سؤالك القانوني' : 'Type your legal question'}
                  placeholder={
                    recording
                      ? (isAr ? 'جاري الاستماع...' : 'Listening...')
                      : attachedFile
                        ? (isAr ? 'اسأل عن الوثيقة أو أرسل للتحليل...' : 'Ask about the document...')
                        : (isAr ? 'اكتب سؤالك هنا...' : 'Type your question here...')
                  }
                  rows={1}
                  disabled={loading}
                  dir={isAr ? 'rtl' : 'ltr'}
                  style={{
                    flex: 1, resize: 'none', border: 'none', outline: 'none',
                    fontSize: 14.5, color: 'var(--text)', background: 'transparent',
                    padding: '7px 4px', lineHeight: 1.55, maxHeight: 120,
                    overflowY: 'auto',
                    fontFamily: 'inherit', opacity: loading ? 0.5 : 1,
                  }}
                />

                {/* Enhance ✨ */}
                {input.trim().length > 3 && !recording && !attachedFile && (
                  <button type="button"
                    disabled={loading || enhancing}
                    onClick={() => enhancePrompt(input, setInput, setEnhancing)}
                    aria-label={isAr ? 'تحسين السؤال' : 'Enhance question'}
                    title={isAr ? 'تحسين السؤال بالذكاء الاصطناعي' : 'AI-enhance your question'}
                    className="icon-btn"
                    style={{
                      flexShrink:0, width:38, height:38, borderRadius:12, border:'none',
                      cursor:(loading||enhancing) ? 'default' : 'pointer',
                      background: enhancing ? 'var(--brand-soft)' : 'none',
                      color: enhancing ? 'var(--brand)' : 'var(--text-3)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      opacity:(loading||enhancing) ? 0.8 : 1,
                      transition:'background 0.15s, color 0.15s',
                    }}
                    onTouchStart={e => !loading && !enhancing && ((e.currentTarget as HTMLButtonElement).style.background='var(--brand-soft)')}
                    onTouchEnd={e => !enhancing && ((e.currentTarget as HTMLButtonElement).style.background='none')}>
                    {enhancing
                      ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{animation:'spin 0.8s linear infinite'}}><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                      : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
                    }
                  </button>
                )}

                {/* Mic */}
                <button type="button" onClick={recording ? stopRecording : startRecording} disabled={loading}
                  aria-label={recording ? (isAr ? 'إيقاف التسجيل' : 'Stop recording') : (isAr ? 'تسجيل صوتي' : 'Voice input')}
                  className={recording ? '' : 'icon-btn'}
                  style={{
                    flexShrink: 0, width: 38, height: 38, borderRadius: 12, border: 'none',
                    cursor: loading ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: recording ? 'var(--brand)' : 'none',
                    color: recording ? '#fff' : 'var(--text-3)',
                    opacity: loading ? 0.4 : 1, transition: 'background 0.15s, opacity 0.15s',
                  }}
                  onTouchStart={e => !loading && !recording && (e.currentTarget.style.background = 'var(--red-light)')}
                  onTouchEnd={e => !recording && (e.currentTarget.style.background = 'none')}>
                  <svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24"
                    fill={recording ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>

                {/* Send */}
                <button type="submit" disabled={!canSend}
                  aria-label={isAr ? 'إرسال' : 'Send'}
                  className="send-btn"
                  style={{
                    flexShrink: 0, width: 38, height: 38, borderRadius: 12, border: 'none',
                    cursor: canSend ? 'pointer' : 'default',
                    background: canSend ? 'var(--brand)' : 'var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.15s',
                  }}
                  onTouchStart={e => canSend && (e.currentTarget.style.transform = 'scale(0.91)')}
                  onTouchEnd={e => (e.currentTarget.style.transform = 'scale(1)')}>
                  {loading ? (
                    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none"
                      style={{ animation: 'spin 0.8s linear infinite' }}>
                      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                      <path fill="#fff" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  )}
                </button>
                </div>
              </div>
            </form>

          </div>}
        </footer>

        {/* Keyboard shortcuts help (floating ? button + modal) */}
        <KeyboardShortcutsHelp />

        {/* First-time user onboarding wizard */}
        <UserOnboarding onComplete={(_type) => { /* type stored in localStorage by component */ }} />

        {/* 24h appointment reminder toast */}
        <AppointmentReminder onAsk={q => sendMessage(q)} />

        {/* FeedbackWidget now renders inline within the chat message flow
            (see near ChatSummaryCard above) instead of here as a floating FAB. */}

        {/* FloatingHelpButton removed from the global floating stack (UX_AUDIT.md —
            "one floating button app-wide"). Its emergency numbers + FAQ link are
            now reachable via MobileMenu's "أرقام الوزارات والطوارئ" item and the
            existing FAQ nav item — no functionality lost. */}

        {/* Celebration overlay — shows when all started procedures are completed */}
        <ProcedureCompletionCelebration />

        {/* ══════════════ BOTTOM NAV (mobile) ══════════════ */}
        <div className="bottom-nav-wrapper">
          <BottomNav
            isAr={isAr}
            activeTab={messages.length > 0 ? 'chat' : 'home'}
            onHomeClick={() => { saveChatSession(messages); setMessages([]); setFollowupQuestions([]); setRetryMsg(null) }}
            onChatClick={() => { /* already in chat */ }}
          />
        </div>

      </div>

      {/* ══════════════ GUIDED FLOW MODAL ══════════════ */}
      {showGuide && (
        <GuidedFlow
          isAr={isAr}
          onSend={(msg) => { sendMessage(msg) }}
          onClose={() => setShowGuide(false)}
        />
      )}

      {/* ══ TRANSACTION STARTER (3-step wizard) ══════════ */}
      {showTransactionStarter && (
        <TransactionStarter
          isAr={isAr}
          onClose={() => setShowTransactionStarter(false)}
          onResult={(result) => {
            setShowTransactionStarter(false)
            if (result.goal === 'analyze') {
              fileInputRef.current?.click()
            } else if (result.goal === 'human_review') {
              const prompt = isAr
                ? 'أريد طلب مراجعة بشرية من مختص قانوني'
                : 'I want to request a human legal review'
              sendMessage(prompt)
            } else {
              // Map goal to a contextual prompt
              const goalPrompts: Record<string, [string, string]> = {
                documents: ['ما هي المستندات المطلوبة لهذه المعاملة؟', 'What documents are required for this transaction?'],
                checklist: ['أعطني checklist شامل لإتمام هذه المعاملة', 'Give me a comprehensive checklist to complete this transaction'],
                authority: ['ما هي الجهة المختصة وكيف أتصل بها؟', 'What is the responsible authority and how do I contact them?'],
              }
              const [arPrompt, enPrompt] = goalPrompts[result.goal] ?? ['ابدأ معاملة', 'Start a transaction']
              setShowGuide(true)
            }
          }}
        />
      )}

      {/* ══ SERVICE GROUP SHEET ══════════════════════════ */}
      <ServiceGroupSheet
        group={activeServiceGroup}
        isAr={isAr}
        onClose={() => setActiveServiceGroup(null)}
        onServiceSelect={(item: ServiceItem) => {
          setActiveServiceGroup(null)
          if (item.defaultAction === 'upload_document') {
            fileInputRef.current?.click()
          } else if (item.defaultAction === 'generate_checklist') {
            const prompt = isAr
              ? `أعطني checklist شامل لـ: ${item.titleAr}`
              : `Give me a comprehensive checklist for: ${item.titleEn}`
            sendMessage(prompt)
          } else if (item.defaultAction === 'start_flow') {
            setShowGuide(true)
          } else {
            const prompt = isAr ? (item.chatPromptAr ?? item.titleAr) : (item.chatPromptEn ?? item.titleEn)
            sendMessage(prompt)
          }
        }}
      />

      {/* ══ JOURNEY SHEET ══════════════════════════════ */}
      {activeJourney && (
        <JourneySheet
          journey={activeJourney}
          onClose={() => setActiveJourney(null)}
          onAsk={(q) => sendMessage(q)}
        />
      )}

      {/* ══════════════ MOBILE MENU DRAWER ══════════════ */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        isAr={isAr}
        lang={lang}
        onLangToggle={toggleLang}
        onHome={() => { saveChatSession(messages); setMessages([]); setFollowupQuestions([]); setRetryMsg(null) }}
        currentUser={currentUser}
        onAsk={q => sendMessage(q)}
        onJourneySelect={slug => {
          const j = getJourneyBySlug(slug)
          if (j) setActiveJourney(j)
        }}
      />
    </>
  )
}
