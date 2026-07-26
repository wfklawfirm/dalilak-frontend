'use client'

/**
 * ProcedureFAQChips — shows up to 3 related FAQ items for a procedure.
 *
 * Matches FAQ items whose title/category overlaps with the procedure's
 * ministry or title keywords. Renders as collapsible chip list.
 *
 * Each chip expands to show the FAQ summary + link to /faq.
 * Clicking "اسأل دليلك" fires onAsk with the FAQ's chatPrompt.
 *
 * Props:
 *   ministry: string — procedure ministry (Arabic)
 *   title: string    — procedure title (Arabic)
 *   isAr: boolean
 *   onAsk: (q: string) => void
 */

import React, { useState, useMemo } from 'react'
import { SERVICE_FAQ, type FAQItem } from '@/lib/serviceFAQ'
import Link from 'next/link'

interface Props {
  ministry: string
  title: string
  isAr: boolean
  onAsk: (q: string) => void
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/[أإآ]/g, 'ا').replace(/[ةه]/g, 'ه').replace(/ى/g, 'ي').replace(/\s+/g, ' ').trim()
}

// Some SERVICE_FAQ records (type:'procedure') deliberately leave `summary`
// empty and put their real content in steps/requiredDocuments/fees/authority
// instead (the same shape app/faq/page.tsx already falls back through for
// its own rendering). Without this fallback, this chip's expanded body
// silently rendered blank for those records — 14 of 52 live FAQ items,
// e.g. mun_001 ("رخصة البناء") has summary:'' but 8 real steps that show
// fine on /faq yet vanished here.
// batch #491: detects a leaked Python dict.__repr__() fragment such as
// "{'الاسم': 'SARL ..." — the same corruption previously found (and guarded
// for) in the `fees` field, but here caught in `summary` too (ref_004:
// "شركة_ذات_مسؤولية_محدودة: {'الاسم': 'SARL (Société ...'"). Unlike the old
// `/^[{[]/` anchor (which only catches a dict/array as the WHOLE value),
// this also catches a dict embedded after some prefix text. Verified against
// all 60 real SERVICE_FAQ summary/fees values: matches only the 1 corrupted
// summary and the 13 already-known corrupted fees records, no other real
// record (Arabic prose never contains a `{'...':` sequence).
function isCorruptDictRepr(s: string): boolean {
  return /\{'[^']*':/.test(s)
}

function previewFor(faq: FAQItem): string {
  if (faq.summary && !isCorruptDictRepr(faq.summary)) return faq.summary
  if (faq.steps.length > 0) return faq.steps.join(' • ')
  if (faq.requiredDocuments.length > 0) return faq.requiredDocuments.join(' • ')
  if (faq.fees && !isCorruptDictRepr(faq.fees)) return faq.fees
  return faq.authority || faq.duration || ''
}

function scoreFAQ(faq: FAQItem, titleNorm: string, ministryNorm: string): number {
  const t = normalize(faq.title)
  const c = normalize(faq.category)
  const s = normalize(faq.summary)
  let score = 0
  // Ministry keyword overlap
  const ministryWords = ministryNorm.split(' ').filter(w => w.length > 3)
  for (const w of ministryWords) if (t.includes(w) || c.includes(w)) score += 2
  // Title keyword overlap
  const titleWords = titleNorm.split(' ').filter(w => w.length > 3)
  for (const w of titleWords) if (t.includes(w) || s.includes(w)) score += 1
  return score
}

export default function ProcedureFAQChips({ ministry, title, isAr, onAsk }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null)

  const related = useMemo(() => {
    const titleNorm    = normalize(title)
    const ministryNorm = normalize(ministry)
    return SERVICE_FAQ
      .map(f => ({ faq: f, score: scoreFAQ(f, titleNorm, ministryNorm) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(({ faq }) => faq)
  }, [title, ministry])

  if (related.length === 0) return null

  return (
    <div dir={isAr ? 'rtl' : 'ltr'} style={{ marginTop: 12, marginBottom: 2 }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-3)', marginBottom: 7, display: 'flex', alignItems: 'center', gap: 5 }}>
        <span>💡</span>
        {isAr ? 'أسئلة ذات صلة' : 'Related questions'}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {related.map(faq => {
          const isOpen = expanded === faq.id
          return (
            <div key={faq.id} style={{
              background: isOpen ? 'rgba(143,29,44,0.04)' : 'transparent',
              border: `1px solid ${isOpen ? 'rgba(143,29,44,0.2)' : '#E6E2DC'}`,
              borderRadius: 9, overflow: 'hidden', transition: 'background 0.15s, border 0.15s',
            }}>
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : faq.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 7,
                  padding: '7px 10px', background: 'none', border: 'none',
                  cursor: 'pointer', fontFamily: 'inherit', textAlign: isAr ? 'right' : 'left',
                }}
              >
                <span style={{ fontSize: 13, flexShrink: 0 }}>{faq.categoryIcon}</span>
                <span style={{ flex: 1, fontSize: 11, fontWeight: 700, color: '#191713', lineHeight: 1.4 }}>
                  {faq.title.length > 60 ? faq.title.slice(0, 58) + '…' : faq.title}
                </span>
                <svg aria-hidden="true" width="10" height="10" viewBox="0 0 24 24" fill="none"
                  stroke="#C8C2BB" strokeWidth="2.5"
                  style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              {isOpen && (
                <div style={{ padding: '4px 10px 10px', borderTop: '1px solid #E6E2DC' }}>
                  <p style={{ fontSize: 10.5, color: '#5C534A', lineHeight: 1.55, margin: '6px 0 8px' }}>
                    {(() => {
                      const preview = previewFor(faq)
                      return preview.length > 160 ? preview.slice(0, 158) + '…' : preview
                    })()}
                  </p>
                  <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                    <button
                      type="button" onClick={() => onAsk(faq.chatPrompt)}
                      style={{
                        fontSize: 10, fontWeight: 700, color: '#8F1D2C',
                        background: 'rgba(143,29,44,0.07)', border: '1px solid rgba(143,29,44,0.18)',
                        borderRadius: 20, padding: '3px 9px', cursor: 'pointer', fontFamily: 'inherit',
                      }}
                    >
                      {isAr ? 'اسأل دليلك' : 'Ask Dalilak'}
                    </button>
                    <Link href="/faq" style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-3)', textDecoration: 'underline', alignSelf: 'center' }}>
                      {isAr ? 'المزيد من الأسئلة' : 'More FAQs'}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
