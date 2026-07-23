'use client'

/**
 * ProcedureViewCount — shows how many times user has viewed a procedure.
 *
 * Increments on mount. Shows "viewed X times" chip only when ≥ 2.
 * LS key: dalilak_views_{code} → number string
 *
 * Props: { code: string; isAr: boolean }
 */

import React, { useState, useEffect } from 'react'

const lsKey = (code: string) => `dalilak_views_${code}`

export default function ProcedureViewCount({ code, isAr }: { code: string; isAr: boolean }) {
  const [count, setCount] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const prev = parseInt(localStorage.getItem(lsKey(code)) || '0', 10)
      const next = prev + 1
      localStorage.setItem(lsKey(code), String(next))
      setCount(next)
    } catch {}
  }, [code])

  if (!mounted || count < 2) return null

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 10,
      background: '#F5F3EE', border: '1px solid #E5E0D8',
      fontSize: 9.5, fontWeight: 700, color: '#78716C',
    }}>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
      {isAr ? `طلعت عليها ${count} مرات` : `Viewed ${count} times`}
    </span>
  )
}
