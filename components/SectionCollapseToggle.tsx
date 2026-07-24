'use client'

/**
 * SectionCollapseToggle — reusable collapsible section wrapper.
 *
 * Renders a labeled section header with an animated chevron.
 * When collapsed, children are hidden (not unmounted, to preserve state).
 * Persists open/closed state in localStorage if storageKey is provided.
 *
 * Props:
 *   titleAr      — Arabic section title
 *   titleEn      — English section title
 *   icon         — optional emoji/icon before title
 *   defaultOpen  — initial state when no localStorage value (default: true)
 *   storageKey   — localStorage key for persistence (e.g. 'dalilak_sec_appointments')
 *   children     — section content
 *   badge        — optional badge element shown in header (e.g. count)
 */

import React, { useState, useEffect, useId } from 'react'
import { useLanguage } from '@/lib/LanguageContext'

interface Props {
  titleAr: string
  titleEn: string
  icon?: string
  defaultOpen?: boolean
  storageKey?: string
  children: React.ReactNode
  badge?: React.ReactNode
}

export default function SectionCollapseToggle({
  titleAr,
  titleEn,
  icon,
  defaultOpen = true,
  storageKey,
  children,
  badge,
}: Props) {
  const { isAr } = useLanguage()
  const contentId = useId()
  const [open, setOpen] = useState(defaultOpen)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (!storageKey) return
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved !== null) setOpen(saved === '1')
    } catch {}
  }, [storageKey])

  function toggle() {
    const next = !open
    setOpen(next)
    if (storageKey) {
      try { localStorage.setItem(storageKey, next ? '1' : '0') } catch {}
    }
  }

  return (
    <div dir={isAr ? 'rtl' : 'ltr'} style={{ marginBottom: 0 }}>
      {/* Collapse header button */}
      <button
        type="button"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={toggle}
        style={{
          display: 'flex', alignItems: 'center', gap: 6, width: '100%',
          background: 'none', border: 'none', cursor: 'pointer',
          padding: '11px 0', minHeight: 44, textAlign: isAr ? 'right' : 'left',
          fontFamily: 'inherit',
        }}
      >
        {icon && <span style={{ fontSize: 14 }}>{icon}</span>}
        <span style={{
          flex: 1, fontSize: 11, fontWeight: 800,
          color: 'var(--text-2)', textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          {isAr ? titleAr : titleEn}
        </span>
        {badge}
        <svg
          aria-hidden="true"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--text-3)"
          strokeWidth="2.5"
          style={{
            transition: 'transform 0.2s ease',
            transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',
            flexShrink: 0,
          }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      {/* Collapsible content */}
      <div
        id={contentId}
        style={{
          overflow: 'hidden',
          maxHeight: mounted ? (open ? '9999px' : '0px') : undefined,
          transition: mounted ? 'max-height 0.25s ease' : 'none',
          opacity: open ? 1 : 0,
        }}
      >
        {children}
      </div>
    </div>
  )
}
