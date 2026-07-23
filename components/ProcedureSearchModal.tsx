'use client'

/**
 * ProcedureSearchModal — fullscreen procedure search modal.
 * Triggered by a search button on /procedures page or via keyboard shortcut.
 * Shows: recent searches (from localStorage), top procedures, search results.
 * Each result shows: title, ministry, doc count, fee badge, step count.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useLanguage } from '@/lib/LanguageContext'
import { ENRICHED_PROCEDURES, type EnrichedProcedure } from '@/lib/enrichedProcedures'
import { normalizeForSearch } from '@/lib/arabicNormalize'

const LS_RECENT = 'dalilak_proc_searches'
const MAX_RECENT = 6

function loadRecent(): string[] {
  try {
    const raw = localStorage.getItem(LS_RECENT)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveSearch(q: string) {
  try {
    const prev = loadRecent().filter(s => s !== q)
    localStorage.setItem(LS_RECENT, JSON.stringify([q, ...prev].slice(0, MAX_RECENT)))
  } catch {}
}

function searchProcs(q: string, isAr: boolean): EnrichedProcedure[] {
  if (!q.trim()) return ENRICHED_PROCEDURES.slice(0, 8)
  const norm = normalizeForSearch(q)
  return ENRICHED_PROCEDURES.filter(p => {
    const title = normalizeForSearch(isAr ? p.title : (p.title_en || p.title))
    const min   = normalizeForSearch(isAr ? p.ministry : (p.ministry_en || p.ministry))
    const code  = p.code.toLowerCase()
    return title.includes(norm) || min.includes(norm) || code.includes(norm)
  }).slice(0, 12)
}

interface Props {
  onClose: () => void
  onSelect?: (proc: EnrichedProcedure) => void
  onAsk?: (q: string) => void
}

export default function ProcedureSearchModal({ onClose, onSelect, onAsk }: Props) {
  const { isAr } = useLanguage()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<EnrichedProcedure[]>(() => ENRICHED_PROCEDURES.slice(0, 8))
  const [recent, setRecent] = useState<string[]>([])
  const [activeIdx, setActiveIdx] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    setRecent(loadRecent())
  }, [])

  useEffect(() => {
    setResults(searchProcs(query, isAr))
    setActiveIdx(-1)
  }, [query, isAr])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleSelect = useCallback((proc: EnrichedProcedure) => {
    if (query.trim()) saveSearch(query.trim())
    onSelect?.(proc)
    onClose()
  }, [query, onSelect, onClose])

  const handleAsk = useCallback((q: string) => {
    if (q.trim()) saveSearch(q)
    onAsk?.(q)
    onClose()
  }, [onAsk, onClose])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx(i => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx(i => Math.max(i - 1, -1))
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      handleSelect(results[activeIdx])
    }
  }

  return (
    <div
      role="presentation"
      style={{
        position: 'fixed', inset: 0, zIndex: 9800,
        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '60px 16px 16px',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        dir={isAr ? 'rtl' : 'ltr'}
        role="dialog"
        aria-modal="true"
        aria-label={isAr ? 'بحث في المعاملات' : 'Search procedures'}
        style={{
          background: 'var(--bg)', borderRadius: 18, width: '100%', maxWidth: 580,
          maxHeight: '78vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
          boxShadow: '0 32px 80px rgba(0,0,0,0.28)',
          animation: 'fadeUp 0.18s ease both',
        }}
      >
        {/* Search input */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '14px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0,
        }}>
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2.5" style={{ flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            ref={inputRef}
            type="search"
            dir={isAr ? 'rtl' : 'ltr'}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isAr ? 'ابحث في المعاملات الحكومية...' : 'Search government procedures...'}
            style={{
              flex: 1, border: 'none', outline: 'none', fontSize: 15,
              color: 'var(--text-1)', background: 'transparent', fontFamily: 'inherit',
            }}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-4)', fontSize: 18 }}
            >×</button>
          )}
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6,
              padding: '2px 7px', fontSize: 10, color: 'var(--text-4)',
              cursor: 'pointer', flexShrink: 0, fontFamily: 'inherit',
            }}
          >Esc</button>
        </div>

        {/* Content */}
        <div style={{ overflow: 'auto', flex: 1 }}>
          {/* Recent searches */}
          {!query && recent.length > 0 && (
            <div style={{ padding: '10px 16px 6px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-4)', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {isAr ? 'عمليات بحث سابقة' : 'Recent searches'}
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {recent.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setQuery(s)}
                    style={{
                      background: 'var(--surface)', border: '1px solid var(--border)',
                      borderRadius: 8, padding: '4px 10px',
                      fontSize: 11.5, color: 'var(--text-2)', cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    🕐 {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section label */}
          <div style={{ padding: '8px 16px 4px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {query
                ? (isAr ? `${results.length} نتيجة` : `${results.length} results`)
                : (isAr ? 'أكثر المعاملات شيوعاً' : 'Popular Procedures')
              }
            </div>
          </div>

          {/* Results list */}
          {results.length === 0 ? (
            <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-4)', fontSize: 13 }}>
              {isAr ? 'لا توجد نتائج' : 'No results found'}
              {onAsk && (
                <div style={{ marginTop: 12 }}>
                  <button
                    type="button"
                    onClick={() => handleAsk(isAr
                      ? `${query} — أخبرني عن هذه المعاملة`
                      : `Tell me about: ${query}`
                    )}
                    style={{
                      padding: '7px 16px', borderRadius: 9,
                      background: '#8F1D2C', color: '#fff',
                      border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700,
                      fontFamily: 'inherit',
                    }}
                  >
                    💬 {isAr ? 'اسأل دليلك' : 'Ask Dalilak'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            results.map((proc, idx) => {
              const title    = isAr ? proc.title : (proc.title_en || proc.title)
              const ministry = isAr ? proc.ministry : (proc.ministry_en || proc.ministry)
              const docs     = isAr ? proc.requiredDocuments : (proc.requiredDocuments_en?.length ? proc.requiredDocuments_en : proc.requiredDocuments)
              const steps    = isAr ? proc.steps : (proc.steps_en?.length ? proc.steps_en : proc.steps)
              const fees     = isAr ? proc.fees : (proc.fees_en || proc.fees)
              const isFree   = fees?.includes('مجان') || fees?.toLowerCase().includes('free')
              const isActive = idx === activeIdx

              return (
                <button
                  key={proc.code}
                  type="button"
                  onClick={() => handleSelect(proc)}
                  onMouseEnter={() => setActiveIdx(idx)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                    padding: '10px 16px', background: isActive ? 'var(--surface-2)' : 'transparent',
                    border: 'none', cursor: 'pointer', textAlign: isAr ? 'right' : 'left',
                    borderBottom: '1px solid var(--border)', fontFamily: 'inherit',
                    transition: 'background 0.1s',
                  }}
                >
                  {/* Icon */}
                  <span style={{
                    width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                    background: 'rgba(143,29,44,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 17,
                  }}>
                    {proc.icon || '📄'}
                  </span>

                  {/* Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 13, fontWeight: 700, color: 'var(--text-1)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      marginBottom: 3,
                    }}>
                      {title}
                    </div>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 10, color: '#8F1D2C', fontWeight: 600 }}>
                        🏛️ {ministry}
                      </span>
                      {docs.length > 0 && (
                        <span style={{ fontSize: 10, color: 'var(--text-4)' }}>
                          · 📋 {docs.length} {isAr ? 'وثيقة' : 'docs'}
                        </span>
                      )}
                      {steps.length > 0 && (
                        <span style={{ fontSize: 10, color: 'var(--text-4)' }}>
                          · 👣 {steps.length} {isAr ? 'خطوة' : 'steps'}
                        </span>
                      )}
                      {fees && (
                        <span style={{
                          fontSize: 10, fontWeight: 700,
                          color: isFree ? '#059669' : '#d97706',
                        }}>
                          · 💰 {isFree ? (isAr ? 'مجاني' : 'Free') : fees.slice(0, 18)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Arrow */}
                  <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-4)" strokeWidth="2.5" style={{ flexShrink: 0, transform: isAr ? 'scaleX(-1)' : 'none' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6"/>
                  </svg>
                </button>
              )
            })
          )}

          {/* Ask about a procedure */}
          {query && results.length > 0 && onAsk && (
            <button
              type="button"
              onClick={() => handleAsk(isAr
                ? `أخبرني عن معاملة: ${query}`
                : `Tell me about the procedure: ${query}`
              )}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '12px 16px',
                background: 'var(--surface)', border: 'none',
                cursor: 'pointer', textAlign: isAr ? 'right' : 'left',
                fontFamily: 'inherit',
                borderTop: '1px solid var(--border)',
              }}
            >
              <span style={{
                width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                background: 'rgba(143,29,44,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 17,
              }}>💬</span>
              <div style={{ flex: 1, textAlign: isAr ? 'right' : 'left' }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: '#8F1D2C' }}>
                  {isAr ? `اسأل دليلك عن "${query}"` : `Ask Dalilak about "${query}"`}
                </div>
                <div style={{ fontSize: 10.5, color: 'var(--text-4)', marginTop: 1 }}>
                  {isAr ? 'احصل على إجابة مفصّلة من المساعد الذكي' : 'Get a detailed AI-powered answer'}
                </div>
              </div>
            </button>
          )}
        </div>

        {/* Footer hint */}
        <div style={{
          padding: '7px 16px', borderTop: '1px solid var(--border)',
          fontSize: 10, color: 'var(--text-4)', flexShrink: 0,
          display: 'flex', gap: 12,
        }}>
          <span>↑↓ {isAr ? 'للتنقل' : 'navigate'}</span>
          <span>↵ {isAr ? 'للاختيار' : 'select'}</span>
          <span>Esc {isAr ? 'للإغلاق' : 'close'}</span>
        </div>
      </div>
    </div>
  )
}
