'use client'

/**
 * ProcedureNeedHelpToggle — lets a user mark a procedure "I'm stuck" so it
 * surfaces later (paired conceptually with ProcedureHelpRequest, but this
 * one is a lightweight status flag, not a WhatsApp trigger).
 *
 * LS key: dalilak_stuck_{code} → '1'
 * Props: { code: string; isAr: boolean }
 */

import React, { useState, useEffect } from 'react'

interface Props {
  code: string
  isAr: boolean
}

export default function ProcedureNeedHelpToggle({ code, isAr }: Props) {
  const [mounted, setMounted] = useState(false)
  const [stuck, setStuck] = useState(false)
  const key = `dalilak_stuck_${code}`

  useEffect(() => {
    setMounted(true)
    try {
      setStuck(localStorage.getItem(key) === '1')
    } catch {}
  }, [key])

  if (!mounted) return null

  const toggle = () => {
    const next = !stuck
    setStuck(next)
    try {
      if (next) localStorage.setItem(key, '1')
      else localStorage.removeItem(key)
      window.dispatchEvent(new Event('dalilak_saved_change'))
    } catch {}
  }

  return (
    <button
      onClick={toggle}
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '6px 12px',
        background: stuck ? '#FEF3C7' : '#F9FAFB',
        border: `1px solid ${stuck ? '#FCD34D' : '#E5E7EB'}`,
        borderRadius: 10,
        fontSize: 12, fontWeight: 700,
        color: stuck ? '#92400E' : '#6B7280',
        cursor: 'pointer',
      }}
    >
      <span>{stuck ? '🆘' : '🤔'}</span>
      <span>
        {stuck
          ? (isAr ? 'محدَّد كأنك عالق هنا' : 'Marked as stuck')
          : (isAr ? 'أنا عالق في هذه الخطوة' : "I'm stuck on this")}
      </span>
    </button>
  )
}
