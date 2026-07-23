'use client'

/**
 * ChatSessionTimer — elapsed time display for the current chat session.
 *
 * Starts when the first message is sent (messageCount > 0).
 * Resets to 0 when messageCount drops back to 0 (new chat).
 * Displays in HH:MM:SS format. Updates every second.
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

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
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
      }, 1000)
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
        fontSize: 10, fontWeight: 700, color: '#918B82',
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '0.02em',
      }}
    >
      <svg aria-hidden="true" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#918B82" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
      <span>{formatTime(elapsed)}</span>
    </div>
  )
}
