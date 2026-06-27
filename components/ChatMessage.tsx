'use client'

import React, { ReactNode, useState } from 'react'

export interface Message {
  role: 'user' | 'assistant'
  content: string
  streaming?: boolean
}

// ── Section styling map ────────────────────────────────────
const SECTION_MAP: Record<string, { bg: string; border: string; icon: string; labelColor: string }> = {
  'الخلاصة':              { bg: '#EFF6FF', border: '#BFDBFE', icon: '💡', labelColor: '#1D4ED8' },
  'summary':              { bg: '#EFF6FF', border: '#BFDBFE', icon: '💡', labelColor: '#1D4ED8' },
  'المستندات المطلوبة':   { bg: '#F0FDF4', border: '#BBF7D0', icon: '📋', labelColor: '#15803D' },
  'الوثائق المطلوبة':     { bg: '#F0FDF4', border: '#BBF7D0', icon: '📋', labelColor: '#15803D' },
  'required documents':   { bg: '#F0FDF4', border: '#BBF7D0', icon: '📋', labelColor: '#15803D' },
  'الخطوات':              { bg: '#FFF7ED', border: '#FED7AA', icon: '📝', labelColor: '#C2410C' },
  'steps':                { bg: '#FFF7ED', border: '#FED7AA', icon: '📝', labelColor: '#C2410C' },
  'الجهة المختصة':        { bg: '#F5F3FF', border: '#DDD6FE', icon: '🏛️', labelColor: '#6D28D9' },
  'responsible authority':{ bg: '#F5F3FF', border: '#DDD6FE', icon: '🏛️', labelColor: '#6D28D9' },
  'النموذج المتوفر':      { bg: '#FEFCE8', border: '#FEF08A', icon: '📄', labelColor: '#854D0E' },
  'الرسوم':               { bg: '#FAF5FF', border: '#E9D5FF', icon: '💰', labelColor: '#7E22CE' },
  'fees':                 { bg: '#FAF5FF', border: '#E9D5FF', icon: '💰', labelColor: '#7E22CE' },
  'الخطوة التالية':       { bg: '#ECFDF5', border: '#6EE7B7', icon: '👉', labelColor: '#065F46' },
  'next step':            { bg: '#ECFDF5', border: '#6EE7B7', icon: '👉', labelColor: '#065F46' },
  'تنبيه مهم':            { bg: '#FFF7ED', border: '#FDBA74', icon: '⚠️', labelColor: '#C2410C' },
  'تنبيه':                { bg: '#FFF7ED', border: '#FDBA74', icon: '⚠️', labelColor: '#C2410C' },
  'ملاحظة مهمة':          { bg: '#FFF7ED', border: '#FDBA74', icon: '⚠️', labelColor: '#C2410C' },
  'important note':       { bg: '#FFF7ED', border: '#FDBA74', icon: '⚠️', labelColor: '#C2410C' },
}

function getSectionStyle(header: string) {
  const key = header.toLowerCase().trim().replace(/^#+\s*/, '')
  for (const [k, v] of Object.entries(SECTION_MAP)) {
    if (key === k || key.includes(k) || k.includes(key)) return v
  }
  return null
}

// ── Inline formatting ──────────────────────────────────────
function inlineFormat(str: string, keyPrefix: string | number): ReactNode {
  const parts: ReactNode[] = []
  let rest = str
  let idx = 0
  while (rest.length > 0) {
    const boldMatch = rest.match(/^(.*?)\*\*(.+?)\*\*/)
    const codeMatch = rest.match(/^(.*?)`([^`]+)`/)
    if (boldMatch && (!codeMatch || boldMatch[0].length <= codeMatch[0].length)) {
      if (boldMatch[1]) parts.push(<span key={`${keyPrefix}-${idx++}`}>{boldMatch[1]}</span>)
      parts.push(<strong key={`${keyPrefix}-${idx++}`} style={{ color: '#7B1111' }}>{boldMatch[2]}</strong>)
      rest = rest.slice(boldMatch[0].length)
    } else if (codeMatch) {
      if (codeMatch[1]) parts.push(<span key={`${keyPrefix}-${idx++}`}>{codeMatch[1]}</span>)
      parts.push(<code key={`${keyPrefix}-${idx++}`} style={{ background: '#fdf2f2', padding: '1px 5px', borderRadius: 3, fontSize: '0.85em' }}>{codeMatch[2]}</code>)
      rest = rest.slice(codeMatch[0].length)
    } else {
      parts.push(<span key={`${keyPrefix}-${idx++}`}>{rest}</span>)
      break
    }
  }
  return <>{parts}</>
}

// ── Parse markdown into sections ───────────────────────────
interface Section {
  header: string | null
  lines: string[]
}

function parseSections(text: string): Section[] {
  const lines = text.split('\n')
  const sections: Section[] = []
  let current: Section = { header: null, lines: [] }

  for (const line of lines) {
    const isH2 = /^## /.test(line)
    const isH1 = /^# /.test(line)
    if ((isH2 || isH1) && getSectionStyle(line)) {
      if (current.header !== null || current.lines.some(l => l.trim())) {
        sections.push(current)
      }
      current = { header: line.replace(/^#+\s*/, ''), lines: [] }
    } else {
      current.lines.push(line)
    }
  }
  if (current.header !== null || current.lines.some(l => l.trim())) {
    sections.push(current)
  }
  return sections.length > 1 ? sections : []
}

// ── Markdown renderer (for inside sections or plain text) ──
function MarkdownBlock({ lines }: { lines: string[] }) {
  const elements: ReactNode[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const h3 = line.match(/^### (.+)/)
    const h2 = line.match(/^## (.+)/)
    const h1m = line.match(/^# (.+)/)

    if (h1m) {
      elements.push(
        <h1 key={i} style={{ fontWeight: 800, fontSize: '1.05em', margin: '0.8rem 0 0.35rem', color: '#1a1208', borderBottom: '2px solid #f0e0e0', paddingBottom: '0.3rem' }}>
          {inlineFormat(h1m[1], i)}
        </h1>
      )
      i++; continue
    }
    if (h2) {
      elements.push(
        <h2 key={i} style={{ fontWeight: 700, fontSize: '0.97em', margin: '0.75rem 0 0.3rem', color: '#8B1A1A' }}>
          {inlineFormat(h2[1], i)}
        </h2>
      )
      i++; continue
    }
    if (h3) {
      elements.push(
        <h3 key={i} style={{ fontWeight: 600, fontSize: '0.9em', margin: '0.6rem 0 0.25rem', color: '#5C3A1A' }}>
          {inlineFormat(h3[1], i)}
        </h3>
      )
      i++; continue
    }
    if (/^---+$/.test(line.trim())) {
      elements.push(<hr key={i} style={{ border: 'none', borderTop: '1px solid #f0e0e0', margin: '0.65rem 0' }} />)
      i++; continue
    }
    if (/^[-*•] /.test(line)) {
      const items: ReactNode[] = []
      while (i < lines.length && /^[-*•] /.test(lines[i])) {
        const content = lines[i].replace(/^[-*•] /, '')
        items.push(
          <li key={i} style={{ marginBottom: '0.28rem', display: 'flex', gap: 7, alignItems: 'flex-start' }}>
            <span style={{ color: '#8B1A1A', flexShrink: 0, marginTop: 2, fontWeight: 700 }}>•</span>
            <span>{inlineFormat(content, i)}</span>
          </li>
        )
        i++
      }
      elements.push(<ul key={'ul' + i} style={{ listStyle: 'none', padding: 0, margin: '0 0 0.55rem' }}>{items}</ul>)
      continue
    }
    if (/^\d+\. /.test(line)) {
      const items: ReactNode[] = []
      let num = 1
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        const content = lines[i].replace(/^\d+\. /, '')
        items.push(
          <li key={i} style={{ marginBottom: '0.32rem', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
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
      elements.push(<ol key={'ol' + i} style={{ listStyle: 'none', padding: 0, margin: '0 0 0.55rem' }}>{items}</ol>)
      continue
    }
    if (line.trim() === '') {
      if (elements.length > 0) elements.push(<div key={i} style={{ height: '0.35rem' }} />)
      i++; continue
    }
    elements.push(<p key={i} style={{ marginBottom: '0.55rem', lineHeight: 1.85 }}>{inlineFormat(line, i)}</p>)
    i++
  }
  return <>{elements}</>
}

// ── Structured section card ────────────────────────────────
function SectionCard({ header, lines, style }: { header: string; lines: string[]; style: ReturnType<typeof getSectionStyle> }) {
  if (!style || lines.every(l => !l.trim())) return null
  return (
    <div style={{
      background: style.bg, border: `1.5px solid ${style.border}`,
      borderRadius: 14, padding: '12px 14px', marginBottom: 10,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 7,
        marginBottom: 10, paddingBottom: 8, borderBottom: `1px solid ${style.border}`,
      }}>
        <span style={{ fontSize: 16 }}>{style.icon}</span>
        <span style={{ fontSize: 12.5, fontWeight: 800, color: style.labelColor }}>
          {header}
        </span>
      </div>
      <div style={{ fontSize: 13, lineHeight: 1.8, color: '#1A1208' }}>
        <MarkdownBlock lines={lines} />
      </div>
    </div>
  )
}

// ── Extract bullet list from text ──────────────────────────
function extractDocsList(text: string): string {
  const lines = text.split('\n')
  const docLines: string[] = []
  let inDocsSection = false
  for (const line of lines) {
    if (/المستندات|الوثائق|documents/i.test(line) && /^#+/.test(line)) {
      inDocsSection = true; continue
    }
    if (inDocsSection && /^#+/.test(line)) { inDocsSection = false; continue }
    if (inDocsSection && /^[-*•\d]/.test(line.trim())) {
      docLines.push(line.replace(/^[-*•\d.]+\s*/, '').trim())
    }
  }
  return docLines.length > 0 ? docLines.map((d, i) => `${i + 1}. ${d}`).join('\n') : ''
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
          ? 'المعلومات إرشادية. تأكد دائماً من الجهة الرسمية قبل التصرف.'
          : 'This is for guidance only. Always verify with the official authority.'}
      </p>
    </div>
  )
}

// ── Action Buttons ─────────────────────────────────────────
function ActionButtons({
  content, isAr, onFollowUp,
}: {
  content: string
  isAr: boolean
  onFollowUp?: (q: string) => void
}) {
  const [copied, setCopied] = useState(false)
  const [docsCopied, setDocsCopied] = useState(false)
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null)

  const copy = () => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000)
    })
  }

  const copyDocs = () => {
    const docs = extractDocsList(content)
    if (!docs) return
    navigator.clipboard.writeText(docs).then(() => {
      setDocsCopied(true); setTimeout(() => setDocsCopied(false), 2000)
    })
  }

  const downloadChecklist = () => {
    const clean = content.replace(/\[.*?\] /g, '')
    const blob = new Blob([clean], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'dalilak-checklist.txt'; a.click()
    URL.revokeObjectURL(url)
  }

  const hasDocs = Boolean(extractDocsList(content))

  const btn = (
    onClick: () => void,
    icon: ReactNode,
    label: string,
    active?: boolean,
    activeColor?: string,
    activeBg?: string,
    activeBorder?: string,
  ) => (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 4,
      padding: '4px 10px', borderRadius: 20, cursor: 'pointer',
      fontSize: 10.5, fontFamily: 'inherit', transition: 'all 0.15s',
      border: `1px solid ${active ? (activeBorder || '#22c55e') : '#E5E7EB'}`,
      background: active ? (activeBg || '#F0FDF4') : '#fff',
      color: active ? (activeColor || '#16a34a') : '#6B7280',
    }}>
      {icon}{label}
    </button>
  )

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>

      {/* Copy full */}
      {btn(copy,
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {copied
            ? <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
            : <><rect x="9" y="9" width="13" height="13" rx="2"/><path strokeLinecap="round" d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></>
          }
        </svg>,
        isAr ? (copied ? 'تم النسخ' : 'نسخ الجواب') : (copied ? 'Copied' : 'Copy'),
        copied, '#16a34a', '#F0FDF4', '#22c55e',
      )}

      {/* Copy docs */}
      {hasDocs && btn(docsCopied ? () => {} : copyDocs,
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
        </svg>,
        isAr ? (docsCopied ? 'تم' : 'نسخ المستندات') : (docsCopied ? 'Done' : 'Copy Docs'),
        docsCopied, '#16a34a', '#F0FDF4', '#22c55e',
      )}

      {/* Download checklist */}
      {btn(downloadChecklist,
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
        </svg>,
        isAr ? 'تحميل Checklist' : 'Download',
      )}

      {/* Follow-up */}
      {onFollowUp && btn(
        () => onFollowUp(isAr ? 'أريد توضيحاً أكثر عن هذا الموضوع' : 'Can you elaborate more on this?'),
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
        </svg>,
        isAr ? 'اسأل متابعة' : 'Follow-up',
      )}

      {/* Divider */}
      <span style={{ color: '#E5E7EB', alignSelf: 'center' }}>|</span>

      {/* Helpful */}
      {btn(() => setFeedback('up'),
        <svg width="11" height="11" viewBox="0 0 24 24" fill={feedback === 'up' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z"/>
        </svg>,
        isAr ? 'مفيد' : 'Helpful',
        feedback === 'up', '#16a34a', '#F0FDF4', '#22c55e',
      )}

      {/* Not helpful */}
      {btn(() => setFeedback('down'),
        <svg width="11" height="11" viewBox="0 0 24 24" fill={feedback === 'down' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10z"/>
        </svg>,
        isAr ? 'غير مفيد' : 'Not helpful',
        feedback === 'down', '#dc2626', '#FEF2F2', '#ef4444',
      )}
    </div>
  )
}

// ── Main ChatMessage component ─────────────────────────────
export default function ChatMessage({
  msg, isAr, onFollowUp,
}: {
  msg: Message
  isAr?: boolean
  onFollowUp?: (q: string) => void
}) {
  const isUser = msg.role === 'user'
  const ar = isAr !== false

  // Try to parse structured sections
  const sections = !isUser && !msg.streaming ? parseSections(msg.content) : []
  const isStructured = sections.length > 0

  // Plain display text (remove the instruction prefix if any)
  const displayContent = msg.content.replace(/^\[.*?\]\n?/, '')

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
      <div style={{ maxWidth: '86%', minWidth: 60 }}>

        {isUser ? (
          /* User bubble */
          <div style={{
            padding: '11px 15px', borderRadius: 16,
            borderTopRightRadius: ar ? 4 : 16, borderTopLeftRadius: ar ? 16 : 4,
            background: 'linear-gradient(135deg, #8B1A1A 0%, #6B1313 100%)',
            color: '#fff', fontSize: 13.5, lineHeight: 1.75,
            boxShadow: '0 2px 10px rgba(139,26,26,0.2)',
          }}>
            <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
              {/* Strip instruction prefix from display */}
              {msg.content.replace(/^\[.*?\]\n?/, '')}
            </p>
          </div>
        ) : isStructured ? (
          /* Structured AI response */
          <div>
            {sections.map((sec, i) => {
              if (sec.header === null) {
                // Plain intro text
                const hasContent = sec.lines.some(l => l.trim())
                if (!hasContent) return null
                return (
                  <div key={i} style={{
                    padding: '12px 16px', borderRadius: 16,
                    borderTopLeftRadius: ar ? 4 : 16, borderTopRightRadius: ar ? 16 : 4,
                    background: '#fff', border: '1px solid #F0EBE0',
                    boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
                    fontSize: 13.5, lineHeight: 1.8, color: '#1A1208',
                    marginBottom: 10,
                  }}>
                    <MarkdownBlock lines={sec.lines} />
                  </div>
                )
              }
              const style = getSectionStyle(sec.header)
              if (style) {
                return <SectionCard key={i} header={sec.header} lines={sec.lines} style={style} />
              }
              // Unknown header — render normally
              return (
                <div key={i} style={{
                  padding: '12px 16px', borderRadius: 14, marginBottom: 10,
                  background: '#fff', border: '1px solid #F0EBE0',
                  fontSize: 13.5, color: '#1A1208', lineHeight: 1.8,
                }}>
                  <strong style={{ color: '#8B1A1A', display: 'block', marginBottom: 6 }}>{sec.header}</strong>
                  <MarkdownBlock lines={sec.lines} />
                </div>
              )
            })}
          </div>
        ) : (
          /* Plain AI response */
          <div style={{
            padding: '12px 16px', borderRadius: 16,
            borderTopLeftRadius: ar ? 4 : 16, borderTopRightRadius: ar ? 16 : 4,
            background: '#fff', border: '1px solid #F0EBE0',
            boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
            fontSize: 13.5, lineHeight: 1.8, color: '#1A1208',
          }}>
            <MarkdownBlock lines={displayContent.split('\n')} />
            {msg.streaming && (
              <span style={{
                display: 'inline-block', width: 8, height: 15,
                background: '#8B1A1A', borderRadius: 2,
                animation: 'blink 0.9s step-end infinite', marginRight: 2,
              }} />
            )}
          </div>
        )}

        {/* Streaming cursor for structured responses */}
        {!isUser && msg.streaming && isStructured && (
          <span style={{
            display: 'inline-block', width: 8, height: 15,
            background: '#8B1A1A', borderRadius: 2,
            animation: 'blink 0.9s step-end infinite', marginRight: 2,
          }} />
        )}

        {/* Action buttons + trust badge */}
        {!isUser && !msg.streaming && msg.content.length > 30 && (
          <>
            <ActionButtons content={displayContent} isAr={ar} onFollowUp={onFollowUp} />
            <TrustBadge isAr={ar} />
          </>
        )}
      </div>

      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </div>
  )
}
