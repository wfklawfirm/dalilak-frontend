'use client'

/**
 * ChatPinnedMessage — pin/unpin an AI message, show it at top of chat.
 *
 * LS key: dalilak_chat_pinned (stores { text, pinnedAt })
 *
 * Two exported pieces:
 *   1. usePinnedMessage()  — hook: { pinned, pinMessage, unpin }
 *   2. ChatPinnedBanner    — sticky strip at top of messages showing the pinned text
 *   3. ChatPinButton       — small pin icon button for each assistant message
 *
 * Props for ChatPinnedBanner: { isAr: boolean }
 * Props for ChatPinButton: { text: string; isAr: boolean }
 */

import React, { useState, useEffect, useCallback } from 'react'

const LS_KEY = 'dalilak_chat_pinned'

interface PinnedEntry {
  text: string
  pinnedAt: string // ISO
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function usePinnedMessage() {
  const [pinned, setPinned] = useState<PinnedEntry | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) setPinned(JSON.parse(raw))
    } catch {}
  }, [])

  const pinMessage = useCallback((text: string) => {
    const entry: PinnedEntry = { text, pinnedAt: new Date().toISOString() }
    try { localStorage.setItem(LS_KEY, JSON.stringify(entry)) } catch {}
    setPinned(entry)
    window.dispatchEvent(new CustomEvent('dalilak_pinned_change'))
  }, [])

  const unpin = useCallback(() => {
    try { localStorage.removeItem(LS_KEY) } catch {}
    setPinned(null)
    window.dispatchEvent(new CustomEvent('dalilak_pinned_change'))
  }, [])

  return { pinned: mounted ? pinned : null, pinMessage, unpin }
}

// ── ChatPinnedBanner ──────────────────────────────────────────────────────────

export function ChatPinnedBanner({ isAr }: { isAr: boolean }) {
  const [pinned, setPinned] = useState<PinnedEntry | null>(null)
  const [mounted, setMounted] = useState(false)
  const [expanded, setExpanded] = useState(false)

  function load() {
    try {
      const raw = localStorage.getItem(LS_KEY)
      setPinned(raw ? JSON.parse(raw) : null)
    } catch { setPinned(null) }
  }

  useEffect(() => {
    setMounted(true)
    load()
    window.addEventListener('dalilak_pinned_change', load)
    return () => window.removeEventListener('dalilak_pinned_change', load)
  }, [])

  if (!mounted || !pinned) return null

  const preview = pinned.text.length > 80
    ? pinned.text.slice(0, 80).trimEnd() + '…'
    : pinned.text
  const displayText = expanded ? pinned.text : preview

  function unpin() {
    try { localStorage.removeItem(LS_KEY) } catch {}
    setPinned(null)
    window.dispatchEvent(new CustomEvent('dalilak_pinned_change'))
  }

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        background: '#FFFBEB', border: '1.5px solid #FDE68A',
        borderRadius: 10, padding: '8px 12px', marginBottom: 10,
        display: 'flex', alignItems: 'flex-start', gap: 8,
        animation: 'fadeUp 0.2s ease both',
      }}
    >
      {/* Pin icon */}
      <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>📌</span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 9, fontWeight: 800, color: '#92400E', marginBottom: 3, letterSpacing: 0.3 }}>
          {isAr ? 'رسالة مثبّتة' : 'Pinned message'}
        </div>
        <div style={{ fontSize: 11, color: '#44403C', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {displayText}
        </div>
        {pinned.text.length > 80 && (
          <button type="button" onClick={() => setExpanded(v => !v)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 9.5, fontWeight: 700, color: '#92400E', padding: '3px 0',
              fontFamily: 'inherit',
            }}>
            {expanded
              ? (isAr ? 'عرض أقل ▲' : 'Show less ▲')
              : (isAr ? 'عرض الكل ▼' : 'Show all ▼')}
          </button>
        )}
      </div>

      {/* Unpin */}
      <button type="button" onClick={unpin}
        title={isAr ? 'إلغاء التثبيت' : 'Unpin'}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 14, color: '#D97706', padding: 0, flexShrink: 0,
          lineHeight: 1,
        }}>
        ✕
      </button>
    </div>
  )
}

// ── ChatPinButton ─────────────────────────────────────────────────────────────

export default function ChatPinButton({ text, isAr }: { text: string; isAr: boolean }) {
  const { pinMessage } = usePinnedMessage()
  const [pinned, setPinned] = useState(false)

  function handlePin() {
    pinMessage(text)
    setPinned(true)
    setTimeout(() => setPinned(false), 2000)
  }

  return (
    <button
      type="button"
      onClick={handlePin}
      title={isAr ? 'تثبيت هذه الرسالة' : 'Pin this message'}
      style={{
        background: pinned ? '#FFFBEB' : 'none',
        border: pinned ? '1px solid #FDE68A' : 'none',
        borderRadius: 8, padding: '3px 6px',
        cursor: 'pointer', fontSize: 12, lineHeight: 1,
        transition: 'all 0.15s',
        color: pinned ? '#92400E' : '#A8A29E',
      }}
      onMouseEnter={e => { if (!pinned) e.currentTarget.style.color = '#D97706' }}
      onMouseLeave={e => { if (!pinned) e.currentTarget.style.color = '#A8A29E' }}
    >
      {pinned ? '✅' : '📌'}
    </button>
  )
}
