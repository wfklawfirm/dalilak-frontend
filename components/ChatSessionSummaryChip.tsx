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

// Arabic number-agreement for "رسالة" (message): 1 -> مفرد, 2 -> مثنى,
// 3-10 -> جمع ("رسائل"), 11+ -> تمييز مفرد منصوب. The chip only ever shows
// at messageCount >= threshold (default 10), so 10 is the most common
// real-world value and needs the plural form, not the bare singular noun.
function arMessages(n: number): string {
  if (n === 1) return 'رسالة واحدة'
  if (n === 2) return 'رسالتين'
  if (n >= 3 && n <= 10) return `${n} رسائل`
  return `${n} رسالة`
}

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
      {/* batch #534: was a <button> nested inside another <button> --
          invalid HTML. Browsers auto-close the outer button as soon as the
          parser hits the inner one, so the real DOM never matched what this
          JSX described: the outer hit-area silently didn't wrap the "✕" as
          intended, and screen readers saw two unrelated sibling buttons
          instead of "chip + nested close button". Changed outer element to
          role="group" (non-interactive) with the two buttons as true
          siblings -- same click behavior, valid DOM/AX tree. */}
      <div
        role="group"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '5px 14px', borderRadius: 20,
          background: 'rgba(91,33,182,0.07)', border: '1px solid rgba(91,33,182,0.2)',
          transition: 'background 0.15s',
        }}
      >
        <button
          type="button"
          onClick={askForSummary}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', padding: 0,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          <span style={{ fontSize: 12 }}>📋</span>
          <span style={{ fontSize: 10.5, fontWeight: 700, color: '#5B21B6' }}>
            {isAr
              ? `${arMessages(messageCount)} — اضغط لتلخيص الجلسة`
              : `${messageCount} messages — tap to summarize`}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C4B5FD', fontSize: 10, padding: 0, lineHeight: 1, fontFamily: 'inherit' }}
          aria-label={isAr ? 'إغلاق' : 'Close'}
        >
          ✕
        </button>
      </div>
    </div>
  )
}
