'use client'

import React, { useState, useRef, useEffect, FormEvent, useCallback } from 'react'
import Image from 'next/image'
import ChatMessage, { Message } from '@/components/ChatMessage'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dalilak-backend-bvb9.onrender.com'

/* ── Types ────────────────────────────────────────────────────── */
interface AttachedFile {
  name: string
  type: string
  base64: string
  preview?: string
  size: number
}

type ResponseMode = 'quick' | 'detailed' | 'research'

/* ── Config ───────────────────────────────────────────────────── */
const MODES: { id: ResponseMode; icon: string; label: string; hint: string; prefix: string }[] = [
  {
    id: 'quick',
    icon: '⚡',
    label: 'سريع',
    hint: 'إجابة مختصرة في ثوانٍ',
    prefix: '[أجب بإيجاز واضح في 4-6 أسطر فقط دون تفاصيل زائدة] ',
  },
  {
    id: 'detailed',
    icon: '📋',
    label: 'مفصّل',
    hint: 'خطوات وتفاصيل كاملة',
    prefix: '[أجب بتفصيل كامل: الوثائق، الخطوات، الرسوم، ساعات العمل، والجهة المختصة] ',
  },
  {
    id: 'research',
    icon: '🔍',
    label: 'بحث وافٍ',
    hint: 'تقرير شامل مع أدلة ونماذج',
    prefix: '[أجب بتقرير شامل: تحليل كامل، جميع الخيارات المتاحة، الأدلة الرسمية، المراجع القانونية، نموذج جاهز للاستخدام إن وجد] ',
  },
]

const ALL_SUGGESTIONS = [
  { icon: '📋', title: 'المعاملات الرسمية',  desc: 'جوازات · هويات · وثائق' },
  { icon: '🏛️', title: 'الإجراءات الحكومية', desc: 'شركات · عقارات · سيارات' },
  { icon: '👶', title: 'الأحوال الشخصية',   desc: 'ولادة · زواج · وفاة' },
  { icon: '🎓', title: 'التعليم والعمل',     desc: 'شهادات · تصاريح · حقوق' },
  { icon: '🏦', title: 'المصارف والمالية',   desc: 'حسابات · قروض · تحويل' },
  { icon: '⚖️', title: 'القانون والقضاء',    desc: 'توثيق · تقاضٍ · عقود' },
  { icon: '🏗️', title: 'البناء والعقارات',   desc: 'رخص · تسجيل · مخططات' },
  { icon: '💼', title: 'تأسيس الشركات',      desc: 'ش.م.م · SAL · تراخيص' },
  { icon: '🏥', title: 'الصحة والضمان',      desc: 'CNSS · مستشفيات · وصفات' },
  { icon: '🚗', title: 'المركبات والنقل',    desc: 'لوحات · رخص · نقل ملكية' },
  { icon: '🌿', title: 'الزراعة والبيئة',    desc: 'تراخيص · تصدير · مشاتل' },
  { icon: '✈️', title: 'السفر والجنسية',     desc: 'تأشيرات · جوازات · إقامة' },
]

const ALL_QUICK_QUESTIONS = [
  'كيف أستخرج جواز سفر لبناني؟',
  'ما هي إجراءات تسجيل سيارة جديدة؟',
  'كيف أستخرج شهادة ميلاد؟',
  'كيف أسجل شركة في لبنان؟',
  'كيف أفتح حساباً مصرفياً للشركة؟',
  'ما هي إجراءات معادلة الشهادة الجامعية؟',
  'كيف أسجل في الضمان الاجتماعي CNSS؟',
  'كيف أستخرج رخصة بناء؟',
  'كيف أسجل علامة تجارية في لبنان؟',
  'ما هي شروط الحصول على إقامة في لبنان؟',
  'كيف أنقل ملكية عقار؟',
  'كيف أحصل على رخصة مهنية؟',
]

const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5)

/* Detect text direction from first meaningful character */
const getDir = (text: string): 'rtl' | 'ltr' => {
  const ch = text.trim()[0]
  if (!ch) return 'rtl'
  const code = ch.charCodeAt(0)
  if (
    (code >= 0x0600 && code <= 0x06FF) || // Arabic
    (code >= 0x0590 && code <= 0x05FF) || // Hebrew
    (code >= 0xFB50 && code <= 0xFDFF) || // Arabic Presentation A
    (code >= 0xFE70 && code <= 0xFEFF)    // Arabic Presentation B
  ) return 'rtl'
  return 'ltr'
}

/* ── Component ────────────────────────────────────────────────── */
export default function Home() {
  const [messages,      setMessages]     = useState<Message[]>([])
  const [input,         setInput]        = useState('')
  const [loading,       setLoading]      = useState(false)
  const [recording,     setRecording]    = useState(false)
  const [attachedFile,  setAttachedFile] = useState<AttachedFile | null>(null)
  const [mode,          setMode]         = useState<ResponseMode>('detailed')
  const [footerBottom,  setFooterBottom] = useState(0)
  const [inputFocused,  setInputFocused] = useState(false)
  const [suggestions,   setSuggestions]  = useState(() => shuffle(ALL_SUGGESTIONS).slice(0, 4))
  const [quickQuestions,setQuickQuestions] = useState(() => shuffle(ALL_QUICK_QUESTIONS).slice(0, 4))

  const bottomRef      = useRef<HTMLDivElement>(null)
  const textareaRef    = useRef<HTMLTextAreaElement>(null)
  const fileInputRef   = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)

  /* iOS keyboard fix */
  useEffect(() => {
    const vv = (window as any).visualViewport
    if (!vv) return
    const onVP = () => {
      const offset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
      setFooterBottom(offset)
      if (offset > 50) setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    }
    vv.addEventListener('resize', onVP)
    vv.addEventListener('scroll', onVP)
    return () => { vv.removeEventListener('resize', onVP); vv.removeEventListener('scroll', onVP) }
  }, [])

  /* Auto-scroll */
  useEffect(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80)
  }, [messages])

  /* Auto-resize textarea */
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px'
  }, [input])

  /* Voice */
  const startRecording = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) { alert('التعرف على الصوت غير مدعوم. استخدم Chrome أو Edge.'); return }
    const r = new SR()
    r.lang = navigator.language || 'ar'
    r.continuous = false
    r.interimResults = true
    r.onresult = (e: any) => setInput(Array.from(e.results as any[]).map((x: any) => x[0].transcript).join(''))
    r.onerror  = () => setRecording(false)
    r.onend    = () => setRecording(false)
    r.start()
    recognitionRef.current = r
    setRecording(true)
  }, [])

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop()
    setRecording(false)
  }, [])

  /* File attach */
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { alert('الحد الأقصى 10MB.'); return }
    const reader = new FileReader()
    reader.onload = ev => {
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

  const formatSize = (b: number) =>
    b < 1048576 ? Math.round(b / 1024) + ' KB' : (b / 1048576).toFixed(1) + ' MB'

  const getFileIcon = (t: string) =>
    t.startsWith('image/') ? '🖼️' : t === 'application/pdf' ? '📄' : t.includes('word') ? '📝' : '📎'

  /* Send */
  const sendMessage = async (text: string, file?: AttachedFile | null, overrideMode?: ResponseMode) => {
    const hasContent = text.trim() || file
    if (!hasContent || loading) return

    const activeMode = MODES.find(m => m.id === (overrideMode || mode))!
    const prefixedMessage = file
      ? text.trim() || 'حلل هذه الوثيقة واقترح الإجراءات المناسبة'
      : activeMode.prefix + text.trim()

    const displayText = file
      ? (text.trim()
          ? `${getFileIcon(file.type)} **${file.name}**\n${text.trim()}`
          : `${getFileIcon(file.type)} **${file.name}** — طلب تحليل الوثيقة`)
      : text.trim()

    const history = messages.map(m => ({ role: m.role, content: m.content }))
    setMessages(prev => [...prev, { role: 'user', content: displayText }])
    setInput('')
    setAttachedFile(null)
    setLoading(true)
    setMessages(prev => [...prev, { role: 'assistant', content: '', streaming: true }])

    try {
      const endpoint = file ? '/analyze/stream' : '/chat/stream'
      const body = file
        ? JSON.stringify({ file_base64: file.base64, file_type: file.type, file_name: file.name, message: prefixedMessage, history })
        : JSON.stringify({ message: prefixedMessage, history })

      const res = await fetch(API_URL + endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body,
      })
      if (!res.ok) throw new Error('HTTP ' + res.status)

      const reader  = res.body!.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''
      let buffer      = ''

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
            const p   = JSON.parse(d)
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
      setMessages(prev => {
        const u = [...prev]
        u[u.length - 1] = { role: 'assistant', content: accumulated || 'عذراً، لم أتلقَّ ردّاً.', streaming: false }
        return u
      })
    } catch {
      setMessages(prev => {
        const u = [...prev]
        u[u.length - 1] = { role: 'assistant', content: 'عذراً، حدث خطأ في الاتصال. حاول مرة أخرى.', streaming: false }
        return u
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit  = (e: FormEvent) => { e.preventDefault(); sendMessage(input, attachedFile) }
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input, attachedFile) }
  }

  const canSend     = Boolean((input.trim() || attachedFile) && !loading)
  const currentMode = MODES.find(m => m.id === mode)!

  /* ── Render ─────────────────────────────────────────────────── */
  return (
    <div style={{
      position: 'fixed', inset: 0,
      bottom: footerBottom,
      display: 'flex', flexDirection: 'column',
      backgroundColor: '#fff',
      paddingTop: 'var(--safe-top)',
    }}>

      {/* ╔══════════════════════════════════════════════════╗
          ║  UNIFIED HEADER                                  ║
          ╚══════════════════════════════════════════════════╝ */}
      <header style={{
        flexShrink: 0,
        background: '#fff',
        borderBottom: '2px solid #8B1A1A',
        boxShadow: '0 2px 12px rgba(139,26,26,0.08)',
      }}>
        <div className="header-inner" style={{
          maxWidth: 720, margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>

          {/* ── Logo + Brand + AIJUR ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Image
              src="/logo.PNG"
              alt="Dalilak AI"
              width={46}
              height={46}
              style={{ objectFit: 'contain', display: 'block', flexShrink: 0 }}
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Brand name */}
              <div style={{
                fontSize: 17, fontWeight: 800,
                color: '#111827', letterSpacing: '-0.03em', lineHeight: 1.1,
              }}>
                دليلك <span style={{ color: '#8B1A1A' }}>AI</span>
              </div>
              {/* Tagline + AIJUR inline */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ fontSize: 10, color: '#B0B7C3', fontWeight: 400, letterSpacing: '0.01em' }}>
                  دليل المواطن اللبناني
                </span>
                <span style={{ width: 1, height: 10, background: '#E5E7EB', display: 'inline-block' }} />
                <span style={{ fontSize: 9.5, color: '#9CA3AF', fontWeight: 400, letterSpacing: '0.03em' }}>
                  by{' '}
                  <a href="https://aijur.ai" target="_blank" rel="noopener noreferrer"
                    style={{ color: '#8B1A1A', fontWeight: 700, textDecoration: 'none', letterSpacing: '0.05em' }}>
                    AIJUR
                  </a>
                </span>
              </div>
            </div>
          </div>

          {/* ── Right side ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

            {/* Contact links — desktop only */}
            <div className="header-contacts" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <a href="mailto:wissam@aijur.ai"
                style={{ display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none', color: '#9CA3AF', fontSize: 10.5 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#8B1A1A" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                wissam@aijur.ai
              </a>
              <a href="tel:+971529860608"
                style={{ display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none', color: '#9CA3AF', fontSize: 10.5 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#8B1A1A" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.16 6.16l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                +971 52 986 0608
              </a>
              <span style={{ width: 1, height: 16, background: '#E5E7EB' }} />
            </div>

            {/* New chat button */}
            {messages.length > 0 && (
              <button
                onClick={() => setMessages([])}
                className="chip-btn"
                style={{
                  fontSize: 11, color: '#6B7280', fontWeight: 500,
                  padding: '5px 12px', borderRadius: 8,
                  border: '1px solid #E5E7EB', background: '#fff',
                  cursor: 'pointer', fontFamily: 'inherit',
                }}>
                محادثة جديدة
              </button>
            )}

            {/* Status */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '4px 10px', borderRadius: 999,
              background: '#F0FDF4', border: '1px solid #BBF7D0',
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                backgroundColor: '#22C55E', display: 'block',
                animation: 'pulse-dot 2.5s ease infinite',
              }} />
              <span style={{ fontSize: 10.5, color: '#15803D', fontWeight: 600 }}>متصل</span>
            </div>

          </div>
        </div>
      </header>

      {/* ╔══════════════════════════════════╗
          ║  MAIN — scrollable               ║
          ╚══════════════════════════════════╝ */}
      <main style={{
        flex: 1, overflowY: 'auto',
        overscrollBehavior: 'contain',
        WebkitOverflowScrolling: 'touch' as any,
      }}>

        {messages.length === 0 ? (

          /* ── Welcome Screen ───────────────────────────────── */
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            minHeight: '100%',
            padding: '24px 18px 12px',
            textAlign: 'center',
          }}>

            {/* Logo */}
            <Image
              src="/logo.PNG"
              alt="Dalilak AI"
              className="logo-welcome"
              width={140}
              height={140}
              style={{ objectFit: 'contain', display: 'block', marginBottom: 14 }}
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
            />

            {/* Heading */}
            <h1 className="welcome-heading" style={{
              fontWeight: 800,
              color: '#111827', margin: '0 0 4px',
              letterSpacing: '-0.02em', lineHeight: 1.25,
            }}>
              كيف يمكنني مساعدتك؟
            </h1>

            {/* Decorative divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '8px 0' }}>
              <div style={{ height: 1, width: 52, background: 'linear-gradient(to left, transparent, #8B1A1A66)' }} />
              <div style={{ width: 5, height: 5, background: '#8B1A1A', transform: 'rotate(45deg)', opacity: 0.65 }} />
              <div style={{ height: 1, width: 52, background: 'linear-gradient(to right, transparent, #8B1A1A66)' }} />
            </div>

            {/* Subtitle */}
            <p className="welcome-sub" style={{
              color: '#9CA3AF', lineHeight: 1.8,
              margin: '0 0 22px', fontWeight: 400,
            }}>
              اسأل عن أي معاملة حكومية، ارفع وثيقة للتحليل، أو تحدث بصوتك مباشرةً
            </p>

            {/* Category cards — responsive grid */}
            <div className="welcome-grid">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  className="card-btn"
                  onClick={() => sendMessage(s.title + ' — ' + s.desc)}
                  style={{
                    gap: 6, padding: '16px 8px',
                    backgroundColor: '#fff',
                    borderRadius: 14,
                    border: '1px solid #E5E7EB',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    cursor: 'pointer', fontFamily: 'inherit',
                    width: '100%', minHeight: 90,
                  }}>
                  <span style={{ fontSize: 22, lineHeight: 1, display: 'block', textAlign: 'center' }}>{s.icon}</span>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: '#1F2937', lineHeight: 1.35, display: 'block', textAlign: 'center', width: '100%' }}>
                    {s.title}
                  </span>
                  <span style={{ fontSize: 10, color: '#9CA3AF', lineHeight: 1.4, display: 'block', textAlign: 'center', width: '100%' }}>
                    {s.desc}
                  </span>
                </button>
              ))}
            </div>

            {/* Quick questions */}
            <div className="quick-list">
              {quickQuestions.map((q, i) => (
                <button
                  key={i}
                  className="chip-btn"
                  onClick={() => sendMessage(q)}
                  style={{
                    width: '100%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '11px 16px',
                    backgroundColor: '#fff',
                    borderRadius: 10,
                    border: '1px solid #E5E7EB',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                    fontSize: 12.5, color: '#374151',
                    cursor: 'pointer', fontFamily: 'inherit',
                    textAlign: 'center',
                    gap: 8,
                  }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%',
                    backgroundColor: '#8B1A1A', opacity: 0.5, flexShrink: 0,
                  }} />
                  <span style={{ textAlign: 'center', flex: 1 }}>{q}</span>
                </button>
              ))}
            </div>

            {/* Capabilities */}
            <div style={{
              marginTop: 18, marginBottom: 6,
              display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center',
            }}>
              {['📎 PDF · صور · وثائق', '🎤 تسجيل صوتي', '🔍 تحليل فوري'].map((c, i) => (
                <span key={i} style={{
                  fontSize: 10.5, color: '#9CA3AF',
                  padding: '3px 11px', borderRadius: 999,
                  border: '1px solid #F3F4F6', backgroundColor: '#F9FAFB',
                  fontWeight: 400,
                }}>
                  {c}
                </span>
              ))}
            </div>

            {/* Stats */}
            <p style={{ fontSize: 10, color: '#C4B9B9', fontWeight: 600, letterSpacing: '0.03em', marginTop: 6 }}>
              35 قطاعاً · 2,484 معاملة · 1,206 نموذج رسمي
            </p>


          </div>

        ) : (

          /* ── Chat Messages ─────────────────────────────────── */
          <div style={{ maxWidth: 720, margin: '0 auto', padding: '16px 14px 8px' }}>
            {messages.map((msg, i) => (
              <div key={i} className="msg-in">
                <ChatMessage msg={msg} />
              </div>
            ))}
            <div ref={bottomRef} style={{ height: 8 }} />
          </div>

        )}
      </main>

      {/* ╔══════════════════════════════════╗
          ║  FOOTER — input                  ║
          ╚══════════════════════════════════╝ */}
      <footer style={{
        flexShrink: 0,
        backgroundColor: '#fff',
        borderTop: '1px solid #F3F4F6',
        paddingBottom: footerBottom > 0 ? 4 : 'var(--safe-bottom)',
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '8px 14px 6px' }}>

          {/* ── Mode pills ─────────────────────────────────── */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 6, marginBottom: 9,
          }}>
            {MODES.map(m => {
              const active = mode === m.id
              return (
                <button
                  key={m.id}
                  type="button"
                  className={`mode-btn${active ? ' active' : ''}`}
                  onClick={() => setMode(m.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '5px 13px', borderRadius: 999,
                    fontSize: 11.5, fontWeight: 500,
                    cursor: 'pointer', border: 'none',
                    backgroundColor: active ? '#8B1A1A' : '#F5F5F5',
                    color:           active ? '#fff'    : '#6B7280',
                    outline:         active ? 'none'    : '1px solid #E5E7EB',
                    boxShadow:       active ? '0 1px 6px rgba(139,26,26,0.28)' : 'none',
                    fontFamily: 'inherit',
                  }}>
                  <span style={{ fontSize: 12 }}>{m.icon}</span>
                  <span>{m.label}</span>
                </button>
              )
            })}
          </div>

          {/* ── File preview ───────────────────────────────── */}
          {attachedFile && (
            <div style={{
              marginBottom: 8,
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 12px',
              backgroundColor: '#F9FAFB',
              borderRadius: 12, border: '1px solid #E5E7EB',
            }}>
              {attachedFile.preview ? (
                <img src={attachedFile.preview} alt="preview"
                  style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
              ) : (
                <div style={{
                  width: 40, height: 40, borderRadius: 8, flexShrink: 0,
                  backgroundColor: '#FEF2F2', border: '1px solid #FECACA',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18,
                }}>
                  {getFileIcon(attachedFile.type)}
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0, textAlign: 'right' }}>
                <div style={{
                  fontSize: 12, fontWeight: 600, color: '#1F2937',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {attachedFile.name}
                </div>
                <div style={{ fontSize: 10.5, color: '#9CA3AF', marginTop: 2 }}>
                  {formatSize(attachedFile.size)} · سيتم التحليل بواسطة AI
                </div>
              </div>
              <button
                onClick={() => setAttachedFile(null)}
                style={{
                  width: 24, height: 24, borderRadius: '50%',
                  backgroundColor: '#E5E7EB', border: 'none',
                  cursor: 'pointer', fontSize: 15, color: '#6B7280',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, lineHeight: 1,
                }}>
                ×
              </button>
            </div>
          )}

          {/* ── Recording indicator ────────────────────────── */}
          {recording && (
            <div style={{
              marginBottom: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 10, padding: '9px 14px',
              backgroundColor: '#FEF2F2',
              borderRadius: 12, border: '1px solid #FEE2E2',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                {[5, 9, 7, 11, 8, 6, 10].map((h, n) => (
                  <span key={n} style={{
                    width: 3, height: h, backgroundColor: '#EF4444',
                    borderRadius: 2, display: 'block',
                    animation: 'wave 0.75s ease infinite',
                    animationDelay: `${n * 0.08}s`,
                    transformOrigin: 'center',
                  }} />
                ))}
              </div>
              <span style={{ fontSize: 12, color: '#DC2626', fontWeight: 600 }}>
                جاري الاستماع... تحدث الآن
              </span>
            </div>
          )}

          {/* ── Input form ─────────────────────────────────── */}
          <form onSubmit={handleSubmit}>
            <div
              className={`input-wrap${inputFocused ? ' focused' : ''}`}
              style={{
                display: 'flex', alignItems: 'flex-end', gap: 4,
                backgroundColor: '#fff',
                border: '1.5px solid #E5E7EB',
                borderRadius: 16, padding: '4px 5px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
              }}>

              {/* Attach button */}
              <button
                type="button"
                className="icon-btn"
                disabled={loading}
                onClick={() => fileInputRef.current?.click()}
                title="إرفاق ملف أو صورة"
                style={{
                  flexShrink: 0, width: 36, height: 36,
                  borderRadius: 10, border: 'none',
                  background: 'none', cursor: 'pointer',
                  color: '#9CA3AF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: loading ? 0.4 : 1,
                }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf,.doc,.docx"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                placeholder={
                  recording    ? 'جاري الاستماع...' :
                  attachedFile ? 'اسأل عن الوثيقة أو أرسل للتحليل...' :
                                 'اكتب سؤالك / Type your question...'
                }
                rows={1}
                disabled={loading}
                dir={getDir(input)}
                style={{
                  flex: 1, resize: 'none', border: 'none', outline: 'none',
                  fontSize: 14, color: '#1F2937',
                  background: 'transparent',
                  padding: '9px 4px', lineHeight: 1.6,
                  maxHeight: 120, fontFamily: 'inherit',
                  opacity: loading ? 0.55 : 1,
                }}
              />

              {/* Mic button */}
              <button
                type="button"
                disabled={loading}
                onClick={recording ? stopRecording : startRecording}
                style={{
                  flexShrink: 0, width: 36, height: 36,
                  borderRadius: 10, border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backgroundColor: recording ? '#EF4444' : 'transparent',
                  color: recording ? '#fff' : '#9CA3AF',
                  opacity: loading ? 0.4 : 1,
                  transition: 'all 0.15s ease',
                }}>
                <svg width="17" height="17" viewBox="0 0 24 24"
                  fill={recording ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>

              {/* Send button */}
              <button
                type="submit"
                className="send-btn"
                disabled={!canSend}
                style={{
                  flexShrink: 0, width: 36, height: 36,
                  borderRadius: 10, border: 'none',
                  cursor: canSend ? 'pointer' : 'default',
                  backgroundColor: canSend ? '#8B1A1A' : '#E5E7EB',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: canSend ? '0 1px 6px rgba(139,26,26,0.3)' : 'none',
                }}>
                {loading ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                    style={{ animation: 'spin 0.8s linear infinite' }}>
                    <circle cx="12" cy="12" r="10" stroke="#9CA3AF" strokeWidth="3" strokeOpacity="0.2" />
                    <path fill="#9CA3AF" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                    stroke={canSend ? '#fff' : '#9CA3AF'} strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            </div>

            {/* Bottom hints */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginTop: 5, padding: '0 2px',
            }}>
              <span style={{ fontSize: 10, color: '#D1D5DB' }}>
                {currentMode.icon} {currentMode.label} — {currentMode.hint}
              </span>
              <span style={{ fontSize: 10, color: '#D1D5DB' }}>
                ↵ إرسال · ⇧↵ سطر جديد
              </span>
            </div>
          </form>

        </div>
      </footer>

    </div>
  )
}
