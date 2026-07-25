'use client'

/**
 * ChatLanguageToggleChip — quick chip to ask Claude to switch response language.
 *
 * Shows when chat has >= 1 message. Clicking fires a pre-built prompt asking Claude
 * to respond in the opposite language. Does NOT change the UI language (that's
 * the language toggle in TopNav); it only asks the AI to switch its replies.
 *
 * batch #364 fix: this chip used to have no dismiss control — it rendered on
 * every single message from message #1 onward, forever, until the user
 * actually triggered a language switch. A user who simply never wants a
 * language-switch prompt had no way to make it stop reappearing at the top
 * of every chat. Added an explicit dismiss (✕), matching the same pattern
 * ChatSessionSummaryChip already used. Same trigger prompt/behavior when
 * clicked — only the "make it go away without using it" path is new.
 *
 * Props: { onAsk: (prompt: string) => void; isAr: boolean; messageCount: number }
 */

import React, { useState } from 'react'

interface Props {
  onAsk: (prompt: string) => void
  isAr: boolean
  messageCount: number
}

export default function ChatLanguageToggleChip({ onAsk, isAr, messageCount }: Props) {
  const [used, setUsed] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  if (messageCount < 1 || used || dismissed) return null

  const targetLang   = isAr ? 'English' : 'العربية'
  const targetLangAr = isAr ? 'الإنجليزية' : 'Arabic'
  const prompt = isAr
    ? `من الآن فصاعداً، أجب عليّ باللغة الإنجليزية في هذه المحادثة.`
    : `From now on, please respond in Arabic (العربية) for this conversation.`

  function handle() {
    setUsed(true)
    onAsk(prompt)
  }

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <button
        type="button"
        onClick={handle}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '4px 10px', borderRadius: 20,
          background: '#F0F4FF', border: '1.5px solid #BFDBFE',
          cursor: 'pointer', fontFamily: 'inherit',
          fontSize: 10, fontWeight: 700, color: '#1D4ED8',
          transition: 'background 0.12s',
          flexShrink: 0,
        }}
        onMouseEnter={e => (e.currentTarget.style.background = '#DBEAFE')}
        onMouseLeave={e => (e.currentTarget.style.background = '#F0F4FF')}
      >
        <span style={{ fontSize: 13 }}>🌐</span>
        {isAr ? `تحدث بـ${targetLangAr}` : `Switch to ${targetLang}`}
      </button>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label={isAr ? 'إغلاق' : 'Dismiss'}
        style={{
          background: 'none', border: 'none', cursor: 'pointer', color: '#93C5FD',
          fontSize: 11, padding: 2, lineHeight: 1, fontFamily: 'inherit', flexShrink: 0,
        }}
      >
        ✕
      </button>
    </div>
  )
}
