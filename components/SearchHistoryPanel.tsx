'use client'

/**
 * SearchHistoryPanel — shows the last N searches as quick-action chips.
 * Reads from dalilak_qa_cache (same key used by page.tsx lsGet/lsSet).
 * Appears in homepage empty state below SmartSuggestions.
 */

import React, { useState, useEffect, useCallback } from 'react'
import { useLanguage } from '@/lib/LanguageContext'

const LS_CACHE = 'dalilak_qa_cache'
const MAX_SHOW = 5

interface QAEntry { q: string; a: string; ts: number }

interface Props {
  onAsk: (q: string) => void
}

export default function SearchHistoryPanel({ onAsk }: Props) {
  const { isAr } = useLanguage()
  const [history, setHistory] = useState<string[]>([])
  const [collapsed, setCollapsed] = useState(false)

  const load = useCallback(() => {
    try {
      const raw = localStorage.getItem(LS_CACHE)
      if (!raw) return
      const entries: QAEntry[] = JSON.parse(raw)
      // Most recent first, limit to MAX_SHOW
      const qs = entries
        .sort((a, b) => b.ts - a.ts)
        .slice(0, MAX_SHOW)
        .map(e => e.q.replace(/^\[.*?\]\s*/, '').trim()) // strip mode prefix
        .filter(q => q.length > 0)
      setHistory(qs)
    } catch {}
  }, [])

  useEffect(() => {
    load()
    const handler = () => load()
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [load])

  const clearHistory = () => {
    try { localStorage.removeItem(LS_CACHE) } catch {}
    setHistory([])
  }

  if (history.length === 0) return null

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        marginBottom: 10,
        overflow: 'hidden',
        animation: 'fadeUp 0.22s ease both',
      }}
    >
      {/* Header */}
      <div
        onClick={() => setCollapsed(c => !c)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '11px 14px', cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 15 }}>🕐</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-2)' }}>
            {isAr ? 'آخر البحوث' : 'Recent Searches'}
          </span>
          <span style={{
            fontSize: 10.5, fontWeight: 700, color: 'var(--text-4)',
            background: 'var(--surface-muted)', borderRadius: 99,
            padding: '1px 7px', border: '1px solid var(--border)',
          }}>
            {history.length}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            onClick={e => { e.stopPropagation(); clearHistory() }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 11, color: 'var(--text-4)', padding: '2px 6px',
              borderRadius: 6,
            }}
            title={isAr ? 'مسح السجل' : 'Clear history'}
          >
            {isAr ? 'مسح' : 'Clear'}
          </button>
          <span style={{
            fontSize: 10, color: 'var(--text-4)',
            transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
            transition: 'transform 0.18s ease', display: 'inline-block',
          }}>
            ▾
          </span>
        </div>
      </div>

      {/* Chips */}
      {!collapsed && (
        <div style={{
          padding: '0 14px 12px',
          display: 'flex', flexDirection: 'column', gap: 6,
        }}>
          {history.map((q, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onAsk(q)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 12px',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 10, cursor: 'pointer', textAlign: 'start', width: '100%',
                fontSize: 12.5, color: 'var(--text-2)',
                transition: 'border-color 0.12s, background 0.12s',
                overflow: 'hidden',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--brand)'
                e.currentTarget.style.background = 'rgba(143,29,44,0.03)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.background = 'var(--bg)'
              }}
            >
              <span style={{ color: 'var(--text-4)', flexShrink: 0, fontSize: 11 }}>↩</span>
              <span style={{
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                lineHeight: 1.4,
              }}>
                {q}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
