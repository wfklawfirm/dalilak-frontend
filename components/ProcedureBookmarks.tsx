'use client'

/**
 * ProcedureBookmarks — collapsible panel showing AI answer snippets
 * the user bookmarked via ChatMessageActions.
 *
 * LS key: dalilak_bookmarks = BookmarkEntry[]
 * Listens to 'dalilak_bookmarks_change' + 'storage' events.
 *
 * Shows most recent 5 bookmarks as truncated snippets.
 * Each bookmark has a ✕ delete button and a "اسأل عنه" button.
 * Displays on homepage when messages.length === 0.
 */

import React, { useState, useEffect, useCallback } from 'react'
import { useLanguage } from '@/lib/LanguageContext'
import { getBookmarks, removeBookmark, type BookmarkEntry } from '@/components/ChatMessageActions'

interface Props {
  onAsk: (q: string) => void
}

export default function ProcedureBookmarks({ onAsk }: Props) {
  const { isAr } = useLanguage()
  const [bookmarks, setBookmarks] = useState<BookmarkEntry[]>([])
  const [expanded, setExpanded] = useState(false)
  const [mounted, setMounted] = useState(false)

  const refresh = useCallback(() => {
    setBookmarks(getBookmarks().slice(0, 5))
  }, [])

  useEffect(() => {
    setMounted(true)
    refresh()
    window.addEventListener('dalilak_bookmarks_change', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('dalilak_bookmarks_change', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [refresh])

  if (!mounted || bookmarks.length === 0) return null

  function handleDelete(id: string) {
    removeBookmark(id)
    refresh()
  }

  function formatDate(iso: string): string {
    try {
      return new Date(iso).toLocaleDateString(isAr ? 'ar-LB' : 'en-GB', {
        day: 'numeric', month: 'short', timeZone: 'Asia/Beirut',
      })
    } catch { return '' }
  }

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        background: '#fff', border: '1.5px solid #E6E2DC',
        borderRadius: 13, overflow: 'hidden', marginBottom: 10,
      }}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 14px', background: 'none', border: 'none',
          cursor: 'pointer', fontFamily: 'inherit', textAlign: isAr ? 'right' : 'left',
        }}
      >
        <span style={{ fontSize: 16 }}>🔖</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#191713' }}>
            {isAr ? 'الردود المحفوظة' : 'Saved Answers'}
          </div>
          <div style={{ fontSize: 10, color: '#918B82', marginTop: 1 }}>
            {isAr ? `${bookmarks.length} ${bookmarks.length === 1 ? 'رد محفوظ' : 'ردود محفوظة'}` : `${bookmarks.length} saved`}
          </div>
        </div>
        <svg
          aria-hidden="true" width="13" height="13" viewBox="0 0 24 24"
          fill="none" stroke="#918B82" strokeWidth="2.5"
          style={{ flexShrink: 0, transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {/* List */}
      {expanded && (
        <div style={{ borderTop: '1px solid #E6E2DC', padding: '8px 14px 10px' }}>
          {bookmarks.map(bm => (
            <div
              key={bm.id}
              style={{
                padding: '8px 10px', borderRadius: 10, marginBottom: 6,
                background: '#FAFAF8', border: '1px solid #F0EDE8',
                position: 'relative',
              }}
            >
              {/* Delete */}
              <button
                type="button"
                onClick={() => handleDelete(bm.id)}
                style={{
                  position: 'absolute', top: 6, [isAr ? 'left' : 'right']: 8,
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#C8C2BB', fontSize: 12, padding: '2px 4px',
                  lineHeight: 1,
                }}
              >✕</button>

              {/* Snippet */}
              <div style={{
                fontSize: 11, color: '#2D1B0E', lineHeight: 1.55,
                paddingInlineEnd: 20,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}>
                {bm.text}
              </div>

              {/* Footer */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
                <span style={{ fontSize: 9.5, color: '#918B82' }}>
                  {formatDate(bm.savedAt)}
                </span>
                <button
                  type="button"
                  onClick={() => onAsk(bm.text.slice(0, 200))}
                  style={{
                    fontSize: 10, fontWeight: 700, color: '#8F1D2C',
                    background: 'none', border: '1px solid rgba(143,29,44,0.2)',
                    borderRadius: 8, padding: '2px 8px',
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  {isAr ? 'اسأل عنه' : 'Ask again'}
                </button>
              </div>
            </div>
          ))}

          {/* Clear all */}
          <button
            type="button"
            onClick={() => {
              try { localStorage.removeItem('dalilak_bookmarks') } catch {}
              refresh()
            }}
            style={{
              fontSize: 10, color: '#918B82', background: 'none', border: 'none',
              cursor: 'pointer', fontFamily: 'inherit', marginTop: 2,
              textDecoration: 'underline',
            }}
          >
            {isAr ? 'حذف الكل' : 'Clear all'}
          </button>
        </div>
      )}
    </div>
  )
}
