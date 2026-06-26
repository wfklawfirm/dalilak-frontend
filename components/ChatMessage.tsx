'use client'

import React, { ReactNode } from 'react'

export interface Message {
  role: 'user' | 'assistant'
  content: string
  streaming?: boolean
}

/* ── Inline markdown (bold + code) ──────────────────────────── */
function Inline({ text, idx }: { text: string; idx: number }): ReactNode {
  const parts: ReactNode[] = []
  let rest = text
  let k = 0

  while (rest.length > 0) {
    const bold = rest.match(/^(.*?)\*\*(.+?)\*\*/)
    const code = rest.match(/^(.*?)`([^`]+)`/)

    if (bold && (!code || bold[0].length <= code[0].length)) {
      if (bold[1]) parts.push(<span key={k++}>{bold[1]}</span>)
      parts.push(
        <strong key={k++} style={{ color: '#8B1A1A', fontWeight: 700 }}>
          {bold[2]}
        </strong>
      )
      rest = rest.slice(bold[0].length)
    } else if (code) {
      if (code[1]) parts.push(<span key={k++}>{code[1]}</span>)
      parts.push(
        <code key={k++} style={{
          background: '#FDF2F2', color: '#8B1A1A',
          padding: '1px 6px', borderRadius: 4,
          fontSize: '0.82em', fontFamily: 'monospace',
          fontStyle: 'normal',
        }}>
          {code[2]}
        </code>
      )
      rest = rest.slice(code[0].length)
    } else {
      parts.push(<span key={k++}>{rest}</span>)
      break
    }
  }
  return <>{parts}</>
}

/* ── Full markdown renderer ──────────────────────────────────── */
function MarkdownRenderer({ text }: { text: string }) {
  const lines    = text.split('\n')
  const elements: ReactNode[] = []
  let i = 0

  while (i < lines.length) {
    const line    = lines[i]
    const trimmed = line.trim()

    /* Empty line → small spacer */
    if (trimmed === '') {
      elements.push(<div key={i} style={{ height: '0.4rem' }} />)
      i++; continue
    }

    /* Horizontal rule */
    if (/^---+$/.test(trimmed)) {
      elements.push(
        <hr key={i} style={{
          border: 'none', borderTop: '1px solid #F0E0E0', margin: '0.7rem 0',
        }} />
      )
      i++; continue
    }

    /* H1 */
    const h1 = trimmed.match(/^# (.+)/)
    if (h1) {
      elements.push(
        <h2 key={i} style={{
          fontWeight: 800, fontSize: '1.06em',
          margin: '1rem 0 0.4rem',
          color: '#111827',
          borderBottom: '1.5px solid #F0E0E0', paddingBottom: '0.28rem',
          lineHeight: 1.4,
        }}>
          <Inline text={h1[1]} idx={i} />
        </h2>
      )
      i++; continue
    }

    /* H2 */
    const h2 = trimmed.match(/^## (.+)/)
    if (h2) {
      elements.push(
        <h3 key={i} style={{
          fontWeight: 700, fontSize: '0.98em',
          margin: '0.85rem 0 0.28rem',
          color: '#8B1A1A', lineHeight: 1.4,
        }}>
          <Inline text={h2[1]} idx={i} />
        </h3>
      )
      i++; continue
    }

    /* H3 */
    const h3 = trimmed.match(/^### (.+)/)
    if (h3) {
      elements.push(
        <h4 key={i} style={{
          fontWeight: 600, fontSize: '0.93em',
          margin: '0.65rem 0 0.22rem',
          color: '#374151', lineHeight: 1.4,
        }}>
          <Inline text={h3[1]} idx={i} />
        </h4>
      )
      i++; continue
    }

    /* Unordered list */
    if (/^[-*•] /.test(trimmed)) {
      const items: ReactNode[] = []
      while (i < lines.length && /^[-*•] /.test(lines[i].trim())) {
        const content = lines[i].trim().replace(/^[-*•] /, '')
        items.push(
          <li key={i} style={{ marginBottom: '0.28rem', paddingRight: '0.1rem', lineHeight: 1.8 }}>
            <Inline text={content} idx={i} />
          </li>
        )
        i++
      }
      elements.push(
        <ul key={'ul-' + i} style={{
          listStyle: 'disc', paddingRight: '1.45rem',
          marginBottom: '0.5rem', marginTop: '0.1rem',
        }}>
          {items}
        </ul>
      )
      continue
    }

    /* Ordered list */
    if (/^\d+\. /.test(trimmed)) {
      const items: ReactNode[] = []
      while (i < lines.length && /^\d+\. /.test(lines[i].trim())) {
        const content = lines[i].trim().replace(/^\d+\. /, '')
        items.push(
          <li key={i} style={{ marginBottom: '0.3rem', paddingRight: '0.1rem', lineHeight: 1.8 }}>
            <Inline text={content} idx={i} />
          </li>
        )
        i++
      }
      elements.push(
        <ol key={'ol-' + i} style={{
          listStyle: 'decimal', paddingRight: '1.45rem',
          marginBottom: '0.5rem', marginTop: '0.1rem',
        }}>
          {items}
        </ol>
      )
      continue
    }

    /* Blockquote */
    if (/^> /.test(trimmed)) {
      const content = trimmed.slice(2)
      elements.push(
        <div key={i} style={{
          borderRight: '3px solid #8B1A1A',
          paddingRight: '0.8rem', margin: '0.45rem 0',
          color: '#6B7280', fontSize: '0.88em',
          fontStyle: 'italic', lineHeight: 1.8,
        }}>
          <Inline text={content} idx={i} />
        </div>
      )
      i++; continue
    }

    /* Paragraph */
    elements.push(
      <p key={i} style={{ marginBottom: '0.45rem', lineHeight: 1.88 }}>
        <Inline text={trimmed} idx={i} />
      </p>
    )
    i++
  }

  return <div>{elements}</div>
}

/* ── ChatMessage component ───────────────────────────────────── */
export default function ChatMessage({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user'

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-end',
      gap: 9,
      marginBottom: 18,
      flexDirection: isUser ? 'row' : 'row-reverse',
    }}>

      {/* Avatar */}
      <div style={{
        flexShrink: 0,
        width: 30, height: 30,
        borderRadius: '50%',
        backgroundColor: isUser ? '#8B1A1A' : '#F3F4F6',
        border: isUser ? 'none' : '1px solid #E5E7EB',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: isUser ? 10 : 14,
        fontWeight: 700,
        color: isUser ? '#fff' : undefined,
        marginBottom: 2,
        boxShadow: isUser ? '0 1px 4px rgba(139,26,26,0.2)' : 'none',
        userSelect: 'none',
      }}>
        {isUser ? 'أنت' : '🌲'}
      </div>

      {/* Bubble */}
      <div style={{
        maxWidth: '80%',
        padding: isUser ? '10px 15px' : '13px 16px',
        borderRadius: isUser
          ? '18px 18px 4px 18px'   /* user: flat bottom-left */
          : '18px 18px 18px 4px',  /* AI:   flat bottom-right (RTL visual) */
        fontSize: 13.5,
        lineHeight: 1.75,
        fontWeight: 400,
        backgroundColor: isUser ? '#8B1A1A' : '#FFFFFF',
        color:           isUser ? '#FFFFFF' : '#1F2937',
        border:          isUser ? 'none'    : '1px solid #E5E7EB',
        boxShadow: isUser
          ? '0 2px 8px rgba(139,26,26,0.18)'
          : '0 1px 4px rgba(0,0,0,0.06)',
      }}>

        {isUser ? (
          <p style={{ whiteSpace: 'pre-wrap', margin: 0, lineHeight: 1.75 }}>
            {msg.content}
          </p>
        ) : (
          <div dir="rtl">
            <MarkdownRenderer text={msg.content} />
            {msg.streaming && (
              <span className="cursor" />
            )}
          </div>
        )}

      </div>
    </div>
  )
}
