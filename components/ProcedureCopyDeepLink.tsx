'use client'

/**
 * ProcedureCopyDeepLink — copies a direct link to a specific procedure card
 * (including its #proc-{code} anchor, matching the id already rendered on
 * each card) so users can share/bookmark a link that opens the site with
 * that exact procedure in view.
 *
 * Props: { code: string; isAr: boolean }
 */

import React, { useState, useCallback } from 'react'

interface Props {
  code: string
  isAr: boolean
}

export default function ProcedureCopyDeepLink({ code, isAr }: Props) {
  const [copied, setCopied] = useState(false)

  const copy = useCallback(async () => {
    try {
      const url = `${window.location.origin}/procedures#proc-${code}`
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }, [code])

  return (
    <button
      type="button"
      onClick={copy}
      title={isAr ? 'نسخ رابط مباشر لهذه المعاملة' : 'Copy direct link to this procedure'}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '3px 8px',
        background: copied ? '#ECFDF5' : 'transparent',
        color: copied ? '#065F46' : '#6B7280',
        border: `1px solid ${copied ? '#6EE7B7' : 'transparent'}`,
        borderRadius: 7,
        fontSize: 11, fontWeight: 600,
        cursor: 'pointer', fontFamily: 'inherit',
        transition: 'all 0.2s',
      }}
      aria-label={isAr ? 'نسخ رابط مباشر' : 'Copy direct link'}
    >
      {copied ? '✓' : '🔗'}
      <span>{copied ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'رابط' : 'Link')}</span>
    </button>
  )
}
