'use client'

import React, { useState, useRef, useEffect, FormEvent, useCallback } from 'react'
import Image from 'next/image'
import ChatMessage, { Message } from '@/components/ChatMessage'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dalilak-backend-bvb9.onrender.com'

interface AttachedFile {
  name: string
  type: string
  base64: string
  preview?: string
  size: number
}

type ResponseMode = 'quick' | 'detailed' | 'research'

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
    prefix: '[أجب بتقرير شامل: تحليل كامل، جميع الخيارات المتاحة، الأدلة الرسمية، المراجع القانونية، نموذج جاهز للاستخدام إن وجد، وتنبيهات العطل الرسمية] ',
  },
]

const SUGGESTIONS = [
  { icon: '📋', title: 'المعاملات الرسمية', desc: 'جوازات، هويات، وثائق رسمية' },
  { icon: '🏛️', title: 'الإجراءات الحكومية', desc: 'تسجيل شركات، عقارات، سيارات' },
  { icon: '👶', title: 'الأحوال الشخصية', desc: 'ولادة، زواج، وفاة، طلاق' },
  { icon: '🎓', title: 'التعليم والعمل', desc: 'شهادات، تصاريح، حقوق العمال' },
]

const QUICK_QUESTIONS = [
  'كيف أستخرج جواز سفر لبناني؟',
  'ما هي إجراءات تسجيل سيارة جديدة؟',
  'كيف أستخرج شهادة ميلاد؟',
  'كيف أسجل شركة في لبنان؟',
]

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [recording, setRecording] = useState(false)
  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null)
  const [mode, setMode] = useState<ResponseMode>('detailed')
  const [footerBottom, setFooterBottom] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)
  const mainRef = useRef<HTMLDivElement>(null)

  // ── Keyboard / visualViewport fix ────────────────────────
  useEffect(() => {
    const vv = (window as any).visualViewport
    if (!vv) return

    const onViewport = () => {
      // Distance from bottom of visual viewport to bottom of layout viewport
      const offset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
      setFooterBottom(offset)
      // Scroll chat to bottom when keyboard opens
      if (offset > 50) {
        setTimeout(() => {
          bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, 50)
      }
    }

    vv.addEventListener('resize', onViewport)
    vv.addEventListener('scroll', onViewport)
    return () => {
      vv.removeEventListener('resize', onViewport)
      vv.removeEventListener('scroll', onViewport)
    }
  }, [])

  // ── Auto-scroll on new messages ───────────────────────────
  useEffect(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80)
  }, [messages])

  // ── Auto-resize textarea ──────────────────────────────────
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 96) + 'px'
  }, [input])

  // ── Voice ─────────────────────────────────────────────────
  const startRecording = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) { alert('التعرف على الصوت غير مدعوم. استخدم Chrome أو Edge.'); return }
    const recognition = new SR()
    recognition.lang = navigator.language || 'ar'
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
  }, [])

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
  const getFileIcon = (t: string) => t.startsWith('image/') ? '🖼️' : t === 'application/pdf' ? '📄' : t.includes('word') ? '📝' : '📎'

  // ── Send ──────────────────────────────────────────────────
  const sendMessage = async (text: string, file?: AttachedFile | null, overrideMode?: ResponseMode) => {
    const hasContent = text.trim() || file
    if (!hasContent || loading) return

    const activeMode = MODES.find(m => m.id === (overrideMode || mode))!
    const prefixedMessage = file
      ? text.trim() || 'حلل هذه الوثيقة واقترح الإجراءات المناسبة'
      : activeMode.prefix + text.trim()

    const displayText = file
      ? (text.trim() ? `${getFileIcon(file.type)} **${file.name}**\n${text.trim()}` : `${getFileIcon(file.type)} **${file.name}** — طلب تحليل الوثيقة`)
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

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''
      let buffer = ''

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

  const handleSubmit = (e: FormEvent) => { e.preventDefault(); sendMessage(input, attachedFile) }
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input, attachedFile) }
  }

  const canSend = Boolean((input.trim() || attachedFile) && !loading)
  const currentMode = MODES.find(m => m.id === mode)!

  return (
    <>
      {/* Global styles */}
      <style>{`
        html, body { margin: 0; padding: 0; height: 100%; overflow: hidden; }
        * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
        textarea { font-family: inherit; }
        :root { --safe-top: env(safe-area-inset-top, 0px); --safe-bottom: env(safe-area-inset-bottom, 0px); }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        .msg-in { animation: fadeUp 0.2s ease; }
        /* Custom scrollbar */
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }
      `}</style>

      {/*
        Root: position:fixed fills the VISUAL viewport.
        When the iOS keyboard opens, the visual viewport shrinks
        and the footer stays pinned above the keyboard automatically.
      */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: footerBottom,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#ffffff',
          paddingTop: 'var(--safe-top)',
        }}
      >

        {/* ── Header ──────────────────────────────────────────── */}
        <header style={{
          flexShrink: 0,
          backgroundColor: '#fff',
          borderBottom: '1px solid #f3f4f6',
        }}>
          <div style={{
            maxWidth: 720,
            margin: '0 auto',
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            {/* Logo + title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Image src="/logo.PNG" alt="Dalilak AI" width={32} height={32}
                style={{ objectFit: 'contain', flexShrink: 0 }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.2, color: '#111' }}>
                  Dalilak <span style={{ color: '#8B1A1A' }}>AI</span>
                </div>
                <div style={{ fontSize: 10, color: '#9ca3af', lineHeight: 1.2 }}>دليل المواطن اللبناني</div>
              </div>
            </div>

            {/* Right actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {messages.length > 0 && (
                <button
                  onClick={() => setMessages([])}
                  style={{
                    fontSize: 11, color: '#9ca3af', padding: '4px 10px',
                    borderRadius: 8, border: 'none', background: 'none',
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}>
                  محادثة جديدة
                </button>
              )}
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#9ca3af' }}>
                <span style={{
                  width: 6, height: 6, borderRadius: '50%',
                  backgroundColor: '#22c55e', display: 'inline-block',
                  animation: 'pulse 2s infinite',
                }} />
                متصل
              </span>
            </div>
          </div>
        </header>

        {/* ── Main (scrollable) ────────────────────────────────── */}
        <main
          ref={mainRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            overscrollBehavior: 'contain',
            WebkitOverflowScrolling: 'touch' as any,
          }}
        >
          {messages.length === 0 ? (

            /* ── Welcome Screen ── */
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '100%',
              padding: '12px 14px 4px',
              textAlign: 'center',
            }}>
              <Image src="/logo.PNG" alt="Dalilak AI" width={72} height={72}
                style={{ objectFit: 'contain', marginBottom: 10 }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />

              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111', margin: '0 0 6px' }}>
                كيف يمكنني مساعدتك؟
              </h2>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0 6px' }}>
                <div style={{ height: 1, width: 36, backgroundColor: '#8B1A1A', opacity: 0.3 }} />
                <div style={{ width: 5, height: 5, backgroundColor: '#8B1A1A', transform: 'rotate(45deg)', opacity: 0.6 }} />
                <div style={{ height: 1, width: 36, backgroundColor: '#8B1A1A', opacity: 0.3 }} />
              </div>

              <p style={{ fontSize: 11, color: '#9ca3af', maxWidth: 260, lineHeight: 1.6, margin: '0 0 12px' }}>
                اسأل عن أي معاملة حكومية، ارفع وثيقة، أو تحدث مباشرةً
              </p>

              {/* Cards 2×2 */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 8,
                width: '100%',
                maxWidth: 340,
                marginBottom: 10,
              }}>
                {SUGGESTIONS.map((s, i) => (
                  <button key={i} onClick={() => sendMessage(s.title + ' — ' + s.desc)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      justifyContent: 'center', gap: 4, padding: '12px 8px',
                      backgroundColor: '#fff', borderRadius: 12, cursor: 'pointer',
                      border: '1px solid #f3f4f6', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                      transition: 'all 0.15s', fontFamily: 'inherit',
                    }}
                    onTouchStart={e => (e.currentTarget.style.transform = 'scale(0.95)')}
                    onTouchEnd={e => (e.currentTarget.style.transform = 'scale(1)')}>
                    <span style={{ fontSize: 20 }}>{s.icon}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#1f2937', lineHeight: 1.3 }}>{s.title}</span>
                    <span style={{ fontSize: 10, color: '#9ca3af', lineHeight: 1.4 }}>{s.desc}</span>
                  </button>
                ))}
              </div>

              {/* Quick questions */}
              <div style={{ width: '100%', maxWidth: 340, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {QUICK_QUESTIONS.map((q, i) => (
                  <button key={i} onClick={() => sendMessage(q)}
                    style={{
                      width: '100%', textAlign: 'center', padding: '10px 12px',
                      backgroundColor: '#fff', borderRadius: 10,
                      border: '1px solid #f3f4f6', fontSize: 12, color: '#4b5563',
                      cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      transition: 'all 0.15s', fontFamily: 'inherit',
                    }}
                    onTouchStart={e => (e.currentTarget.style.transform = 'scale(0.97)')}
                    onTouchEnd={e => (e.currentTarget.style.transform = 'scale(1)')}>
                    {q}
                  </button>
                ))}
              </div>

              <div style={{
                marginTop: 12, marginBottom: 4,
                display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center',
                fontSize: 10, color: '#d1d5db',
              }}>
                <span>📎 صور · PDF · وثائق</span>
                <span>·</span>
                <span>🎤 تسجيل صوتي</span>
                <span>·</span>
                <span>🔍 تحليل فوري</span>
              </div>
            </div>

          ) : (

            /* ── Chat Messages ── */
            <div style={{ maxWidth: 720, margin: '0 auto', padding: '10px 12px' }}>
              {messages.map((msg, i) => (
                <div key={i} className="msg-in"><ChatMessage msg={msg} /></div>
              ))}
              <div ref={bottomRef} style={{ height: 8 }} />
            </div>
          )}
        </main>

        {/* ── Footer / Input (always visible) ─────────────────── */}
        <footer style={{
          flexShrink: 0,
          backgroundColor: '#fff',
          borderTop: '1px solid #f3f4f6',
          paddingBottom: footerBottom > 0 ? 4 : 'var(--safe-bottom)',
        }}>
          <div style={{ maxWidth: 720, margin: '0 auto', padding: '6px 10px 6px' }}>

            {/* ── Mode pills ── */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 6, marginBottom: 6,
            }}>
              {MODES.map(m => {
                const active = mode === m.id
                return (
                  <button key={m.id} type="button" onClick={() => setMode(m.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      padding: '4px 11px', borderRadius: 999, fontSize: 11,
                      fontWeight: 500, cursor: 'pointer', border: 'none',
                      backgroundColor: active ? '#8B1A1A' : '#f5f5f5',
                      color: active ? '#fff' : '#9ca3af',
                      outline: active ? 'none' : '1px solid #e5e7eb',
                      transition: 'all 0.15s', fontFamily: 'inherit',
                    }}
                    onTouchStart={e => (e.currentTarget.style.transform = 'scale(0.94)')}
                    onTouchEnd={e => (e.currentTarget.style.transform = 'scale(1)')}>
                    <span style={{ fontSize: 12 }}>{m.icon}</span>
                    <span>{m.label}</span>
                  </button>
                )
              })}
            </div>

            {/* File preview */}
            {attachedFile && (
              <div style={{
                marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 10px', backgroundColor: '#f9fafb',
                borderRadius: 10, border: '1px solid #e5e7eb',
              }}>
                {attachedFile.preview ? (
                  <img src={attachedFile.preview} alt="preview"
                    style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                ) : (
                  <div style={{
                    width: 40, height: 40, borderRadius: 8, backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 18, flexShrink: 0,
                  }}>
                    {getFileIcon(attachedFile.type)}
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0, textAlign: 'right' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#1f2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {attachedFile.name}
                  </div>
                  <div style={{ fontSize: 10, color: '#9ca3af' }}>{formatSize(attachedFile.size)}</div>
                  <div style={{ fontSize: 10, color: '#ef4444' }}>تحليل بواسطة AI</div>
                </div>
                <button onClick={() => setAttachedFile(null)}
                  style={{
                    width: 22, height: 22, borderRadius: '50%', backgroundColor: '#e5e7eb',
                    border: 'none', cursor: 'pointer', fontSize: 14, color: '#6b7280',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                  ×
                </button>
              </div>
            )}

            {/* Recording indicator */}
            {recording && (
              <div style={{
                marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 8, padding: '6px', backgroundColor: '#fef2f2',
                borderRadius: 10, border: '1px solid #fee2e2',
              }}>
                <span style={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
                  {[8, 13, 10, 15, 11].map((h, n) => (
                    <span key={n} style={{
                      width: 3, height: h, backgroundColor: '#ef4444', borderRadius: 2,
                      animation: 'pulse 1s infinite', animationDelay: `${n * 0.1}s`,
                      display: 'inline-block',
                    }} />
                  ))}
                </span>
                <span style={{ fontSize: 11, color: '#dc2626', fontWeight: 500 }}>جاري الاستماع... تحدث الآن</span>
                <span style={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
                  {[11, 15, 10, 13, 8].map((h, n) => (
                    <span key={n} style={{
                      width: 3, height: h, backgroundColor: '#ef4444', borderRadius: 2,
                      animation: 'pulse 1s infinite', animationDelay: `${n * 0.12}s`,
                      display: 'inline-block',
                    }} />
                  ))}
                </span>
              </div>
            )}

            {/* ── Input row ── */}
            <form onSubmit={handleSubmit}>
              <div style={{
                display: 'flex', alignItems: 'flex-end', gap: 4,
                backgroundColor: '#fff', border: recording ? '1.5px solid #fca5a5' : '1.5px solid #e5e7eb',
                borderRadius: 16, padding: '4px 6px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                transition: 'border-color 0.15s',
              }}>

                {/* Attach */}
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={loading}
                  title="إرفاق ملف أو صورة"
                  style={{
                    flexShrink: 0, width: 36, height: 36, borderRadius: 10,
                    border: 'none', background: 'none', cursor: 'pointer',
                    color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: loading ? 0.4 : 1,
                  }}
                  onTouchStart={e => !loading && (e.currentTarget.style.backgroundColor = '#fef2f2')}
                  onTouchEnd={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>
                <input ref={fileInputRef} type="file" accept="image/*,.pdf,.doc,.docx" style={{ display: 'none' }} onChange={handleFileChange} />

                {/* Textarea */}
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    recording ? 'جاري الاستماع...' :
                    attachedFile ? 'اسأل عن الوثيقة أو أرسل للتحليل...' :
                    'اكتب سؤالك هنا...'
                  }
                  rows={1}
                  disabled={loading}
                  dir="rtl"
                  style={{
                    flex: 1, resize: 'none', border: 'none', outline: 'none',
                    fontSize: 14, color: '#374151', background: 'transparent',
                    padding: '8px 2px', lineHeight: 1.5, maxHeight: 96,
                    fontFamily: 'inherit', opacity: loading ? 0.5 : 1,
                  }}
                />

                {/* Mic */}
                <button type="button" onClick={recording ? stopRecording : startRecording} disabled={loading}
                  style={{
                    flexShrink: 0, width: 36, height: 36, borderRadius: 10, border: 'none',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: recording ? '#ef4444' : 'transparent',
                    color: recording ? '#fff' : '#9ca3af',
                    opacity: loading ? 0.4 : 1,
                    transition: 'all 0.15s',
                  }}
                  onTouchStart={e => !loading && !recording && (e.currentTarget.style.backgroundColor = '#fef2f2')}
                  onTouchEnd={e => !recording && (e.currentTarget.style.backgroundColor = 'transparent')}>
                  <svg width="18" height="18" viewBox="0 0 24 24"
                    fill={recording ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>

                {/* Send */}
                <button type="submit" disabled={!canSend}
                  style={{
                    flexShrink: 0, width: 36, height: 36, borderRadius: 10, border: 'none',
                    cursor: canSend ? 'pointer' : 'default',
                    backgroundColor: canSend ? '#8B1A1A' : '#e5e7eb',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s',
                  }}
                  onTouchStart={e => canSend && (e.currentTarget.style.transform = 'scale(0.92)')}
                  onTouchEnd={e => (e.currentTarget.style.transform = 'scale(1)')}>
                  {loading ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                      style={{ animation: 'spin 1s linear infinite' }}>
                      <circle cx="12" cy="12" r="10" stroke="#9ca3af" strokeWidth="4" strokeOpacity="0.25" />
                      <path fill="#9ca3af" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Bottom hint */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginTop: 4, padding: '0 2px',
              }}>
                <span style={{ fontSize: 10, color: '#d1d5db' }}>
                  {currentMode.icon} {currentMode.label} — {currentMode.hint}
                </span>
                <span style={{ fontSize: 10, color: '#d1d5db' }}>
                  35 قطاعاً · 1,746 سجل
                </span>
              </div>
            </form>

          </div>
        </footer>

      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </>
  )
}
