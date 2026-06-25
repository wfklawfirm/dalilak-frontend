'use client'

import React, { useState, useRef, useEffect, FormEvent } from 'react'
import Image from 'next/image'
import ChatMessage, { Message } from '@/components/ChatMessage'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dalilak-backend-bvb9.onrender.com'

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
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
    }
  }, [input])

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return
    const userMsg: Message = { role: 'user', content: text.trim() }
    const history = messages.map(m => ({ role: m.role, content: m.content }))
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    setMessages(prev => [...prev, { role: 'assistant', content: '', streaming: true }])
    try {
      const res = await fetch(API_URL + '/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim(), history }),
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
        const sseLines = buffer.split('\n')
        buffer = sseLines.pop() || ''
        for (const sseLine of sseLines) {
          const trimmed = sseLine.trim()
          if (!trimmed.startsWith('data: ')) continue
          const data = trimmed.slice(6).trim()
          if (data === '[DONE]') continue
          try {
            const parsed = JSON.parse(data)
            if (parsed.type === 'token' && parsed.text) {
              accumulated += parsed.text
              setMessages(prev => { const u = [...prev]; u[u.length-1] = { role: 'assistant', content: accumulated, streaming: true }; return u })
            }
            const token = parsed.choices?.[0]?.delta?.content
            if (token) {
              accumulated += token
              setMessages(prev => { const u = [...prev]; u[u.length-1] = { role: 'assistant', content: accumulated, streaming: true }; return u })
            }
          } catch {}
        }
      }
      setMessages(prev => { const u = [...prev]; u[u.length-1] = { role: 'assistant', content: accumulated || 'عذراً، لم أتلقَّ ردّاً.', streaming: false }; return u })
    } catch {
      setMessages(prev => { const u = [...prev]; u[u.length-1] = { role: 'assistant', content: 'عذراً، حدث خطأ في الاتصال.', streaming: false }; return u })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: FormEvent) => { e.preventDefault(); sendMessage(input) }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) }
  }

  return (
    <div className="flex flex-col h-screen bg-white">

      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm px-6 py-3 flex-shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.PNG"
              alt="Dalilak AI"
              width={44}
              height={44}
              className="object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
            <div>
              <h1 className="text-base font-bold text-gray-900 leading-tight">
                Dalilak <span style={{color:'#8B1A1A'}}>AI</span>
              </h1>
              <p className="text-xs text-gray-400">دليل ذكي للمواطن اللبناني</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-gray-400">متصل</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 overflow-y-auto bg-white">
        {messages.length === 0 ? (

          <div className="flex flex-col items-center justify-center min-h-full px-4 py-10 text-center">

            {/* Logo */}
            <div className="mb-6">
              <Image
                src="/logo.PNG"
                alt="Dalilak AI"
                width={160}
                height={160}
                className="object-contain mx-auto"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            </div>

            {/* Title */}
            <h2 className="text-3xl font-bold text-gray-900 mb-1">
              كيف يمكنني مساعدتك اليوم؟
            </h2>
            <div className="flex items-center gap-3 my-3">
              <div style={{height:1, width:60, backgroundColor:'#8B1A1A', opacity:0.4}} />
              <div style={{width:6, height:6, backgroundColor:'#8B1A1A', transform:'rotate(45deg)'}} />
              <div style={{height:1, width:60, backgroundColor:'#8B1A1A', opacity:0.4}} />
            </div>
            <p className="text-gray-500 text-sm mb-8 max-w-md leading-relaxed">
              اطرح سؤالاً حول أي معاملة حكومية لبنانية وسأرشدك خطوة بخطوة
            </p>

            {/* Feature Cards */}
            <div className="grid grid-cols-2 gap-3 w-full max-w-xl mb-6">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s.title + ' — ' + s.desc)}
                  className="flex flex-col items-start gap-1 p-4 bg-white rounded-xl border border-gray-100 hover:border-red-200 hover:bg-red-50 text-right shadow-sm hover:shadow-md transition-all group"
                >
                  <span className="text-2xl">{s.icon}</span>
                  <span className="font-semibold text-gray-800 text-sm group-hover:text-red-800">{s.title}</span>
                  <span className="text-xs text-gray-400">{s.desc}</span>
                </button>
              ))}
            </div>

            {/* Quick Questions */}
            <div className="w-full max-w-xl space-y-2">
              {QUICK_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q)}
                  className="w-full text-right px-4 py-3 bg-white rounded-xl border border-gray-100 hover:border-red-200 hover:bg-red-50 text-sm text-gray-600 shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
                >
                  <span className="text-gray-300 group-hover:text-red-300 text-xs">←</span>
                  <span>{q}</span>
                </button>
              ))}
            </div>

          </div>

        ) : (

          <div className="max-w-3xl mx-auto px-4 py-6">
            {messages.map((msg, i) => (
              <div key={i} className="msg-appear">
                <ChatMessage msg={msg} />
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

        )}
      </main>

      {/* Input */}
      <footer className="bg-white border-t border-gray-100 px-4 py-4 flex-shrink-0">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="flex items-end gap-2 bg-white border border-gray-200 rounded-2xl px-4 py-2 shadow-sm focus-within:border-red-300 focus-within:shadow-md transition-all">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="اكتب سؤالك هنا... (Enter للإرسال)"
              rows={1}
              disabled={loading}
              className="flex-1 resize-none border-0 outline-none text-sm text-gray-700 placeholder-gray-300 bg-transparent py-1.5 disabled:opacity-50"
              style={{ maxHeight: '120px' }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              style={{backgroundColor: input.trim() && !loading ? '#8B1A1A' : undefined}}
              className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center bg-gray-100 disabled:opacity-40 hover:opacity-90 transition-all"
            >
              {loading ? (
                <svg className="w-4 h-4 animate-spin text-gray-400" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              ) : (
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              )}
            </button>
          </div>
          <p className="text-center text-xs text-gray-300 mt-2">
            Dalilak AI · 35 قطاعاً حكومياً · 897 مصدر معلومات
          </p>
        </form>
      </footer>

    </div>
  )
}
