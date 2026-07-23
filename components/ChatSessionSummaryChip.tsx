'use client'

/**
 * ChatSessionSummaryChip — appears at top of messages area when a session
 * has grown long (>= threshold messages). Offers to summarize the conversation.
 *
 * When clicked, fires onAsk with a summarization prompt.
 * Dismissed per session-length threshold: hidden again until N more messages.
 *
 * Props:
 *   messageCount: number — current number of messages
 *   isAr: boolean
 *   onAsk: (q: string) => void
 *   threshold?: number — min messages to show (default 10)
 */

import React, { useState, useEffect } from 'react'

interface Props {
  messageCount: number
  isAr: boolean
  onAsk: (q: string) => void
  threshold?: number
}

export default function ChatSessionSummaryChip({
  messageCount, isAr, onAsk, threshold = 10,
}: Props) {
  const [dismissed, setDismissed] = useState(false)
  const [prevCount, setPrevCount] = useState(0)

  // Re-show chip every 5 messages after threshold
  useEffect(() => {
    if (messageCount >= threshold && (messageCount - prevCount >= 5 || prevCount === 0)) {
      setDismissed(false)
      setPrevCount(messageCount)
    }
  }, [messageCount, threshold]) // eslint-disable-line react-hooks/exhaustive-deps

  if (messageCount < threshold || dismissed) return null

  function askForSummary() {
    const prompt = isAr
      ? 'لخّص لي ما تحدثنا عنه في هذه الجلسة في نقاط مختصرة'
      : 'Please summarize the key points from our conversation so far in bullet points'
    onAsk(prompt)
    setDismissed(true)
  }

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '5px 0', marginBottom: 6,
      }}
    >
      <button
        type="button"
        onClick={askForSummary}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '5px 14px', borderRadius: 20,
          background: 'rgba(91,33,182,0.07)', border: '1px solid rgba(91,33,182,0.2)',
          cursor: 'pointer', fontFamily: 'inherit',
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(91,33,182,0.12)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(91,33,182,0.07)')}
      >
        <span style={{ fontSize: 12 }}>📋</span>
        <span style={{ fontSize: 10.5, fontWeight: 700, color: '#5B21B6' }}>
          {isAr
            ? `${messageCount} رسالة — اضغط لتلخيص الجلسة`
            : `${messageCount} messages — tap to summarize`}
        </span>
        <button
          type="button"
          onClick={e => { e.stopPropagation(); setDismissed(true) }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C4B5FD', fontSize: 10, padding: 0, lineHeight: 1, fontFamily: 'inherit' }}
          aria-label={isAr ? 'إغلاق' : 'Close'}
        >
          ✕
        </button>
      </button>
    </div>
  )
}
