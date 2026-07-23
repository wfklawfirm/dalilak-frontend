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
    try { setModeState((localStorage.getItem(LS_KEY) as LengthMode) || '') } catch {}
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
        return (
          <button
            key={o.value || 'normal'}
            type="button"
            onClick={() => setMode(o.value)}
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
            {isAr ? o.ar : o.en}
          </button>
        )
      })}
    </div>
  )
}
