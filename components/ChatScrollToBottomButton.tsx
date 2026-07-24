'use client'

/**
 * ChatScrollToBottomButton — floating button that appears when the user has
 * scrolled up in a long chat, letting them jump back to the latest message.
 * Purely visual/interaction helper — reads scroll position of a given
 * container ref's owner document (no LS, no external calls).
 *
 * Props: { containerId: string; isAr: boolean }
 *   containerId — the DOM id of the scrollable chat container
 */

import React, { useState, useEffect, useCallback } from 'react'

interface Props {
  containerId: string
  isAr: boolean
}

export default function ChatScrollToBottomButton({ containerId, isAr }: Props) {
  const [mounted, setMounted]   = useState(false)
  const [visible, setVisible]   = useState(false)

  useEffect(() => {
    setMounted(true)
    const el = document.getElementById(containerId)
    if (!el) return
    const onScroll = () => {
      const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
      setVisible(distanceFromBottom > 250)
    }
    el.addEventListener('scroll', onScroll)
    onScroll()
    return () => el.removeEventListener('scroll', onScroll)
  }, [containerId])

  const scrollDown = useCallback(() => {
    const el = document.getElementById(containerId)
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [containerId])

  if (!mounted || !visible) return null

  return (
    <button
      onClick={scrollDown}
      aria-label={isAr ? 'الانتقال لأسفل' : 'Scroll to bottom'}
      className="no-print"
      style={{
        position: 'fixed',
        // 146 = FeedbackWidget's 42px toggle (bottom:90) + gap, so this button
        // stacks cleanly above it instead of overlapping when both are visible.
        bottom: 146,
        insetInlineEnd: 16,
        width: 40, height: 40,
        borderRadius: '50%',
        background: '#FFFFFF',
        border: '1px solid #E5E7EB',
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
        fontSize: 16,
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 40,
      }}
    >
      ↓
    </button>
  )
}
