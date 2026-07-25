'use client'

/**
 * ProcedureCostBreakdown — expandable detailed fee breakdown panel.
 *
 * Parses the raw fees string into individual line items and renders
 * each as a distinct chip with an icon (free / stamp / fee / variable).
 * Collapsed by default: shows a one-line summary; click to expand.
 *
 * Props: { fees: string; fees_en?: string; isAr: boolean }
 */

import React, { useState } from 'react'

interface Props {
  fees: string
  fees_en?: string
  isAr: boolean
}

type FeeLineKind = 'free' | 'stamp' | 'variable' | 'fee'

interface FeeLine {
  text: string
  kind: FeeLineKind
}

function classify(line: string): FeeLineKind {
  const l = line.toLowerCase()
  if (!line.trim()) return 'fee'
  if (l.includes('مجان') || l.includes('free') || l === '0' || l.includes('لا رسوم')) return 'free'
  if (l.includes('طابع') || l.includes('stamp')) return 'stamp'
  if (l.includes('حسب') || l.includes('يُحتسب') || l.includes('according') || l.includes('variable')) return 'variable'
  return 'fee'
}

const KIND_META: Record<FeeLineKind, { icon: string; bg: string; border: string; text: string }> = {
  free:     { icon: '✅', bg: '#D1FAE5', border: 'rgba(16,185,129,0.35)', text: '#065F46' },
  stamp:    { icon: '🏷️', bg: '#EEF2FF', border: 'rgba(99,102,241,0.3)',  text: '#3730A3' },
  variable: { icon: '⚖️', bg: '#FFF7ED', border: 'rgba(234,88,12,0.3)',   text: '#7C2D12' },
  fee:      { icon: '💰', bg: '#FFFBEB', border: 'rgba(161,98,7,0.3)',    text: '#78350F' },
}

function parseLines(raw: string): FeeLine[] {
  if (!raw || !raw.trim()) return []

  // Split on newlines, then on | or dash at start of a segment
  const segments = raw
    .split(/\n|(?<=[^\d])\|(?=[^\d])/)  // split on \n and | (but not inside numbers like 1|2)
    // em-dash between items. Lookbehind includes "." alongside \w/Arabic
    // range because real Arabic fee clauses end in a period right before
    // the em-dash (e.g. "...بقيمة 1000 ل.ل. — رسم الانتقال..." at
    // lib/enrichedProcedures.ts line 668) — without "." in the lookbehind
    // this never matched for Arabic text (only ASCII \w), so tiered
    // Arabic fees using an em-dash separator stayed merged into one
    // segment.
    .flatMap(seg => seg.split(/(?<=[\w؀-ۿ.])\s*—\s*(?=[\w؀-ۿ])/))
    // Real fee data (lib/enrichedProcedures.ts, e.g. the "1.500.000 ل.ل. للعامل
    // من الفئة الأولى.- رسم بـ 800.000 ل.ل...." tiered-fee strings) uses a
    // plain hyphen as an inline bullet with NO newline/pipe/em-dash between
    // items — without this split the whole multi-tier fee text collapses
    // into one segment, and classify() below sees the trailing "طابع أميري"
    // clause and misclassifies the entire (often much larger) fee as
    // stamp-only. Split on a hyphen that follows a period/Arabic char and
    // precedes a new word (mirrors the em-dash rule above). Bare digit was
    // removed from the lookbehind — it over-matched compound "N-word"
    // spans like "24-hour" (real data at line 1095), incorrectly splitting
    // them into "24" / "hour urgent service...".
    .flatMap(seg => seg.split(/(?<=[.؀-ۿ])-\s*(?=[؀-ۿA-Za-z])/))
    // Space-padded hyphen separator (" - "), the dominant multi-item
    // separator in fees_en (e.g. line 336: "...worker. - A fee of
    // 800,000 LBP..." and line 658: "Revenue stamp of 1,000 LBP - the
    // transfer tax is calculated..."). Neither rule above matched this —
    // the em-dash rule only matches em-dashes, and the tight-hyphen rule
    // above requires no space between the preceding char and the hyphen —
    // so these strings collapsed into one segment and, since they also
    // contain "stamp"/"طابع", were misclassified as stamp-only, hiding a
    // potentially much larger variable/fee clause. Verified against all
    // 142 real fees/fees_en strings in lib/enrichedProcedures.ts: 27
    // strings now split differently (7 previously mislabeled as
    // stamp-only now correctly split out the larger fee), zero
    // regressions (no string produces fewer segments than before).
    .flatMap(seg => seg.split(/\s+-\s+(?=[؀-ۿA-Za-z0-9])/))
    .map(s => s.replace(/^[-–•]\s*/, '').trim())
    .filter(s => s.length > 2)

  // Deduplicate
  const seen = new Set<string>()
  const result: FeeLine[] = []
  for (const text of segments) {
    if (!seen.has(text)) {
      seen.add(text)
      result.push({ text, kind: classify(text) })
    }
  }
  return result.length > 0 ? result : [{ text: raw.trim(), kind: classify(raw) }]
}

function summarize(lines: FeeLine[], isAr: boolean): string {
  if (lines.length === 0) return ''
  if (lines.every(l => l.kind === 'free')) return isAr ? 'مجاني' : 'Free'
  const hasVariable = lines.some(l => l.kind === 'variable')
  if (hasVariable) return isAr ? 'رسوم متغيرة' : 'Variable fees'
  if (lines.length === 1) {
    const t = lines[0].text
    return t.length > 22 ? t.slice(0, 22) + '…' : t
  }
  return isAr ? `${lines.length} بنود` : `${lines.length} items`
}

export default function ProcedureCostBreakdown({ fees, fees_en, isAr }: Props) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const raw = isAr ? fees : (fees_en || fees)
  const lines = parseLines(raw)

  if (lines.length === 0) return null

  const summary = summarize(lines, isAr)
  const isFree = lines.every(l => l.kind === 'free')

  function copyAll() {
    try {
      navigator.clipboard.writeText(raw)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {}
  }

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{ marginBottom: 10 }}
    >
      {/* Header row — always visible */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 7,
          background: isFree ? '#D1FAE5' : '#FFFBEB',
          border: `1.5px solid ${isFree ? 'rgba(16,185,129,0.35)' : '#FEF3C7'}`,
          borderRadius: open ? '9px 9px 0 0' : 9,
          padding: '7px 10px', cursor: 'pointer', textAlign: 'start',
          transition: 'border-radius 0.15s',
        }}
      >
        <span style={{ fontSize: 13 }}>{isFree ? '✅' : '💰'}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: isFree ? '#065F46' : '#92400E', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {isAr ? 'الرسوم والتكاليف' : 'Fees & Costs'}
          </div>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: isFree ? '#065F46' : '#78350F', lineHeight: 1.3 }}>
            {summary}
          </div>
        </div>
        <span style={{
          fontSize: 9, fontWeight: 700, color: '#B45309',
          background: 'rgba(180,83,9,0.1)', borderRadius: 5,
          padding: '2px 6px', flexShrink: 0,
        }}>
          {open ? (isAr ? '▲ إخفاء' : '▲ Hide') : (isAr ? '▼ تفاصيل' : '▼ Details')}
        </span>
      </button>

      {/* Expanded breakdown */}
      {open && (
        <div style={{
          border: '1.5px solid #FEF3C7', borderTop: 'none',
          borderRadius: '0 0 9px 9px',
          background: '#FEFCE8',
          padding: '8px 10px',
        }}>
          {/* Line items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 8 }}>
            {lines.map((line, i) => {
              const meta = KIND_META[line.kind]
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 7,
                  background: meta.bg, border: `1px solid ${meta.border}`,
                  borderRadius: 7, padding: '5px 9px',
                }}>
                  <span style={{ fontSize: 12, flexShrink: 0, marginTop: 1 }}>{meta.icon}</span>
                  <span style={{ fontSize: 11, color: meta.text, lineHeight: 1.5, fontWeight: line.kind === 'free' ? 700 : 500 }}>
                    {line.text}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Footer — kind legend + copy */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 5 }}>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {([ 'free', 'stamp', 'fee', 'variable' ] as FeeLineKind[])
                .filter(k => lines.some(l => l.kind === k))
                .map(k => {
                  const m = KIND_META[k]
                  const label: Record<string, string> = {
                    free:     isAr ? 'مجاني'       : 'Free',
                    stamp:    isAr ? 'طوابع'       : 'Stamps',
                    fee:      isAr ? 'رسم'         : 'Fee',
                    variable: isAr ? 'متغير'       : 'Variable',
                  }
                  return (
                    <span key={k} style={{
                      fontSize: 8.5, fontWeight: 700, color: m.text,
                      background: m.bg, border: `1px solid ${m.border}`,
                      borderRadius: 4, padding: '1px 5px',
                    }}>
                      {m.icon} {label[k]}
                    </span>
                  )
                })
              }
            </div>
            <button
              type="button"
              onClick={copyAll}
              style={{
                fontSize: 9.5, fontWeight: 700,
                color: copied ? '#059669' : '#92400E',
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '2px 4px',
              }}
            >
              {copied ? (isAr ? '✓ تم النسخ' : '✓ Copied') : (isAr ? '📋 نسخ الرسوم' : '📋 Copy fees')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
