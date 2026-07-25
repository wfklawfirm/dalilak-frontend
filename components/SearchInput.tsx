'use client'

import React, { useState } from 'react'

// ── SearchInput ─────────────────────────────────────────────────────────────
// Shared flat v4.0 search bar (icon + text input + clear button), extracted
// from the near-identical markup /faq, /authorities, /forms, /services each
// hand-rolled (the "search-wrap" pattern with an absolutely-positioned icon
// and clear button, relying on globals.css's .search-wrap:focus-within ring).
// Named per the design brief's section 22 request for reusable components.
//
// /procedures' search bar is a DELIBERATE exception, not migrated here: it
// embeds two extra buttons (advanced-search, filter-drawer) inside the same
// visual bar using a different flex-row layout, so forcing it into this
// component would risk a real layout regression. Left as-is, documented in
// UX_AUDIT.md rather than silently skipped.
//
// The component owns its own focus state internally (previously each page
// tracked `searchFocused` in its own useState just to color the border/icon)
// — this removes that boilerplate from every caller.
interface SearchInputProps {
  value: string
  onChange: (v: string) => void
  isAr: boolean
  placeholder: string
  ariaLabel: string
  clearAriaLabel?: string
  /** Wrapper style overrides, e.g. a different marginBottom. */
  style?: React.CSSProperties
}

export default function SearchInput({ value, onChange, isAr, placeholder, ariaLabel, clearAriaLabel, style }: SearchInputProps) {
  const [focused, setFocused] = useState(false)
  return (
    <div className="search-wrap" style={{
      position: 'relative', marginBottom: 12,
      border: `1px solid ${focused ? 'var(--brand)' : 'var(--border)'}`,
      borderRadius: 14, background: 'var(--surface)', transition: 'border-color 0.18s',
      ...style,
    }}>
      <span style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: 14, color: focused ? 'var(--brand)' : 'var(--text-3)', pointerEvents: 'none', display: 'flex', transition: 'color 0.18s' }}>
        <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
        </svg>
      </span>
      <input
        type="text"
        aria-label={ariaLabel}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{ width: '100%', padding: '11px 42px 11px 14px', border: 'none', borderRadius: 14, fontSize: 13, background: 'transparent', outline: 'none', fontFamily: 'inherit', color: 'var(--text-1)', direction: isAr ? 'rtl' : 'ltr' }}
      />
      {value && (
        <button
          type="button"
          aria-label={clearAriaLabel || (isAr ? 'مسح البحث' : 'Clear search')}
          onClick={() => onChange('')}
          className="tap-hit-2"
          style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: 4, background: 'var(--bg)', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', color: 'var(--text-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <svg aria-hidden="true" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
