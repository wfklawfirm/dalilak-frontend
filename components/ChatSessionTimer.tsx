'use client'

/**
 * ChatSessionTimer — elapsed time display for the current chat session.
 *
 * Starts when the first message is sent (messageCount > 0).
 * Resets to 0 when messageCount drops back to 0 (new chat).
 * Displays in H:MM / M:SS-style minute granularity. Updates every 30s
 * (batch #362 perf fix — was updating every 1s with second-level display,
 * forcing a re-render every single second for the entire time a chat
 * stayed open. Nobody reads a session-duration indicator down to the
 * second, so minute granularity + a 30s tick loses no real information
 * while cutting re-render frequency 30x. Same visible feature, same
 * props, zero functionality removed).
 *
 * Shows as a subtle inline chip below the chat header.
 *
 * Props: { messageCount: number; isAr: boolean }
 */

import React, { useState, useEffect, useRef } from 'react'

interface Props {
  messageCount: number
  isAr: boolean
}

function formatTime(seconds: number, isAr: boolean): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return isAr ? `${h}س ${m}د` : `${h}h ${m}m`
  return isAr ? `${m} د` : `${m}m`
}

export default function ChatSessionTimer({ messageCount, isAr }: Props) {
  const [elapsed, setElapsed]     = useState(0)
  const [mounted, setMounted]     = useState(false)
  const startRef                  = useRef<number | null>(null)
  const intervalRef               = useRef<ReturnType<typeof setInterval> | null>(null)
  const prevCountRef              = useRef(0)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted) return

    // New chat started (messageCount went from 0 to >0)
    if (messageCount > 0 && prevCountRef.current === 0) {
      startRef.current = Date.now()
      setElapsed(0)
      if (intervalRef.current) clearInterval(intervalRef.current)
      intervalRef.current = setInterval(() => {
        if (startRef.current) setElapsed(Math.floor((Date.now() - startRef.current) / 1000))
      }, 30000)
    }

    // Chat cleared
    if (messageCount === 0 && prevCountRef.current > 0) {
      startRef.current = null
      setElapsed(0)
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
    }

    prevCountRef.current = messageCount
  }, [messageCount, mounted])

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current) }, [])

  if (!mounted || messageCount === 0) return null

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '3px 8px', borderRadius: 20,
        background: 'rgba(143,29,44,0.06)',
        border: '1px solid rgba(143,29,44,0.12)',
        fontSize: 10, fontWeight: 700, color: 'var(--text-3)',
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '0.02em',
      }}
    >
      <svg aria-hidden="true" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
      <span>{formatTime(elapsed, isAr)}</span>
    </div>
  )
}
