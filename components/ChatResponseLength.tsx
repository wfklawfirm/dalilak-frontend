'use client'

/**
 * ChatResponseLength — toggle preferred answer length before sending.
 *
 * Appends a length-hint prefix to the next message sent by the user.
 * Modes:
 *   short   → prepends "[موجز] " / "[Brief] "
 *   detailed → prepends "[مفصّل] " / "[Detailed] "
 *   (none)   → no prefix (default)
 *
 * LS key: dalilak_response_length → 'short' | 'detailed' | ''
 *
 * Exports:
 *   default ChatResponseLength  — the toggle chip UI (props: isAr)
 *   useResponseLength()         — hook: { prefix, mode, setMode }
 */

import React, { useState, useEffect } from 'react'

export type LengthMode = 'short' | 'detailed' | ''

const LS_KEY = 'dalilak_response_length'

export function useResponseLength() {
  const [mode, setModeState] = useState<LengthMode>('')

  useEffect(() => {
    function refresh() {
      try { setModeState((localStorage.getItem(LS_KEY) as LengthMode) || '') } catch {}
    }
    refresh()
    // Multiple independent components/hooks call useResponseLength() at once
    // (the ChatResponseLength toggle chip + app/page.tsx's own instance used
    // to build the outgoing message prefix). Without this listener each
    // instance only reads localStorage once on mount, so toggling the chip
    // in one instance never updates the mode read by another — the prefix
    // silently stops working until a full page reload. Listening for the
    // custom event (dispatched by setMode below) and storage keeps every
    // mounted instance in sync.
    window.addEventListener('dalilak_response_length_change', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('dalilak_response_length_change', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  function setMode(m: LengthMode) {
    try {
      if (m) localStorage.setItem(LS_KEY, m)
      else    localStorage.removeItem(LS_KEY)
    } catch {}
    setModeState(m)
    window.dispatchEvent(new CustomEvent('dalilak_response_length_change', { detail: m }))
  }

  function getPrefix(isAr: boolean): string {
    if (mode === 'short')    return isAr ? '[موجز] '  : '[Brief] '
    if (mode === 'detailed') return isAr ? '[مفصّل] ' : '[Detailed] '
    return ''
  }

  return { mode, setMode, getPrefix }
}

interface Props { isAr: boolean }

export default function ChatResponseLength({ isAr }: Props) {
  const [mounted, setMounted] = useState(false)
  const { mode, setMode } = useResponseLength()

  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null

  const opts: Array<{ value: LengthMode; ar: string; en: string; icon: string }> = [
    { value: 'short',    ar: 'موجز',   en: 'Brief',    icon: '⚡' },
    { value: '',         ar: 'عادي',   en: 'Normal',   icon: '💬' },
    { value: 'detailed', ar: 'مفصّل',  en: 'Detailed', icon: '📖' },
  ]

  return (
    <>
      {/* batch #358: on narrow screens this sits right next to ModeSelector's
          compact single-button (which already collapses to an icon+label
          button + bottom sheet below 640px — see MobileModeSheet.tsx). Text
          labels here were forcing the row to wrap/crowd on phones. Below
          640px we hide the text and keep only the icon + a11y label, so the
          two controls sit comfortably on one row like ModeSelector does. */}
      <style>{`
        @media (max-width: 639px) {
          .rl-label { display: none; }
          .rl-btn { padding: 5px 8px !important; }
        }
      `}</style>
      <div
        dir={isAr ? 'rtl' : 'ltr'}
        style={{
          display: 'inline-flex', alignItems: 'center',
          background: '#F5F3EE', borderRadius: 20,
          border: '1.5px solid #E5E0D8',
          padding: '2px', gap: 1,
        }}
        role="group"
        aria-label={isAr ? 'طول الرد' : 'Response length'}
      >
        {opts.map(o => {
          const active = mode === o.value
          const label = isAr ? o.ar : o.en
          return (
            <button
              key={o.value || 'normal'}
              type="button"
              className="rl-btn"
              onClick={() => setMode(o.value)}
              aria-label={label}
              title={label}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 3,
                padding: '3px 9px', borderRadius: 16,
                background: active ? '#fff' : 'transparent',
                border: active ? '1.5px solid #D1CBC4' : '1.5px solid transparent',
                cursor: 'pointer', fontFamily: 'inherit',
                fontSize: 10, fontWeight: active ? 800 : 600,
                color: active ? '#1C1917' : '#78716C',
                transition: 'all 0.15s',
                boxShadow: active ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              <span style={{ fontSize: 11 }}>{o.icon}</span>
              <span className="rl-label">{label}</span>
            </button>
          )
        })}
      </div>
    </>
  )
}
