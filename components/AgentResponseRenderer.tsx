'use client'

/**
 * AgentResponseRenderer — Dalilak AI
 *
 * Renders AI responses in two modes:
 * 1. Structured: When the response contains ## Header sections mapped in SECTION_MAP
 * 2. Fallback: Plain markdown renderer (MarkdownFallbackRenderer)
 *
 * Future: Accept parsed AgentResponse JSON when backend supports it.
 */

import React, { ReactNode, useState } from 'react'
import type { AgentSource, ConfidenceLevel } from '@/lib/types'

// ── Section style map ─────────────────────────────────────────
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
  'النماذج':              { bg: '#FEFCE8', border: '#FEF08A', icon: '📄', labelColor: '#854D0E' },
  'forms':                { bg: '#FEFCE8', border: '#FEF08A', icon: '📄', labelColor: '#854D0E' },
  'الرسوم':               { bg: '#FAF5FF', border: '#E9D5FF', icon: '💰', labelColor: '#7E22CE' },
  'fees':                 { bg: '#FAF5FF', border: '#E9D5FF', icon: '💰', labelColor: '#7E22CE' },
  'الخطوة التالية':       { bg: '#ECFDF5', border: '#6EE7B7', icon: '👉', labelColor: '#065F46' },
  'next step':            { bg: '#ECFDF5', border: '#6EE7B7', icon: '👉', labelColor: '#065F46' },
  'تنبيه مهم':            { bg: '#FFF7ED', border: '#FDBA74', icon: '⚠️', labelColor: '#C2410C' },
  'تنبيه':                { bg: '#FFF7ED', border: '#FDBA74', icon: '⚠️', labelColor: '#C2410C' },
  'ملاحظة مهمة':          { bg: '#FFF7ED', border: '#FDBA74', icon: '⚠️', labelColor: '#C2410C' },
  'important note':       { bg: '#FFF7ED', border: '#FDBA74', icon: '⚠️', labelColor: '#C2410C' },
  'الأساس القانوني':      { bg: '#F0F9FF', border: '#BAE6FD', icon: '⚖️', labelColor: '#0369A1' },
  'legal basis':          { bg: '#F0F9FF', border: '#BAE6FD', icon: '⚖️', labelColor: '#0369A1' },
}

function getSectionStyle(header: string) {
  const key = header.toLowerCase().trim().replace(/^#+\s*/, '')
  for (const [k, v] of Object.entries(SECTION_MAP)) {
    if (key === k || key.includes(k) || k.includes(key)) return v
  }
  return null
}

// ── Inline formatting ─────────────────────────────────────────
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

// ── Parse markdown into sections ──────────────────────────────
interface Section { header: string | null; lines: string[] }

function parseSections(text: string): Section[] {
  const lines = text.split('\n')
  const sections: Section[] = []
  let current: Section = { header: null, lines: [] }
  for (const line of lines) {
    if ((/^## /.test(line) || /^# /.test(line)) && getSectionStyle(line)) {
      if (current.header !== null || current.lines.some(l => l.trim())) sections.push(current)
      current = { header: line.replace(/^#+\s*/, ''), lines: [] }
    } else {
      current.lines.push(line)
    }
  }
  if (current.header !== null || current.lines.some(l => l.trim())) sections.push(current)
  return sections.length > 1 ? sections : []
}

// ── Markdown fallback renderer ────────────────────────────────
export function MarkdownFallbackRenderer({ lines }: { lines: string[] }) {
  const elements: ReactNode[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    const h3 = line.match(/^### (.+)/)
    const h2m = line.match(/^## (.+)/)
    const h1m = line.match(/^# (.+)/)
    if (h1m) {
      elements.push(<h1 key={i} style={{ fontWeight: 800, fontSize: '1.05em', margin: '0.8rem 0 0.35rem', color: '#1a1208', borderBottom: '2px solid #f0e0e0', paddingBottom: '0.3rem' }}>{inlineFormat(h1m[1], i)}</h1>)
      i++; continue
    }
    if (h2m) {
      elements.push(<h2 key={i} style={{ fontWeight: 700, fontSize: '0.97em', margin: '0.75rem 0 0.3rem', color: '#8B1A1A' }}>{inlineFormat(h2m[1], i)}</h2>)
      i++; continue
    }
    if (h3) {
      elements.push(<h3 key={i} style={{ fontWeight: 600, fontSize: '0.9em', margin: '0.6rem 0 0.25rem', color: '#5C3A1A' }}>{inlineFormat(h3[1], i)}</h3>)
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
        items.push(<li key={i} style={{ marginBottom: '0.28rem', display: 'flex', gap: 7, alignItems: 'flex-start' }}>
          <span style={{ color: '#8B1A1A', flexShrink: 0, marginTop: 2, fontWeight: 700 }}>•</span>
          <span>{inlineFormat(content, i)}</span>
        </li>)
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
        items.push(<li key={i} style={{ marginBottom: '0.32rem', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <span style={{ minWidth: 22, height: 22, borderRadius: '50%', background: '#8B1A1A', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{num++}</span>
          <span style={{ paddingTop: 2 }}>{inlineFormat(content, i)}</span>
        </li>)
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

// ── Structured section card ───────────────────────────────────
export function AgentSectionCard({ header, lines, style }: { header: string; lines: string[]; style: ReturnType<typeof getSectionStyle> }) {
  if (!style || lines.every(l => !l.trim())) return null
  return (
    <div style={{ background: style.bg, border: `1.5px solid ${style.border}`, borderRadius: 14, padding: '12px 14px', marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10, paddingBottom: 8, borderBottom: `1px solid ${style.border}` }}>
        <span style={{ fontSize: 16 }}>{style.icon}</span>
        <span style={{ fontSize: 12.5, fontWeight: 800, color: style.labelColor }}>{header}</span>
      </div>
      <div style={{ fontSize: 13, lineHeight: 1.8, color: '#1A1208' }}>
        <MarkdownFallbackRenderer lines={lines} />
      </div>
    </div>
  )
}

// ── Source badge ──────────────────────────────────────────────
function SourceTypeBadge({ type }: { type?: AgentSource['type'] }) {
  const map = {
    official:      { label: 'مصدر رسمي', color: '#15803D', bg: '#F0FDF4', border: '#BBF7D0' },
    internal:      { label: 'قاعدة البيانات', color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE' },
    user_uploaded: { label: 'مستند المستخدم', color: '#B45309', bg: '#FFFBEB', border: '#FDE68A' },
    unknown:       { label: 'غير محدد', color: '#6B7280', bg: '#F9FAFB', border: '#E5E7EB' },
  }
  const s = map[type || 'unknown']
  return (
    <span style={{ fontSize: 9.5, fontWeight: 700, color: s.color, background: s.bg, border: `1px solid ${s.border}`, borderRadius: 10, padding: '1px 7px', whiteSpace: 'nowrap' }}>
      {s.label}
    </span>
  )
}

// ── Trust Badge (upgraded with sources + confidence) ──────────
export function TrustBadge({
  isAr, sources, confidence, lastReviewed,
}: {
  isAr: boolean
  sources?: AgentSource[]
  confidence?: ConfidenceLevel
  lastReviewed?: string
}) {
  const [expanded, setExpanded] = useState(false)
  const hasSources = sources && sources.length > 0
  const confLabel = { high: isAr ? 'عالية' : 'High', medium: isAr ? 'متوسطة' : 'Medium', low: isAr ? 'منخفضة' : 'Low', unknown: isAr ? 'غير محددة' : 'Unknown' }
  const confColor = { high: '#15803D', medium: '#B45309', low: '#DC2626', unknown: '#6B7280' }

  return (
    <div style={{ marginTop: 10, padding: '8px 12px', background: '#FAFAF8', borderRadius: 10, border: '1px solid #F0EBE0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: hasSources ? 'pointer' : 'default' }}
        onClick={() => hasSources && setExpanded(e => !e)}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#B8860B" strokeWidth="2" style={{ flexShrink: 0 }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <div style={{ flex: 1, fontSize: 10, color: '#9C8E80', lineHeight: 1.5 }}>
          {!hasSources
            ? (isAr
                ? '⚠️ لم يتم ربط هذه الإجابة بمصدر موثّق. تحقق قبل التصرف.'
                : '⚠️ This answer could not be linked to a verified source. Please verify before acting.')
            : (isAr
                ? `تأكد دائماً من الجهة الرسمية. ${confidence ? `ثقة: ${confLabel[confidence]}` : ''}`
                : `Always verify with official authority. ${confidence ? `Confidence: ${confLabel[confidence]}` : ''}`)}
        </div>
        {confidence && (
          <span style={{ fontSize: 9.5, fontWeight: 700, color: confColor[confidence], background: confColor[confidence] + '15', borderRadius: 8, padding: '1px 6px', flexShrink: 0 }}>
            {confLabel[confidence]}
          </span>
        )}
        {hasSources && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9C8E80" strokeWidth="2" style={{ transform: expanded ? 'rotate(180deg)' : 'none', flexShrink: 0 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
          </svg>
        )}
      </div>

      {/* Expanded source list */}
      {expanded && hasSources && (
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #F0EBE0' }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#5C3A1A', margin: '0 0 6px' }}>
            {isAr ? 'المصادر المستخدمة:' : 'Sources used:'}
          </p>
          {sources!.map((src, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, marginBottom: 5 }}>
              <SourceTypeBadge type={src.type} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 10, color: '#374151', fontWeight: 600 }}>
                  {src.title}
                  {src.ministry && ` — ${src.ministry}`}
                </span>
                {src.url && (
                  <a href={src.url} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'block', fontSize: 9.5, color: '#8B1A1A', marginTop: 1 }}>
                    {src.url.replace(/^https?:\/\//, '').slice(0, 40)}
                  </a>
                )}
                {src.lastUpdated && (
                  <span style={{ fontSize: 9, color: '#9C8E80', display: 'block' }}>
                    {isAr ? `آخر تحديث: ${src.lastUpdated}` : `Last updated: ${src.lastUpdated}`}
                  </span>
                )}
              </div>
              {src.score !== undefined && (
                <span style={{ fontSize: 9, color: '#9C8E80', flexShrink: 0 }}>
                  {Math.round(src.score * 100)}%
                </span>
              )}
            </div>
          ))}
          {lastReviewed && (
            <p style={{ fontSize: 9, color: '#9C8E80', margin: '4px 0 0' }}>
              {isAr ? `آخر مراجعة: ${lastReviewed}` : `Last reviewed: ${lastReviewed}`}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// ── Extract docs list ─────────────────────────────────────────
function extractDocsList(text: string): string {
  const lines = text.split('\n')
  const docLines: string[] = []
  let inDocsSection = false
  for (const line of lines) {
    if (/المستندات|الوثائق|documents/i.test(line) && /^#+/.test(line)) { inDocsSection = true; continue }
    if (inDocsSection && /^#+/.test(line)) { inDocsSection = false; continue }
    if (inDocsSection && /^[-*•\d]/.test(line.trim())) {
      docLines.push(line.replace(/^[-*•\d.]+\s*/, '').trim())
    }
  }
  return docLines.length > 0 ? docLines.map((d, i) => `${i + 1}. ${d}`).join('\n') : ''
}

// ── Response Actions ──────────────────────────────────────────
export function ResponseActions({
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
    navigator.clipboard.writeText(content).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }
  const copyDocs = () => {
    const docs = extractDocsList(content)
    if (!docs) return
    navigator.clipboard.writeText(docs).then(() => { setDocsCopied(true); setTimeout(() => setDocsCopied(false), 2000) })
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

  const btn = (onClick: () => void, icon: ReactNode, label: string, active?: boolean, activeColor?: string, activeBg?: string, activeBorder?: string) => (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 4,
      padding: '4px 10px', borderRadius: 20, cursor: 'pointer',
      fontSize: 10.5, fontFamily: 'inherit', transition: 'all 0.15s',
      border: `1px solid ${active ? (activeBorder || '#22c55e') : '#E5E7EB'}`,
      background: active ? (activeBg || '#F0FDF4') : '#fff',
      color: active ? (activeColor || '#16a34a') : '#6B7280',
    }}>{icon}{label}</button>
  )

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
      {btn(copy,
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {copied ? <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/> : <><rect x="9" y="9" width="13" height="13" rx="2"/><path strokeLinecap="round" d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></>}
        </svg>,
        isAr ? (copied ? 'تم النسخ' : 'نسخ الجواب') : (copied ? 'Copied' : 'Copy'),
        copied, '#16a34a', '#F0FDF4', '#22c55e',
      )}
      {hasDocs && btn(docsCopied ? () => {} : copyDocs,
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
        </svg>,
        isAr ? (docsCopied ? 'تم' : 'نسخ المستندات') : (docsCopied ? 'Done' : 'Copy Docs'),
        docsCopied, '#16a34a', '#F0FDF4', '#22c55e',
      )}
      {btn(downloadChecklist,
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
        </svg>,
        isAr ? 'تحميل Checklist' : 'Download',
      )}
      {onFollowUp && btn(
        () => onFollowUp(isAr ? 'أريد توضيحاً أكثر عن هذا الموضوع' : 'Can you elaborate more on this?'),
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
        </svg>,
        isAr ? 'اسأل متابعة' : 'Follow-up',
      )}
      <span style={{ color: '#E5E7EB', alignSelf: 'center' }}>|</span>
      {btn(() => setFeedback('up'),
        <svg width="11" height="11" viewBox="0 0 24 24" fill={feedback === 'up' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z"/>
        </svg>,
        isAr ? 'مفيد' : 'Helpful',
        feedback === 'up', '#16a34a', '#F0FDF4', '#22c55e',
      )}
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

// ── Main AgentResponseRenderer ────────────────────────────────
interface AgentResponseRendererProps {
  content: string
  isAr: boolean
  streaming?: boolean
  sources?: AgentSource[]
  confidence?: ConfidenceLevel
  onFollowUp?: (q: string) => void
}

export default function AgentResponseRenderer({
  content, isAr, streaming, sources, confidence, onFollowUp,
}: AgentResponseRendererProps) {
  const displayContent = content.replace(/^\[.*?\]\n?/, '')
  const sections = !streaming ? parseSections(displayContent) : []
  const isStructured = sections.length > 0

  // Convert SSE sources to AgentSource format for TrustBadge
  const agentSources: AgentSource[] | undefined = sources?.map(s => ({
    title: s.title,
    type: 'internal' as const,
    ministry: s.ministry,
    score: s.score,
  }))

  return (
    <div style={{ maxWidth: '86%', minWidth: 60 }}>
      {isStructured ? (
        <div>
          {sections.map((sec, i) => {
            if (sec.header === null) {
              const hasContent = sec.lines.some(l => l.trim())
              if (!hasContent) return null
              return (
                <div key={i} style={{ padding: '12px 16px', borderRadius: 16, borderTopLeftRadius: isAr ? 4 : 16, borderTopRightRadius: isAr ? 16 : 4, background: '#fff', border: '1px solid #F0EBE0', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', fontSize: 13.5, lineHeight: 1.8, color: '#1A1208', marginBottom: 10 }}>
                  <MarkdownFallbackRenderer lines={sec.lines} />
                </div>
              )
            }
            const style = getSectionStyle(sec.header)
            if (style) return <AgentSectionCard key={i} header={sec.header} lines={sec.lines} style={style} />
            return (
              <div key={i} style={{ padding: '12px 16px', borderRadius: 14, marginBottom: 10, background: '#fff', border: '1px solid #F0EBE0', fontSize: 13.5, color: '#1A1208', lineHeight: 1.8 }}>
                <strong style={{ color: '#8B1A1A', display: 'block', marginBottom: 6 }}>{sec.header}</strong>
                <MarkdownFallbackRenderer lines={sec.lines} />
              </div>
            )
          })}
        </div>
      ) : (
        <div style={{ padding: '12px 16px', borderRadius: 16, borderTopLeftRadius: isAr ? 4 : 16, borderTopRightRadius: isAr ? 16 : 4, background: '#fff', border: '1px solid #F0EBE0', boxShadow: '0 1px 6px rgba(0,0,0,0.07)', fontSize: 13.5, lineHeight: 1.8, color: '#1A1208' }}>
          <MarkdownFallbackRenderer lines={displayContent.split('\n')} />
          {streaming && (
            <span style={{ display: 'inline-block', width: 8, height: 15, background: '#8B1A1A', borderRadius: 2, animation: 'blink 0.9s step-end infinite', marginRight: 2 }} />
          )}
        </div>
      )}

      {streaming && isStructured && (
        <span style={{ display: 'inline-block', width: 8, height: 15, background: '#8B1A1A', borderRadius: 2, animation: 'blink 0.9s step-end infinite', marginRight: 2 }} />
      )}

      {!streaming && content.length > 30 && (
        <>
          <ResponseActions content={displayContent} isAr={isAr} onFollowUp={onFollowUp} />
          <TrustBadge isAr={isAr} sources={agentSources} confidence={confidence} />
        </>
      )}

      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </div>
  )
}
