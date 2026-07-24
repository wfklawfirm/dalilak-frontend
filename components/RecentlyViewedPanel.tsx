'use client'

/**
 * RecentlyViewedPanel — shows recently viewed procedures on the homepage.
 * Listens for `dalilak_recent_change` custom events to stay in sync.
 */

import React, { useState, useEffect, useCallback } from 'react'
import { useLanguage } from '@/lib/LanguageContext'
import { loadRecentItems, type RecentItem } from '@/lib/savedItems'

interface Props {
  onAsk?: (q: string) => void
}

function timeAgo(ts: number, isAr: boolean): string {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60_000)
  const hrs  = Math.floor(diff / 3_600_000)
  const days = Math.floor(diff / 86_400_000)
  if (mins < 2) return isAr ? 'الآن'           : 'just now'
  if (mins < 60) return isAr ? `${mins}د`        : `${mins}m`
  if (hrs < 24)  return isAr ? `${hrs}س`         : `${hrs}h`
  return isAr ? `${days}ي` : `${days}d`
}

export default function RecentlyViewedPanel({ onAsk }: Props) {
  const { isAr } = useLanguage()
  const [items, setItems] = useState<RecentItem[]>([])
  const [mounted, setMounted] = useState(false)

  const reload = useCallback(() => setItems(loadRecentItems()), [])

  useEffect(() => {
    setMounted(true)
    reload()
    window.addEventListener('dalilak_recent_change', reload)
    return () => window.removeEventListener('dalilak_recent_change', reload)
  }, [reload])

  if (!mounted || items.length === 0) return null

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        margin: '0 auto 16px',
        maxWidth: 'var(--container-md)',
        animation: 'fadeUp 0.18s ease',
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8,
        paddingInline: 4,
      }}>
        <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
        <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-3)' }}>
          {isAr ? 'شاهدت مؤخراً' : 'Recently Viewed'}
        </span>
      </div>
      <div style={{
        display: 'flex', gap: 8, overflowX: 'auto',
        paddingBottom: 4,
        scrollbarWidth: 'none',
      }}>
        {items.map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => item.aiPrompt && onAsk?.(item.aiPrompt)}
            style={{
              flexShrink: 0,
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '7px 10px', borderRadius: 10,
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              cursor: item.aiPrompt ? 'pointer' : 'default',
              fontFamily: 'inherit', textAlign: isAr ? 'right' : 'left',
              transition: 'border-color 0.12s, background 0.12s',
              maxWidth: 200,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--brand)'
              e.currentTarget.style.background = 'var(--surface-muted)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.background = 'var(--surface)'
            }}
          >
            <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontSize: 11.5, fontWeight: 700, color: 'var(--text-1)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                maxWidth: 130,
              }}>
                {isAr ? item.titleAr : item.titleEn}
              </div>
              <div style={{ fontSize: 9.5, color: 'var(--text-4)', marginTop: 1 }}>
                {timeAgo(item.viewedAt, isAr)}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
