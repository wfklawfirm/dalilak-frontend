'use client'

/**
 * ProcedureRelatedSuggestions — "You may also need" row under an expanded procedure.
 *
 * Algorithm:
 *   1. Find procedures from the SAME ministry (exclude current)
 *   2. If fewer than 2 from same ministry, supplement with keyword overlap on title
 *   3. Show max 3 suggestions as small clickable chips/cards
 *
 * Props:
 *   proc       — the currently expanded procedure
 *   onSelect   — called when user clicks a suggestion (passes the procedure code)
 *   onAsk      — called when user clicks "Ask Dalilak" on a suggestion
 */

import React, { useMemo } from 'react'
import { useLanguage } from '@/lib/LanguageContext'
import { ENRICHED_PROCEDURES, type EnrichedProcedure } from '@/lib/enrichedProcedures'

interface Props {
  proc: EnrichedProcedure
  onSelect?: (code: string) => void
  onAsk?: (q: string) => void
}

function getSuggestions(proc: EnrichedProcedure, isAr: boolean): EnrichedProcedure[] {
  const others = ENRICHED_PROCEDURES.filter(p => p.code !== proc.code)

  // 1. Same ministry
  const sameMinistry = others.filter(p => p.ministry === proc.ministry)

  // 2. Keyword overlap on title (split on spaces, check 2+ word overlap)
  const titleWords = new Set(
    (isAr ? proc.title : (proc.title_en || proc.title))
      .split(/\s+/)
      .filter(w => w.length > 3)
      .map(w => w.toLowerCase())
  )

  const keywordMatch = others.filter(p => {
    if (p.ministry === proc.ministry) return false // already in sameMinistry
    const words = (isAr ? p.title : (p.title_en || p.title))
      .split(/\s+/)
      .map(w => w.toLowerCase())
    const overlap = words.filter(w => titleWords.has(w))
    return overlap.length >= 1
  })

  // Combine: ministry first, then keyword, deduplicate
  const seen = new Set<string>()
  const combined: EnrichedProcedure[] = []
  for (const p of [...sameMinistry, ...keywordMatch]) {
    if (!seen.has(p.code)) {
      seen.add(p.code)
      combined.push(p)
    }
  }

  return combined.slice(0, 3)
}

export default function ProcedureRelatedSuggestions({ proc, onSelect, onAsk }: Props) {
  const { isAr } = useLanguage()
  const suggestions = useMemo(() => getSuggestions(proc, isAr), [proc, isAr])

  if (suggestions.length === 0) return null

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        marginTop: 16, paddingTop: 14,
        borderTop: '1px solid var(--border)',
      }}
    >
      {/* Section label */}
      <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-4)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        🔗 {isAr ? 'قد تحتاج أيضاً' : 'You may also need'}
      </div>

      {/* Suggestions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {suggestions.map(s => {
          const title    = isAr ? s.title    : (s.title_en    || s.title)
          const ministry = isAr ? s.ministry : (s.ministry_en || s.ministry)
          const docCount = s.requiredDocuments.length

          return (
            <div
              key={s.code}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 12px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 10,
              }}
            >
              {/* Icon */}
              <span style={{
                width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                background: 'rgba(143,29,44,0.07)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 15,
              }}>
                {s.icon || '📄'}
              </span>

              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <button
                  type="button"
                  onClick={() => onSelect?.(s.code)}
                  style={{
                    background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                    textAlign: isAr ? 'right' : 'left', fontFamily: 'inherit',
                    display: 'block', width: '100%',
                  }}
                >
                  <div style={{
                    fontSize: 12, fontWeight: 700, color: 'var(--text-1)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {title}
                  </div>
                  <div style={{ fontSize: 10, color: '#8F1D2C', fontWeight: 600, marginTop: 2 }}>
                    🏛️ {ministry}
                    {docCount > 0 && (
                      <span style={{ color: 'var(--text-4)', fontWeight: 400, marginInlineStart: 6 }}>
                        · {docCount} {isAr ? 'وثيقة' : 'docs'}
                      </span>
                    )}
                  </div>
                </button>
              </div>

              {/* Ask button */}
              {onAsk && (
                <button
                  type="button"
                  title={isAr ? 'اسأل دليلك' : 'Ask Dalilak'}
                  onClick={() => onAsk(isAr
                    ? `أخبرني عن معاملة: ${title}`
                    : `Tell me about the procedure: ${s.title_en || s.title}`
                  )}
                  style={{
                    background: 'rgba(143,29,44,0.07)',
                    border: '1px solid rgba(143,29,44,0.15)',
                    borderRadius: 7, padding: '3px 8px',
                    fontSize: 10, fontWeight: 700, color: '#8F1D2C',
                    cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
                  }}
                >
                  💬
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
