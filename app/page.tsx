'use client'

import React, { useState, useRef, useEffect, FormEvent, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import ChatMessage, { Message } from '@/components/ChatMessage'
import BottomNav from '@/components/BottomNav'
import GuidedFlow from '@/components/GuidedFlow'
import MobileMenu from '@/components/MobileMenu'
import ModeSelector from '@/components/MobileModeSheet'
import TopNav from '@/components/TopNav'
import { getToken, getUser, setUser, clearToken, authHeaders, isAdmin, type User } from '@/lib/auth'
import { sanitizeInput } from '@/lib/sanitize'
import TransactionStarter, { type StarterResult } from '@/components/TransactionStarter'
import ServiceGroupSheet from '@/components/ServiceGroupSheet'
import { SERVICE_GROUPS, type ServiceGroup, type ServiceItem } from '@/lib/serviceGroups'
import { useLanguage } from '@/lib/LanguageContext'
import { TX_ALL, TX_WITH_FORMS, TX_MINISTRIES } from '@/lib/allTransactions'
import { ALL_SERVICES } from '@/lib/allServices'

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

export default function Home() {
  const router = useRouter()
  const { lang, isAr, toggleLang } = useLanguage()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
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
  // Session restore — number of messages reloaded from localStorage
  const [restoredCount, setRestoredCount] = useState(0)

  // ── Enhance prompt via AI — reads /chat/stream, updates chips after ──
  const enhancePrompt = useCallback(async (text: string, setter: (v: string) => void, setLoading: (v: boolean) => void) => {
    if (!text.trim() || text.trim().length < 4) return
    setLoading(true)
    try {
      const enhanceMsg = isAr
        ? `حسّن هذا السؤال فقط — اكتب نسخة أوضح وأدق للسؤال التالي مع ذكر اسم المعاملة الحكومية إن كانت واضحة، بدون أي شرح أو مقدمة، السؤال المحسّن فقط:\n"${text}"`
        : `Improve this question only — rewrite it as a clearer, more specific Lebanese government procedure question. No explanation or preamble, just the improved question:\n"${text}"`

      const res = await fetch(`${API_URL}/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ message: enhanceMsg, history: [] }),
      })
      if (!res.ok || !res.body) return

      // Read streaming response chunks
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
            // backend sends {type:'token', text:...} — also handle legacy {token:...}
            const tok = json.text ?? json.token ?? ''
            if (tok && json.type !== 'meta' && json.type !== 'error') accumulated += tok
            if (json.done) break outer
          } catch { /* skip malformed */ }
        }
      }

      // Clean: strip quotes, bold, markdown, take first non-empty line
      const improved = accumulated
        .split('\n')
        .map(l => l.trim().replace(/^[\*\#"«»""]+|[\*\#"«»""]+$/g, '').trim())
        .find(l => l.length > 5) || ''

      if (improved && improved.length < 400) {
        setter(improved)

        // ── Generate contextual chips via a second /chat/stream call ──
        ;(async () => {
          try {
            const chipsMsg = isAr
              ? `بناءً على هذا السؤال: "${improved}"\nاكتب 4 أسئلة متابعة مختصرة جداً (سطر واحد لكل سؤال، بدون أرقام أو نقاط أو أي تنسيق، كل سؤال في سطر منفصل فقط):`
              : `Based on this question: "${improved}"\nWrite 4 short follow-up questions (one per line, no numbers, no bullets, no formatting — just the questions):`

            const r2 = await fetch(`${API_URL}/chat/stream`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', ...authHeaders() },
              body: JSON.stringify({ message: chipsMsg, history: [] }),
            })
            if (!r2.ok || !r2.body) return

            const reader2 = r2.body.getReader()
            const decoder2 = new TextDecoder()
            let raw = ''

            outer2: while (true) {
              const { done, value } = await reader2.read()
              if (done) break
              for (const line of decoder2.decode(value, { stream: true }).split('\n')) {
                if (!line.startsWith('data: ')) continue
                const p = line.slice(6)
                if (p === '[DONE]') break outer2
                try {
                  const j = JSON.parse(p)
                  const t = j.text ?? j.token ?? ''
                  if (t && j.type !== 'meta' && j.type !== 'error') raw += t
                  if (j.done) break outer2
                } catch { /* skip */ }
              }
            }

            const chips = raw
              .split('\n')
              .map(l => l.trim().replace(/^[\d\.\-\*\#]+\s*/, '').replace(/^["«»""]+|["«»""]+$/g, '').trim())
              .filter(l => l.length > 6 && l.length < 120)
              .slice(0, 4)

            if (chips.length >= 2) setVisibleQ(chips)
          } catch { /* silent */ }
        })()
      }
    } catch { /* silent */ } finally {
      setLoading(false)
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

  const pool = lang === 'ar' ? QUESTION_POOL_AR : QUESTION_POOL_EN

  // ── Handle ?q= param + ?draft=true from other pages ─────────
  useEffect(() => {
    if (!authChecked) return
    const params = new URLSearchParams(window.location.search)
    const q = params.get('q')
    if (q) {
      window.history.replaceState({}, '', '/')
      sendMessage(q)
      return
    }
    // DraftingStudio sends ?draft=true + stores prompt in sessionStorage
    const isDraft = params.get('draft') === 'true'
    if (isDraft) {
      window.history.replaceState({}, '', '/')
      const draft = sessionStorage.getItem('dalilak_draft_prompt')
      if (draft) {
        sessionStorage.removeItem('dalilak_draft_prompt')
        sendMessage(draft)
      }
    }
  }, [authChecked])

  // ── Auth guard ────────────────────────────────────────────
  // Strategy: show UI instantly from cached user, validate in background.
  // This hides the Render cold-start delay (up to 30s on free tier).
  useEffect(() => {
    const token = getToken()
    if (!token) { router.push('/login'); return }

    // Wake the backend early (fire-and-forget — don't await)
    fetch(`${API_URL}/ping`).catch(() => {})

    // Instant render: use cached user if available
    const cached = getUser()
    if (cached) {
      setCurrentUser(cached)
      setAuthChecked(true)
    }

    // Background validation — update user data silently
    fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(async res => {
      if (!res.ok) { clearToken(); localStorage.removeItem(CHAT_HISTORY_KEY); router.push('/login'); return }
      const data = await res.json()
      setUser(data)          // refresh localStorage cache
      setCurrentUser(data)
      if (!cached) setAuthChecked(true)   // first login: no cache yet
    }).catch(() => {
      // Network error — keep showing cached user
      if (!cached) setAuthChecked(true)
    })
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
    const refresh = () => setVisibleQ(shufflePick(pool, 3))
    refresh()
    const interval = setInterval(refresh, 8000)
    return () => clearInterval(interval)
  }, [lang])

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
    if (!SR) { setVoiceError(isAr ? 'التعرف على الصوت غير مدعوم في هذا المتصفح.' : 'Voice input not supported. Use Chrome or Edge.'); return }
    const recognition = new SR()
    recognition.lang = lang === 'ar' ? 'ar-LB' : 'en-US'
    recognition.continuous = false
    recognition.interimResults = true
    recognition.onresult = (e: Event & { results: SpeechRecognitionResultList }) => {
      const results = Array.from(e.results)
      setInput(results.map(r => r[0].transcript).join(''))
    }
    recognition.onerror = () => setRecording(false)
    recognition.onend = () => setRecording(false)
    recognition.start()
    recognitionRef.current = recognition
    setRecording(true)
  }, [lang])

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
  }, [])

  const formatSize = (b: number) => b < 1048576 ? Math.round(b / 1024) + ' KB' : (b / 1048576).toFixed(1) + ' MB'
  const getFileIcon = (t: string) => t.startsWith('image/') ? 'IMG' : t === 'application/pdf' ? 'PDF' : t.includes('word') ? 'DOC' : 'FILE'

  // ── Send ──────────────────────────────────────────────────
  const sendMessage = async (text: string, file?: AttachedFile | null, overrideMode?: ResponseMode) => {
    const hasContent = text.trim() || file
    if (!hasContent || loading) return
    setFollowupQuestions([])
    setRetryMsg(null)

    // ── Sanitize input ────────────────────────────────────────
    const { clean: cleanText, flagged } = sanitizeInput(text)
    if (flagged) {
      setMessages(prev => [...prev,
        { role: 'user', content: cleanText },
        { role: 'assistant', content: isAr ? 'تعذّر معالجة هذا الطلب. يرجى إعادة صياغة السؤال.' : 'This request could not be processed. Please rephrase your question.', streaming: false },
      ])
      return
    }

    const activeMode = MODES.find(m => m.id === (overrideMode || mode))!
    const modePrefix = lang === 'en' ? activeMode.prefix_en : activeMode.prefix
    const prefixedMessage = file
      ? cleanText || 'حلل هذه الوثيقة واقترح الإجراءات المناسبة'
      : modePrefix + cleanText

    const displayText = file
      ? (cleanText ? `${getFileIcon(file.type)} **${file.name}**\n${cleanText}` : `${getFileIcon(file.type)} **${file.name}** — طلب تحليل الوثيقة`)
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
                document_text: `[File: ${file.name}, Type: ${file.type}] — تحليل المستند المرفوع`,
                filename: file.name,
                document_id: Date.now().toString(36),
              }),
            })
            if (extractRes.ok) {
              const analysis = await extractRes.json()
              if (analysis?.kind === 'universal_document_analysis') {
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
          body: JSON.stringify({ question: prefixedMessage.slice(0, 300), answer: accumulated.slice(0, 600) }),
        })
          .then(r => r.ok ? r.json() : null)
          .then(d => { if (d?.questions?.length) setFollowupQuestions(d.questions.slice(0, 3)) })
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

  const handleSubmit = (e: FormEvent) => { e.preventDefault(); sendMessage(input, attachedFile) }
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input, attachedFile) }
  }

  const canSend = Boolean((input.trim() || attachedFile) && !loading)
  const MAX_INPUT = 4000
  const showCharCount = input.length > 3000

  if (!authChecked) return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#F8F8F6', gap:20 }}>
      <style>{`@keyframes auth-dot { 0%,80%,100%{transform:translateY(0);opacity:0.3} 40%{transform:translateY(-6px);opacity:1} }`}</style>
      <div style={{ width:64, height:64, borderRadius:18, background:'#F8EDEF', border:'1.5px solid rgba(143,29,44,0.15)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 20px rgba(143,29,44,0.12)' }}>
        <img src="/logo-icon.png" alt="دليلك" style={{ width:42, height:42, objectFit:'contain' }} />
      </div>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:18, fontWeight:900, color:'#191713', letterSpacing:'-0.5px', marginBottom:4 }}>{isAr ? 'دليلك' : 'Dalilak'}</div>
        <div style={{ fontSize:11, color:'#918B82', fontWeight:500 }}>{isAr ? 'الدليل الحكومي الذكي' : 'Smart Government Guide'}</div>
      </div>
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
          --red: #8F1D2C;
          --red-dark: #741622;
          --red-light: #F8EDEF;
          --gold: #B76B00;
          --gold-light: #FFFBEB;
          --bg: #F8F8F6;
          --card: #FFFFFF;
          --border: #E6E2DC;
          --border-strong: #D5D0C8;
          --text: #191713;
          --text-2: #69645C;
          --text-3: #918B82;
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
        @keyframes heroIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .msg-in { animation: fadeUp 0.25s cubic-bezier(0.22,1,0.36,1) both; }
        .quick-btn { animation: slideQ 0.28s cubic-bezier(0.22,1,0.36,1) both; }
        .wlc-hero-band { animation: heroIn 0.35s cubic-bezier(0.22,1,0.36,1) both; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 4px; }
        /* quick-btn hover is handled via inline onMouseEnter/Leave */
        .mode-btn { transition: background 0.15s, color 0.15s, box-shadow 0.18s cubic-bezier(0.22,1,0.36,1); }
        .mode-btn:hover { background: rgba(255,255,255,0.22) !important; }
        .send-btn:hover:not(:disabled) { background: var(--red-dark) !important; transform: scale(1.05); }
        .icon-btn:hover:not(:disabled) { background: var(--red-light) !important; color: var(--red) !important; }
        .lang-btn:hover { background: rgba(255,255,255,0.22) !important; }

        /* ── Welcome screen responsive layout ─────────────────────── */
        .wlc-stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
        .wlc-nav-chip { }
        .wlc-svc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 7px; }
        .wlc-svc-btn:hover { border-color: #8F1D2C !important; background: #FEF7F7 !important; box-shadow: 0 4px 14px rgba(143,29,44,0.09) !important; transform: translateY(-2px) !important; }
        /* Stagger entrance for service group cards */
        .wlc-svc-grid > :nth-child(1) { animation: fadeUp 0.32s cubic-bezier(0.22,1,0.36,1) both; animation-delay: 0.30s; }
        .wlc-svc-grid > :nth-child(2) { animation: fadeUp 0.32s cubic-bezier(0.22,1,0.36,1) both; animation-delay: 0.36s; }
        .wlc-svc-grid > :nth-child(3) { animation: fadeUp 0.32s cubic-bezier(0.22,1,0.36,1) both; animation-delay: 0.42s; }
        .wlc-svc-grid > :nth-child(4) { animation: fadeUp 0.32s cubic-bezier(0.22,1,0.36,1) both; animation-delay: 0.47s; }
        .wlc-svc-grid > :nth-child(5) { animation: fadeUp 0.32s cubic-bezier(0.22,1,0.36,1) both; animation-delay: 0.52s; }
        .wlc-svc-grid > :nth-child(6) { animation: fadeUp 0.32s cubic-bezier(0.22,1,0.36,1) both; animation-delay: 0.56s; }
        .wlc-svc-grid > :nth-child(7) { animation: fadeUp 0.32s cubic-bezier(0.22,1,0.36,1) both; animation-delay: 0.60s; }
        .wlc-svc-grid > :nth-child(8) { animation: fadeUp 0.32s cubic-bezier(0.22,1,0.36,1) both; animation-delay: 0.64s; }
        /* Quick-q pill hover lift */
        .quick-btn:hover { transform: translateY(-1px) !important; border-color: rgba(143,29,44,0.25) !important; box-shadow: 0 2px 8px rgba(0,0,0,0.08) !important; }
        /* Input focused: subtle scale */
        .input-focused { border-color: var(--red) !important; box-shadow: 0 0 0 3px rgba(143,29,44,0.08), 0 2px 12px rgba(143,29,44,0.06) !important; transform: scale(1.004); }
        /* Followup chip entrance */
        .followup-chip { animation: slideQ 0.22s cubic-bezier(0.22,1,0.36,1) both; }
        @media (min-width: 640px) {
          .wlc-stats-grid { grid-template-columns: repeat(4, 1fr); gap: 10px; }
          .wlc-svc-grid   { grid-template-columns: repeat(3, 1fr); gap: 10px; }
        }
        /* How-it-works: 3 cols always, tighter on narrow screens */
        @media (max-width: 400px) {
          .wlc-how-grid > div { padding: 10px 6px 8px !important; }
          .wlc-how-grid > div > div:last-child { display: none; }
        }
        /* ── Homepage v3 grid classes ── */
        .hl { display:grid; gap:clamp(32px,5vw,48px); }
        @media (min-width:900px) { .hl { grid-template-columns:1fr 420px; align-items:center; } }
        .hp { display:none !important; }
        @media (min-width:900px) { .hp { display:block !important; } }
        .pgrid { display:grid; grid-template-columns:1fr; gap:16px; }
        @media (min-width:640px) { .pgrid { grid-template-columns:repeat(2,1fr); } }
        @media (min-width:1024px) { .pgrid { grid-template-columns:repeat(3,1fr); } }
        .pcard { background:var(--surface,#fff); border:1px solid var(--border,#E6E2DC); border-radius:14px; padding:20px; cursor:pointer; font-family:inherit; display:flex; flex-direction:column; transition:border-color 0.15s, box-shadow 0.15s, transform 0.15s; width:100%; }
        .pcard:hover { border-color:rgba(143,29,44,0.20); box-shadow:0 4px 12px rgba(0,0,0,0.08); transform:translateY(-2px); }
        .pcard:active { transform:scale(0.98) !important; }
        .hwgrid { display:grid; grid-template-columns:1fr; gap:16px; }
        @media (min-width:640px) { .hwgrid { grid-template-columns:repeat(3,1fr); gap:24px; } }
        .tgrid { display:grid; grid-template-columns:1fr; gap:12px; }
        @media (min-width:640px) { .tgrid { grid-template-columns:repeat(2,1fr); } }
        @media (min-width:1024px) { .tgrid { grid-template-columns:repeat(4,1fr); } }
        .fgrid { display:grid; grid-template-columns:1fr 1fr; gap:32px; }
        @media (min-width:768px) { .fgrid { grid-template-columns:2fr 1fr 1fr; } }
        .hsearch:focus-within { border-color:var(--brand,#8F1D2C) !important; box-shadow:0 0 0 3px rgba(143,29,44,0.12) !important; }
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
          onNewChat={() => { setMessages([]); setFollowupQuestions([]); setRetryMsg(null) }}
          onMenuOpen={() => setMobileMenuOpen(true)}
          onStartGuide={() => setShowGuide(true)}
          showGuideBtn={messages.length === 0}
        />


        {/* ══════════════ MAIN ══════════════ */}
        <main id="main-content" ref={mainRef} style={{
          flex: 1, overflowY: 'auto',
          overscrollBehavior: 'contain',
          WebkitOverflowScrolling: 'touch' as any,
        }}>
          {messages.length === 0 ? (

            /* ══ Welcome Screen v3 ══ */
            <div style={{ minHeight:'100%', background:'var(--bg-page)', direction: isAr ? 'rtl' : 'ltr' }}>

              {/* ══ HERO ══ */}
              <section style={{ background:'var(--surface)', borderBottom:'1px solid var(--border)', padding:'clamp(48px,6vw,88px) 0 clamp(56px,7vw,96px)' }}>
                <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 clamp(16px,3vw,32px)' }}>
                  <div className="hl">

                    {/* ── Left Column ── */}
                    <div>
                      {/* Badge */}
                      <div style={{ display:'inline-flex', alignItems:'center', gap:8, marginBottom:24, padding:'6px 16px 6px 10px', borderRadius:999, background:'var(--brand-soft)', border:'1px solid var(--brand-ring)' }}>
                        <img src="/logo-icon.png" alt="" aria-hidden="true" style={{ width:20, height:20, objectFit:'contain', borderRadius:4 }} />
                        <span style={{ fontSize:12, fontWeight:700, color:'var(--brand)', letterSpacing:'0.2px' }}>
                          {isAr ? 'دليلك — الدليل الحكومي الذكي' : 'Dalilak — Smart Government Guide'}
                        </span>
                      </div>

                      {/* H1 */}
                      <h1 style={{ fontSize:'clamp(30px,5vw,54px)', fontWeight:800, color:'var(--text-1)', margin:'0 0 16px', lineHeight:1.1, letterSpacing:'-1px' }}>
                        {isAr
                          ? <>{`أنجز معاملتك الحكومية`}<br/><span style={{ color:'var(--brand)' }}>بخطوات واضحة</span></>
                          : <>{`Navigate Lebanon's`}<br/><span style={{ color:'var(--brand)' }}>Government System</span></>
                        }
                      </h1>

                      {/* Description */}
                      <p style={{ fontSize:'clamp(15px,2vw,17px)', color:'var(--text-2)', margin:'0 0 28px', lineHeight:1.7, maxWidth:480 }}>
                        {isAr
                          ? 'اسأل عن أي معاملة حكومية — دليلك يوجّهك خطوة بخطوة بمصادر رسمية محدّثة'
                          : 'Ask about any government procedure — step-by-step guidance from official Lebanese sources'
                        }
                      </p>

                      {/* CTAs */}
                      <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:28 }}>
                        <button type="button"
                          onClick={() => sendMessage(isAr ? 'مرحباً، أريد مساعدة في معاملة حكومية' : 'Hello, I need help with a government procedure')}
                          style={{ height:44, padding:'0 22px', borderRadius:11, border:'none', background:'var(--brand)', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:7, boxShadow:'var(--shadow-brand)', transition:'background 0.14s, transform 0.14s' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background='var(--brand-hover)'; (e.currentTarget as HTMLButtonElement).style.transform='translateY(-1px)' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background='var(--brand)'; (e.currentTarget as HTMLButtonElement).style.transform='' }}
                        >
                          <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
                          {isAr ? 'اسأل دليلك' : 'Ask Dalilak'}
                        </button>
                        <button type="button"
                          onClick={() => router.push('/procedures')}
                          style={{ height:44, padding:'0 22px', borderRadius:11, border:'1.5px solid var(--border-strong)', background:'transparent', color:'var(--text-1)', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:7, transition:'border-color 0.14s, background 0.14s, color 0.14s' }}
                          onMouseEnter={e => { const t = e.currentTarget as HTMLButtonElement; t.style.borderColor='var(--brand)'; t.style.background='var(--brand-soft)'; t.style.color='var(--brand)' }}
                          onMouseLeave={e => { const t = e.currentTarget as HTMLButtonElement; t.style.borderColor='var(--border-strong)'; t.style.background='transparent'; t.style.color='var(--text-1)' }}
                        >
                          {isAr ? 'تصفح المعاملات' : 'Browse Procedures'}
                        </button>
                      </div>

                      {/* Search bar */}
                      <form
                        className="hsearch"
                        onSubmit={e => { e.preventDefault(); if (heroInput.trim()) { sendMessage(heroInput); setHeroInput('') } }}
                        style={{ display:'flex', alignItems:'center', height:56, background:'var(--surface)', border:'1.5px solid var(--border)', borderRadius:14, overflow:'hidden', transition:'border-color 0.15s, box-shadow 0.15s', marginBottom:16, maxWidth:540 }}
                      >
                        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2.2" style={{ flexShrink:0, margin:'0 14px' }}>
                          <circle cx="11" cy="11" r="7"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/>
                        </svg>
                        <input
                          type="text"
                          value={heroInput}
                          onChange={e => setHeroInput(e.target.value)}
                          placeholder={isAr ? 'اكتب اسم المعاملة أو سؤالك...' : 'Type a procedure or ask a question...'}
                          dir={isAr ? 'rtl' : 'ltr'}
                          style={{ flex:1, height:'100%', border:'none', outline:'none', background:'transparent', fontSize:14.5, fontFamily:'inherit', fontWeight:500, color:'var(--text-1)' }}
                        />
                        {heroInput.trim().length > 3 && (
                          <button type="button"
                            disabled={heroEnhancing}
                            onClick={() => enhancePrompt(heroInput, setHeroInput, setHeroEnhancing)}
                            aria-label={isAr ? 'تحسين السؤال' : 'Enhance question'}
                            title={isAr ? 'تحسين السؤال بالذكاء الاصطناعي' : 'AI-enhance your question'}
                            style={{ flexShrink:0, height:'100%', padding:'0 13px', border:'none', borderInlineStart:'1.5px solid var(--border)', background:'var(--brand-soft)', color:'var(--brand)', fontSize:12, fontWeight:700, cursor: heroEnhancing ? 'default' : 'pointer', fontFamily:'inherit', transition:'background 0.14s', display:'flex', alignItems:'center', gap:5, whiteSpace:'nowrap' }}
                            onMouseEnter={e => !heroEnhancing && ((e.currentTarget as HTMLButtonElement).style.background = '#FDDDE2')}
                            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = 'var(--brand-soft)')}>
                            {heroEnhancing
                              ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation:'spin 0.8s linear infinite' }}><circle cx="12" cy="12" r="10" strokeOpacity="0.2"/><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                              : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 3l1.5 4.5L11 9l-4.5 1.5L5 15l-1.5-4.5L-1 9l4.5-1.5zM19 3l1 3 3 1-3 1-1 3-1-3-3-1 3-1z"/></svg>
                            }
                            {isAr ? 'حسّن' : 'Enhance'}
                          </button>
                        )}
                        <button type="submit" disabled={!heroInput.trim()}
                          style={{ flexShrink:0, height:'100%', padding:'0 18px', border:'none', borderInlineStart:'1.5px solid var(--border)', background: heroInput.trim() ? 'var(--brand)' : 'var(--surface-2)', color: heroInput.trim() ? '#fff' : 'var(--text-3)', fontSize:13, fontWeight:700, cursor: heroInput.trim() ? 'pointer' : 'default', fontFamily:'inherit', transition:'background 0.14s, color 0.14s', whiteSpace:'nowrap' }}>
                          {isAr ? 'بحث' : 'Search'}
                        </button>
                      </form>

                      {/* Suggestion chips */}
                      {visibleQ.length > 0 && (
                        <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                          {visibleQ.slice(0, 4).map((q, i) => (
                            <button key={i} type="button"
                              onClick={() => sendMessage(q)}
                              className="quick-btn"
                              style={{ padding:'6px 14px', borderRadius:999, background:'var(--surface)', border:'1px solid var(--border)', color:'var(--text-2)', fontSize:12, fontWeight:500, cursor:'pointer', fontFamily:'inherit', display:'inline-flex', alignItems:'center', gap:5, animationDelay:`${i*0.06}s`, whiteSpace:'nowrap', maxWidth:220, overflow:'hidden', textOverflow:'ellipsis', boxShadow:'var(--shadow-xs)', transition:'border-color 0.14s, color 0.14s' }}
                              onMouseEnter={e => { const t = e.currentTarget as HTMLButtonElement; t.style.borderColor='var(--border-brand)'; t.style.color='var(--brand)' }}
                              onMouseLeave={e => { const t = e.currentTarget as HTMLButtonElement; t.style.borderColor='var(--border)'; t.style.color='var(--text-2)' }}
                            >
                              <svg aria-hidden="true" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2.5"><circle cx="11" cy="11" r="7"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/></svg>
                              {q.length > 32 ? q.slice(0,30)+'…' : q}
                            </button>
                          ))}
                        </div>
                      )}
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
                                  style={{ width: idx===displayCard ? 20 : 6, height:6, borderRadius:3, border:'none', cursor:'pointer', padding:0, transition:'all 0.32s cubic-bezier(0.34,1.56,0.64,1)', background: idx===displayCard ? 'var(--brand)' : 'var(--border)', flexShrink:0 }}
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

              {/* ══ PROCEDURES ══ */}
              <section style={{ padding:'clamp(48px,5vw,80px) 0', background:'var(--bg-page)' }}>
                <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 clamp(16px,3vw,32px)' }}>
                  <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:24, gap:16 }}>
                    <div>
                      <h2 style={{ fontSize:'clamp(20px,3vw,28px)', fontWeight:800, color:'var(--text-1)', margin:'0 0 4px', letterSpacing:'-0.4px' }}>
                        {isAr ? 'الإجراءات الأكثر طلباً' : 'Most Requested Procedures'}
                      </h2>
                      <p style={{ fontSize:13.5, color:'var(--text-3)', margin:0 }}>
                        {isAr ? 'اضغط على أي معاملة للحصول على خطوات مفصّلة' : 'Tap any procedure for step-by-step guidance'}
                      </p>
                    </div>
                    <button type="button" onClick={() => router.push('/procedures')}
                      style={{ fontSize:13, fontWeight:600, color:'var(--brand)', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:4, whiteSpace:'nowrap', flexShrink:0 }}>
                      {isAr ? 'كل المعاملات' : 'All'}
                      <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d={isAr ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'}/></svg>
                    </button>
                  </div>
                  <div className="pgrid">
                    {([
                      { ar:'استخراج جواز السفر', en:'Passport Application', authAr:'الأمن العام', authEn:'General Security', stepsAr:'4 خطوات', stepsEn:'4 Steps', pAr:'كيف أستخرج أو أجدد جواز سفري اللبناني؟', pEn:'How do I get or renew my Lebanese passport?', icon:<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0"/></svg> },
                      { ar:'إخراج قيد فردي', en:'Civil Registry Extract', authAr:'السجل المدني', authEn:'Civil Registry', stepsAr:'3 خطوات', stepsEn:'3 Steps', pAr:'كيف أستخرج إخراج قيد فردي من السجل المدني؟', pEn:'How do I get a civil registry extract?', icon:<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg> },
                      { ar:'تسجيل شركة', en:'Company Registration', authAr:'وزارة الاقتصاد', authEn:'Ministry of Economy', stepsAr:'7 خطوات', stepsEn:'7 Steps', pAr:'كيف أسجّل شركة في لبنان وما هي الخطوات؟', pEn:'How do I register a company in Lebanon?', icon:<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg> },
                      { ar:'تسجيل سيارة جديدة', en:'Vehicle Registration', authAr:'مصلحة تسجيل السيارات', authEn:'Vehicle Registration', stepsAr:'5 خطوات', stepsEn:'5 Steps', pAr:'كيف أسجّل سيارة جديدة في لبنان؟', pEn:'How do I register a new vehicle in Lebanon?', icon:<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg> },
                      { ar:'تجديد رخصة القيادة', en:"Driver's License Renewal", authAr:'مصلحة تسجيل السيارات', authEn:'Vehicle Registration', stepsAr:'4 خطوات', stepsEn:'4 Steps', pAr:'كيف أجدد رخصة القيادة في لبنان؟', pEn:"How do I renew my driver's license in Lebanon?", icon:<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg> },
                      { ar:'تجديد إقامة الأجانب', en:'Residency Renewal', authAr:'الأمن العام', authEn:'General Security', stepsAr:'5 خطوات', stepsEn:'5 Steps', pAr:'كيف أجدد إقامة أجنبي في لبنان؟', pEn:"How do I renew a foreigner's residency in Lebanon?", icon:<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 004 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> },
                    ] as {ar:string;en:string;authAr:string;authEn:string;stepsAr:string;stepsEn:string;pAr:string;pEn:string;icon:React.ReactNode}[]).map(p => (
                      <button type="button" key={p.en}
                        onClick={() => sendMessage(isAr ? p.pAr : p.pEn)}
                        className="pcard"
                        style={{ textAlign: isAr ? 'right' : 'left' }}
                      >
                        <div style={{ width:44, height:44, borderRadius:12, background:'var(--brand-soft)', border:'1px solid var(--brand-ring)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--brand)', marginBottom:14 }}>
                          {p.icon}
                        </div>
                        <div style={{ fontSize:15, fontWeight:700, color:'var(--text-1)', marginBottom:6, lineHeight:1.3 }}>
                          {isAr ? p.ar : p.en}
                        </div>
                        <div style={{ display:'flex', gap:8, marginTop:'auto', paddingTop:12, flexWrap:'wrap' }}>
                          <span style={{ fontSize:11.5, color:'var(--text-3)', background:'var(--surface-2)', borderRadius:6, padding:'3px 8px' }}>{isAr ? p.authAr : p.authEn}</span>
                          <span style={{ fontSize:11.5, color:'var(--brand)', background:'var(--brand-soft)', borderRadius:6, padding:'3px 8px' }}>{isAr ? p.stepsAr : p.stepsEn}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              {/* ══ CATEGORIES ══ */}
              <section style={{ background:'var(--surface)', padding:'clamp(32px,4vw,56px) 0', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)' }}>
                <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 clamp(16px,3vw,32px)' }}>
                  <h3 style={{ fontSize:11, fontWeight:700, color:'var(--text-3)', letterSpacing:'1px', textTransform:'uppercase', marginBottom:16 }}>
                    {isAr ? 'تصفّح حسب الفئة' : 'Browse by Category'}
                  </h3>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
                    {([
                      { ar:'الأحوال الشخصية',             en:'Personal Status',       q_ar:'ما هي معاملات الأحوال الشخصية في لبنان؟',        q_en:'What are personal status procedures in Lebanon?' },
                      { ar:'السفر والإقامة',               en:'Travel & Residency',    q_ar:'ما هي إجراءات السفر والإقامة في لبنان؟',          q_en:'What are travel and residency procedures in Lebanon?' },
                      { ar:'الشركات والأعمال',             en:'Business',              q_ar:'كيف أسجّل شركة أو أبدأ عمل تجاري في لبنان؟',     q_en:'How do I register a business in Lebanon?' },
                      { ar:'السيارات والنقل',              en:'Vehicles & Transport',  q_ar:'ما هي إجراءات السيارات والنقل في لبنان؟',         q_en:'What are vehicle and transport procedures in Lebanon?' },
                      { ar:'العقارات',                     en:'Real Estate',           q_ar:'ما هي إجراءات العقارات وتسجيل الملكية في لبنان؟', q_en:'What are real estate procedures in Lebanon?' },
                      { ar:'البلديات',                     en:'Municipalities',        q_ar:'ما هي خدمات البلديات في لبنان؟',                   q_en:'What are municipality services in Lebanon?' },
                      { ar:'الكاتب العدل',                 en:'Notary Public',         q_ar:'ما هي خدمات الكاتب العدل في لبنان؟',               q_en:'What are notary public services in Lebanon?' },
                      { ar:'التعليم',                      en:'Education',             q_ar:'ما هي إجراءات التعليم في لبنان؟',                   q_en:'What are education procedures in Lebanon?' },
                      { ar:'العمل والضمان',                en:'Labor & Social Security',q_ar:'ما هي إجراءات العمل والضمان الاجتماعي في لبنان؟', q_en:'What are labor and social security procedures in Lebanon?' },
                      { ar:'القضاء والمعاملات القانونية', en:'Legal Procedures',       q_ar:'ما هي الإجراءات القضائية والقانونية في لبنان؟',    q_en:'What are legal and court procedures in Lebanon?' },
                    ] as {ar:string;en:string;q_ar:string;q_en:string}[]).map(cat => (
                      <button type="button" key={cat.en}
                        onClick={() => sendMessage(isAr ? cat.q_ar : cat.q_en)}
                        style={{ padding:'9px 18px', borderRadius:999, background:'var(--surface-2)', border:'1px solid var(--border)', color:'var(--text-2)', fontSize:13.5, fontWeight:600, cursor:'pointer', fontFamily:'inherit', transition:'background 0.13s, border-color 0.13s, color 0.13s' }}
                        onMouseEnter={e => { const t = e.currentTarget as HTMLButtonElement; t.style.background='var(--brand-soft)'; t.style.borderColor='var(--border-brand)'; t.style.color='var(--brand)' }}
                        onMouseLeave={e => { const t = e.currentTarget as HTMLButtonElement; t.style.background='var(--surface-2)'; t.style.borderColor='var(--border)'; t.style.color='var(--text-2)' }}
                      >
                        {isAr ? cat.ar : cat.en}
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              {/* ══ HOW IT WORKS ══ */}
              <section style={{ background:'var(--surface-muted)', padding:'clamp(48px,5vw,80px) 0', borderBottom:'1px solid var(--border)' }}>
                <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 clamp(16px,3vw,32px)' }}>
                  <div style={{ textAlign:'center', marginBottom:36 }}>
                    <h2 style={{ fontSize:'clamp(20px,3vw,28px)', fontWeight:800, color:'var(--text-1)', margin:'0 0 8px', letterSpacing:'-0.4px' }}>
                      {isAr ? 'كيف يعمل دليلك؟' : 'How does Dalilak work?'}
                    </h2>
                    <p style={{ fontSize:14, color:'var(--text-3)', margin:0 }}>
                      {isAr ? 'ثلاث خطوات تفصلك عن أي إجابة حكومية' : 'Three steps to any government answer'}
                    </p>
                  </div>
                  <div className="hwgrid">
                    {([
                      { num:'1', numAr:'١', ar:'اطرح سؤالك', en:'Ask Your Question', descAr:'اكتب اسم المعاملة أو صف وضعك بكلماتك — عربي أو إنجليزي', descEn:'Type the procedure or describe your situation — Arabic or English', color:'var(--brand)' },
                      { num:'2', numAr:'٢', ar:'راجع الخطوات', en:'Review the Steps', descAr:'خطوات مرتّبة مع المستندات والجهات المختصة والرسوم', descEn:'Organized steps with required documents, authorities, and fees', color:'#1d4ed8' },
                      { num:'3', numAr:'٣', ar:'تابع بثقة', en:'Proceed with Confidence', descAr:'كل المعلومات مستندة إلى مصادر رسمية لبنانية محدّثة', descEn:'All information backed by updated official Lebanese sources', color:'var(--success)' },
                    ] as {num:string;numAr:string;ar:string;en:string;descAr:string;descEn:string;color:string}[]).map(step => (
                      <div key={step.num} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, padding:'28px 24px', textAlign:'center' }}>
                        <div style={{ width:48, height:48, borderRadius:'50%', background:step.color, color:'#fff', fontSize:20, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 18px' }}>
                          {isAr ? step.numAr : step.num}
                        </div>
                        <div style={{ fontSize:16, fontWeight:700, color:'var(--text-1)', marginBottom:10 }}>{isAr ? step.ar : step.en}</div>
                        <div style={{ fontSize:13.5, color:'var(--text-2)', lineHeight:1.65 }}>{isAr ? step.descAr : step.descEn}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* ══ TRUST ══ */}
              <section style={{ background:'var(--surface)', padding:'clamp(40px,5vw,72px) 0', borderBottom:'1px solid var(--border)' }}>
                <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 clamp(16px,3vw,32px)' }}>
                  <div className="tgrid">
                    {([
                      { ar:'مصادر رسمية فقط', en:'Official Sources Only', descAr:'كل المعلومات مستقاة من المواقع والوثائق الرسمية للحكومة اللبنانية', descEn:'All information sourced from official Lebanese government websites and documents', color:'var(--success)', icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg> },
                      { ar:'متاح ٢٤ ساعة', en:'Available 24/7', descAr:'دليلك متاح دائماً — بلا طوابير ولا أوقات دوام', descEn:'Always available — no queues, no office hours', color:'var(--brand)', icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><circle cx="12" cy="12" r="9"/><path strokeLinecap="round" d="M12 7v5l3 3"/></svg> },
                      { ar:'خصوصية كاملة', en:'Full Privacy', descAr:'لا نحتفظ ببياناتك الشخصية — محادثاتك خاصة بك تماماً', descEn:"We don't store your personal data — your conversations stay private", color:'#1d4ed8', icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
                      { ar:'عربي وإنجليزي', en:'Arabic & English', descAr:'اسأل بأي لغة — دليلك يجيبك بنفس اللغة التي تختارها', descEn:'Ask in either language — Dalilak responds in your chosen language', color:'#7c3aed', icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"/></svg> },
                    ] as {ar:string;en:string;descAr:string;descEn:string;color:string;icon:React.ReactNode}[]).map(trust => (
                      <div key={trust.en} style={{ background:'var(--surface-muted)', border:'1px solid var(--border)', borderRadius:16, padding:'24px 20px', display:'flex', gap:16, alignItems:'flex-start' }}>
                        <div style={{ width:44, height:44, borderRadius:12, background:'var(--surface)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', color:trust.color, flexShrink:0 }}>
                          {trust.icon}
                        </div>
                        <div>
                          <div style={{ fontSize:14.5, fontWeight:700, color:'var(--text-1)', marginBottom:5 }}>{isAr ? trust.ar : trust.en}</div>
                          <div style={{ fontSize:13, color:'var(--text-2)', lineHeight:1.6 }}>{isAr ? trust.descAr : trust.descEn}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* ══ FOOTER ══ */}
              <footer style={{ background:'#191713', padding:'clamp(40px,5vw,64px) 0 clamp(24px,3vw,40px)' }}>
                <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 clamp(16px,3vw,32px)' }}>
                  <div className="fgrid" style={{ marginBottom:40 }}>
                    {/* Brand col */}
                    <div>
                      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
                        <div style={{ width:36, height:36, borderRadius:10, background:'var(--brand-soft)', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
                          <img src="/logo-icon.png" alt="دليلك" style={{ width:26, height:26, objectFit:'contain' }} />
                        </div>
                        <div>
                          <div style={{ fontSize:16, fontWeight:800, color:'#fff', lineHeight:1 }}>{isAr ? 'دليلك' : 'Dalilak'}</div>
                          <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginTop:2 }}>{isAr ? 'الدليل الحكومي الذكي' : 'Smart Government Guide'}</div>
                        </div>
                      </div>
                      <p style={{ fontSize:13, color:'rgba(255,255,255,0.45)', lineHeight:1.7, maxWidth:300, margin:0 }}>
                        {isAr
                          ? 'منصة ذكية تساعد المواطنين اللبنانيين على فهم الإجراءات الحكومية بسهولة وثقة.'
                          : 'A smart platform helping Lebanese citizens understand government procedures with confidence.'
                        }
                      </p>
                      <button type="button" onClick={toggleLang}
                        style={{ marginTop:20, display:'inline-flex', alignItems:'center', gap:6, padding:'7px 16px', borderRadius:20, border:'1px solid rgba(255,255,255,0.12)', background:'rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.6)', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit', transition:'background 0.13s, color 0.13s' }}
                        onMouseEnter={e => { const t = e.currentTarget as HTMLButtonElement; t.style.background='rgba(255,255,255,0.10)'; t.style.color='#fff' }}
                        onMouseLeave={e => { const t = e.currentTarget as HTMLButtonElement; t.style.background='rgba(255,255,255,0.05)'; t.style.color='rgba(255,255,255,0.6)' }}
                      >
                        <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"/></svg>
                        {isAr ? 'English' : 'العربية'}
                      </button>
                    </div>
                    {/* Quick links */}
                    <div>
                      <div style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.35)', letterSpacing:'1px', textTransform:'uppercase', marginBottom:14 }}>
                        {isAr ? 'روابط سريعة' : 'Quick Links'}
                      </div>
                      {([
                        { ar:'الرئيسية', en:'Home', href:'/' },
                        { ar:'الخدمات', en:'Services', href:'/services' },
                        { ar:'المعاملات', en:'Procedures', href:'/procedures' },
                        { ar:'الجهات', en:'Authorities', href:'/authorities' },
                        { ar:'النماذج', en:'Forms', href:'/forms' },
                        { ar:'الأسئلة', en:'FAQ', href:'/faq' },
                      ] as {ar:string;en:string;href:string}[]).map(link => (
                        <button key={link.href} type="button" onClick={() => router.push(link.href)}
                          style={{ display:'block', background:'none', border:'none', color:'rgba(255,255,255,0.5)', fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:'inherit', padding:'5px 0', lineHeight:1.4, textAlign: isAr ? 'right' : 'left', transition:'color 0.13s' }}
                          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color='#fff'}
                          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color='rgba(255,255,255,0.5)'}
                        >
                          {isAr ? link.ar : link.en}
                        </button>
                      ))}
                    </div>
                    {/* Account links */}
                    <div>
                      <div style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.35)', letterSpacing:'1px', textTransform:'uppercase', marginBottom:14 }}>
                        {isAr ? 'حسابي' : 'Account'}
                      </div>
                      {([
                        { ar:'ملفاتي', en:'My Files', href:'/my-files' },
                        { ar:'استوديو الصياغة', en:'Drafting Studio', href:'/drafting-studio' },
                      ] as {ar:string;en:string;href:string}[]).map(link => (
                        <button key={link.href} type="button" onClick={() => router.push(link.href)}
                          style={{ display:'block', background:'none', border:'none', color:'rgba(255,255,255,0.5)', fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:'inherit', padding:'5px 0', lineHeight:1.4, textAlign: isAr ? 'right' : 'left', transition:'color 0.13s' }}
                          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color='#fff'}
                          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color='rgba(255,255,255,0.5)'}
                        >
                          {isAr ? link.ar : link.en}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ borderTop:'1px solid rgba(255,255,255,0.07)', paddingTop:20, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
                    <div style={{ fontSize:12, color:'rgba(255,255,255,0.3)' }}>
                      {isAr ? '© ٢٠٢٤ دليلك — جميع الحقوق محفوظة' : '© 2024 Dalilak — All rights reserved'}
                    </div>
                    <div style={{ fontSize:12, color:'rgba(255,255,255,0.25)' }}>
                      {isAr ? 'ليس بديلاً عن الاستشارة القانونية الرسمية' : 'Not a substitute for official legal advice'}
                    </div>
                  </div>
                </div>
              </footer>

            </div>

          ) : (

            /* ── Chat Messages ── */
            <div aria-live="polite" aria-label={isAr ? 'محادثة المساعد القانوني' : 'Legal assistant conversation'} style={{ maxWidth: 720, margin: '0 auto', padding: '12px 14px' }}>
              {/* Home button — visible on mobile inside chat */}
              <div style={{ display: 'flex', justifyContent: isAr ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
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
                        background: '#fff', border: '1px solid rgba(210,195,178,0.5)',
                        borderRadius: isAr ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        padding: '10px 16px',
                        boxShadow: '0 1px 8px rgba(100,60,20,0.06)',
                      }}>
                        {[0, 1, 2].map(j => (
                          <span key={j} style={{
                            width: 7, height: 7, borderRadius: '50%',
                            background: '#8F1D2C', display: 'inline-block',
                            animation: `typing-dot 1.2s ease-in-out ${j * 0.2}s infinite`,
                          }} />
                        ))}
                      </div>
                    </div>
                  )
                }
                return (
                  <div key={i} className="msg-in">
                    <ChatMessage
                      msg={msg}
                      isAr={isAr}
                      onFollowUp={(q) => { setInput(q); textareaRef.current?.focus() }}
                      onSendMessage={(q) => sendMessage(q)}
                      onUploadFile={() => fileInputRef.current?.click()}
                      onStartFlow={() => setShowGuide(true)}
                      question={msg.role === 'assistant' && i > 0 && messages[i - 1]?.role === 'user'
                        ? messages[i - 1].content.replace(/^\[.*?\]\n?/, '').slice(0, 300)
                        : undefined}
                    />
                  </div>
                )
              })}
              <div ref={bottomRef} style={{ height: 8 }} />
            </div>
          )}
        </main>

        {/* ══ Follow-up question chips ══ */}
        {followupQuestions.length > 0 && !loading && (
          <div style={{
            maxWidth: 720, margin: '0 auto', padding: '4px 12px 2px',
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
            maxWidth: 720, margin: '0 auto 6px', padding: '8px 14px',
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
          <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 12px 4px', direction: 'rtl' }}>
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
              <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: 5 }}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg> إعادة المحاولة
            </button>
          </div>
        )}

        {/* ══ Quota remaining warning ══ */}
        {quotaRemaining !== null && quotaRemaining >= 0 && quotaRemaining <= 10 && (
          <div style={{
            maxWidth: 720, margin: '0 auto', padding: '0 12px 2px',
            direction: 'rtl', textAlign: 'right',
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
        <footer className={footerBottom > 0 ? '' : 'bottom-nav-padding'} style={{
          flexShrink: 0,
          background: messages.length > 0 ? 'linear-gradient(to top, rgba(242,237,230,1) 0%, rgba(242,237,230,0.96) 70%, rgba(242,237,230,0) 100%)' : 'transparent',
          paddingTop: messages.length > 0 ? 8 : 0,
          paddingBottom: messages.length > 0 && footerBottom > 0 ? 'env(safe-area-inset-bottom, 4px)' : undefined,
        }}>
          {messages.length > 0 && <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 12px 10px' }}>

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
                  style={{ background: 'none', border: 'none', color: '#918B82', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center' }}
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
                  <img src={attachedFile.preview} alt="preview" loading="lazy"
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
                <div style={{ flex: 1, minWidth: 0, textAlign: 'right' }}>
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
                gap: 10, padding: '8px 14px',
                background: 'linear-gradient(135deg, #F8EDEF 0%, #FDE8E8 100%)',
                borderRadius: 12, border: '1.5px solid #FECACA',
              }}>
                <span style={{ display: 'flex', gap: 3, alignItems: 'flex-end' }}>
                  {[8, 14, 10, 16, 11, 14, 9].map((h, n) => (
                    <span key={n} style={{
                      width: 3, height: h, backgroundColor: '#8F1D2C', borderRadius: 2,
                      animation: `pulse 0.9s infinite`, animationDelay: `${n * 0.08}s`,
                      display: 'inline-block',
                    }} />
                  ))}
                </span>
                <span style={{ fontSize: 12, color: '#8F1D2C', fontWeight: 600 }}>
                  {isAr ? 'جاري الاستماع... تحدث الآن' : 'Listening... speak now'}
                </span>
                <span style={{ display: 'flex', gap: 3, alignItems: 'flex-end' }}>
                  {[9, 14, 11, 16, 10, 14, 8].map((h, n) => (
                    <span key={n} style={{
                      width: 3, height: h, backgroundColor: '#8F1D2C', borderRadius: 2,
                      animation: `pulse 0.9s infinite`, animationDelay: `${n * 0.1}s`,
                      display: 'inline-block',
                    }} />
                  ))}
                </span>
              </div>
            )}

            {/* ── Mode selector — ModeSelector handles mobile/desktop ── */}
            <div style={{ marginBottom: 10 }}>
              <ModeSelector mode={mode} onSelect={setMode} isAr={isAr} />
            </div>

            {/* ── Input box ── */}
            <form onSubmit={handleSubmit}>
              <div className={inputFocused ? 'input-focused' : ''}
                style={{
                  display: 'flex', alignItems: 'flex-end', gap: 4,
                  backgroundColor: '#fff',
                  border: recording ? '2px solid #FCA5A5' : '1.5px solid rgba(210,195,178,0.7)',
                  borderRadius: 22, padding: '7px 8px',
                  boxShadow: '0 2px 16px rgba(100,60,20,0.09), 0 1px 4px rgba(0,0,0,0.05)',
                  transition: 'border-color 0.18s, box-shadow 0.18s',
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
                  onChange={e => setInput(e.target.value.slice(0, MAX_INPUT))}
                  onKeyDown={handleKeyDown}
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

                {/* Character counter — visible only when > 3000 chars */}
                {showCharCount && (
                  <span style={{
                    flexShrink: 0, fontSize: 11, lineHeight: 1,
                    color: input.length > 3800 ? '#b91c1c' : '#918B82',
                    fontFamily: 'monospace', padding: '0 2px',
                    alignSelf: 'flex-end', paddingBottom: 10,
                  }}>
                    {input.length}/{MAX_INPUT}
                  </span>
                )}

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
                    background: recording
                      ? 'linear-gradient(135deg, #8F1D2C 0%, #741622 100%)'
                      : 'none',
                    color: recording ? '#fff' : 'var(--text-3)',
                    boxShadow: recording ? '0 2px 8px rgba(143,29,44,0.35)' : 'none',
                    opacity: loading ? 0.4 : 1, transition: 'background 0.15s, box-shadow 0.15s, opacity 0.15s',
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
                    background: canSend
                      ? 'linear-gradient(135deg, var(--red) 0%, var(--red-dark) 100%)'
                      : 'var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: canSend ? '0 3px 10px rgba(143,29,44,0.35)' : 'none',
                    transition: 'background 0.15s, box-shadow 0.15s',
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

        {/* ══════════════ BOTTOM NAV (mobile) ══════════════ */}
        <div className="bottom-nav-wrapper">
          <BottomNav
            isAr={isAr}
            activeTab={messages.length > 0 ? 'chat' : 'home'}
            onHomeClick={() => setMessages([])}
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

      {/* ══════════════ MOBILE MENU DRAWER ══════════════ */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        isAr={isAr}
        lang={lang}
        onLangToggle={toggleLang}
        onHome={() => setMessages([])}
        currentUser={currentUser}
      />
    </>
  )
}
