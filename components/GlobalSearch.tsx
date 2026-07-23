'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/lib/LanguageContext'
import { ENRICHED_PROCEDURES } from '@/lib/enrichedProcedures'
import { PROCEDURES_DATA } from '@/lib/procedures'
import { SERVICE_FAQ } from '@/lib/serviceFAQ'
import { LIFE_JOURNEYS } from '@/lib/lifeJourneys'
import { normalizeForSearch } from '@/lib/arabicNormalize'

interface SearchResult {
  id: string
  type: 'procedure' | 'enriched' | 'faq' | 'journey'
  icon: string
  titleAr: string
  titleEn: string
  subtitleAr: string
  subtitleEn: string
  aiPrompt?: string
  href?: string
}

interface GlobalSearchProps {
  onAsk?: (q: string) => void
  onJourneySelect?: (slug: string) => void
}

// ── Build flat index once ─────────────────────────────────────────────────────
function buildIndex(): SearchResult[] {
  const results: SearchResult[] = []

  // 1. Enriched procedures (61 items)
  for (const p of ENRICHED_PROCEDURES) {
    results.push({
      id: `enr-${p.code}`,
      type: 'enriched',
      icon: p.icon || '📄',
      titleAr: p.title,
      titleEn: p.title_en || p.title,
      subtitleAr: p.ministry,
      subtitleEn: p.ministry_en || p.ministry,
      aiPrompt: `أخبرني بكل التفاصيل عن: ${p.title} — الإجراءات والوثائق والرسوم والمدة`,
      href: `/procedures`,
    })
  }

  // 2. PROCEDURES_DATA (guided wizard procedures)
  for (const p of PROCEDURES_DATA) {
    results.push({
      id: `proc-${p.slug}`,
      type: 'procedure',
      icon: p.icon || '📋',
      titleAr: p.title_ar,
      titleEn: p.title_en,
      subtitleAr: p.category_ar,
      subtitleEn: p.category_en,
      aiPrompt: `أرشدني خطوة بخطوة في معاملة: ${p.title_ar}`,
      href: `/procedures`,
    })
  }

  // 3. Service FAQ (48 items)
  for (const f of SERVICE_FAQ) {
    results.push({
      id: `faq-${f.id}`,
      type: 'faq',
      icon: f.categoryIcon || '❓',
      titleAr: f.title,
      titleEn: f.title,
      subtitleAr: f.category,
      subtitleEn: f.category,
      aiPrompt: f.chatPrompt,
      href: `/faq`,
    })
  }

  // 4. Life journeys (8 items)
  for (const j of LIFE_JOURNEYS) {
    results.push({
      id: `jrn-${j.slug}`,
      type: 'journey',
      icon: j.emoji,
      titleAr: j.titleAr,
      titleEn: j.titleEn,
      subtitleAr: j.subtitleAr,
      subtitleEn: j.subtitleEn,
      aiPrompt: `أرشدني في رحلة: ${j.titleAr}`,
    })
  }

  return results
}

// Cached at module level (built once)
let _indexCache: SearchResult[] | null = null
function getIndex() {
  if (!_indexCache) _indexCache = buildIndex()
  return _indexCache
}

// Search — match query in title/subtitle (both langs), with Arabic normalization
function search(query: string, isAr: boolean): SearchResult[] {
  const q = normalizeForSearch(query.trim())
  if (!q) return []
  const index = getIndex()
  const scored: Array<{ r: SearchResult; score: number }> = []

  for (const r of index) {
    const titleMatch = isAr
      ? normalizeForSearch(r.titleAr).includes(q) || normalizeForSearch(r.titleEn).includes(q)
      : normalizeForSearch(r.titleEn).includes(q) || normalizeForSearch(r.titleAr).includes(q)
    const subMatch = isAr
      ? normalizeForSearch(r.subtitleAr).includes(q) || normalizeForSearch(r.subtitleEn).includes(q)
      : normalizeForSearch(r.subtitleEn).includes(q) || normalizeForSearch(r.subtitleAr).includes(q)

    if (!titleMatch && !subMatch) continue

    // Score: title match > subtitle match; enriched > others
    let score = subMatch ? 1 : 0
    if (titleMatch) score += 3
    if (r.type === 'enriched' || r.type === 'procedure') score += 1
    scored.push({ r, score })
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map(s => s.r)
}

// ── Type labels ───────────────────────────────────────────────────────────────
const TYPE_LABEL: Record<string, { ar: string; en: string; color: string }> = {
  enriched:  { ar: 'إجراء',  en: 'Procedure', color: 'var(--brand)' },
  procedure: { ar: 'خدمة',   en: 'Service',   color: 'var(--accent)' },
  faq:       { ar: 'سؤال',   en: 'FAQ',       color: '#8b5cf6' },
  journey:   { ar: 'رحلة',   en: 'Journey',   color: '#f59e0b' },
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function GlobalSearch({ onAsk, onJourneySelect }: GlobalSearchProps) {
  const { isAr } = useLanguage()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIdx, setActiveIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const results = useMemo(() => search(query, isAr), [query, isAr])

  // ── Open/close ──
  const openSearch = useCallback(() => {
    setOpen(true)
    setQuery('')
    setActiveIdx(0)
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [])

  const close = useCallback(() => {
    setOpen(false)
    setQuery('')
    setActiveIdx(0)
  }, [])

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (open) close()
        else openSearch()
        return
      }
      // / key to open (when not in an input)
      if (e.key === '/' && !open) {
        const tag = (e.target as Element)?.tagName?.toLowerCase()
        if (tag !== 'input' && tag !== 'textarea') {
          e.preventDefault()
          openSearch()
        }
        return
      }
      if (!open) return
      if (e.key === 'Escape') { close(); return }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIdx(i => Math.min(i + 1, results.length - 1))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIdx(i => Math.max(i - 1, 0))
      }
      if (e.key === 'Enter' && results[activeIdx]) {
        selectResult(results[activeIdx])
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, results, activeIdx])

  // Reset active when results change
  useEffect(() => setActiveIdx(0), [results])

  const selectResult = useCallback((r: SearchResult) => {
    close()
    if (r.type === 'journey' && onJourneySelect) {
      onJourneySelect(r.id.replace('jrn-', ''))
      return
    }
    if (r.aiPrompt && onAsk) {
      onAsk(r.aiPrompt)
      return
    }
    // fallback: navigate + store query in sessionStorage for the page to pick up
    if (r.aiPrompt) {
      try { sessionStorage.setItem('dalilak_pending_query', r.aiPrompt) } catch { /* ignore */ }
    }
    router.push(r.href || '/')
  }, [close, onAsk, onJourneySelect, router])

  if (!open) {
    return (
      <button
        type="button"
        onClick={openSearch}
        aria-label={isAr ? 'بحث سريع (Cmd+K)' : 'Quick search (Cmd+K)'}
        title={isAr ? 'بحث سريع' : 'Quick search'}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          height: 34, padding: '0 12px', borderRadius: 9,
          border: '1.5px solid var(--border)',
          background: 'var(--surface-muted)',
          color: 'var(--text-3)', fontSize: 12, fontWeight: 500,
          cursor: 'pointer', fontFamily: 'inherit',
          transition: 'border-color 0.14s, color 0.14s, background 0.14s',
        }}
        onMouseEnter={e => {
          const t = e.currentTarget
          t.style.borderColor = 'var(--brand)'
          t.style.color = 'var(--text-1)'
          t.style.background = 'var(--surface)'
        }}
        onMouseLeave={e => {
          const t = e.currentTarget
          t.style.borderColor = 'var(--border)'
          t.style.color = 'var(--text-3)'
          t.style.background = 'var(--surface-muted)'
        }}
      >
        <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/>
        </svg>
        <span className="gs-search-label">{isAr ? 'بحث...' : 'Search...'}</span>
        <kbd style={{
          display: 'flex', alignItems: 'center', gap: 1,
          padding: '1px 5px', borderRadius: 4,
          border: '1px solid var(--border)', background: 'var(--surface)',
          fontSize: 9.5, fontFamily: 'inherit', color: 'var(--text-4)',
          lineHeight: 1.6, letterSpacing: '0.3px',
        }}>
          ⌘K
        </kbd>
        <style>{`.gs-search-label { display: none; } @media (min-width: 640px) { .gs-search-label { display: inline; } }`}</style>
      </button>
    )
  }

  return (
    <>
      {/* Overlay */}
      <div
        onClick={close}
        aria-hidden="true"
        style={{
          position: 'fixed', inset: 0, zIndex: 9000,
          background: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(4px)',
          animation: 'gs-fade-in 0.15s ease',
        }}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-label={isAr ? 'البحث السريع' : 'Quick search'}
        dir={isAr ? 'rtl' : 'ltr'}
        style={{
          position: 'fixed',
          top: '12vh',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9001,
          width: 'min(92vw, 600px)',
          background: 'var(--surface)',
          borderRadius: 16,
          border: '1px solid var(--border)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          overflow: 'hidden',
          animation: 'gs-slide-in 0.18s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        <style>{`
          @keyframes gs-fade-in { from{opacity:0} to{opacity:1} }
          @keyframes gs-slide-in { from{opacity:0;transform:translateX(-50%) translateY(-10px) scale(0.97)} to{opacity:1;transform:translateX(-50%) translateY(0) scale(1)} }
          .gs-result-row { transition: background 0.10s; }
          .gs-result-row:hover, .gs-result-row.active { background: var(--surface-muted) !important; }
        `}</style>

        {/* Search input row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '14px 16px',
          borderBottom: '1px solid var(--border)',
        }}>
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2.5" style={{ flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={isAr ? 'ابحث عن معاملة، خدمة، سؤال...' : 'Search procedures, services, questions...'}
            aria-label={isAr ? 'البحث' : 'Search'}
            style={{
              flex: 1, border: 'none', outline: 'none',
              background: 'transparent',
              fontSize: 15, color: 'var(--text-1)', fontFamily: 'inherit',
            }}
          />
          <button
            type="button"
            onClick={close}
            aria-label={isAr ? 'إغلاق' : 'Close'}
            style={{
              flexShrink: 0, height: 26, padding: '0 8px',
              border: '1px solid var(--border)', borderRadius: 6,
              background: 'transparent', color: 'var(--text-3)',
              fontSize: 10.5, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            ESC
          </button>
        </div>

        {/* Results */}
        <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {query.trim() === '' ? (
            // Empty state — show hints
            <div style={{ padding: '24px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>🔍</div>
              <p style={{ fontSize: 13, color: 'var(--text-3)', margin: 0, lineHeight: 1.7 }}>
                {isAr
                  ? 'ابحث عن أي معاملة حكومية، خدمة، سؤال شائع، أو رحلة حياتية'
                  : 'Search any government procedure, service, FAQ, or life journey'}
              </p>
              <div style={{
                marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 6,
                justifyContent: 'center',
              }}>
                {(isAr
                  ? ['جواز سفر', 'رخصة سيارة', 'تسجيل شركة', 'زواج', 'عقار']
                  : ['passport', 'driving license', 'company', 'marriage', 'property']
                ).map(hint => (
                  <button
                    key={hint}
                    type="button"
                    onClick={() => setQuery(hint)}
                    style={{
                      padding: '5px 12px', borderRadius: 20,
                      border: '1px solid var(--border)',
                      background: 'var(--surface-muted)',
                      color: 'var(--text-2)', fontSize: 12,
                      cursor: 'pointer', fontFamily: 'inherit',
                      transition: 'border-color 0.12s, color 0.12s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'var(--brand)'
                      e.currentTarget.style.color = 'var(--brand)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--border)'
                      e.currentTarget.style.color = 'var(--text-2)'
                    }}
                  >
                    {hint}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            // No results
            <div style={{ padding: '28px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>😕</div>
              <p style={{ fontSize: 13, color: 'var(--text-3)', margin: 0 }}>
                {isAr
                  ? `لا نتائج لـ «${query}» — جرّب كلمة أخرى أو اسأل دليلك مباشرة`
                  : `No results for "${query}" — try another term or ask Dalilak directly`}
              </p>
              {onAsk && (
                <button
                  type="button"
                  onClick={() => {
                    close()
                    onAsk(isAr
                      ? `أخبرني عن: ${query} في لبنان`
                      : `Tell me about: ${query} in Lebanon`)
                  }}
                  style={{
                    marginTop: 14, padding: '8px 18px', borderRadius: 9,
                    border: 'none', background: 'var(--brand)',
                    color: '#fff', fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  {isAr ? `اسأل دليلك عن "${query}"` : `Ask Dalilak about "${query}"`}
                </button>
              )}
            </div>
          ) : (
            // Results list
            <div style={{ padding: '6px 0' }}>
              {results.map((r, i) => {
                const label = TYPE_LABEL[r.type]
                const isActive = i === activeIdx
                return (
                  <button
                    key={r.id}
                    type="button"
                    className={`gs-result-row${isActive ? ' active' : ''}`}
                    onClick={() => selectResult(r)}
                    onMouseEnter={() => setActiveIdx(i)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 16px', border: 'none', textAlign: isAr ? 'right' : 'left',
                      background: isActive ? 'var(--surface-muted)' : 'transparent',
                      cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    {/* Icon */}
                    <div style={{
                      flexShrink: 0, width: 36, height: 36, borderRadius: 10,
                      border: '1px solid var(--border)',
                      background: 'var(--surface-muted)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 17,
                    }}>
                      {r.icon}
                    </div>

                    {/* Text */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 13.5, fontWeight: 600, color: 'var(--text-1)',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {isAr ? r.titleAr : r.titleEn}
                      </div>
                      <div style={{
                        fontSize: 11.5, color: 'var(--text-3)', marginTop: 1,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {isAr ? r.subtitleAr : r.subtitleEn}
                      </div>
                    </div>

                    {/* Type badge */}
                    <div style={{
                      flexShrink: 0,
                      padding: '2px 8px', borderRadius: 20,
                      border: `1px solid ${label.color}33`,
                      background: `${label.color}11`,
                      color: label.color,
                      fontSize: 10.5, fontWeight: 700,
                    }}>
                      {isAr ? label.ar : label.en}
                    </div>

                    {/* Keyboard nav hint */}
                    {isActive && (
                      <div style={{
                        flexShrink: 0, display: 'flex', alignItems: 'center', gap: 3,
                        color: 'var(--text-4)', fontSize: 10,
                      }}>
                        <kbd style={{
                          padding: '1px 5px', borderRadius: 4,
                          border: '1px solid var(--border)', background: 'var(--surface)',
                          fontSize: 9, fontFamily: 'inherit',
                        }}>↵</kbd>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'space-between',
          padding: '8px 16px', borderTop: '1px solid var(--border)',
          background: 'var(--surface-muted)',
        }}>
          <div style={{ display: 'flex', gap: 12, fontSize: 10.5, color: 'var(--text-4)' }}>
            {[
              { keys: '↑↓', label: isAr ? 'تنقل' : 'navigate' },
              { keys: '↵', label: isAr ? 'اختر' : 'select' },
              { keys: 'ESC', label: isAr ? 'إغلاق' : 'close' },
            ].map(({ keys, label }) => (
              <span key={keys} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <kbd style={{
                  padding: '1px 5px', borderRadius: 4,
                  border: '1px solid var(--border)', background: 'var(--surface)',
                  fontSize: 9, fontFamily: 'inherit', color: 'var(--text-3)',
                }}>
                  {keys}
                </kbd>
                {label}
              </span>
            ))}
          </div>
          <span style={{ fontSize: 10.5, color: 'var(--text-4)' }}>
            {results.length > 0 && query
              ? (isAr ? `${results.length} نتيجة` : `${results.length} results`)
              : ''}
          </span>
        </div>
      </div>
    </>
  )
}
