'use client'

// دليلك — بحث بالذكاء الاصطناعي داخل أرشيف الوثائق الرسمية
//
// بطلب المستخدم: "اجعل البحث عبر الذكاء الاصطناعي و ليس محرك بحث عادة".
// يستخدم نقطة النهاية الموجودة مسبقاً /chat/stream مع معامل domain الموجود
// أصلاً في ChatRequest (backend/main.py) — بدون أي تعديل على الـ Backend —
// لتضييق نطاق الاسترجاع على وثائق الأرشيف فقط (domain=official_documents_archive)
// والحصول على إجابة مُصاغة بالذكاء الاصطناعي بدل قائمة نتائج نصية بسيطة.
//
// يطابق عناوين المصادر المُعادة من الباك-إند مع lib/archiveDocuments.ts محلياً
// (كلاهما مصدره نفس title من forms_pipeline/final_dataset.json) لعرض روابط
// PDF حقيقية — بدون الحاجة لأي تغيير في شكل استجابة الباك-إند.
//
// يتطلب تسجيل دخول لأن /chat/stream يتطلب Bearer token أصلاً (نفس شرط
// "اسأل دليلك" الرئيسي) — لا تجاوز أو تسهيل جديد للمصادقة، فقط إعادة استخدام
// الشرط الموجود.

import React, { useState, useRef } from 'react'
import Link from 'next/link'
import { isLoggedIn, authHeaders } from '@/lib/auth'
import type { ArchiveDoc } from '@/lib/archiveDocuments'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dalilak-backend-bvb9.onrender.com'

interface AISource {
  title: string
  ministry: string
  score: number
  doc?: ArchiveDoc
}

interface Props {
  isAr: boolean
  docs: ArchiveDoc[]
  onAskFull: (prompt: string) => void
}

type Status = 'idle' | 'loading' | 'streaming' | 'done' | 'error'

export default function ArchiveAISearch({ isAr, docs, onAskFull }: Props) {
  const [loggedIn] = useState(() => isLoggedIn())
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [answer, setAnswer] = useState('')
  const [sources, setSources] = useState<AISource[]>([])
  const [errorMsg, setErrorMsg] = useState('')
  const abortRef = useRef<AbortController | null>(null)

  const matchDoc = (title: string): ArchiveDoc | undefined => {
    const exact = docs.find(d => d.title === title)
    if (exact) return exact
    const t = title.trim().toLowerCase()
    if (!t) return undefined
    return docs.find(d => {
      const dt = d.title.toLowerCase()
      return dt.startsWith(t) || t.startsWith(dt)
    })
  }

  const runSearch = async () => {
    const q = query.trim()
    if (!q || status === 'loading' || status === 'streaming') return
    setStatus('loading')
    setAnswer('')
    setSources([])
    setErrorMsg('')
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch(`${API_URL}/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ message: q, history: [], domain: 'official_documents_archive' }),
        signal: controller.signal,
      })

      if (res.status === 401) {
        setStatus('error')
        setErrorMsg(isAr ? 'انتهت صلاحية الجلسة — سجّل الدخول مجدداً.' : 'Session expired — please log in again.')
        return
      }
      if (!res.ok || !res.body) {
        setStatus('error')
        setErrorMsg(isAr ? 'تعذّر الاتصال بخدمة البحث الذكي، حاول مجدداً.' : 'Could not reach AI search, please retry.')
        return
      }

      setStatus('streaming')
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let acc = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        for (const line of lines) {
          const t = line.trim()
          if (!t.startsWith('data: ')) continue
          const payload = t.slice(6)
          if (payload === '[DONE]') continue
          let p: any
          try { p = JSON.parse(payload) } catch { continue }
          if (p.type === 'meta') {
            const srcs: AISource[] = (p.sources || []).map((s: any) => ({ ...s, doc: matchDoc(s.title || '') }))
            setSources(srcs)
          } else if (p.type === 'token') {
            const tok = p.text ?? p.choices?.[0]?.delta?.content ?? ''
            if (tok) { acc += tok; setAnswer(acc) }
          } else if (p.type === 'error') {
            setStatus('error')
            setErrorMsg(p.detail || (isAr ? 'حدث خطأ غير متوقّع.' : 'An unexpected error occurred.'))
            return
          }
        }
      }
      setStatus('done')
    } catch (e) {
      if ((e as any)?.name === 'AbortError') return
      setStatus('error')
      setErrorMsg(isAr ? 'تعذّر الاتصال بخدمة البحث الذكي، حاول مجدداً.' : 'Could not reach AI search, please retry.')
    }
  }

  if (!loggedIn) {
    return (
      <div style={{ background: '#FAFAF8', border: '1px dashed var(--border)', borderRadius: 14, padding: '16px 14px', textAlign: 'center', marginBottom: 12 }}>
        <div style={{ color: 'var(--brand)', marginBottom: 6 }}>
          <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ margin: '0 auto', display: 'block' }}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        <p style={{ fontSize: 12.5, color: 'var(--text-2)', margin: '0 0 10px', lineHeight: 1.6 }}>
          {isAr ? 'البحث بالذكاء الاصطناعي في الأرشيف يتطلب تسجيل الدخول. يمكنك الاستمرار بالبحث النصي السريع بلا تسجيل.' : 'AI-powered archive search requires logging in. You can keep using quick text search without an account.'}
        </p>
        <Link href="/login" style={{ fontSize: 12, fontWeight: 700, color: '#fff', background: 'var(--brand)', borderRadius: 9, padding: '7px 18px', textDecoration: 'none', display: 'inline-block' }}>
          {isAr ? 'تسجيل الدخول' : 'Log in'}
        </Link>
      </div>
    )
  }

  return (
    <div style={{ marginBottom: 12 }}>
      <form onSubmit={(e) => { e.preventDefault(); runSearch() }} style={{ display: 'flex', gap: 6 }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={isAr ? 'اسأل عن أي وثيقة أو موضوع في الأرشيف...' : 'Ask about any document or topic in the archive...'}
          aria-label={isAr ? 'بحث بالذكاء الاصطناعي في الأرشيف' : 'AI search in the archive'}
          style={{ flex: 1, minWidth: 0, padding: '11px 14px', borderRadius: 12, border: '1.5px solid var(--border)', fontSize: 13, fontFamily: 'inherit', background: '#fff' }}
        />
        <button
          type="submit"
          disabled={!query.trim() || status === 'loading' || status === 'streaming'}
          style={{
            flexShrink: 0, padding: '0 16px', borderRadius: 12, border: 'none', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            background: 'var(--brand)', color: '#fff',
            opacity: (!query.trim() || status === 'loading' || status === 'streaming') ? 0.55 : 1,
          }}
        >
          {status === 'loading' || status === 'streaming' ? (isAr ? '...' : '...') : (isAr ? 'اسأل' : 'Ask')}
        </button>
      </form>

      {status === 'idle' && (
        <p style={{ fontSize: 10.5, color: 'var(--text-3)', margin: '7px 2px 0' }}>
          {isAr ? 'يبحث بالذكاء الاصطناعي في نص الوثائق نفسها ويلخّص لك الإجابة، وليس فقط في عناوينها.' : 'Searches the actual text of documents with AI and summarizes an answer — not just titles.'}
        </p>
      )}

      {status === 'loading' && (
        <p style={{ fontSize: 12, color: 'var(--text-2)', margin: '10px 2px 0' }}>
          {isAr ? 'جارٍ البحث في الأرشيف...' : 'Searching the archive...'}
        </p>
      )}

      {status === 'error' && (
        <div style={{ marginTop: 10, background: '#FEF7F7', border: '1px solid rgba(143,29,44,0.15)', borderRadius: 12, padding: '10px 12px' }}>
          <p style={{ fontSize: 12, color: '#8F1D2C', margin: 0 }}>{errorMsg}</p>
        </div>
      )}

      {(status === 'streaming' || status === 'done') && (
        <div style={{ marginTop: 10, background: '#fff', border: '1.5px solid var(--border)', borderRadius: 14, padding: '14px' }}>
          <p style={{ fontSize: 13, color: 'var(--text-1)', lineHeight: 1.8, margin: 0, whiteSpace: 'pre-wrap' }}>
            {answer || (status === 'streaming' ? '...' : '')}
          </p>

          {sources.length > 0 && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
              <p style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-3)', margin: '0 0 8px' }}>
                {isAr ? 'من الأرشيف:' : 'From the archive:'}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {sources.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 9, padding: '7px 10px' }}>
                    <span style={{ flex: 1, minWidth: 0, color: 'var(--text-1)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.title}
                    </span>
                    {s.doc && (
                      <a href={s.doc.pdfUrl} target="_blank" rel="noopener noreferrer" style={{ flexShrink: 0, color: 'var(--brand)', fontWeight: 700, textDecoration: 'none', fontSize: 10.5 }}>
                        {isAr ? 'عرض الملف' : 'View file'}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {status === 'done' && (
            <button
              type="button"
              onClick={() => onAskFull(query)}
              style={{ marginTop: 12, width: '100%', padding: '8px', background: 'var(--brand-soft)', color: 'var(--brand)', border: '1px solid var(--border-brand)', borderRadius: 9, fontFamily: 'inherit', fontSize: 11.5, fontWeight: 700, cursor: 'pointer' }}
            >
              {isAr ? 'متابعة هذا السؤال في محادثة كاملة مع دليلك' : 'Continue this question in a full chat with Dalilak'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
