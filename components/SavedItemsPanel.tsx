'use client'

/**
 * SavedItemsPanel — shows bookmarked procedures/services on the homepage.
 * Listens for `dalilak_saved_change` custom events to stay in sync.
 */

import React, { useState, useEffect, useCallback } from 'react'
import { useLanguage } from '@/lib/LanguageContext'
import { loadSavedItems, unsaveItem, type SavedItem } from '@/lib/savedItems'

interface Props {
  onAsk?: (q: string) => void
}

export default function SavedItemsPanel({ onAsk }: Props) {
  const { isAr } = useLanguage()
  const [items, setItems] = useState<SavedItem[]>([])
  const [mounted, setMounted] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  const reload = useCallback(() => setItems(loadSavedItems()), [])

  useEffect(() => {
    setMounted(true)
    reload()
    window.addEventListener('dalilak_saved_change', reload)
    return () => window.removeEventListener('dalilak_saved_change', reload)
  }, [reload])

  if (!mounted || items.length === 0) return null

  const handleRemove = (id: string) => {
    unsaveItem(id)
    reload()
  }

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        margin: '0 auto 16px',
        maxWidth: 'var(--container-md)',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        overflow: 'hidden',
        animation: 'fadeUp 0.18s ease',
      }}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setCollapsed(c => !c)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: 12,
          padding: '10px 14px',
          background: 'var(--surface-muted)',
          border: 'none', borderBottom: collapsed ? 'none' : '1px solid var(--border)',
          cursor: 'pointer', fontFamily: 'inherit',
          textAlign: isAr ? 'right' : 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="var(--brand)" stroke="none">
            <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
          </svg>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>
            {isAr ? 'المحفوظات' : 'Saved Items'}
          </span>
          <span style={{
            fontSize: 10.5, fontWeight: 700, color: 'var(--brand)',
            background: 'var(--brand-soft)', padding: '1px 6px', borderRadius: 10,
          }}>
            {items.length}
          </span>
        </div>
        <svg
          aria-hidden="true"
          width="12" height="12"
          viewBox="0 0 24 24"
          fill="none" stroke="var(--text-3)" strokeWidth="2.5"
          style={{ transition: 'transform 0.2s', transform: collapsed ? 'rotate(180deg)' : 'none' }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      {/* Items grid.
          Remove button and "Ask Dalilak" CTA are hover-revealed for
          pointer/mouse devices to keep cards calm, but touch devices have
          no hover state — force them visible there so the affordance isn't
          permanently invisible on mobile. */}
      <style>{`
        @media (pointer: coarse) {
          .saved-remove-btn { opacity: 1 !important; background: var(--surface) !important; }
          .saved-ask-cta { opacity: 1 !important; }
          /* The visible button is 20x20 (fine for a precise mouse cursor),
             but that's under the 44px minimum touch target — expand the
             actual hit area with an invisible pseudo-element rather than
             growing the visual button and disrupting the card layout. */
          .saved-remove-btn::before {
            content: ''; position: absolute; inset: -12px;
          }
        }
      `}</style>
      {!collapsed && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 1,
          background: 'var(--border)',
        }}>
          {items.map(item => (
            <SavedCard
              key={item.id}
              item={item}
              isAr={isAr}
              onAsk={onAsk}
              onRemove={() => handleRemove(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function SavedCard({
  item, isAr, onAsk, onRemove,
}: {
  item: SavedItem
  isAr: boolean
  onAsk?: (q: string) => void
  onRemove: () => void
}) {
  const [hovered, setHovered] = useState(false)

  const handleClick = () => {
    if (item.aiPrompt && onAsk) {
      onAsk(item.aiPrompt)
    }
  }

  return (
    <div
      style={{
        background: hovered ? 'var(--surface-muted)' : 'var(--surface)',
        padding: '10px 12px',
        cursor: item.aiPrompt ? 'pointer' : 'default',
        transition: 'background 0.12s',
        display: 'flex', flexDirection: 'column', gap: 6,
        position: 'relative',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
    >
      {/* Remove button — always visible on touch devices (no hover state
          to reveal it there), hover-revealed on pointer/mouse devices to
          keep the card visually calm. */}
      <button
        type="button"
        className="saved-remove-btn"
        onClick={e => { e.stopPropagation(); onRemove() }}
        aria-label={isAr ? 'إزالة من المحفوظات' : 'Remove from saved'}
        style={{
          position: 'absolute', top: 6, insetInlineEnd: 6,
          width: 20, height: 20, borderRadius: 5,
          border: '1px solid var(--border)',
          background: hovered ? 'var(--surface)' : 'transparent',
          color: 'var(--text-4)', fontSize: 12, fontWeight: 700,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'opacity 0.12s', opacity: hovered ? 1 : 0,
        }}
      >
        ×
      </button>

      {/* Icon + type badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 18 }}>{item.icon}</span>
        <span style={{
          fontSize: 9.5, fontWeight: 700, padding: '1px 6px', borderRadius: 10,
          background: 'var(--brand-soft)', color: 'var(--brand)',
        }}>
          {isAr
            ? { procedure: 'إجراء', enriched: 'إجراء', service: 'خدمة', journey: 'رحلة', faq: 'سؤال' }[item.type]
            : { procedure: 'Procedure', enriched: 'Procedure', service: 'Service', journey: 'Journey', faq: 'FAQ' }[item.type]}
        </span>
      </div>

      {/* Title */}
      <div style={{
        fontSize: 12.5, fontWeight: 700, color: 'var(--text-1)',
        lineHeight: 1.4,
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>
        {isAr ? item.titleAr : item.titleEn}
      </div>

      {/* Subtitle */}
      <div style={{
        fontSize: 11, color: 'var(--text-3)',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {isAr ? item.subtitleAr : item.subtitleEn}
      </div>

      {/* Ask CTA */}
      {item.aiPrompt && (
        <div className="saved-ask-cta" style={{
          display: 'flex', alignItems: 'center', gap: 3,
          fontSize: 10.5, color: 'var(--brand)', fontWeight: 600,
          opacity: hovered ? 1 : 0.5, transition: 'opacity 0.12s',
        }}>
          <svg aria-hidden="true" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
          {isAr ? 'اسأل دليلك' : 'Ask Dalilak'}
        </div>
      )}
    </div>
  )
}
