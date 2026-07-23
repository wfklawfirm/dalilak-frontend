'use client'

/**
 * ProcedureCopySummaryLine — copies a compact one-line summary
 * ("Title — Ministry — Fees") for quick pasting into WhatsApp/notes,
 * distinct from the full checklist export or share-card features which
 * produce a much longer formatted block.
 *
 * Props: { title: string; ministry: string; fees?: string; isAr: boolean }
 */

import React, { useState, useCallback } from 'react'

interface Props {
  title: string
  ministry: string
  fees?: string
  isAr: boolean
}

export default function ProcedureCopySummaryLine({ title, ministry, fees, isAr }: Props) {
  const [copied, setCopied] = useState(false)

  const copy = useCallback(async () => {
    const parts = [title, ministry, fees].filter(Boolean)
    const line = parts.join(' — ')
    try {
      await navigator.clipboard.writeText(line)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {}
  }, [title, ministry, fees])

  return (
    <button
      type="button"
      onClick={copy}
      title={isAr ? 'نسخ ملخص سطر واحد' : 'Copy one-line summary'}
      aria-label={isAr ? 'نسخ ملخص سطر واحد' : 'Copy one-line summary'}
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
    >
      {copied ? '✓' : '⎘'}
      <span>{copied ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'ملخص' : 'Summary')}</span>
    </button>
  )
}
