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

import React, { ReactNode, useState, useEffect } from 'react'
import type { AgentSource, ConfidenceLevel } from '@/lib/types'
import { authHeaders } from '@/lib/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dalilak-backend-bvb9.onrender.com'

// ── Section icons ─────────────────────────────────────────────
const SvgSummary  = <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01"/></svg>
const SvgDocs     = <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
const SvgSteps    = <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
const SvgBuilding = <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
const SvgForm     = <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
const SvgFee      = <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
const SvgClock    = <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3"/></svg>
const SvgArrow    = <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
const SvgWarn     = <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
const SvgScales   = <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"/></svg>
const SvgLink     = <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>

// ── Section style map ─────────────────────────────────────────
const SECTION_MAP: Record<string, { bg: string; border: string; icon: ReactNode; labelColor: string }> = {
  'الخلاصة':              { bg: '#FDF8F0', border: '#E6E2DC', icon: SvgSummary,  labelColor: '#7C5C1C' },
  'الملخص':               { bg: '#FDF8F0', border: '#E6E2DC', icon: SvgSummary,  labelColor: '#7C5C1C' },
  'معلومات عامة':         { bg: '#FDF8F0', border: '#E6E2DC', icon: SvgSummary,  labelColor: '#7C5C1C' },
  'نظرة عامة':            { bg: '#FDF8F0', border: '#E6E2DC', icon: SvgSummary,  labelColor: '#7C5C1C' },
  'summary':              { bg: '#FDF8F0', border: '#E6E2DC', icon: SvgSummary,  labelColor: '#7C5C1C' },
  'overview':             { bg: '#FDF8F0', border: '#E6E2DC', icon: SvgSummary,  labelColor: '#7C5C1C' },
  'المستندات المطلوبة':   { bg: '#F8EDEF', border: '#FECACA', icon: SvgDocs,     labelColor: '#8F1D2C' },
  'الوثائق المطلوبة':     { bg: '#F8EDEF', border: '#FECACA', icon: SvgDocs,     labelColor: '#8F1D2C' },
  'الوثائق':              { bg: '#F8EDEF', border: '#FECACA', icon: SvgDocs,     labelColor: '#8F1D2C' },
  'المتطلبات':            { bg: '#F8EDEF', border: '#FECACA', icon: SvgDocs,     labelColor: '#8F1D2C' },
  'الشروط':               { bg: '#F8EDEF', border: '#FECACA', icon: SvgDocs,     labelColor: '#8F1D2C' },
  'required documents':   { bg: '#F8EDEF', border: '#FECACA', icon: SvgDocs,     labelColor: '#8F1D2C' },
  'الخطوات':              { bg: '#FFFBEB', border: '#FDE68A', icon: SvgSteps,    labelColor: '#B45309' },
  'الإجراءات':            { bg: '#FFFBEB', border: '#FDE68A', icon: SvgSteps,    labelColor: '#B45309' },
  'المراحل':              { bg: '#FFFBEB', border: '#FDE68A', icon: SvgSteps,    labelColor: '#B45309' },
  'steps':                { bg: '#FFFBEB', border: '#FDE68A', icon: SvgSteps,    labelColor: '#B45309' },
  'الجهة المختصة':        { bg: '#E6E2DC', border: '#C8BFB4', icon: SvgBuilding, labelColor: '#69645C' },
  'الجهة':                { bg: '#E6E2DC', border: '#C8BFB4', icon: SvgBuilding, labelColor: '#69645C' },
  'الجهات':               { bg: '#E6E2DC', border: '#C8BFB4', icon: SvgBuilding, labelColor: '#69645C' },
  'responsible authority':{ bg: '#E6E2DC', border: '#C8BFB4', icon: SvgBuilding, labelColor: '#69645C' },
  'النموذج المتوفر':      { bg: '#FFFBEB', border: '#FDE68A', icon: SvgForm,     labelColor: '#854D0E' },
  'النماذج':              { bg: '#FFFBEB', border: '#FDE68A', icon: SvgForm,     labelColor: '#854D0E' },
  'forms':                { bg: '#FFFBEB', border: '#FDE68A', icon: SvgForm,     labelColor: '#854D0E' },
  'الرسوم':               { bg: '#FFFBEB', border: '#FDE68A', icon: SvgFee,      labelColor: '#854D0E' },
  'التكاليف':             { bg: '#FFFBEB', border: '#FDE68A', icon: SvgFee,      labelColor: '#854D0E' },
  'الأتعاب':              { bg: '#FFFBEB', border: '#FDE68A', icon: SvgFee,      labelColor: '#854D0E' },
  'fees':                 { bg: '#FFFBEB', border: '#FDE68A', icon: SvgFee,      labelColor: '#854D0E' },
  'المدة':                { bg: '#FFFBEB', border: '#FDE68A', icon: SvgClock,    labelColor: '#B45309' },
  'مدة الإجراء':          { bg: '#FFFBEB', border: '#FDE68A', icon: SvgClock,    labelColor: '#B45309' },
  'المهل':                { bg: '#FFFBEB', border: '#FDE68A', icon: SvgClock,    labelColor: '#B45309' },
  'الخطوة التالية':       { bg: '#F8EDEF', border: '#FECACA', icon: SvgArrow,    labelColor: '#8F1D2C' },
  'التوصية':              { bg: '#F8EDEF', border: '#FECACA', icon: SvgArrow,    labelColor: '#8F1D2C' },
  'next step':            { bg: '#F8EDEF', border: '#FECACA', icon: SvgArrow,    labelColor: '#8F1D2C' },
  'تنبيه مهم':            { bg: '#FFFBEB', border: '#FDE68A', icon: SvgWarn,     labelColor: '#B45309' },
  'تنبيه':                { bg: '#FFFBEB', border: '#FDE68A', icon: SvgWarn,     labelColor: '#B45309' },
  'ملاحظة مهمة':          { bg: '#FFFBEB', border: '#FDE68A', icon: SvgWarn,     labelColor: '#B45309' },
  'ملاحظة':               { bg: '#FFFBEB', border: '#FDE68A', icon: SvgWarn,     labelColor: '#B45309' },
  'تحذير':                { bg: '#FFFBEB', border: '#FDE68A', icon: SvgWarn,     labelColor: '#B45309' },
  'important note':       { bg: '#FFFBEB', border: '#FDE68A', icon: SvgWarn,     labelColor: '#B45309' },
  'الأساس القانوني':      { bg: '#F8EDEF', border: 'rgba(143,29,44,0.15)', icon: SvgScales,   labelColor: '#8F1D2C' },
  'النص القانوني':        { bg: '#F8EDEF', border: 'rgba(143,29,44,0.15)', icon: SvgScales,   labelColor: '#8F1D2C' },
  'المرجع القانوني':      { bg: '#F8EDEF', border: 'rgba(143,29,44,0.15)', icon: SvgScales,   labelColor: '#8F1D2C' },
  'legal basis':          { bg: '#F8EDEF', border: 'rgba(143,29,44,0.15)', icon: SvgScales,   labelColor: '#8F1D2C' },
  'المصدر':               { bg: '#FAFAF8', border: '#E6E2DC', icon: SvgLink,     labelColor: '#2D1B0E' },
  'المصادر':              { bg: '#FAFAF8', border: '#E6E2DC', icon: SvgLink,     labelColor: '#2D1B0E' },
}

function getSectionStyle(header: string) {
  const key = header.toLowerCase().trim().replace(/^#+\s*/, '')
  for (const [k, v] of Object.entries(SECTION_MAP)) {
    if (key === k || key.includes(k) || k.includes(key)) return v
  }
  return null
}

// ── Citation superscript badge ────────────────────────────────
function CiteBadge({ n, active, onClick }: { n: number; active: boolean; onClick: () => void }) {
  return (
    <sup
      onClick={(e) => { e.stopPropagation(); onClick() }}
      title={`المصدر [${n}]`}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 16, height: 16, borderRadius: '50%',
        background: active ? '#8F1D2C' : '#F8EDEF',
        color: active ? '#fff' : '#8F1D2C',
        fontSize: 9, fontWeight: 800, cursor: 'pointer',
        border: `1px solid ${active ? '#8F1D2C' : '#FECACA'}`,
        marginInline: 2, verticalAlign: 'super', lineHeight: 1,
        transition: 'background 0.12s, color 0.12s, border-color 0.12s', flexShrink: 0,
        userSelect: 'none',
      }}
    >
      {n}
    </sup>
  )
}

// ── Inline formatting ─────────────────────────────────────────
function inlineFormat(
  str: string,
  keyPrefix: string | number,
  onCitation?: (n: number) => void,
  activeCitation?: number | null,
): ReactNode {
  const parts: ReactNode[] = []
  let rest = str
  let idx = 0

  while (rest.length > 0) {
    const boldMatch = rest.match(/^(.*?)\*\*(.+?)\*\*/)
    const codeMatch = rest.match(/^(.*?)`([^`]+)`/)
    const citeMatch = rest.match(/^(.*?)\[(\d{1,2})\]/)

    type MatchEntry = { type: 'bold' | 'code' | 'cite'; match: RegExpMatchArray }
    const candidates: MatchEntry[] = []
    if (boldMatch) candidates.push({ type: 'bold', match: boldMatch })
    if (codeMatch) candidates.push({ type: 'code', match: codeMatch })
    if (citeMatch) candidates.push({ type: 'cite', match: citeMatch })

    if (candidates.length === 0) {
      parts.push(<span key={`${keyPrefix}-${idx++}`}>{rest}</span>)
      break
    }

    const earliest = candidates.reduce((a, b) =>
      a.match[1].length <= b.match[1].length ? a : b
    )
    const { type, match } = earliest

    if (match[1]) parts.push(<span key={`${keyPrefix}-${idx++}`}>{match[1]}</span>)

    if (type === 'bold') {
      parts.push(
        <strong key={`${keyPrefix}-${idx++}`} style={{ color: '#7B1111' }}>{match[2]}</strong>
      )
    } else if (type === 'code') {
      parts.push(
        <code key={`${keyPrefix}-${idx++}`} style={{ background: '#fdf2f2', padding: '1px 5px', borderRadius: 3, fontSize: '0.85em' }}>{match[2]}</code>
      )
    } else if (type === 'cite') {
      const n = parseInt(match[2])
      if (n >= 1 && n <= 15 && onCitation) {
        parts.push(
          <CiteBadge
            key={`${keyPrefix}-cite-${idx++}`}
            n={n}
            active={activeCitation === n}
            onClick={() => onCitation(n)}
          />
        )
      } else {
        parts.push(<span key={`${keyPrefix}-${idx++}`}>[{match[2]}]</span>)
      }
    }

    rest = rest.slice(match[0].length)
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
    if (/^#{1,3} /.test(line) && getSectionStyle(line)) {
      if (current.header !== null || current.lines.some(l => l.trim())) sections.push(current)
      current = { header: line.replace(/^#+\s*/, ''), lines: [] }
    } else {
      current.lines.push(line)
    }
  }
  if (current.header !== null || current.lines.some(l => l.trim())) sections.push(current)
  return sections.some(s => s.header !== null) ? sections : []
}

// ── Markdown fallback renderer ────────────────────────────────
export function MarkdownFallbackRenderer({
  lines,
  onCitation,
  activeCitation,
}: {
  lines: string[]
  onCitation?: (n: number) => void
  activeCitation?: number | null
}) {
  const elements: ReactNode[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    const h3 = line.match(/^### (.+)/)
    const h2m = line.match(/^## (.+)/)
    const h1m = line.match(/^# (.+)/)
    if (h1m) {
      elements.push(<h1 key={i} style={{ fontWeight: 800, fontSize: '1.05em', margin: '0.8rem 0 0.35rem', color: '#1a1208', borderBottom: '2px solid #f0e0e0', paddingBottom: '0.3rem' }}>{inlineFormat(h1m[1], i, onCitation, activeCitation)}</h1>)
      i++; continue
    }
    if (h2m) {
      elements.push(<h2 key={i} style={{ fontWeight: 700, fontSize: '0.97em', margin: '0.75rem 0 0.3rem', color: '#8F1D2C' }}>{inlineFormat(h2m[1], i, onCitation, activeCitation)}</h2>)
      i++; continue
    }
    if (h3) {
      elements.push(<h3 key={i} style={{ fontWeight: 600, fontSize: '0.9em', margin: '0.6rem 0 0.25rem', color: '#5C3A1A' }}>{inlineFormat(h3[1], i, onCitation, activeCitation)}</h3>)
      i++; continue
    }
    if (/^---+$/.test(line.trim())) {
      elements.push(<hr key={i} style={{ border: 'none', borderTop: '1px solid #f0e0e0', margin: '0.65rem 0' }} />)
      i++; continue
    }
    // ── Markdown table ──────────────────────────────────────
    if (/^\|/.test(line)) {
      const tableLines: string[] = []
      while (i < lines.length && /^\|/.test(lines[i])) {
        tableLines.push(lines[i])
        i++
      }
      // Filter out separator rows (|---|---|)
      const headerRow = tableLines[0]
      const dataRows = tableLines.slice(2) // skip header + separator
      const parseCells = (row: string) =>
        row.split('|').slice(1, -1).map(c => c.trim())
      const headers = parseCells(headerRow)
      elements.push(
        <div key={'tbl' + i} className="prose-table-wrap">
          <table>
            <thead>
              <tr>
                {headers.map((h, ci) => (
                  <th key={ci}>{inlineFormat(h, `th-${ci}`, onCitation, activeCitation)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataRows.map((row, ri) => (
                <tr key={ri}>
                  {parseCells(row).map((cell, ci) => (
                    <td key={ci}>{inlineFormat(cell, `td-${ri}-${ci}`, onCitation, activeCitation)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
      continue
    }
    if (/^[-*•] /.test(line)) {
      const items: ReactNode[] = []
      while (i < lines.length && /^[-*•] /.test(lines[i])) {
        const content = lines[i].replace(/^[-*•] /, '')
        items.push(<li key={i} style={{ marginBottom: '0.28rem', display: 'flex', gap: 7, alignItems: 'flex-start' }}>
          <span style={{ color: '#8F1D2C', flexShrink: 0, marginTop: 4, display: 'inline-flex' }}><svg aria-hidden="true" width="5" height="5" viewBox="0 0 10 10"><circle cx="5" cy="5" r="3.5" fill="#8F1D2C"/></svg></span>
          <span>{inlineFormat(content, i, onCitation, activeCitation)}</span>
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
        items.push(<li key={i} style={{ marginBottom: '0.38rem', display: 'flex', gap: 9, alignItems: 'flex-start' }}>
          <span style={{ minWidth: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg, #8F1D2C, #741622)', color: '#fff', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 1px 3px rgba(143,29,44,0.2)', marginTop: 1 }}>{num++}</span>
          <span style={{ paddingTop: 2, lineHeight: 1.7 }}>{inlineFormat(content, i, onCitation, activeCitation)}</span>
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
    elements.push(<p key={i} style={{ marginBottom: '0.55rem', lineHeight: 1.85 }}>{inlineFormat(line, i, onCitation, activeCitation)}</p>)
    i++
  }
  return <>{elements}</>
}

// ── Structured section card ───────────────────────────────────
export function AgentSectionCard({
  header, lines, style, onCitation, activeCitation,
}: {
  header: string
  lines: string[]
  style: ReturnType<typeof getSectionStyle>
  onCitation?: (n: number) => void
  activeCitation?: number | null
}) {
  if (!style || lines.every(l => !l.trim())) return null
  return (
    <div style={{ background: style.bg, border: `1.5px solid ${style.border}`, borderRadius: 14, padding: '12px 14px', marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10, paddingBottom: 8, borderBottom: `1px solid ${style.border}` }}>
        <span style={{ display: 'flex', alignItems: 'center', color: style.labelColor }}>{style.icon}</span>
        <span style={{ fontSize: 12.5, fontWeight: 800, color: style.labelColor }}>{header}</span>
      </div>
      <div style={{ fontSize: 13, lineHeight: 1.8, color: '#191713' }}>
        <MarkdownFallbackRenderer lines={lines} onCitation={onCitation} activeCitation={activeCitation} />
      </div>
    </div>
  )
}

// ── Source badge ──────────────────────────────────────────────
function SourceTypeBadge({ type }: { type?: AgentSource['type'] }) {
  const map = {
    official:      { label: 'مصدر رسمي', color: '#78350F', bg: '#FFFBEB', border: '#FDE68A' },
    internal:      { label: 'قاعدة البيانات', color: '#8F1D2C', bg: '#F8EDEF', border: 'rgba(143,29,44,0.2)' },
    user_uploaded: { label: 'مستند المستخدم', color: '#B45309', bg: '#FFFBEB', border: '#FDE68A' },
    unknown:       { label: 'غير محدد', color: '#69645C', bg: '#E6E2DC', border: '#D5CEC4' },
  }
  const s = map[type || 'unknown']
  return (
    <span style={{ fontSize: 9.5, fontWeight: 700, color: s.color, background: s.bg, border: `1px solid ${s.border}`, borderRadius: 10, padding: '1px 7px', whiteSpace: 'nowrap' }}>
      {s.label}
    </span>
  )
}

// ── Score color helper ────────────────────────────────────────
function scoreStyle(score: number) {
  if (score >= 0.75) return { color: '#78350F', bg: '#FFFBEB', border: '#FDE68A' }
  if (score >= 0.50) return { color: '#92400E', bg: '#FFFBEB', border: '#FDE68A' }
  return { color: '#69645C', bg: '#E6E2DC', border: '#D5CEC4' }
}

// ── Trust Badge ───────────────────────────────────────────────
export function TrustBadge({
  isAr, sources, confidence, lastReviewed, activeCitation, defaultExpanded,
}: {
  isAr: boolean
  sources?: AgentSource[]
  confidence?: ConfidenceLevel
  lastReviewed?: string
  activeCitation?: number | null
  defaultExpanded?: boolean
}) {
  const [expanded, setExpanded] = useState(defaultExpanded ?? false)

  const hasSources = sources && sources.length > 0
  const confLabel = {
    high:    isAr ? 'عالية'      : 'High',
    medium:  isAr ? 'متوسطة'    : 'Medium',
    low:     isAr ? 'منخفضة'    : 'Low',
    unknown: isAr ? 'غير محددة' : 'Unknown',
  }
  const confColor = { high: '#78350F', medium: '#B45309', low: '#8F1D2C', unknown: '#69645C' }

  useEffect(() => {
    if (activeCitation != null) setExpanded(true)
  }, [activeCitation])

  const activeRef = React.useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (activeCitation != null && activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [activeCitation])

  return (
    <div style={{ marginTop: 10, padding: '8px 12px', background: '#FAFAF8', borderRadius: 10, border: '1px solid #E6E2DC' }}>
      <div
        role={hasSources ? 'button' : undefined}
        tabIndex={hasSources ? 0 : undefined}
        aria-expanded={hasSources ? expanded : undefined}
        onKeyDown={hasSources ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpanded(prev => !prev) } } : undefined}
        style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: hasSources ? 'pointer' : 'default' }}
        onClick={() => hasSources && setExpanded(e => !e)}
      >
        <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#B8860B" strokeWidth="2" style={{ flexShrink: 0 }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <div style={{ flex: 1, fontSize: 10, color: '#918B82', lineHeight: 1.5 }}>
          {!hasSources
            ? (isAr
                ? 'لم يتم ربط هذه الإجابة بمصدر موثّق. تحقق قبل التصرف.'
                : 'This answer could not be linked to a verified source. Please verify before acting.')
            : (isAr
                ? `${sources!.length} مصادر · ${confidence ? `ثقة: ${confLabel[confidence]}` : ''} · تأكد من الجهة الرسمية`
                : `${sources!.length} sources · ${confidence ? `Confidence: ${confLabel[confidence]}` : ''} · Verify with authority`)}
        </div>
        {confidence && (
          <span style={{ fontSize: 9.5, fontWeight: 700, color: confColor[confidence], background: confColor[confidence] + '15', borderRadius: 8, padding: '1px 6px', flexShrink: 0 }}>
            {confLabel[confidence]}
          </span>
        )}
        {hasSources && (
          <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#918B82" strokeWidth="2" style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
          </svg>
        )}
      </div>

      {expanded && hasSources && (
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #E6E2DC' }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#5C3A1A', margin: '0 0 6px' }}>
            {isAr ? 'المصادر المستخدمة:' : 'Sources used:'}
          </p>
          {sources!.map((src, i) => {
            const citNum = i + 1
            const isActive = activeCitation === citNum
            const ss = src.score !== undefined ? scoreStyle(src.score) : null
            return (
              <div
                key={i}
                ref={isActive ? activeRef : undefined}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 7, marginBottom: 5,
                  padding: '5px 7px', borderRadius: 8,
                  background: isActive ? '#F8EDEF' : 'transparent',
                  border: `1px solid ${isActive ? '#FECACA' : 'transparent'}`,
                  transition: 'background 0.18s cubic-bezier(0.22,1,0.36,1), border-color 0.18s',
                }}
              >
                <span style={{
                  flexShrink: 0, width: 18, height: 18, borderRadius: '50%',
                  background: isActive ? '#8F1D2C' : '#E6E2DC',
                  color: isActive ? '#fff' : '#69645C',
                  fontSize: 10, fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.18s cubic-bezier(0.22,1,0.36,1), color 0.18s',
                }}>
                  {citNum}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                    <SourceTypeBadge type={src.type} />
                    {ss && (
                      <span style={{
                        fontSize: 9, fontWeight: 700, flexShrink: 0,
                        color: ss.color, background: ss.bg,
                        border: `1px solid ${ss.border}`,
                        borderRadius: 8, padding: '1px 5px',
                      }}>
                        {Math.round(src.score! * 100)}%
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: 10.5, color: '#2D1B0E', fontWeight: 600, display: 'block', marginTop: 2 }}>
                    {src.title}
                    {src.ministry && <span style={{ color: '#69645C', fontWeight: 400 }}> — {src.ministry}</span>}
                  </span>
                  {src.url && (
                    <a href={src.url} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'block', fontSize: 9.5, color: '#8F1D2C', marginTop: 1 }}>
                      {src.url.replace(/^https?:\/\//, '').slice(0, 40)}
                    </a>
                  )}
                  {src.lastUpdated && (
                    <span style={{ fontSize: 9, color: '#918B82', display: 'block' }}>
                      {isAr ? `آخر تحديث: ${src.lastUpdated}` : `Last updated: ${src.lastUpdated}`}
                    </span>
                  )}
                  {isActive && src.snippet && (
                    <p style={{
                      fontSize: 10, color: '#69645C', margin: '5px 0 0',
                      padding: '5px 7px', borderRadius: 6,
                      background: '#FFF', border: '1px solid #FECACA',
                      lineHeight: 1.6, direction: 'rtl', textAlign: 'right',
                    }}>
                      {src.snippet}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
          {lastReviewed && (
            <p style={{ fontSize: 9, color: '#918B82', margin: '4px 0 0' }}>
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
  content, isAr, onFollowUp, question, confidence,
}: {
  content: string
  isAr: boolean
  onFollowUp?: (q: string) => void
  question?: string
  confidence?: ConfidenceLevel
}) {
  const [copied, setCopied] = useState(false)
  const [docsCopied, setDocsCopied] = useState(false)
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null)

  const submitFeedback = (rating: 'up' | 'down') => {
    if (feedback) return  // already rated
    setFeedback(rating)
    fetch(API_URL + '/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({
        question: question || '',
        answer: content.slice(0, 800),
        rating,
        confidence: confidence || 'unknown',
      }),
    }).catch(() => {})
  }

  const copy = () => {
    navigator.clipboard.writeText(content).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }
  const copyDocs = () => {
    const docs = extractDocsList(content)
    if (!docs) return
    navigator.clipboard.writeText(docs).then(() => { setDocsCopied(true); setTimeout(() => setDocsCopied(false), 2000) })
  }
  const downloadChecklist = () => {
    const clean = content.replace(/\[\d+\]/g, '').replace(/\[.*?\] /g, '')
    const blob = new Blob([clean], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'dalilak-checklist.txt'; a.click()
    URL.revokeObjectURL(url)
  }
  const hasDocs = Boolean(extractDocsList(content))

  const btn = (onClick: () => void, icon: ReactNode, label: string, active?: boolean, activeColor?: string, activeBg?: string, activeBorder?: string) => (
    <button type="button" aria-label={label} aria-pressed={active !== undefined ? active : undefined} onClick={onClick}
      onTouchStart={e => { e.currentTarget.style.background = active ? (activeBg || '#F8EDEF') : '#F5F0EA'; e.currentTarget.style.transform = 'scale(0.95)' }}
      onTouchEnd={e => { e.currentTarget.style.background = active ? (activeBg || '#F8EDEF') : '#fff'; e.currentTarget.style.transform = 'scale(1)' }}
      onMouseEnter={e => { e.currentTarget.style.background = active ? (activeBg || '#F8EDEF') : '#F5F0EA'; e.currentTarget.style.borderColor = active ? (activeBorder || 'rgba(143,29,44,0.3)') : '#D8CFC2' }}
      onMouseLeave={e => { e.currentTarget.style.background = active ? (activeBg || '#F8EDEF') : '#fff'; e.currentTarget.style.borderColor = active ? (activeBorder || 'rgba(143,29,44,0.3)') : '#E6E2DC' }}
      style={{
      display: 'flex', alignItems: 'center', gap: 4,
      padding: '4px 10px', borderRadius: 20, cursor: 'pointer',
      fontSize: 10.5, fontFamily: 'inherit', transition: 'background 0.12s, color 0.12s, border-color 0.12s',
      border: `1px solid ${active ? (activeBorder || 'rgba(143,29,44,0.3)') : '#E6E2DC'}`,
      background: active ? (activeBg || '#F8EDEF') : '#fff',
      color: active ? (activeColor || '#8F1D2C') : '#69645C',
    }}>{icon}{label}</button>
  )

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
      {btn(copy,
        <svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {copied ? <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/> : <><rect x="9" y="9" width="13" height="13" rx="2"/><path strokeLinecap="round" d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></>}
        </svg>,
        isAr ? (copied ? 'تم النسخ' : 'نسخ الجواب') : (copied ? 'Copied' : 'Copy'),
        copied, '#8F1D2C', '#F8EDEF', 'rgba(143,29,44,0.3)',
      )}
      {hasDocs && btn(docsCopied ? () => {} : copyDocs,
        <svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
        </svg>,
        isAr ? (docsCopied ? 'تم' : 'نسخ المستندات') : (docsCopied ? 'Done' : 'Copy Docs'),
        docsCopied, '#8F1D2C', '#F8EDEF', 'rgba(143,29,44,0.3)',
      )}
      {btn(downloadChecklist,
        <svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
        </svg>,
        isAr ? 'تحميل Checklist' : 'Download',
      )}
      {onFollowUp && btn(
        () => onFollowUp(isAr ? 'أريد توضيحاً أكثر عن هذا الموضوع' : 'Can you elaborate more on this?'),
        <svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
        </svg>,
        isAr ? 'اسأل متابعة' : 'Follow-up',
      )}
      <span style={{ color: '#D5CEC4', alignSelf: 'center' }}>|</span>
      {btn(() => submitFeedback('up'),
        <svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill={feedback === 'up' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z"/>
        </svg>,
        isAr ? 'مفيد' : 'Helpful',
        feedback === 'up', '#78350F', '#FFFBEB', '#FDE68A',
      )}
      {btn(() => submitFeedback('down'),
        <svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill={feedback === 'down' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10z"/>
        </svg>,
        isAr ? 'غير مفيد' : 'Not helpful',
        feedback === 'down', '#8F1D2C', '#F8EDEF', 'rgba(143,29,44,0.3)',
      )}
    </div>
  )
}

// ── Streaming cursor ─────────────────────────────────────────
function StreamingCursor() {
  return (
    <span style={{
      display: 'inline-block', width: 2, height: '1em',
      background: '#8F1D2C', borderRadius: 1,
      verticalAlign: 'text-bottom', marginInlineStart: 2,
      animation: 'streaming-blink 0.9s step-end infinite',
    }} />
  )
}

// ── Main AgentResponseRenderer ────────────────────────────────
interface AgentResponseRendererProps {
  content: string
  isAr: boolean
  streaming?: boolean
  sources?: AgentSource[]
  confidence?: ConfidenceLevel
  lastReviewed?: string
  onFollowUp?: (q: string) => void
  question?: string
  defaultExpandSources?: boolean
}

export default function AgentResponseRenderer({
  content,
  isAr,
  streaming = false,
  sources,
  confidence,
  lastReviewed,
  onFollowUp,
  question,
  defaultExpandSources,
}: AgentResponseRendererProps) {
  const [activeCitation, setActiveCitation] = useState<number | null>(null)

  const handleCitation = (n: number) => {
    setActiveCitation(prev => prev === n ? null : n)
  }

  const sections = parseSections(content)
  const isStructured = sections.length > 0

  return (
    <div style={{
      fontFamily: "'Cairo','Inter',sans-serif",
      fontSize: 13, color: '#191713', lineHeight: 1.8,
      direction: isAr ? 'rtl' : 'ltr',
    }}>
      <style>{`@keyframes streaming-blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
      {isStructured ? (
        <div>
          {sections.map((sec, i) => {
            if (sec.header === null) {
              const nonEmpty = sec.lines.filter(l => l.trim())
              if (!nonEmpty.length) return null
              return (
                <div key={i} style={{ marginBottom: 10 }}>
                  <MarkdownFallbackRenderer
                    lines={sec.lines}
                    onCitation={handleCitation}
                    activeCitation={activeCitation}
                  />
                </div>
              )
            }
            const style = getSectionStyle(sec.header)
            return (
              <div key={i} style={{ animation: 'fadeUp 0.22s cubic-bezier(0.22,1,0.36,1) both', animationDelay: `${Math.min(i, 8) * 0.05}s` }}>
                <AgentSectionCard
                  header={sec.header}
                  lines={sec.lines}
                  style={style}
                  onCitation={handleCitation}
                  activeCitation={activeCitation}
                />
              </div>
            )
          })}
        </div>
      ) : (
        <MarkdownFallbackRenderer
          lines={content.split('\n')}
          onCitation={handleCitation}
          activeCitation={activeCitation}
        />
      )}
      {streaming && <StreamingCursor />}

      <TrustBadge
        isAr={isAr}
        sources={sources}
        confidence={confidence}
        lastReviewed={lastReviewed}
        activeCitation={activeCitation}
        defaultExpanded={defaultExpandSources}
      />

      <ResponseActions
        content={content}
        isAr={isAr}
        onFollowUp={onFollowUp}
        question={question}
        confidence={confidence}
      />

      <p style={{
        fontSize: 10, color: '#C4B5A5', marginTop: 10,
        paddingTop: 8, borderTop: '1px solid #E6E2DC',
        textAlign: isAr ? 'right' : 'left',
      }}>
        {isAr
          ? 'دليلك: معلومات إرشادية لا تُغني عن المختص القانوني.'
          : 'Dalilak: Informational only — does not replace legal counsel.'}
      </p>
    </div>
  )
}
