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

const MODES: { id: ResponseMode; icon: string; label_ar: string; label_en: string; hint_ar: string; hint_en: string; prefix: string }[] = [
  {
    id: 'quick',
    icon: '',
    label_ar: 'سريع', label_en: 'Quick',
    hint_ar: 'إجابة مختصرة في ثوانٍ', hint_en: 'Short answer in seconds',
    prefix: '[أجب بإيجاز واضح في 4-6 أسطر فقط دون تفاصيل زائدة] ',
  },
  {
    id: 'detailed',
    icon: '',
    label_ar: 'مفصّل', label_en: 'Detailed',
    hint_ar: 'خطوات وتفاصيل كاملة', hint_en: 'Full steps and details',
    prefix: '[أجب بتنسيق منظّم مع عناوين ## واضحة: ## الخلاصة | ## المستندات المطلوبة | ## الخطوات | ## الجهة المختصة | ## الرسوم | ## تنبيه مهم] ',
  },
  {
    id: 'research',
    icon: '',
    label_ar: 'بحث وافٍ', label_en: 'Research',
    hint_ar: 'تقرير شامل مع أدلة ونماذج', hint_en: 'Full report with evidence',
    prefix: '[أجب بتقرير شامل: تحليل كامل، جميع الخيارات المتاحة، الأدلة الرسمية، المراجع القانونية، نموذج جاهز للاستخدام إن وجد، وتنبيهات العطل الرسمية] ',
  },
]

const SUGGESTION_POOL = [
  { icon: '', title_ar: 'المعاملات الرسمية', desc_ar: 'جوازات، هويات، وثائق رسمية', title_en: 'Official Transactions', desc_en: 'Passports, IDs, official documents' },
  { icon: '', title_ar: 'الإجراءات الحكومية', desc_ar: 'تسجيل شركات، عقارات، سيارات', title_en: 'Gov. Procedures', desc_en: 'Companies, real estate, vehicles' },
  { icon: '', title_ar: 'الأحوال الشخصية', desc_ar: 'ولادة، زواج، وفاة، طلاق', title_en: 'Civil Status', desc_en: 'Birth, marriage, death, divorce' },
  { icon: '', title_ar: 'التعليم والعمل', desc_ar: 'شهادات، تصاريح، حقوق العمال', title_en: 'Education & Work', desc_en: 'Degrees, permits, labor rights' },
  { icon: '', title_ar: 'العقارات والبناء', desc_ar: 'تصاريح، ملكية، رخص بناء', title_en: 'Real Estate', desc_en: 'Permits, ownership, construction' },
  { icon: '', title_ar: 'المركبات والسير', desc_ar: 'تسجيل، رخص قيادة، مخالفات', title_en: 'Vehicles & Traffic', desc_en: 'Registration, licenses, fines' },
  { icon: '', title_ar: 'الحقوق القانونية', desc_ar: 'دعاوى، طعون، استئنافات', title_en: 'Legal Rights', desc_en: 'Lawsuits, appeals, disputes' },
  { icon: '', title_ar: 'الأعمال والتجارة', desc_ar: 'تراخيص، ضرائب، شركات', title_en: 'Business & Trade', desc_en: 'Licenses, taxes, companies' },
  { icon: '', title_ar: 'الصحة والضمان', desc_ar: 'ضمان اجتماعي، تأمين، صحة', title_en: 'Health & Insurance', desc_en: 'Social security, coverage' },
  { icon: '', title_ar: 'السفر والإقامة', desc_ar: 'تأشيرات، إقامة، جوازات', title_en: 'Travel & Residency', desc_en: 'Visas, residency, passports' },
  { icon: '', title_ar: 'الأجانب في لبنان', desc_ar: 'إقامة، عمل، تجنيس', title_en: 'Foreigners in Lebanon', desc_en: 'Residency, work permits' },
  { icon: '', title_ar: 'الضمان والتقاعد', desc_ar: 'معاشات، تقاعد، مستحقات', title_en: 'Pension & Retirement', desc_en: 'Pensions, benefits, rights' },
]

function ServiceGroupIcon({ slug }: { slug: string }) {
  if (slug === 'expat') return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 004 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
  )
  if (slug === 'property') return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
    </svg>
  )
  if (slug === 'contracts') return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
    </svg>
  )
  if (slug === 'civil-records') return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
    </svg>
  )
  if (slug === 'business') return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
    </svg>
  )
  // forms-docs
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
]

const QUESTION_POOL_EN = [
  'How do I get a Lebanese passport?',
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

export default function Home() {
  const router = useRouter()
  const [lang, setLang] = useState<Lang>('ar')
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
  const [visibleS, setVisibleS] = useState<typeof SUGGESTION_POOL>([])
  const [showGuide, setShowGuide] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showTransactionStarter, setShowTransactionStarter] = useState(false)
  const [activeServiceGroup, setActiveServiceGroup] = useState<ServiceGroup | null>(null)
  const [showMorePopular, setShowMorePopular] = useState(false)
  // Active document context — persists across follow-up questions (Phase 9)
  const [activeDocumentName, setActiveDocumentName] = useState<string | null>(null)
  // Follow-up question suggestions — shown after each assistant answer
  const [followupQuestions, setFollowupQuestions] = useState<string[]>([])
  // Remaining daily quota — null = unknown, -1 = unlimited (admin)
  const [quotaRemaining, setQuotaRemaining] = useState<number | null>(null)
  // Last failed message — shown as retry chip on error
  const [retryMsg, setRetryMsg] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)
  const mainRef = useRef<HTMLDivElement>(null)
  const historyLoaded = useRef(false)

  const pool = lang === 'ar' ? QUESTION_POOL_AR : QUESTION_POOL_EN

  // ── Handle ?q= param from procedures/forms pages ─────────
  useEffect(() => {
    if (!authChecked) return
    const params = new URLSearchParams(window.location.search)
    const q = params.get('q')
    if (q) {
      window.history.replaceState({}, '', '/')
      sendMessage(q)
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
        if (clean.length > 0) setMessages(clean)
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

  // ── Auto-rotate questions + suggestion cards ──────────────
  useEffect(() => {
    const refresh = () => {
      setVisibleQ(shufflePick(pool, 4))
      setVisibleS(shufflePick(SUGGESTION_POOL, 4))
    }
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
    if (!SR) { alert('التعرف على الصوت غير مدعوم. استخدم Chrome أو Edge.'); return }
    const recognition = new SR()
    recognition.lang = lang === 'ar' ? 'ar-LB' : 'en-US'
    recognition.continuous = false
    recognition.interimResults = true
    recognition.onresult = (e: any) => {
      setInput(Array.from(e.results as any[]).map((r: any) => r[0].transcript).join(''))
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
    if (file.size > 10 * 1024 * 1024) { alert('الحد الأقصى 10MB.'); return }
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
        { role: 'assistant', content: 'تعذّر معالجة هذا الطلب. يرجى إعادة صياغة السؤال.', streaming: false },
      ])
      return
    }

    const activeMode = MODES.find(m => m.id === (overrideMode || mode))!
    const langInstruction = lang === 'en'
      ? '[IMPORTANT: The user is writing in English. You MUST respond entirely in English. Do not use Arabic at all.] '
      : ''
    const prefixedMessage = file
      ? cleanText || 'حلل هذه الوثيقة واقترح الإجراءات المناسبة'
      : langInstruction + activeMode.prefix + cleanText

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
            content: '**النظام في وضع السكون، جاري التنشيط...**\n\nقد يستغرق الرد 30-60 ثانية في أول طلب. يُرجى الانتظار.',
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
          content: '**انتهت فترتك التجريبية.**\n\nللاستمرار في استخدام دليلك AI، يرجى الترقية إلى الاشتراك المدفوع. تواصل معنا عبر البريد أو واتساب.',
          streaming: false,
        }))
        setLoading(false)
        return
      }
      if (res.status === 429) {
        const data = await res.json().catch(() => ({}))
        const detail: string = data?.detail || 'استنفذت حصتك اليومية'
        setMessages(prev => prev.slice(0, -1).concat({
          role: 'assistant',
          content: `**${detail}**\n\nللحصول على المزيد من الأسئلة، يمكنك الترقية إلى الاشتراك المدفوع (200 سؤال/يوم). تواصل معنا عبر البريد أو واتساب.`,
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
                  .map((s: any) => ({
                    title: s.title || s.ministry || 'مصدر',
                    type: 'official' as const,
                    ministry: s.ministry,
                    score: s.score,
                    snippet: s.snippet,
                  }))
                  .filter((s: any) => {
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
      const finalAnswer = accumulated || 'عذراً، لم أتلقَّ ردّاً.'
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
        u[u.length - 1] = { role: 'assistant', content: 'عذراً، حدث خطأ في الاتصال. تحقق من اتصالك وأعد المحاولة.', streaming: false }
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
  const isAr = lang === 'ar'
  const MAX_INPUT = 4000
  const showCharCount = input.length > 3000

  if (!authChecked) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#FAFAF8', gap: 14 }}>
      <img src="/logo.PNG" alt="دليلك" style={{ width: 52, height: 52, objectFit: 'contain', opacity: 0.7 }} />
      <div style={{ display: 'flex', gap: 6 }}>
        {[0,1,2].map(i => <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#8B1A1A', display: 'inline-block', animation: `typing-dot 1.2s ease-in-out ${i*0.2}s infinite` }} />)}
      </div>
    </div>
  )

  return (
    <>
      <style>{`
        html, body { margin: 0; padding: 0; height: 100%; overflow: hidden; background: #FAFAF8; }
        * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
        textarea { font-family: inherit; }
        :root {
          --safe-top: env(safe-area-inset-top, 0px);
          --safe-bottom: env(safe-area-inset-bottom, 0px);
          --red: #8B1A1A;
          --red-dark: #6B1313;
          --red-light: #FEF2F2;
          --gold: #B8860B;
          --gold-light: #FDF8E8;
          --bg: #FAFAF8;
          --card: #FFFFFF;
          --border: #EAE4D9;
          --border-strong: #D5CEC4;
          --text: #1A1208;
          --text-2: #5C5044;
          --text-3: #9C8E80;
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
        .msg-in { animation: fadeUp 0.25s ease; }
        .quick-btn { animation: slideQ 0.3s ease; }
        .wlc-hero-band { animation: heroIn 0.35s ease; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 4px; }
        .suggestion-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(139,26,26,0.10) !important; border-color: rgba(139,26,26,0.25) !important; }
        .quick-btn:hover { background: var(--red-light) !important; border-color: rgba(139,26,26,0.3) !important; color: var(--red) !important; }
        .action-card:hover { transform: translateY(-3px) !important; box-shadow: 0 10px 28px rgba(0,0,0,0.10) !important; border-color: rgba(139,26,26,0.22) !important; }
        .action-card:active { transform: scale(0.96) !important; }
        .mode-btn { transition: all 0.18s ease; }
        .mode-btn:hover { transform: scale(1.04); }
        .input-focused { border-color: var(--red) !important; box-shadow: 0 0 0 3px rgba(139,26,26,0.08), 0 2px 12px rgba(139,26,26,0.06) !important; }
        .send-btn:hover:not(:disabled) { background: var(--red-dark) !important; transform: scale(1.05); }
        .icon-btn:hover:not(:disabled) { background: var(--red-light) !important; color: var(--red) !important; }
        .lang-btn:hover { background: rgba(255,255,255,0.22) !important; }

        /* ── Welcome screen responsive layout ─────────────────────── */
        .wlc-svc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .wlc-most-req { display: none; }
        .wlc-svc-btn:hover { border-color: #8B1A1A !important; background: #FEF7F7 !important; box-shadow: 0 4px 14px rgba(139,26,26,0.09) !important; }

        @media (min-width: 768px) {
          .wlc-desktop-cols { display: grid !important; grid-template-columns: 280px 1fr; gap: 36px; align-items: start; }
          .wlc-svc-grid { grid-template-columns: repeat(3, 1fr); gap: 10px; }
          .wlc-most-req { display: flex !important; }
        }
      `}</style>

      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        bottom: footerBottom,
        display: 'flex', flexDirection: 'column',
        backgroundColor: '#FAFAF8',
        paddingTop: 'var(--safe-top)',
      }}>

        {/* ══════════════ HEADER ══════════════ */}
        <TopNav
          isAr={isAr}
          currentUser={currentUser}
          messages={messages}
          onLangToggle={() => setLang(l => l === 'ar' ? 'en' : 'ar')}
          onNewChat={() => { setMessages([]); setFollowupQuestions([]); setRetryMsg(null) }}
          onMenuOpen={() => setMobileMenuOpen(true)}
          onStartGuide={() => setShowGuide(true)}
          showGuideBtn={messages.length === 0}
        />


        {/* ══════════════ MAIN ══════════════ */}
        <main ref={mainRef} style={{
          flex: 1, overflowY: 'auto',
          overscrollBehavior: 'contain',
          WebkitOverflowScrolling: 'touch' as any,
        }}>
          {messages.length === 0 ? (

            /* ══ Welcome Screen — Big Four Premium Edition ══ */
            <div style={{ minHeight: '100%', background: '#FAFAF8', direction: isAr ? 'rtl' : 'ltr' }}>

              {/* ── Hero Band (full-width gradient) ── */}
              <div className="wlc-hero-band" style={{
                background: 'linear-gradient(150deg, #8B1A1A 0%, #6b2737 52%, #4a1020 100%)',
                padding: 'clamp(18px,5vw,28px) clamp(16px,4vw,24px) clamp(22px,5vw,32px)',
                position: 'relative', overflow: 'hidden',
              }}>
                {/* Decorative rings */}
                <div style={{ position:'absolute', top:-90, right:-90, width:260, height:260, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.07)', pointerEvents:'none' }} />
                <div style={{ position:'absolute', top:-50, right:-50, width:160, height:160, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.05)', pointerEvents:'none' }} />
                <div style={{ position:'absolute', bottom:-60, left:-40, width:180, height:180, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.04)', pointerEvents:'none' }} />

                <div style={{ maxWidth: 720, margin: '0 auto', position: 'relative' }}>
                  {/* Top row: logo wordmark + online badge */}
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 14 }}>
                    <div style={{ display:'flex', alignItems:'center', gap: 10 }}>
                      <div style={{ width:38, height:38, borderRadius:11, background:'rgba(255,255,255,0.13)', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid rgba(255,255,255,0.2)', flexShrink:0 }}>
                        <img src="/logo.PNG" alt="دليلك" style={{ width:27, height:27, objectFit:'contain' }} />
                      </div>
                      <div>
                        <div style={{ fontSize:16, fontWeight:900, color:'#fff', letterSpacing:'-0.4px', lineHeight:1 }}>دليلك</div>
                        <div style={{ fontSize:9.5, color:'rgba(255,255,255,0.5)', marginTop:2 }}>
                          {isAr ? 'المرشد القانوني اللبناني' : 'Lebanese Legal Guide'}
                        </div>
                      </div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:5, background:'rgba(74,222,128,0.1)', borderRadius:20, padding:'4px 10px', border:'1px solid rgba(74,222,128,0.2)', flexShrink:0 }}>
                      <span style={{ width:6, height:6, borderRadius:'50%', background:'#4ade80', boxShadow:'0 0 5px #4ade80', display:'block' }} />
                      <span style={{ fontSize:10, color:'#4ade80', fontWeight:700 }}>{isAr ? 'متاح الآن' : 'Available'}</span>
                    </div>
                  </div>

                  {/* User greeting */}
                  {currentUser && (
                    <p style={{ fontSize:11, color:'rgba(255,255,255,0.55)', margin:'0 0 4px', fontWeight:500 }}>
                      {isAr
                        ? `مرحباً، ${currentUser.name || currentUser.email?.split('@')[0]}`
                        : `Hello, ${currentUser.name || currentUser.email?.split('@')[0]}`}
                    </p>
                  )}

                  {/* Main headline */}
                  <h1 style={{ fontSize:'clamp(18px,5.5vw,25px)', fontWeight:900, color:'#fff', margin:'0 0 6px', lineHeight:1.2, letterSpacing:'-0.5px' }}>
                    {isAr ? 'ما المعاملة التي تريد إنجازها؟' : 'What can we help you with today?'}
                  </h1>
                  <p style={{ fontSize:11.5, color:'rgba(255,255,255,0.58)', margin:0, lineHeight:1.55 }}>
                    {isAr
                      ? 'معاملات حكومية · وثائق رسمية · إجراءات قانونية · تحليل مستندات'
                      : 'Government transactions · Official documents · Legal procedures · Document analysis'}
                  </p>
                </div>
              </div>

              {/* ── Content Area ── */}
              <div style={{ maxWidth: 720, margin: '0 auto', padding: '20px 14px 100px' }}>
                <div className="wlc-desktop-cols" style={{ display: 'block' }}>

                  {/* ════ LEFT / TOP COL ════ */}
                  <div>
                    {/* 3 Premium White Action Cards */}
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:9, marginBottom:20 }}>
                      {[
                        {
                          ar:'ابدأ معاملة', en:'Start',
                          sub_ar:'مسار موجّه', sub_en:'Guided path',
                          action:'start', color:'#8B1A1A',
                          svg:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 3l14 9-14 9V3z"/></svg>,
                        },
                        {
                          ar:'حلّل مستنداً', en:'Analyze',
                          sub_ar:'PDF أو صورة', sub_en:'PDF or image',
                          action:'file', color:'#9a3412',
                          svg:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>,
                        },
                        {
                          ar:'اسأل دليلك', en:'Ask',
                          sub_ar:'سؤال مباشر', sub_en:'Free-form question',
                          action:'ask', color:'#374151',
                          svg:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>,
                        },
                      ].map(item => (
                        <button
                          key={item.action}
                          className="action-card"
                          onClick={() => {
                            if (item.action === 'start') setShowTransactionStarter(true)
                            else if (item.action === 'file') fileInputRef.current?.click()
                            else textareaRef.current?.focus()
                          }}
                          style={{
                            padding:'14px 8px 12px', borderRadius:15, cursor:'pointer',
                            background:'#fff', border:`1.5px solid ${item.color}18`,
                            display:'flex', flexDirection:'column', alignItems:'center', gap:9,
                            fontFamily:'inherit', boxShadow:'0 2px 10px rgba(0,0,0,0.055)',
                            transition:'all 0.16s',
                          }}
                        >
                          <div style={{ width:44, height:44, borderRadius:13, background:`${item.color}0f`, border:`1.5px solid ${item.color}1c`, display:'flex', alignItems:'center', justifyContent:'center', color:item.color }}>
                            {item.svg}
                          </div>
                          <div style={{ textAlign:'center' }}>
                            <div style={{ fontSize:11, fontWeight:800, color:'#1A1208', lineHeight:1.15 }}>
                              {isAr ? item.ar : item.en}
                            </div>
                            <div style={{ fontSize:9.5, color:'#9C8E80', marginTop:3, lineHeight:1.25 }}>
                              {isAr ? item.sub_ar : item.sub_en}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Divider + Quick nav pills (desktop) */}
                    <div className="wlc-most-req" style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:4 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <div style={{ flex:1, height:1, background:'#EAE4D9' }} />
                        <span style={{ fontSize:9.5, color:'#9C8E80', fontWeight:700, whiteSpace:'nowrap', letterSpacing:'0.4px', textTransform:'uppercase' as const }}>
                          {isAr ? 'الأكثر طلباً' : 'Most requested'}
                        </span>
                        <div style={{ flex:1, height:1, background:'#EAE4D9' }} />
                      </div>
                      <div style={{ display:'flex', gap:6, flexWrap:'wrap' as const }}>
                        {[
                          { ar:'جواز سفر', en:'Passport', slug:'passport' },
                          { ar:'سجل عدلي', en:'Criminal Record', slug:'criminal-record' },
                          { ar:'إخراج قيد', en:'Civil Extract', slug:'civil-registry-extract' },
                          { ar:'حصر إرث', en:'Inheritance', slug:'inheritance-certificate' },
                          { ar:'تأسيس شركة', en:'Company Reg.', slug:'company-registration' },
                          { ar:'رخصة بناء', en:'Building Permit', slug:'building-permit' },
                        ].map(p => (
                          <button key={p.slug} onClick={() => setShowGuide(true)} style={{
                            padding:'5px 12px', borderRadius:20, border:'1.5px solid #EAE4D9',
                            background:'#fff', fontSize:11, fontWeight:600, color:'#5C5044',
                            cursor:'pointer', fontFamily:'inherit', transition:'all 0.12s',
                            whiteSpace:'nowrap' as const,
                          }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor='#8B1A1A'; e.currentTarget.style.color='#8B1A1A'; e.currentTarget.style.background='#FEF2F2' }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor='#EAE4D9'; e.currentTarget.style.color='#5C5044'; e.currentTarget.style.background='#fff' }}>
                            {isAr ? p.ar : p.en}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* ════ RIGHT / BOTTOM COL ════ */}
                  <div>
                    {/* Section header */}
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                      <span style={{ fontSize:12, fontWeight:700, color:'#5C5044', letterSpacing:'-0.1px' }}>
                        {isAr ? 'الخدمات' : 'Services'}
                      </span>
                      <button onClick={() => router.push('/services')} style={{
                        fontSize:11, color:'#8B1A1A', background:'none',
                        border:'none', cursor:'pointer', fontFamily:'inherit', fontWeight:700,
                        display:'flex', alignItems:'center', gap:3,
                      }}>
                        {isAr ? 'عرض الكل' : 'View all'}
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d={isAr ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'}/>
                        </svg>
                      </button>
                    </div>

                    {/* Service group grid */}
                    <div className="wlc-svc-grid" style={{ marginBottom:14 }}>
                      {SERVICE_GROUPS.map(group => (
                        <button
                          key={group.slug}
                          className="wlc-svc-btn"
                          onClick={() => setActiveServiceGroup(group)}
                          style={{
                            display:'flex', alignItems:'center', gap:10,
                            padding:'11px 12px', borderRadius:13, cursor:'pointer',
                            background:'#fff', border:'1.5px solid #EAE4D9',
                            fontFamily:'inherit', textAlign:isAr?'right':'left',
                            transition:'all 0.14s', boxShadow:'0 1px 4px rgba(0,0,0,0.04)',
                          }}
                          onTouchStart={e => { e.currentTarget.style.background='#F5F1EC'; e.currentTarget.style.transform='scale(0.97)' }}
                          onTouchEnd={e => { e.currentTarget.style.background='#fff'; e.currentTarget.style.transform='scale(1)' }}
                        >
                          <div style={{ width:32, height:32, borderRadius:9, flexShrink:0, background:`${group.color}12`, border:`1px solid ${group.color}22`, display:'flex', alignItems:'center', justifyContent:'center', color:group.color }}>
                            <ServiceGroupIcon slug={group.slug} />
                          </div>
                          <div style={{ minWidth:0 }}>
                            <div style={{ fontSize:11, fontWeight:700, color:'#1A1208', lineHeight:1.2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                              {isAr ? group.titleAr : group.titleEn}
                            </div>
                            <div style={{ fontSize:9.5, color:'#9C8E80', marginTop:1 }}>
                              {group.services.length}{isAr ? ' خدمة' : ' services'}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Expat CTA */}
                    <button
                      onClick={() => router.push('/services/expat-property')}
                      style={{
                        width:'100%', padding:'14px 16px', borderRadius:14, cursor:'pointer',
                        background:'linear-gradient(135deg, #5c1212 0%, #8B1A1A 55%, #6b2737 100%)',
                        border:'none', color:'#fff', fontFamily:'inherit',
                        display:'flex', alignItems:'center', justifyContent:'space-between',
                        gap:10, boxShadow:'0 4px 16px rgba(139,26,26,0.22)',
                        transition:'transform 0.15s, box-shadow 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(139,26,26,0.32)' }}
                      onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 4px 16px rgba(139,26,26,0.22)' }}
                      onTouchStart={e => { e.currentTarget.style.transform='scale(0.97)' }}
                      onTouchEnd={e => { e.currentTarget.style.transform='scale(1)' }}
                    >
                      <div style={{ textAlign:isAr?'right':'left' }}>
                        <div style={{ fontSize:13, fontWeight:800 }}>
                          {isAr ? 'حزمة المغتربين والعقارات' : 'Expat & Property Pack'}
                        </div>
                        <div style={{ fontSize:10, color:'rgba(255,255,255,0.65)', marginTop:3 }}>
                          {isAr ? 'وكالات · بيع عقارات · عقود · كشف ثغرات' : 'POA · Property sale · Contracts · Gap analysis'}
                        </div>
                      </div>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink:0, opacity:0.8 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={isAr?'M15 19l-7-7 7-7':'M9 5l7 7-7 7'}/>
                      </svg>
                    </button>
                  </div>

                </div>{/* end desktop-cols */}
              </div>{/* end content area */}
            </div>

          ) : (

            /* ── Chat Messages ── */
            <div style={{ maxWidth: 720, margin: '0 auto', padding: '12px 14px' }}>
              {/* Home button — visible on mobile inside chat */}
              <div style={{ display: 'flex', justifyContent: isAr ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
                <button
                  onClick={() => { setMessages([]); setFollowupQuestions([]); setRetryMsg(null) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 14px', borderRadius: 20,
                    background: '#fff', border: '1.5px solid #EAE4D9',
                    fontSize: 12, color: '#9C8E80', fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'inherit',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#8B1A1A'; e.currentTarget.style.color = '#8B1A1A' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#EAE4D9'; e.currentTarget.style.color = '#9C8E80' }}
                  onTouchStart={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = '#8B1A1A' }}
                  onTouchEnd={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#9C8E80' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 21V12h6v9"/>
                  </svg>
                  {isAr ? 'الرئيسية' : 'Home'}
                </button>
              </div>

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
                        background: '#FAFAF8', border: '1px solid #EAE4D9',
                        borderRadius: isAr ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        padding: '10px 16px',
                      }}>
                        {[0, 1, 2].map(j => (
                          <span key={j} style={{
                            width: 7, height: 7, borderRadius: '50%',
                            background: '#8B1A1A', display: 'inline-block',
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
            display: 'flex', flexWrap: 'wrap', gap: 8, direction: 'rtl',
          }}>
            {followupQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => { setInput(q); sendMessage(q) }}
                style={{
                  background: '#FFF5F5', border: '1px solid rgba(139,26,26,0.18)',
                  borderRadius: 20, padding: '6px 14px', fontSize: 12.5,
                  color: '#8B1A1A', cursor: 'pointer', fontFamily: 'inherit',
                  lineHeight: 1.4, textAlign: 'right', transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', gap: 5,
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#FEE2E2' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#FFF5F5' }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.6, flexShrink: 0 }}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg> {q}
              </button>
            ))}
          </div>
        )}

        {/* ══ Retry chip on connection error ══ */}
        {retryMsg && !loading && (
          <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 12px 4px', direction: 'rtl' }}>
            <button
              onClick={() => sendMessage(retryMsg!)}
              style={{
                background: '#fff5f5', border: '1px solid rgba(139,26,26,0.25)',
                borderRadius: 20, padding: '6px 16px', fontSize: 12.5,
                color: '#8B1A1A', cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', gap: 4,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#FEE2E2' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#fff5f5' }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: 5 }}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg> إعادة المحاولة
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
              display: 'inline-block', fontSize: 11.5, color: quotaRemaining <= 3 ? '#b91c1c' : '#92400e',
              background: quotaRemaining <= 3 ? '#fef2f2' : '#fffbeb',
              border: `1px solid ${quotaRemaining <= 3 ? '#fecaca' : '#fde68a'}`,
              borderRadius: 20, padding: '2px 10px', fontFamily: 'inherit',
            }}>
              {quotaRemaining <= 3
                ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: 4, verticalAlign: 'middle' }}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: 4, verticalAlign: 'middle' }}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              } {quotaRemaining === 0 ? 'استنفذت حصتك اليومية' : `${quotaRemaining} سؤال متبقٍ اليوم`}
            </span>
          </div>
        )}

        {/* ══════════════ FOOTER / INPUT ══════════════ */}
        {/* bottom-nav-padding only when keyboard is closed — prevents 56px phantom gap above keyboard */}
        <footer className={footerBottom > 0 ? '' : 'bottom-nav-padding'} style={{
          flexShrink: 0,
          backgroundColor: 'transparent',
          paddingBottom: footerBottom > 0 ? 'env(safe-area-inset-bottom, 4px)' : undefined,
        }}>
          <div style={{ maxWidth: 720, margin: '0 auto', padding: '6px 12px 10px' }}>

            {/* ── Active Document Context Chip (Phase 9) ── */}
            {activeDocumentName && messages.length > 0 && !attachedFile && (
              <div style={{
                marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 10px', background: '#FEF2F2',
                borderRadius: 10, border: '1px solid rgba(139,26,26,0.2)',
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8B1A1A" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                <span style={{ fontSize: 10.5, color: '#8B1A1A', fontWeight: 600, flex: 1 }}>
                  {isAr ? 'يتم تحليل: ' : 'Analyzing: '}{activeDocumentName}
                </span>
                <button
                  onClick={() => { setActiveDocumentName(null) }}
                  style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 13, padding: 2 }}
                  title={isAr ? 'مسح' : 'Clear'}
                >✕</button>
              </div>
            )}

            {/* File preview */}
            {attachedFile && (
              <div style={{
                marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', backgroundColor: 'var(--red-light)',
                borderRadius: 12, border: '1.5px solid rgba(139,26,26,0.15)',
              }}>
                {attachedFile.preview ? (
                  <img src={attachedFile.preview} alt="preview"
                    style={{ width: 42, height: 42, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                ) : (
                  <div style={{
                    width: 42, height: 42, borderRadius: 10, background: '#fff',
                    border: '1.5px solid rgba(139,26,26,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, flexShrink: 0,
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B1A1A" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
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
                <button onClick={() => setAttachedFile(null)} style={{
                  width: 24, height: 24, borderRadius: '50%',
                  backgroundColor: 'rgba(139,26,26,0.1)', border: 'none',
                  cursor: 'pointer', fontSize: 15, color: 'var(--red)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  fontWeight: 700,
                }}>×</button>
              </div>
            )}

            {/* Recording indicator */}
            {recording && (
              <div style={{
                marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 10, padding: '8px 14px',
                background: 'linear-gradient(135deg, #FEF2F2 0%, #FDE8E8 100%)',
                borderRadius: 12, border: '1.5px solid #FECACA',
              }}>
                <span style={{ display: 'flex', gap: 3, alignItems: 'flex-end' }}>
                  {[8, 14, 10, 16, 11, 14, 9].map((h, n) => (
                    <span key={n} style={{
                      width: 3, height: h, backgroundColor: '#ef4444', borderRadius: 2,
                      animation: `pulse 0.9s infinite`, animationDelay: `${n * 0.08}s`,
                      display: 'inline-block',
                    }} />
                  ))}
                </span>
                <span style={{ fontSize: 12, color: '#dc2626', fontWeight: 600 }}>
                  {isAr ? 'جاري الاستماع... تحدث الآن' : 'Listening... speak now'}
                </span>
                <span style={{ display: 'flex', gap: 3, alignItems: 'flex-end' }}>
                  {[9, 14, 11, 16, 10, 14, 8].map((h, n) => (
                    <span key={n} style={{
                      width: 3, height: h, backgroundColor: '#ef4444', borderRadius: 2,
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
                  border: recording ? '2px solid #FCA5A5' : '2px solid var(--border)',
                  borderRadius: 20, padding: '6px 8px',
                  boxShadow: '0 2px 14px rgba(0,0,0,0.07)',
                  transition: 'all 0.2s ease',
                }}>

                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, flex: 1 }}>

                {/* Attach */}
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={loading}
                  className="icon-btn"
                  title={isAr ? 'إرفاق ملف أو صورة' : 'Attach file or image'}
                  style={{
                    flexShrink: 0, width: 38, height: 38, borderRadius: 12,
                    border: 'none', background: 'none', cursor: loading ? 'default' : 'pointer',
                    color: 'var(--text-3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: loading ? 0.4 : 1, transition: 'all 0.15s',
                  }}
                  onTouchStart={e => !loading && (e.currentTarget.style.background = 'var(--red-light)')}
                  onTouchEnd={e => (e.currentTarget.style.background = 'none')}>
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>
                <input ref={fileInputRef} type="file" accept="image/*,.pdf,.doc,.docx,.txt"
                  style={{ display: 'none' }} onChange={handleFileChange} />

                {/* Textarea */}
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={e => setInput(e.target.value.slice(0, MAX_INPUT))}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
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
                    color: input.length > 3800 ? '#b91c1c' : '#9ca3af',
                    fontFamily: 'monospace', padding: '0 2px',
                    alignSelf: 'flex-end', paddingBottom: 10,
                  }}>
                    {input.length}/{MAX_INPUT}
                  </span>
                )}

                {/* Mic */}
                <button type="button" onClick={recording ? stopRecording : startRecording} disabled={loading}
                  className={recording ? '' : 'icon-btn'}
                  style={{
                    flexShrink: 0, width: 38, height: 38, borderRadius: 12, border: 'none',
                    cursor: loading ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: recording
                      ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)'
                      : 'none',
                    color: recording ? '#fff' : 'var(--text-3)',
                    boxShadow: recording ? '0 2px 8px rgba(239,68,68,0.4)' : 'none',
                    opacity: loading ? 0.4 : 1, transition: 'all 0.2s',
                  }}
                  onTouchStart={e => !loading && !recording && (e.currentTarget.style.background = 'var(--red-light)')}
                  onTouchEnd={e => !recording && (e.currentTarget.style.background = 'none')}>
                  <svg width="19" height="19" viewBox="0 0 24 24"
                    fill={recording ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>

                {/* Send */}
                <button type="submit" disabled={!canSend}
                  className="send-btn"
                  style={{
                    flexShrink: 0, width: 38, height: 38, borderRadius: 12, border: 'none',
                    cursor: canSend ? 'pointer' : 'default',
                    background: canSend
                      ? 'linear-gradient(135deg, var(--red) 0%, var(--red-dark) 100%)'
                      : 'var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: canSend ? '0 3px 10px rgba(139,26,26,0.35)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                  onTouchStart={e => canSend && (e.currentTarget.style.transform = 'scale(0.91)')}
                  onTouchEnd={e => (e.currentTarget.style.transform = 'scale(1)')}>
                  {loading ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                      style={{ animation: 'spin 0.8s linear infinite' }}>
                      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                      <path fill="#fff" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  )}
                </button>
                </div>
              </div>
            </form>

          </div>
        </footer>

        {/* ══════════════ BOTTOM NAV (mobile) ══════════════ */}
        <div style={{ display: 'none' }} className="bottom-nav-wrapper">
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
        onLangToggle={() => setLang(l => l === 'ar' ? 'en' : 'ar')}
        onHome={() => setMessages([])}
        currentUser={currentUser}
      />
    </>
  )
}
