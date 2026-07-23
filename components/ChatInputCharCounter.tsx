'use client'

/**
 * ChatInputCharCounter — live character count indicator for chat input.
 *
 * Only visible when text.length > 200.
 * Turns amber at 400, red at 500 (soft warning — no hard block).
 *
 * Props: { text: string; maxLength?: number; isAr: boolean }
 */

import React from 'react'

interface Props {
  text: string
  maxLength?: number
  isAr: boolean
}

export default function ChatInputCharCounter({ text, maxLength = 600, isAr }: Props) {
  const len = text.length
  if (len <= 200) return null

  const pct    = len / maxLength
  const color  = pct >= 1 ? '#DC2626' : pct >= 0.8 ? '#D97706' : '#6B7280'

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        fontSize: 10, color, fontWeight: 600,
        textAlign: isAr ? 'left' : 'right',
        paddingInlineEnd: 4,
        transition: 'color 0.2s',
      }}
    >
      {len}/{maxLength}
      {pct >= 1 && (
        <span style={{ marginInlineStart: 4 }}>
          {isAr ? '(طويل جداً)' : '(very long)'}
        </span>
      )}
    </div>
  )
}
