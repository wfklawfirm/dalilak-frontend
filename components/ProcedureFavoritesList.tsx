'use client'

/**
 * ProcedureFavoritesList — compact horizontal scrollable strip of saved items.
 * Shows up to 6 saved procedures/services as icon + title pills.
 * Distinct from SavedItemsPanel (which is a full grid) — this is a quick-access row.
 * Syncs with dalilak_saved_change events.
 */

import React, { useState, useEffect, useCallback } from 'react'
import { useLanguage } from '@/lib/LanguageContext'
import { loadSavedItems, type SavedItem } from '@/lib/savedItems'

const MAX_SHOW = 6

interface Props {
  onAsk?: (q: string) => void
  onNavigate?: (href: string) => void
}

export default function ProcedureFavoritesList({ onAsk, onNavigate }: Props) {
  const { isAr } = useLanguage()
  const [items, setItems] = useState<SavedItem[]>([])

  const load = useCallback(() => {
    const saved = loadSavedItems()
    // Most recently saved first
    setItems(saved.sort((a, b) => b.savedAt - a.savedAt).slice(0, MAX_SHOW))
  }, [])

  useEffect(() => {
    load()
    const handler = () => load()
    window.addEventListener('dalilak_saved_change', handler)
    window.addEventListener('storage', handler)
    return () => {
      window.removeEventListener('dalilak_saved_change', handler)
      window.removeEventListener('storage', handler)
    }
  }, [load])

  if (items.length === 0) return null

  const handleClick = (item: SavedItem) => {
    if (item.aiPrompt && onAsk) {
      onAsk(isAr ? (item.aiPrompt) : (item.titleEn ? `Tell me about: ${item.titleEn}` : item.aiPrompt))
    } else if (item.href && onNavigate) {
      onNavigate(item.href)
    }
  }

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        marginBottom: 10,
        animation: 'fadeUp 0.22s ease both',
      }}
    >
      {/* Label */}
      <div style={{
        fontSize: 10.5, fontWeight: 800, color: 'var(--text-4)',
        textTransform: 'uppercase', letterSpacing: '0.05em',
        marginBottom: 7,
        display: 'flex', alignItems: 'center', gap: 5,
      }}>
        <span>🔖</span>
        {isAr ? 'المحفوظات' : 'Saved'}
      </div>

      {/* Horizontal scrollable row */}
      <div style={{
        display: 'flex', gap: 8, overflowX: 'auto',
        paddingBottom: 4,
        scrollbarWidth: 'none',
      }}>
        {items.map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleClick(item)}
            title={isAr ? item.titleAr : item.titleEn}
            style={{
              flexShrink: 0,
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '7px 12px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 99, cursor: 'pointer',
              maxWidth: 180, overflow: 'hidden',
              transition: 'border-color 0.12s, background 0.12s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--brand)'
              e.currentTarget.style.background = 'rgba(143,29,44,0.04)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.background = 'var(--surface)'
            }}
          >
            <span style={{ fontSize: 15, flexShrink: 0 }}>{item.icon}</span>
            <span style={{
              fontSize: 11.5, fontWeight: 600, color: 'var(--text-2)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              lineHeight: 1.3,
            }}>
              {isAr ? item.titleAr : item.titleEn}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
