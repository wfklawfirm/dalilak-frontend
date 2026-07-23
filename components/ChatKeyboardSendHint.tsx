'use client'

/**
 * ChatKeyboardSendHint — tiny hint below the chat input on desktop
 * ("Enter to send, Shift+Enter for new line"). Hidden on touch devices
 * where it isn't relevant (mobile has no physical Enter key concept
 * for this pattern).
 *
 * Props: { isAr: boolean }
 */

import React, { useState, useEffect } from 'react'

interface Props {
  isAr: boolean
}

export default function ChatKeyboardSendHint({ isAr }: Props) {
  const [mounted, setMounted] = useState(false)
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      setIsTouch(window.matchMedia('(pointer: coarse)').matches)
    } catch {}
  }, [])

  if (!mounted || isTouch) return null

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        fontSize: 9.5, color: '#B0AAA2', fontWeight: 500,
        textAlign: isAr ? 'left' : 'right',
        paddingInlineEnd: 4, marginTop: 2,
      }}
    >
      {isAr
        ? 'Enter للإرسال • Shift+Enter لسطر جديد'
        : 'Enter to send · Shift+Enter for new line'}
    </div>
  )
}
