'use client'

/**
 * ProcedureLanguageToggleHint — one-time dismissible tip shown on a
 * procedure page telling users they can switch language for this content.
 * Shown once per browser (LS flag), auto-dismissible.
 *
 * LS key: dalilak_lang_hint_seen → '1'
 * Props: { isAr: boolean }
 */

import React, { useState, useEffect } from 'react'

interface Props {
  isAr: boolean
}

const LS_KEY = 'dalilak_lang_hint_seen'

export default function ProcedureLanguageToggleHint({ isAr }: Props) {
  const [mounted, setMounted] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      if (localStorage.getItem(LS_KEY) === '1') setDismissed(true)
    } catch {}
  }, [])

  if (!mounted || dismissed) return null

  const close = () => {
    setDismissed(true)
    try { localStorage.setItem(LS_KEY, '1') } catch {}
  }

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 8,
        padding: '8px 12px',
        background: '#F0F9FF',
        border: '1px solid #BAE6FD',
        borderRadius: 10,
        fontSize: 12, color: '#075985', fontWeight: 600,
      }}
    >
      <span>
        {isAr
          ? '💡 يمكنك تبديل اللغة من الأعلى لعرض هذا المحتوى بالإنجليزية'
          : '💡 You can switch language from the top to view this content in Arabic'}
      </span>
      <button
        onClick={close}
        aria-label={isAr ? 'إغلاق' : 'Close'}
        style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          fontSize: 14, color: '#075985', fontWeight: 700,
          padding: 6, minWidth: 28, minHeight: 28,
          flexShrink: 0,
        }}
      >
        ✕
      </button>
    </div>
  )
}
