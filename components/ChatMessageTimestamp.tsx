'use client'

/**
 * ChatMessageTimestamp — relative time label under each chat message
 * ("just now", "5m ago" / "قبل 5 دقائق"), computed client-side from a
 * fixed-at-render timestamp so SSR stays stable.
 *
 * Props: { timestamp: number; isAr: boolean }  // epoch ms
 */

import React, { useState, useEffect } from 'react'

interface Props {
  timestamp: number
  isAr: boolean
}

function formatRelative(ms: number, isAr: boolean): string {
  const diffSec = Math.max(0, Math.floor((Date.now() - ms) / 1000))
  if (diffSec < 30) return isAr ? 'الآن' : 'just now'
  if (diffSec < 60) return isAr ? `قبل ${diffSec} ثانية` : `${diffSec}s ago`
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return isAr ? `قبل ${diffMin} دقيقة` : `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return isAr ? `قبل ${diffHr} ساعة` : `${diffHr}h ago`
  const diffDay = Math.floor(diffHr / 24)
  return isAr ? `قبل ${diffDay} يوم` : `${diffDay}d ago`
}

export default function ChatMessageTimestamp({ timestamp, isAr }: Props) {
  const [mounted, setMounted] = useState(false)
  const [label, setLabel] = useState('')

  useEffect(() => {
    setMounted(true)
    setLabel(formatRelative(timestamp, isAr))
    const id = setInterval(() => setLabel(formatRelative(timestamp, isAr)), 30000)
    return () => clearInterval(id)
  }, [timestamp, isAr])

  if (!mounted) return null

  return (
    <span style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 500 }}>
      {label}
    </span>
  )
}
