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
    // batch #519 (axe-core target-size audit): gap raised 4->10 to give the
    // now-24x24 dismiss button room without its hit-area overlapping the
    // pill button's own hit-area (a real risk with tight gaps + WCAG 2.2
    // 2.5.8's 24x24px minimum, since a naive fix that only enlarges the
    // button can eat into a small neighboring gap).
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
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
      {/* batch #519: was a bare 2px-padded 11px-font icon (~12x15px real
          hit-area, axe-core target-size violation — needs >=24x24). Given
          fixed explicit size instead of an inset::before expansion, since
          this button sits right next to a sibling pill and an expanded
          invisible hit-zone risked overlapping it. */}
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label={isAr ? 'إغلاق' : 'Dismiss'}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 24, height: 24,
          background: 'none', border: 'none', cursor: 'pointer', color: '#93C5FD',
          fontSize: 11, padding: 0, lineHeight: 1, fontFamily: 'inherit', flexShrink: 0,
        }}
      >
        ✕
      </button>
    </div>
  )
}
