'use client'

/**
 * ChatMessageSearchInThread — small floating search box to find text
 * within the current conversation's messages, jumping to and briefly
 * highlighting matches. Self-contained: takes the current messages list
 * (role/content pairs) and scrolls/flashes the matching message element
 * by id (expects each message to be rendered with id={`msg-${index}`}).
 *
 * Props: { messages: { role: string; content: string }[]; isAr: boolean }
 */

import React, { useState, useMemo, useCallback } from 'react'

interface Msg {
  role: string
  content: string
}

interface Props {
  messages: Msg[]
  isAr: boolean
}

export default function ChatMessageSearchInThread({ messages, isAr }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  // batch #553: -1 means "no match jumped to yet" (fresh query, nothing
  // navigated to). Was initialized to 0, which the counter below then
  // displayed as "1/N" even though no jump had happened -- and the very
  // first press of "next" computed `(0 + 1) % matches.length`, landing on
  // the SECOND match and permanently skipping the first one on the primary
  // forward-navigation path (the counter jumped straight from "1/N" to
  // "2/N" with the highlighted message being matches[1], not matches[0]).
  const [matchIdx, setMatchIdx] = useState(-1)

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return messages
      .map((m, i) => ({ i, hit: m.content.toLowerCase().includes(q) }))
      .filter(m => m.hit)
      .map(m => m.i)
  }, [query, messages])

  const jumpTo = useCallback((idx: number) => {
    const el = document.getElementById(`msg-${idx}`)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    const prevBg = el.style.backgroundColor
    el.style.transition = 'background-color 0.3s'
    el.style.backgroundColor = 'rgba(250, 204, 21, 0.35)'
    setTimeout(() => { el.style.backgroundColor = prevBg }, 1200)
  }, [])

  const goNext = () => {
    if (matches.length === 0) return
    const next = matchIdx < 0 ? 0 : (matchIdx + 1) % matches.length
    setMatchIdx(next)
    jumpTo(matches[next])
  }
  const goPrev = () => {
    if (matches.length === 0) return
    const prev = matchIdx < 0 ? matches.length - 1 : (matchIdx - 1 + matches.length) % matches.length
    setMatchIdx(prev)
    jumpTo(matches[prev])
  }

  if (messages.length < 4) return null

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={isAr ? 'بحث في المحادثة' : 'Search in conversation'}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 14, padding: '4px 6px', color: '#9CA3AF',
        }}
      >
        🔎
      </button>
    )
  }

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '5px 8px',
        background: '#F9FAFB',
        border: '1px solid #E5E7EB',
        borderRadius: 10,
      }}
    >
      <input
        autoFocus
        value={query}
        onChange={e => { setQuery(e.target.value); setMatchIdx(-1) }}
        onKeyDown={e => {
          if (e.key === 'Enter') { e.preventDefault(); goNext() }
          if (e.key === 'Escape') setOpen(false)
        }}
        placeholder={isAr ? 'ابحث في هذه المحادثة...' : 'Search this chat...'}
        aria-label={isAr ? 'ابحث في هذه المحادثة' : 'Search this chat'}
        style={{
          flex: 1, border: 'none', outline: 'none', background: 'transparent',
          fontSize: 12, fontFamily: 'inherit', minWidth: 0,
        }}
      />
      {query && (
        <span style={{ fontSize: 10, color: '#9CA3AF', flexShrink: 0 }}>
          {matches.length > 0
            ? (matchIdx >= 0 ? `${matchIdx + 1}/${matches.length}` : `${matches.length} ${isAr ? 'نتيجة' : 'matches'}`)
            : (isAr ? 'لا نتائج' : 'No results')}
        </span>
      )}
      <button type="button" onClick={goPrev} disabled={matches.length === 0}
        aria-label={isAr ? 'النتيجة السابقة' : 'Previous match'}
        style={{ background: 'none', border: 'none', cursor: matches.length ? 'pointer' : 'default', fontSize: 12, color: '#6B7280', padding: '2px 4px' }}>
        ↑
      </button>
      <button type="button" onClick={goNext} disabled={matches.length === 0}
        aria-label={isAr ? 'النتيجة التالية' : 'Next match'}
        style={{ background: 'none', border: 'none', cursor: matches.length ? 'pointer' : 'default', fontSize: 12, color: '#6B7280', padding: '2px 4px' }}>
        ↓
      </button>
      <button type="button" onClick={() => { setOpen(false); setQuery('') }}
        aria-label={isAr ? 'إغلاق البحث' : 'Close search'}
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#9CA3AF', padding: '2px 4px' }}>
        ✕
      </button>
    </div>
  )
}
