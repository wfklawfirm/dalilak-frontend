'use client'

import React, { ReactNode } from 'react'

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
    if (h1m) { elements.push(<h1 key={i} style={{ fontWeight: 700, fontSize: '1.15em', margin: '0.8rem 0 0.4rem', color: '#1a1a2e' }}>{inlineFormat(h1m[1], i)}</h1>); i++; continue }
    if (h2) { elements.push(<h2 key={i} style={{ fontWeight: 700, fontSize: '1.05em', margin: '0.8rem 0 0.4rem', color: '#1a1a2e' }}>{inlineFormat(h2[1], i)}</h2>); i++; continue }
    if (h3) { elements.push(<h3 key={i} style={{ fontWeight: 700, fontSize: '0.95em', margin: '0.6rem 0 0.3rem', color: '#1a1a2e' }}>{inlineFormat(h3[1], i)}</h3>); i++; continue }

    if (/^---+$/.test(line.trim())) { elements.push(<hr key={i} style={{ border: 'none', borderTop: '1px solid #f0e0e0', margin: '0.8rem 0' }} />); i++; continue }

    if (/^[-*•] /.test(line)) {
      const items: ReactNode[] = []
      while (i < lines.length && /^[-*•] /.test(lines[i])) {
        const content = lines[i].replace(/^[-*•] /, '')
        items.push(<li key={i} style={{ marginBottom: '0.25rem' }}>{inlineFormat(content, i)}</li>)
        i++
      }
      elements.push(<ul key={'ul-' + i} style={{ listStyle: 'disc', paddingRight: '1.4rem', marginBottom: '0.65rem' }}>{items}</ul>)
      continue
    }

    if (/^\d+\. /.test(line)) {
      const items: ReactNode[] = []
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        const content = lines[i].replace(/^\d+\. /, '')
        items.push(<li key={i} style={{ marginBottom: '0.25rem' }}>{inlineFormat(content, i)}</li>)
        i++
      }
      elements.push(<ol key={'ol-' + i} style={{ listStyle: 'decimal', paddingRight: '1.4rem', marginBottom: '0.65rem' }}>{items}</ol>)
      continue
    }

    if (line.trim() === '') { elements.push(<div key={i} style={{ height: '0.4rem' }} />); i++; continue }

    elements.push(
      <p key={i} style={{ marginBottom: '0.65rem', lineHeight: 1.85 }}>
        {inlineFormat(line, i)}
      </p>
    )
    i++
  }

  return <div>{elements}</div>
}

export default function ChatMessage({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user'

  return (
    <div className={'flex items-start gap-3 mb-5 ' + (isUser ? 'flex-row-reverse' : 'flex-row')}>
      <div
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
        style={{ backgroundColor: isUser ? '#E8A020' : '#8B1A1A' }}
      >
        {isUser ? 'أنت' : 'AI'}
      </div>

      <div
        className={'max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ' +
          (isUser ? 'text-white rounded-tl-sm' : 'bg-white text-gray-800 rounded-tr-sm border border-gray-100 shadow-sm')}
        style={isUser ? { backgroundColor: '#8B1A1A' } : {}}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{msg.content}</p>
        ) : (
          <div className="prose-ar">
            <MarkdownRenderer text={msg.content} />
            {msg.streaming && <span className="cursor" />}
          </div>
        )}
      </div>
    </div>
  )
}
