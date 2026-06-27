'use client'

import React, { useState, useRef, useEffect, FormEvent, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import ChatMessage, { Message } from '@/components/ChatMessage'
import { getToken, getUser, clearToken, authHeaders, isAdmin, type User } from '@/lib/auth'

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
  const router = useRouter()
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
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)
  const mainRef = useRef<HTMLDivElement>(null)

  // ── Auth guard ────────────────────────────────────────────
  useEffect(() => {
    const token = getToken()
    if (!token) { router.push('/login'); return }
    // Verify token with backend (not just localStorage)
    fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(async res => {
      if (!res.ok) { clearToken(); router.push('/login'); return }
      const data = await res.json()
      setCurrentUser(data)
      setAuthChecked(true)
    }).catch(() => {
      // Network error — allow offline use if token exists
      setCurrentUser(getUser())
      setAuthChecked(true)
    })
    // ping to keep Render alive
    fetch(`${API_URL}/ping`).catch(() => {})
  }, [])

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
    recognition.lang = 'ar-LB'
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
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body,
      })
      if (res.status === 401) { clearToken(); router.push('/login'); return }
      if (res.status === 402) {
        setMessages(prev => prev.slice(0, -1).concat({
          role: 'assistant',
          content: '⏰ **انتهت فترتك التجريبية.**\n\nللاستمرار في استخدام دليلك AI، يرجى الترقية إلى الاشتراك المدفوع. تواصل معنا عبر البريد أو واتساب.',
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

  if (!authChecked) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ffffff' }}>
      <div style={{ fontSize: 14, color: '#9ca3af' }}>جاري التحقق...</div>
    </div>
  )

  return (
    <>
      <style>{`
        html, body { margin: 0; padding: 0; height: 100%; overflow: hidden; background: #ffffff; }
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
          --bg: #ffffff;
          --card: #FFFFFF;
          --border: #EAE4D9;
          --border-strong: #D4C9B8;
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
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        @keyframes glow {
          0%,100% { box-shadow: 0 0 8px rgba(139,26,26,0.15); }
          50%      { box-shadow: 0 0 18px rgba(139,26,26,0.30); }
        }
        .msg-in { animation: fadeUp 0.25s ease; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 4px; }
        .suggestion-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(139,26,26,0.10) !important; border-color: rgba(139,26,26,0.25) !important; }
        .quick-btn:hover { background: var(--red-light) !important; border-color: rgba(139,26,26,0.3) !important; color: var(--red) !important; }
        .mode-btn { transition: all 0.18s ease; }
        .mode-btn:hover { transform: scale(1.04); }
        .input-focused { border-color: var(--red) !important; box-shadow: 0 0 0 3px rgba(139,26,26,0.08), 0 2px 12px rgba(139,26,26,0.06) !important; }
        .send-btn:hover:not(:disabled) { background: var(--red-dark) !important; transform: scale(1.05); }
        .icon-btn:hover:not(:disabled) { background: var(--red-light) !important; color: var(--red) !important; }
      `}</style>

      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        bottom: footerBottom,
        display: 'flex', flexDirection: 'column',
        backgroundColor: 'var(--bg)',
        paddingTop: 'var(--safe-top)',
      }}>

        {/* ══════════════ HEADER ══════════════ */}
        <header style={{
          flexShrink: 0,
          backgroundColor: '#fff',
          borderBottom: '1px solid var(--border)',
          boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
        }}>
          {/* Top accent line */}
          <div style={{
            height: 3,
            background: 'linear-gradient(90deg, var(--red) 0%, #C9982A 50%, var(--red) 100%)',
          }} />
          <div style={{
            maxWidth: 720, margin: '0 auto',
            padding: '10px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <img src="/logo.PNG" alt="Dalilak AI"
                style={{ width: 48, height: 48, objectFit: 'contain', flexShrink: 0, mixBlendMode: 'multiply' }} />
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.3px', lineHeight: 1.2 }}>
                  Dalilak <span style={{ color: 'var(--red)' }}>AI</span>
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-3)', lineHeight: 1.3, fontWeight: 500 }}>
                  دليل المواطن اللبناني الذكي
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {messages.length > 0 && (
                <button onClick={() => setMessages([])} style={{
                  fontSize: 11, color: 'var(--text-3)', padding: '5px 12px',
                  borderRadius: 20, border: '1px solid var(--border)',
                  background: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  fontWeight: 500,
                }}>
                  محادثة جديدة
                </button>
              )}
              {/* Trial badge */}
              {currentUser?.plan === 'trial' && currentUser?.days_left !== undefined && (
                <div style={{
                  fontSize: 10, color: currentUser.days_left <= 1 ? '#dc2626' : '#d97706',
                  background: currentUser.days_left <= 1 ? '#fef2f2' : '#fffbeb',
                  border: `1px solid ${currentUser.days_left <= 1 ? '#fecaca' : '#fde68a'}`,
                  borderRadius: 20, padding: '4px 10px', fontWeight: 600,
                }}>
                  ⏱️ {currentUser.days_left} {currentUser.days_left === 1 ? 'يوم' : 'أيام'} تجريبية
                </div>
              )}
              {/* Admin link */}
              {isAdmin() && (
                <button onClick={() => router.push('/admin')} style={{
                  fontSize: 11, color: '#6b2737', padding: '5px 12px',
                  borderRadius: 20, border: '1px solid #e9d5d8',
                  background: '#fdf2f4', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600,
                }}>
                  🛡️ Admin
                </button>
              )}
              {/* Logout */}
              <button onClick={() => { clearToken(); router.push('/login') }} style={{
                fontSize: 11, color: 'var(--text-3)', padding: '5px 10px',
                borderRadius: 20, border: '1px solid var(--border)',
                background: 'none', cursor: 'pointer', fontFamily: 'inherit',
              }}>
                خروج
              </button>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: '#F0FDF4', borderRadius: 20, padding: '4px 10px',
                border: '1px solid #BBF7D0',
              }}>
                <span style={{
                  width: 7, height: 7, borderRadius: '50%',
                  backgroundColor: '#22c55e', display: 'inline-block',
                  boxShadow: '0 0 6px #22c55e',
                  animation: 'pulse 2.5s infinite',
                }} />
                <span style={{ fontSize: 10, color: '#16a34a', fontWeight: 600 }}>متصل</span>
              </div>
            </div>
          </div>
        </header>

        {/* ══════════════ MAIN ══════════════ */}
        <main ref={mainRef} style={{
          flex: 1, overflowY: 'auto',
          overscrollBehavior: 'contain',
          WebkitOverflowScrolling: 'touch' as any,
        }}>
          {messages.length === 0 ? (

            /* ── Welcome Screen ── */
            <div style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              minHeight: '100%', padding: '20px 16px 8px',
              textAlign: 'center',
            }}>

              {/* Hero logo */}
              <img src="/logo.PNG" alt="Dalilak AI"
                style={{ width: 130, height: 130, objectFit: 'contain', marginBottom: 16, mixBlendMode: 'multiply' }} />

              <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
                كيف يمكنني مساعدتك؟
              </h2>

              {/* Decorative divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0 10px' }}>
                <div style={{ height: 1.5, width: 40, background: 'linear-gradient(90deg, transparent, var(--red))' }} />
                <div style={{ width: 6, height: 6, background: 'var(--gold)', transform: 'rotate(45deg)', borderRadius: 1 }} />
                <div style={{ height: 1.5, width: 40, background: 'linear-gradient(90deg, var(--red), transparent)' }} />
              </div>

              <p style={{ fontSize: 12, color: 'var(--text-3)', maxWidth: 280, lineHeight: 1.7, margin: '0 0 18px', fontWeight: 400 }}>
                اسأل عن أي معاملة حكومية، ارفع وثيقة للتحليل، أو تحدث مباشرةً بالصوت
              </p>

              {/* Suggestion cards 2×2 */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr',
                gap: 10, width: '100%', maxWidth: 360, marginBottom: 12,
              }}>
                {SUGGESTIONS.map((s, i) => (
                  <button key={i}
                    className="suggestion-card"
                    onClick={() => sendMessage(s.title + ' — ' + s.desc)}
                    style={{
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      gap: 6, padding: '16px 10px',
                      backgroundColor: '#fff', borderRadius: 16, cursor: 'pointer',
                      border: '1.5px solid var(--border)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                      transition: 'all 0.2s ease', fontFamily: 'inherit',
                      textAlign: 'center',
                    }}
                    onTouchStart={e => { e.currentTarget.style.transform = 'scale(0.95)'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.08)' }}
                    onTouchEnd={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 12,
                      background: 'linear-gradient(135deg, var(--red-light) 0%, #FDE8E8 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 22, marginBottom: 2,
                      border: '1px solid rgba(139,26,26,0.12)',
                    }}>
                      {s.icon}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', lineHeight: 1.3, textAlign: 'center' }}>
                      {s.title}
                    </span>
                    <span style={{ fontSize: 10, color: 'var(--text-3)', lineHeight: 1.4, textAlign: 'center' }}>
                      {s.desc}
                    </span>
                  </button>
                ))}
              </div>

              {/* Quick questions */}
              <div style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 7 }}>
                {QUICK_QUESTIONS.map((q, i) => (
                  <button key={i}
                    className="quick-btn"
                    onClick={() => sendMessage(q)}
                    style={{
                      width: '100%', padding: '11px 16px',
                      backgroundColor: '#fff', borderRadius: 12,
                      border: '1.5px solid var(--border)',
                      fontSize: 12.5, color: 'var(--text-2)', fontWeight: 500,
                      cursor: 'pointer', fontFamily: 'inherit',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                      transition: 'all 0.18s ease',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      textAlign: 'center',
                    }}
                    onTouchStart={e => { e.currentTarget.style.transform = 'scale(0.97)'; e.currentTarget.style.background = 'var(--red-light)' }}
                    onTouchEnd={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = '#fff' }}>
                    <span style={{ color: 'var(--red)', fontSize: 13 }}>←</span>
                    {q}
                  </button>
                ))}
              </div>

              {/* Feature badges */}
              <div style={{
                marginTop: 16, marginBottom: 4,
                display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center',
              }}>
                {['📎 صور · PDF · وثائق', '🎤 تسجيل صوتي', '🔍 تحليل فوري'].map((badge, i) => (
                  <span key={i} style={{
                    fontSize: 10, color: 'var(--text-3)', fontWeight: 500,
                    background: '#fff', padding: '4px 10px', borderRadius: 20,
                    border: '1px solid var(--border)',
                  }}>
                    {badge}
                  </span>
                ))}
              </div>
            </div>

          ) : (

            /* ── Chat Messages ── */
            <div style={{ maxWidth: 720, margin: '0 auto', padding: '12px 14px' }}>
              {messages.map((msg, i) => (
                <div key={i} className="msg-in"><ChatMessage msg={msg} /></div>
              ))}
              <div ref={bottomRef} style={{ height: 8 }} />
            </div>
          )}
        </main>

        {/* ══════════════ FOOTER / INPUT ══════════════ */}
        <footer style={{
          flexShrink: 0,
          backgroundColor: 'transparent',
          paddingBottom: footerBottom > 0 ? 4 : 'var(--safe-bottom)',
        }}>
          <div style={{ maxWidth: 720, margin: '0 auto', padding: '6px 12px 10px' }}>

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
                    {getFileIcon(attachedFile.type)}
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0, textAlign: 'right' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {attachedFile.name}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 1 }}>{formatSize(attachedFile.size)}</div>
                  <div style={{ fontSize: 10, color: 'var(--red)', fontWeight: 600, marginTop: 1 }}>⚡ جاهز للتحليل</div>
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
                <span style={{ fontSize: 12, color: '#dc2626', fontWeight: 600 }}>جاري الاستماع... تحدث الآن</span>
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

            {/* ── Mode selector — centered above input ── */}
            <div style={{
              display: 'flex', justifyContent: 'center', marginBottom: 10,
            }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center',
                background: '#f3f4f6', borderRadius: 999,
                padding: '3px', gap: 2,
              }}>
                {MODES.map(m => {
                  const active = mode === m.id
                  return (
                    <button key={m.id} type="button"
                      className="mode-btn"
                      onClick={() => setMode(m.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        padding: '6px 16px', borderRadius: 999, fontSize: 12,
                        fontWeight: 600, cursor: 'pointer', border: 'none',
                        background: active ? '#fff' : 'transparent',
                        color: active ? 'var(--red)' : '#9ca3af',
                        boxShadow: active ? '0 1px 4px rgba(0,0,0,0.12)' : 'none',
                        fontFamily: 'inherit',
                        transition: 'all 0.18s ease',
                      }}>
                      <span style={{ fontSize: 13 }}>{m.icon}</span>
                      <span>{m.label}</span>
                    </button>
                  )
                })}
              </div>
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

                {/* Input row */}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, flex: 1 }}>

                {/* Attach */}
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={loading}
                  className="icon-btn"
                  title="إرفاق ملف أو صورة"
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
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
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
                    fontSize: 14.5, color: 'var(--text)', background: 'transparent',
                    padding: '7px 4px', lineHeight: 1.55, maxHeight: 120,
                    fontFamily: 'inherit', opacity: loading ? 0.5 : 1,
                  }}
                />

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
                </div>{/* end input row */}
              </div>{/* end input box */}

            </form>

          </div>
        </footer>

      </div>
    </>
  )
}
