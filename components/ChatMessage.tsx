'use client'

import React, { ReactNode, useState } from 'react'

export interface Message {
  role: 'user' | 'assistant'
  content: string
  streaming?: boolean
}

function MarkdownRenderer({ text }: { text: string }) {
  const lines = text.split('\n')
  const elements: ReactNode[] = []
  let i = 0

  const inlineFormat = (str: string, key: string | number): ReactNode => {
    const parts: ReactNode[] = []
    let rest = str
    let idx = 0
    const push = (node: ReactNode) => parts.push(node)
    while (rest.length > 0) {
      const boldMatch = rest.match(/^(.*?)\*\*(.+?)\*\*/)
      const codeMatch = rest.match(/^(.*?)`([^`]+)`/)
      if (boldMatch && (!codeMatch || boldMatch[0].length <= codeMatch[0].length)) {
        if (boldMatch[1]) push(<span key={idx++}>{boldMatch[1]}</span>)
        push(<strong key={idx++} style={{ color: '#8B1A1A' }}>{boldMatch[2]}</strong>)
        rest = rest.slice(boldMatch[0].length)
      } else if (codeMatch) {
        if (codeMatch[1]) push(<span key={idx++}>{codeMatch[1]}</span>)
        push(<code key={idx++} style={{ background: '#fdf2f2', padding: '1px 5px', borderRadius: 3, fontSize: '0.85em' }}>{codeMatch[2]}</code>)
        rest = rest.slice(codeMatch[0].length)
      } else {
        push(<span key={idx++}>{rest}</span>)
        break
      }
    }
    return <>{parts}</>
  }

  while (i < lines.length) {
    const line = lines[i]
    const h3 = line.match(/^### (.+)/)
    const h2 = line.match(/^## (.+)/)
    const h1m = line.match(/^# (.+)/)
    if (h1m) { elements.push(<h1 key={i} style={{ fontWeight: 800, fontSize: '1.1em', margin: '1rem 0 0.4rem', color: '#1a1208', borderBottom: '2px solid #f0e0e0', paddingBottom: '0.3rem' }}>{inlineFormat(h1m[1], i)}</h1>); i++; continue }
    if (h2) { elements.push(<h2 key={i} style={{ fontWeight: 700, fontSize: '1.0em', margin: '0.9rem 0 0.35rem', color: '#8B1A1A' }}>{inlineFormat(h2[1], i)}</h2>); i++; continue }
    if (h3) { elements.push(<h3 key={i} style={{ fontWeight: 600, fontSize: '0.92em', margin: '0.7rem 0 0.3rem', color: '#5C3A1A' }}>{inlineFormat(h3[1], i)}</h3>); i++; continue }
    if (/^---+$/.test(line.trim())) { elements.push(<hr key={i} style={{ border: 'none', borderTop: '1px solid #f0e0e0', margin: '0.75rem 0' }} />); i++; continue }
    if (/^[-*•] /.test(line)) {
      const items: ReactNode[] = []
      while (i < lines.length && /^[-*•] /.test(lines[i])) {
        const content = lines[i].replace(/^[-*•] /, '')
        items.push(
          <li key={i} style={{ marginBottom: '0.3rem', display: 'flex', gap: 6, alignItems: 'flex-start' }}>
            <span style={{ color: '#8B1A1A', flexShrink: 0, marginTop: 2 }}>•</span>
            <span>{inlineFormat(content, i)}</span>
          </li>
        )
        i++
      }
      elements.push(<ul key={'ul-' + i} style={{ listStyle: 'none', padding: 0, marginBottom: '0.65rem' }}>{items}</ul>)
      continue
    }
    if (/^\d+\. /.test(line)) {
      const items: ReactNode[] = []
      let num = 1
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        const content = lines[i].replace(/^\d+\. /, '')
        items.push(
          <li key={i} style={{ marginBottom: '0.35rem', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <span style={{
              minWidth: 22, height: 22, borderRadius: '50%', background: '#8B1A1A',
              color: '#fff', fontSize: 11, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>{num++}</span>
            <span style={{ paddingTop: 2 }}>{inlineFormat(content, i)}</span>
          </li>
        )
        i++
      }
      elements.push(<ol key={'ol-' + i} style={{ listStyle: 'none', padding: 0, marginBottom: '0.65rem' }}>{items}</ol>)
      continue
    }
    if (line.trim() === '') { elements.push(<div key={i} style={{ height: '0.4rem' }} />); i++; continue }
    elements.push(<p key={i} style={{ marginBottom: '0.6rem', lineHeight: 1.9 }}>{inlineFormat(line, i)}</p>)
    i++
  }

  return <div>{elements}</div>
}

// ── Trust Badge ────────────────────────────────────────────
function TrustBadge({ isAr }: { isAr: boolean }) {
  return (
    <div style={{
      marginTop: 10, padding: '7px 12px',
      background: '#FAFAF8', borderRadius: 8,
      border: '1px solid #F0EBE0',
      display: 'flex', alignItems: 'flex-start', gap: 7,
    }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#B8860B" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <p style={{ fontSize: 10, color: '#9C8E80', lineHeight: 1.6, margin: 0 }}>
        {isAr
          ? 'هذه المعلومات إرشادية. تأكد دائماً من الجهة الرسمية قبل التصرف.'
          : 'This information is for guidance only. Always verify with the official authority.'}
      </p>
    </div>
  )
}

// ── Action Buttons ─────────────────────────────────────────
function ActionButtons({ content, isAr }: { content: string; isAr: boolean }) {
  const [copied, setCopied] = useState(false)
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null)

  const copy = () => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6, marginTop: 10,
      flexWrap: 'wrap',
    }}>
      {/* Copy */}
      <button onClick={copy} style={{
        display: 'flex', alignItems: 'center', gap: 4,
        padding: '4px 10px', borderRadius: 20, border: '1px solid #E5E7EB',
        background: copied ? '#F0FDF4' : '#fff', cursor: 'pointer',
        fontSize: 11, color: copied ? '#16a34a' : '#6B7280',
        fontFamily: 'inherit', transition: 'all 0.15s',
      }}>
        {copied ? (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path strokeLinecap="round" d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
        )}
        {isAr ? (copied ? 'تم النسخ' : 'نسخ') : (copied ? 'Copied' : 'Copy')}
      </button>

      {/* Helpful */}
      <button onClick={() => setFeedback('up')} style={{
        display: 'flex', alignItems: 'center', gap: 4,
        padding: '4px 10px', borderRadius: 20,
        border: `1px solid ${feedback === 'up' ? '#22c55e' : '#E5E7EB'}`,
        background: feedback === 'up' ? '#F0FDF4' : '#fff', cursor: 'pointer',
        fontSize: 11, color: feedback === 'up' ? '#16a34a' : '#6B7280',
        fontFamily: 'inherit', transition: 'all 0.15s',
      }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill={feedback === 'up' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z"/>
        </svg>
        {isAr ? 'مفيد' : 'Helpful'}
      </button>

      {/* Not helpful */}
      <button onClick={() => setFeedback('down')} style={{
        display: 'flex', alignItems: 'center', gap: 4,
        padding: '4px 10px', borderRadius: 20,
        border: `1px solid ${feedback === 'down' ? '#ef4444' : '#E5E7EB'}`,
        background: feedback === 'down' ? '#FEF2F2' : '#fff', cursor: 'pointer',
        fontSize: 11, color: feedback === 'down' ? '#dc2626' : '#6B7280',
        fontFamily: 'inherit', transition: 'all 0.15s',
      }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill={feedback === 'down' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10z"/>
        </svg>
        {isAr ? 'غير مفيد' : 'Not helpful'}
      </button>
    </div>
  )
}

export default function ChatMessage({ msg, isAr }: { msg: Message; isAr?: boolean }) {
  const isUser = msg.role === 'user'
  const ar = isAr !== false

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 20,
      flexDirection: isUser ? 'row-reverse' : 'row',
    }}>
      {/* Avatar */}
      <div style={{
        flexShrink: 0, width: 32, height: 32, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 700, color: '#fff',
        background: isUser
          ? 'linear-gradient(135deg, #C9982A 0%, #B8860B 100%)'
          : 'linear-gradient(135deg, #8B1A1A 0%, #6B1313 100%)',
        boxShadow: isUser ? '0 2px 6px rgba(201,152,42,0.3)' : '0 2px 6px rgba(139,26,26,0.3)',
      }}>
        {isUser ? (ar ? 'أنت' : 'You') : 'AI'}
      </div>

      {/* Bubble */}
      <div style={{ maxWidth: '82%', minWidth: 60 }}>
        <div style={{
          padding: '12px 16px', borderRadius: 16,
          borderTopRightRadius: isUser ? 4 : 16,
          borderTopLeftRadius: isUser ? 16 : 4,
          fontSize: 13.5, lineHeight: 1.8,
          background: isUser
            ? 'linear-gradient(135deg, #8B1A1A 0%, #6B1313 100%)'
            : '#fff',
          color: isUser ? '#fff' : '#1A1208',
          boxShadow: isUser
            ? '0 2px 10px rgba(139,26,26,0.2)'
            : '0 1px 6px rgba(0,0,0,0.07)',
          border: isUser ? 'none' : '1px solid #F0EBE0',
        }}>
          {isUser ? (
            <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{msg.content}</p>
          ) : (
            <div>
              <MarkdownRenderer text={msg.content} />
              {msg.streaming && (
                <span style={{
                  display: 'inline-block', width: 8, height: 15,
                  background: '#8B1A1A', borderRadius: 2,
                  animation: 'blink 0.9s step-end infinite', marginRight: 2,
                }} />
              )}
            </div>
          )}
        </div>

        {/* Action buttons + Trust badge — only for completed AI responses */}
        {!isUser && !msg.streaming && msg.content.length > 30 && (
          <>
            <ActionButtons content={msg.content} isAr={ar} />
            <TrustBadge isAr={ar} />
          </>
        )}
      </div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
      `}</style>
    </div>
  )
}
