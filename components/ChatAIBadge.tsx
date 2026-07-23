'use client'

/**
 * ChatAIBadge — small "مُولَّد بالذكاء الاصطناعي / AI-generated" disclaimer
 * shown below the first assistant message in a conversation.
 *
 * Props: { isAr: boolean; messageIndex: number }
 * Only renders when messageIndex === 0.
 */

import React from 'react'

interface Props {
  isAr: boolean
  messageIndex: number
}

export default function ChatAIBadge({ isAr, messageIndex }: Props) {
  if (messageIndex !== 0) return null

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        fontSize: 10, color: '#9CA3AF', marginTop: 4,
        paddingInlineStart: 10,
      }}
    >
      {/* Sparkle icon */}
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
        <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
      </svg>
      <span>
        {isAr
          ? 'هذا الرد مُولَّد بالذكاء الاصطناعي — تحقق من المعلومات مع الجهات الرسمية'
          : 'AI-generated — verify important information with official authorities'}
      </span>
    </div>
  )
}
